-- Add charity account columns to users table
-- This will make charity account management much cleaner

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) DEFAULT 'regular',
ADD COLUMN IF NOT EXISTS original_user_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS is_charity_account BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS charity_status VARCHAR(20) DEFAULT 'pending';

-- Add UNIQUE constraint to prevent duplicate charity accounts per user
ALTER TABLE users 
ADD CONSTRAINT unique_original_user_id UNIQUE (original_user_id);

-- Update existing records to have default values
UPDATE users 
SET account_type = 'regular' 
WHERE account_type IS NULL;

UPDATE users
SET is_charity_account = false 
WHERE is_charity_account IS NULL;

UPDATE users 
SET charity_status = 'pending' 
WHERE charity_status IS NULL;

-- Add index for better performance on charity account queries
CREATE INDEX IF NOT EXISTS idx_users_charity_account ON users(is_charity_account);
CREATE INDEX IF NOT EXISTS idx_users_original_user_id ON users(original_user_id);

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('account_type', 'original_user_id', 'is_charity_account', 'charity_status')
ORDER BY ordinal_position;
