-- Fixes surfaced by end-to-end testing of the app against a fresh project:
--
-- 1. withdrawal_requests_status_view was referenced by the app (getWithdrawalRequests)
--    but never created -> 404 on every withdrawal-requests fetch.
--    Created with security_invoker so RLS on withdrawal_requests still applies.
--
-- 2. gift_codes only had a service_role policy, so normal users could not SELECT codes
--    (redeemGiftCode -> "Gift code not found") nor increment current_uses.
--    Added authenticated-user SELECT + UPDATE policies. The UPDATE policy is permissive
--    (any field) to match the app's client-side redemption flow; prefer a SECURITY
--    DEFINER RPC if this table needs hardening later.
--
-- 3. Seeded a test gift code so redemption can be exercised end-to-end.

-- 1. Withdrawal requests status view (per-user via security_invoker)
CREATE OR REPLACE VIEW public.withdrawal_requests_status_view
WITH (security_invoker = true) AS
SELECT
    wr.*,
    CASE wr.status
        WHEN 'approved'   THEN 'success'
        WHEN 'rejected'   THEN 'danger'
        WHEN 'processing' THEN 'warning'
        WHEN 'pending'    THEN 'info'
        ELSE 'default'
    END AS status_style,
    wr.status AS status_label
FROM public.withdrawal_requests wr;

-- 2. Gift codes: let authenticated users read and redeem codes
CREATE POLICY user_select_gift_codes ON public.gift_codes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY user_use_gift_codes ON public.gift_codes
    FOR UPDATE USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 3. Test gift code (income 100 + recharge 200, single use)
INSERT INTO public.gift_codes (code, reward_type, income_wallet_amount, main_wallet_amount, max_uses, current_uses, is_active, description, created_by)
VALUES ('TEST2026', 'both_wallets', 100.00, 200.00, 1, 0, true, 'End-to-end test gift code', 'codebuff-test')
ON CONFLICT (code) DO NOTHING;
