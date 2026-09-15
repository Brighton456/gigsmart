-- Award KES 500 to each user's recharge wallet as giftcode transaction
-- This script updates all users and creates corresponding transaction records

BEGIN;

-- Update each user's recharge_wallet by adding KES 500 (only for users with current_level >= 1)
UPDATE users 
SET recharge_wallet = COALESCE(recharge_wallet, 0) + 500
WHERE current_level >= 1;

-- Create transaction records for each user who received the gift
INSERT INTO transactions (
    user_id,
    type,
    amount,
    description,
    status,
    created_at,
    updated_at
)
SELECT 
    id,
    'giftcode',
    500,
    'KES 500 monthly upkeep bonus',
    'completed',
    NOW(),
    NOW()
FROM users
WHERE current_level >= 1;

-- Verify the operation
SELECT 
    COUNT(*) as total_users_updated,
    COUNT(*) * 500 as total_amount_awarded
FROM users
WHERE current_level >= 1;

COMMIT;

-- Summary query to verify the transactions were created
SELECT 
    COUNT(*) as total_transactions,
    SUM(amount) as total_amount,
    type
FROM transactions 
WHERE type = 'giftcode' 
AND description = 'KES 500 monthly upkeep bonus'
GROUP BY type;
