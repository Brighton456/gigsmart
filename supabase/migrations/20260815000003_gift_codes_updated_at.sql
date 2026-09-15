-- Fix surfaced by end-to-end testing: redeemGiftCode includes `updated_at` in its
-- gift_codes UPDATE, but the table had no such column -> the UPDATE failed with
-- PGRST204 AFTER the wallets were already credited (partial-failure path).
ALTER TABLE public.gift_codes
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Fresh single-use code so the full redemption flow can be retested cleanly.
INSERT INTO public.gift_codes (code, reward_type, income_wallet_amount, main_wallet_amount, max_uses, current_uses, is_active, description, created_by)
VALUES ('TEST2027', 'both_wallets', 50.00, 150.00, 1, 0, true, 'End-to-end test gift code (retest)', 'codebuff-test')
ON CONFLICT (code) DO NOTHING;
