-- Supabase migration: earnings correctness, withdrawals, referrals, check-ins, monitoring, gift codes, tasks
-- Run in Supabase SQL Editor (idempotent where possible).

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Withdrawal requests
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  fee DECIMAL(10,2) DEFAULT 0.00,
  net_amount DECIMAL(15,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  payment_details JSONB,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  admin_notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);

-- Snapshot trigger
CREATE OR REPLACE FUNCTION fn_withdrawal_request_insert_snapshot()
RETURNS trigger AS $$
DECLARE u record;
BEGIN
  SELECT * INTO u FROM users WHERE id = NEW.user_id;
  IF NEW.payment_details IS NULL THEN
    NEW.payment_details := jsonb_build_object(
      'withdrawal_account_type', u.withdrawal_account_type,
      'withdrawal_account_details', u.withdrawal_account_details
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_withdrawal_request_snapshot ON withdrawal_requests;
CREATE TRIGGER trg_withdrawal_request_snapshot
BEFORE INSERT ON withdrawal_requests
FOR EACH ROW
EXECUTE PROCEDURE fn_withdrawal_request_insert_snapshot();

-- Daily check-ins
CREATE TABLE IF NOT EXISTS user_daily_activity (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip INET,
  device_info JSONB,
  PRIMARY KEY(user_id, activity_date)
);
CREATE INDEX IF NOT EXISTS idx_user_daily_activity_date ON user_daily_activity(activity_date);

CREATE OR REPLACE VIEW user_activity_summary AS
SELECT
  u.id,
  u.name,
  u.phone,
  u.email,
  u.created_at::date AS created_date,
  (CURRENT_DATE - u.created_at::date) AS account_age_days,
  COUNT(uda.activity_date) AS checkins,
  GREATEST(0, (CURRENT_DATE - u.created_at::date) - COUNT(uda.activity_date)) AS days_missed
FROM users u
LEFT JOIN user_daily_activity uda ON uda.user_id = u.id
GROUP BY u.id;

-- Monitoring logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  details JSONB,
  ip INET,
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_event ON activity_logs(event_type);

-- Earnings views excluding deposits/recharges/withdrawals
CREATE OR REPLACE VIEW earnings_eligible_transactions AS
SELECT * FROM transactions t
WHERE t.status = 'completed'
  AND t.type IN (
    'task_earning','referral_bonus','investment_return','gift_code','spin_win','admin_adjustment'
  );

CREATE OR REPLACE VIEW user_earnings_by_period AS
SELECT
  user_id,
  SUM(CASE WHEN created_at::date = CURRENT_DATE THEN net_amount ELSE 0 END) AS today_earnings,
  SUM(CASE WHEN created_at::date = CURRENT_DATE - INTERVAL '1 day' THEN net_amount ELSE 0 END) AS yesterday_earnings,
  SUM(CASE WHEN created_at >= date_trunc('week', CURRENT_DATE) THEN net_amount ELSE 0 END) AS week_earnings,
  SUM(CASE WHEN created_at >= date_trunc('month', CURRENT_DATE) THEN net_amount ELSE 0 END) AS month_earnings,
  SUM(net_amount) AS total_earnings
FROM earnings_eligible_transactions
GROUP BY user_id;

-- Gift code earnings view
CREATE OR REPLACE VIEW user_gift_code_earnings AS
SELECT u.id AS user_id, COALESCE(SUM(gcr.income_wallet_reward + gcr.main_wallet_reward), 0) AS gift_code_earnings
FROM users u
LEFT JOIN gift_code_redemptions gcr ON gcr.user_id = u.id
GROUP BY u.id;

-- Task progress today
CREATE OR REPLACE VIEW user_task_progress_today AS
SELECT user_id,
       COUNT(*) AS tasks_done_today,
       SUM(earnings) AS task_earnings_today
FROM task_completions
WHERE completion_date = CURRENT_DATE
GROUP BY user_id;

-- Wealth fund status helper
CREATE OR REPLACE VIEW investments_with_status AS
SELECT *,
  CASE
    WHEN status = 'cancelled' THEN 'cancelled'
    WHEN maturity_date <= CURRENT_DATE THEN 'completed'
    ELSE status
  END AS derived_status
FROM investments;

-- Referral bonuses: recruit gating
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_recruit BOOLEAN DEFAULT TRUE;
CREATE TABLE IF NOT EXISTS referral_bonus_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 3),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  admin_notes TEXT,
  UNIQUE(referrer_id, referred_id, level)
);
CREATE INDEX IF NOT EXISTS idx_referral_bonus_queue_referrer ON referral_bonus_queue(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_bonus_queue_status ON referral_bonus_queue(status);

-- Withdrawal requests admin view
CREATE OR REPLACE VIEW admin_withdrawal_requests AS
SELECT wr.*, u.name AS user_name, u.phone AS user_phone, u.email AS user_email,
       u.withdrawal_account_type, u.withdrawal_account_details
FROM withdrawal_requests wr
JOIN users u ON u.id = wr.user_id;

-- Date indexes
CREATE INDEX IF NOT EXISTS idx_transactions_created_date ON transactions((created_at::date));
CREATE INDEX IF NOT EXISTS idx_task_completions_created_date ON task_completions((created_at::date));
