-- ============================================================
-- WITHDRAWAL / SPIN / REFERRAL HARDENING
-- 1. try_debit_wallet: atomic, non-negative wallet debit
-- 2. create_withdrawal_request: reserves funds + inserts request in ONE transaction
-- 3. process_withdrawal_payout: admin state machine (approve/reject/complete/fail)
--    with refund-on-reject/fail and double-process protection
-- 4. Spin config keys (win rate admin-controlled)
-- 5. Referral sync trigger: resolves typed codes, builds referrals rows (L1-L3)
-- 6. Backfill referral rows for existing users
-- ============================================================

-- ------------------------------------------------------------
-- 1. Atomic debit with balance floor (never goes negative)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.try_debit_wallet(p_user_id uuid, p_amount numeric, p_wallet text DEFAULT 'income')
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  updated int;
  new_balance numeric;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_amount');
  END IF;
  IF p_wallet NOT IN ('income', 'recharge') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_wallet');
  END IF;

  IF p_wallet = 'income' THEN
    UPDATE users
       SET income_wallet = income_wallet - p_amount,
           updated_at = now()
     WHERE id = p_user_id
       AND income_wallet >= p_amount
       AND is_active = true;
    GET DIAGNOSTICS updated = ROW_COUNT;
    IF updated = 0 THEN
      RETURN jsonb_build_object('ok', false, 'error', 'insufficient_funds');
    END IF;
    SELECT income_wallet INTO new_balance FROM users WHERE id = p_user_id;
  ELSE
    UPDATE users
       SET recharge_wallet = recharge_wallet - p_amount,
           updated_at = now()
     WHERE id = p_user_id
       AND recharge_wallet >= p_amount
       AND is_active = true;
    GET DIAGNOSTICS updated = ROW_COUNT;
    IF updated = 0 THEN
      RETURN jsonb_build_object('ok', false, 'error', 'insufficient_funds');
    END IF;
    SELECT recharge_wallet INTO new_balance FROM users WHERE id = p_user_id;
  END IF;

  RETURN jsonb_build_object('ok', true, 'balance', new_balance);
END;
$$;

-- ------------------------------------------------------------
-- 2. Withdrawal request with atomic fund reservation
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_withdrawal_request(
  p_user_id uuid,
  p_amount numeric,
  p_fee numeric,
  p_net_amount numeric,
  p_payment_method text DEFAULT NULL,
  p_payment_details jsonb DEFAULT NULL,
  p_user_name text DEFAULT NULL,
  p_user_phone text DEFAULT NULL,
  p_user_email text DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_reserve jsonb;
  v_id uuid;
  v_acct_type text;
  v_acct_details jsonb;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_amount');
  END IF;

  -- Guard: one pending request at a time (prevents parallel double-submits)
  IF EXISTS (SELECT 1 FROM withdrawal_requests WHERE user_id = p_user_id AND status = 'pending') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'pending_request_exists');
  END IF;

  -- Reserve the full amount atomically (fails if balance dropped below amount)
  v_reserve := public.try_debit_wallet(p_user_id, p_amount, 'income');
  IF NOT COALESCE((v_reserve->>'ok')::boolean, false) THEN
    RETURN jsonb_build_object('ok', false, 'error', v_reserve->>'error');
  END IF;

  SELECT withdrawal_account_type, withdrawal_account_details
    INTO v_acct_type, v_acct_details
    FROM users WHERE id = p_user_id;

  BEGIN
    INSERT INTO withdrawal_requests (
      user_id, amount, fee, net_amount, status,
      withdrawal_account_type, withdrawal_account_details,
      user_name, user_phone, user_email, metadata,
      funds_reserved, reserved_at
    ) VALUES (
      p_user_id, p_amount, COALESCE(p_fee, 0), COALESCE(p_net_amount, p_amount), 'pending',
      COALESCE(p_payment_method, v_acct_type),
      COALESCE(p_payment_details, v_acct_details),
      p_user_name, p_user_phone, p_user_email,
      COALESCE(p_metadata, '{}'::jsonb),
      true, now()
    ) RETURNING id INTO v_id;
  EXCEPTION WHEN OTHERS THEN
    -- Reservation succeeded but insert failed -> refund immediately
    UPDATE users SET income_wallet = income_wallet + p_amount, updated_at = now()
     WHERE id = p_user_id;
    RETURN jsonb_build_object('ok', false, 'error', 'insert_failed', 'detail', SQLERRM);
  END;

  RETURN jsonb_build_object('ok', true, 'request_id', v_id, 'balance', v_reserve->>'balance');
END;
$$;

-- ------------------------------------------------------------
-- 3. Admin payout state machine (SECURITY DEFINER, self-checks admin role)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.process_withdrawal_payout(
  p_request_id uuid,
  p_decision text,
  p_admin_email text DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  req withdrawal_requests%ROWTYPE;
  admin_row record;
  v_allowed boolean := false;
  v_debit jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'forbidden');
  END IF;

  SELECT admin_role, admin_permissions INTO admin_row FROM users WHERE id = auth.uid();
  IF admin_row.admin_role = 'super_admin' THEN
    v_allowed := true;
  ELSIF admin_row.admin_role = 'admin' THEN
    v_allowed := admin_row.admin_permissions ? 'withdrawals.approve'
              OR admin_row.admin_permissions ? 'withdrawals.complete'
              OR admin_row.admin_permissions ? 'withdrawals.reject'
              OR admin_row.admin_permissions ? 'withdrawals.fail'
              OR admin_row.admin_permissions ? '*';
  END IF;
  IF NOT v_allowed THEN
    RETURN jsonb_build_object('ok', false, 'error', 'forbidden');
  END IF;

  IF p_decision NOT IN ('approved', 'rejected', 'completed', 'failed') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'bad_decision');
  END IF;

  SELECT * INTO req FROM withdrawal_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;

  -- State machine: pending -> approved/rejected/completed/failed; approved -> completed/failed
  IF req.status NOT IN ('pending', 'approved') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_state', 'current', req.status);
  END IF;
  IF req.status = 'approved' AND p_decision NOT IN ('completed', 'failed') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_state', 'current', req.status);
  END IF;

  IF p_decision = 'approved' THEN
    UPDATE withdrawal_requests
       SET status = 'approved', approved_at = now(), processed_at = now(),
           processed_by = COALESCE(p_admin_email, auth.email()::text), updated_at = now()
     WHERE id = p_request_id;
    RETURN jsonb_build_object('ok', true, 'status', 'approved');
  END IF;

  IF p_decision = 'rejected' THEN
    IF req.funds_reserved THEN
      UPDATE users SET income_wallet = income_wallet + req.amount, updated_at = now()
       WHERE id = req.user_id;
    END IF;
    UPDATE withdrawal_requests
       SET status = 'rejected', rejection_reason = COALESCE(p_notes, 'Rejected by admin'),
           processed_at = now(), processed_by = COALESCE(p_admin_email, auth.email()::text), updated_at = now()
     WHERE id = p_request_id;
    RETURN jsonb_build_object('ok', true, 'status', 'rejected');
  END IF;

  IF p_decision = 'failed' THEN
    IF req.funds_reserved THEN
      UPDATE users SET income_wallet = income_wallet + req.amount, updated_at = now()
       WHERE id = req.user_id;
    END IF;
    UPDATE withdrawal_requests
       SET status = 'failed', admin_notes = COALESCE(p_notes, 'Payout failed'),
           processed_at = now(), processed_by = COALESCE(p_admin_email, auth.email()::text), updated_at = now()
     WHERE id = p_request_id;
    RETURN jsonb_build_object('ok', true, 'status', 'failed');
  END IF;

  -- completed: money leaves the system. Debit now if not reserved at request time.
  IF NOT COALESCE(req.funds_reserved, false) THEN
    v_debit := public.try_debit_wallet(req.user_id, req.amount, 'income');
    IF NOT COALESCE((v_debit->>'ok')::boolean, false) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'insufficient_funds');
    END IF;
  END IF;

  UPDATE withdrawal_requests
     SET status = 'completed', processed_at = now(),
         processed_by = COALESCE(p_admin_email, auth.email()::text), updated_at = now()
   WHERE id = p_request_id;

  -- Negative amount = money left the wallet. The trigger_update_user_stats
  -- trigger (fixed below) credits total_withdrawals by ABS(amount) and does
  -- NOT touch total_earnings for withdrawal rows.
  INSERT INTO transactions (user_id, amount, net_amount, fee, status, description, type, processed_at, created_at, metadata)
  VALUES (
    req.user_id, -req.amount, -req.net_amount, COALESCE(req.fee, 0), 'completed',
    'Withdrawal payout' || CASE WHEN req.user_phone IS NOT NULL THEN (' to ' || req.user_phone) ELSE '' END,
    'withdrawal', now(), now(),
    jsonb_build_object('wallet_type', 'income', 'withdrawal_request_id', p_request_id, 'phase', 'payout')
  );

  RETURN jsonb_build_object('ok', true, 'status', 'completed');
END;
$$;

GRANT EXECUTE ON FUNCTION public.try_debit_wallet(uuid, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_withdrawal_request(uuid, numeric, numeric, numeric, text, jsonb, text, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_withdrawal_payout(uuid, text, text, text) TO authenticated;

-- ------------------------------------------------------------
-- 4. Spin configuration (admin-editable via Platform Config)
-- ------------------------------------------------------------
INSERT INTO system_settings (key, value, description, updated_by) VALUES
  ('spin_win_rate_percent', '0', 'Chance (0-100%) that a paid spin bet wins its staked amount. 0 = never win.', 'system'),
  ('spin_min_amount', '20', 'Minimum spin bet amount (KES).', 'system'),
  ('spin_max_amount', '5000', 'Maximum spin bet amount (KES).', 'system'),
  ('spin_max_daily', '20', 'Maximum paid spins per user per day.', 'system')
ON CONFLICT (key) DO NOTHING;

-- ------------------------------------------------------------
-- 5. Referral sync: resolve typed referral codes + build referrals rows
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_referral_core(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  u record;
  v_referrer text;
  v_l2 text;
  v_l3 text;
  v_uuid_pattern text := '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
BEGIN
  SELECT * INTO u FROM users WHERE id = p_user_id;
  IF NOT FOUND OR u.referred_by IS NULL THEN RETURN; END IF;

  -- Skip if already linked
  IF EXISTS (SELECT 1 FROM referrals WHERE referred_id = p_user_id) THEN RETURN; END IF;

  -- Resolve: uuid passthrough, otherwise look up referral_code (case-insensitive)
  v_referrer := u.referred_by::text;
  IF v_referrer !~ v_uuid_pattern THEN
    SELECT id::text INTO v_referrer FROM users
     WHERE UPPER(referral_code) = UPPER(v_referrer)
     LIMIT 1;
  END IF;

  IF v_referrer IS NULL OR v_referrer !~ v_uuid_pattern THEN RETURN; END IF;
  IF v_referrer::uuid = p_user_id THEN RETURN; END IF;

  -- Persist the resolved uuid for future audits/bonuses
  UPDATE users SET referred_by = v_referrer
   WHERE id = p_user_id AND referred_by IS DISTINCT FROM v_referrer;

  -- Build the up-chain (max 3 levels)
  SELECT referred_by::text INTO v_l2 FROM users WHERE id = v_referrer::uuid;
  IF v_l2 IS NOT NULL AND v_l2::uuid <> p_user_id AND v_l2 ~ v_uuid_pattern THEN
    SELECT referred_by::text INTO v_l3 FROM users WHERE id = v_l2::uuid;
  END IF;

  INSERT INTO referrals (referrer_id, referred_id, level)
  VALUES (v_referrer::uuid, p_user_id, 1)
  ON CONFLICT (referrer_id, referred_id, level) DO NOTHING;

  IF v_l2 IS NOT NULL AND v_l2 ~ v_uuid_pattern
     AND v_l2::uuid NOT IN (p_user_id, v_referrer::uuid) THEN
    INSERT INTO referrals (referrer_id, referred_id, level)
    VALUES (v_l2::uuid, p_user_id, 2)
    ON CONFLICT (referrer_id, referred_id, level) DO NOTHING;

    IF v_l3 IS NOT NULL AND v_l3 ~ v_uuid_pattern
       AND v_l3::uuid NOT IN (p_user_id, v_referrer::uuid, v_l2::uuid) THEN
      INSERT INTO referrals (referrer_id, referred_id, level)
      VALUES (v_l3::uuid, p_user_id, 3)
      ON CONFLICT (referrer_id, referred_id, level) DO NOTHING;
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_referral_on_user_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.sync_referral_core(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_referral ON users;
CREATE TRIGGER trg_sync_referral
AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION public.sync_referral_on_user_insert();

-- ------------------------------------------------------------
-- 6. Backfill: link existing users whose code was never resolved
-- ------------------------------------------------------------
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT id FROM users
     WHERE referred_by IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM referrals WHERE referrals.referred_id = users.id)
     LIMIT 5000
  LOOP
    BEGIN
      PERFORM public.sync_referral_core(r.id);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'referral backfill failed for %: %', r.id, SQLERRM;
    END;
  END LOOP;
END;
$$;

-- ------------------------------------------------------------
-- 7. referred_by must accept TYPED REFERRAL CODES (not just uuids).
-- The UUID column made every signup with a referral code fail profile creation.
-- ------------------------------------------------------------
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_referred_by_fkey;
ALTER TABLE users ALTER COLUMN referred_by TYPE text USING referred_by::text;

-- ------------------------------------------------------------
-- 8. Fix trigger_update_user_stats: withdrawals must not inflate
-- total_earnings, and must count by ABS regardless of amount sign
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        UPDATE users SET
            total_earnings = total_earnings + CASE WHEN NEW.amount > 0 AND NEW.type <> 'withdrawal' THEN NEW.amount ELSE 0 END,
            total_withdrawals = total_withdrawals + CASE WHEN NEW.type = 'withdrawal' THEN ABS(NEW.amount) ELSE 0 END,
            today_earnings = today_earnings + CASE WHEN NEW.amount > 0 AND NEW.type <> 'withdrawal' AND DATE(NEW.created_at) = CURRENT_DATE THEN NEW.amount ELSE 0 END,
            updated_at = NOW()
        WHERE id = NEW.user_id;
        
        -- Refresh daily statistics
        PERFORM ensure_daily_statistics_exists();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Withdrawal request extra columns used above
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS approved_at timestamptz;
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS funds_reserved boolean DEFAULT false;
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS reserved_at timestamptz;
