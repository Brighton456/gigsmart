-- Columns the app writes on signup (supabaseAuth.signUp / ensureUserProfile)
-- that were missing from the fresh users table definition. Idempotent.
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS real_balance DECIMAL(15,2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS user_category VARCHAR(20) DEFAULT 'new',
    ADD COLUMN IF NOT EXISTS category_updated_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS restrictions JSONB DEFAULT '{}'::jsonb;
