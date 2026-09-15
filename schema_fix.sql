-- Schema Fix: Add missing columns to existing users table
-- Run this AFTER running complete_supabase_schema.sql

-- Add missing columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS level_investment DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS recharge_wallet DECIMAL(15,2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS real_balance DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_category VARCHAR(20) DEFAULT 'new';
ALTER TABLE users ADD COLUMN IF NOT EXISTS category_updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS restrictions JSONB DEFAULT '{}';

-- Update existing users to have proper initial values
UPDATE users SET 
    level_investment = 0.00,
    recharge_wallet = 0.00,
    real_balance = 0.00,
    user_category = 'new',
    category_updated_at = NOW(),
    restrictions = '{}'
WHERE level_investment IS NULL 
   OR recharge_wallet IS NULL 
   OR real_balance IS NULL 
   OR user_category IS NULL;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Schema fix applied successfully!';
    RAISE NOTICE 'Added columns: level_investment, recharge_wallet, real_balance, user_category, category_updated_at, restrictions';
    RAISE NOTICE 'Updated existing users with default values';
END $$;
