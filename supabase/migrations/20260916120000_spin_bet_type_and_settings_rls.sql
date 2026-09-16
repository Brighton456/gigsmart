-- ====================================================================
-- Gig-Smart: spin_bet transaction type + public read for system settings
-- Applied: 2026-09-16
-- 1) Allow 'spin_bet' in transactions.type so spin-wheel bets record
--    correctly instead of falling back to 'admin_adjustment'.
-- 2) Allow authenticated/anon users to SELECT system_settings so the app
--    reads live fees and configuration (write remains service-only).
-- Idempotent: safe to re-run.
-- ====================================================================

-- 1. Widen the transactions type constraint to include 'spin_bet'
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_type_check CHECK (type::text = ANY (ARRAY[
    'deposit'::character varying,
    'withdrawal'::character varying,
    'task_earning'::character varying,
    'referral_bonus'::character varying,
    'level_upgrade'::character varying,
    'investment'::character varying,
    'investment_return'::character varying,
    'gift_code'::character varying,
    'spin_bet'::character varying,
    'spin_win'::character varying,
    'admin_adjustment'::character varying,
    'penalty'::character varying
  ]));

-- 2. Users may read system settings (fees, links, limits); writes stay service-only
DROP POLICY IF EXISTS "public_read_system_settings" ON public.system_settings;
CREATE POLICY "public_read_system_settings"
  ON public.system_settings
  FOR SELECT
  TO public
  USING (true);
