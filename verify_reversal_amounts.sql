-- Verify the exact amounts that were added back to income wallets
-- Compare with expected withdrawal amounts: -70, -470, -1750

-- Since we can't access the original withdrawal amounts anymore (they were deleted),
-- we need to calculate what was actually added back by comparing
-- the income_wallet changes for affected users.

-- First, let's identify which users had withdrawals and calculate the reversal amounts
-- Based on the CSV data you provided, let's analyze the income_wallet changes:

-- Users who should have received reversals based on the withdrawal amounts you mentioned:
-- -70 withdrawal: franglinemufwinyi@gmail.com (was -70, now 170 = +240 added)
-- -470 withdrawal: apolocalvince43@gmail.com (was 0, now 300 = +300 added) 
-- -1750 withdrawal: This might be split across multiple users

-- Let's check current income_wallet for users who had recent activity
SELECT 
    u.email,
    u.income_wallet as current_income_wallet,
    u.total_withdrawals,
    u.total_earnings,
    CASE 
        WHEN u.email = 'franglinemufwinyi@gmail.com' THEN 'Expected +240 (was -70, now 170)'
        WHEN u.email = 'apolocalvince43@gmail.com' THEN 'Expected +300 (was 0, now 300)'
        WHEN u.email = 'otienoedmonton5@gmail.com' THEN 'Expected +720 (was -944, now -224)'
        WHEN u.email = 'odhiambofelixomondi65@gmail.com' THEN 'Expected +1520 (was -1620, now -100)'
        WHEN u.email = 'reecejuma001@gmail.com' THEN 'Expected +300 (was 0, now 300)'
        WHEN u.email = 'stephennyamboha8@gmail.com' THEN 'Expected +200 (was 0, now -200)'
        ELSE 'Unknown user'
    END as expected_change
FROM users u
WHERE u.email IN (
    'franglinemufwinyi@gmail.com',
    'apolocalvince43@gmail.com', 
    'otienoedmonton5@gmail.com',
    'odhiambofelixomondi65@gmail.com',
    'reecejuma001@gmail.com',
    'stephennyamboha8@gmail.com'
)
ORDER BY u.email;

-- Calculate total amount that was added back across all users
SELECT 
    SUM(u.income_wallet) as total_current_income_wallet,
    COUNT(*) as total_users_with_income,
    'Need to compare with previous data to calculate exact reversal amount'
FROM users u
WHERE u.income_wallet > 0 OR u.income_wallet < 0;

-- Alternative approach: Check if there are any transaction logs or audit trails
-- that might show the original withdrawal amounts
SELECT 
    'Checking for any remaining withdrawal evidence' as info,
    COUNT(*) as count
FROM transactions 
WHERE type = 'withdrawal' 
AND created_at >= CURRENT_DATE - INTERVAL '2 days';

-- Check if there are any activity logs that might help
SELECT 
    'Checking activity logs for withdrawal evidence' as info
FROM information_schema.tables 
WHERE table_name LIKE '%log%' OR table_name LIKE '%audit%' OR table_name LIKE '%history%';
