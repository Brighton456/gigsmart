-- Check what withdrawal amounts were actually processed
-- Let's see the exact withdrawal amounts that should have been reversed

-- First, let's see if there are any remaining withdrawal transactions
SELECT 
    id,
    user_id,
    amount,
    created_at,
    status
FROM transactions
WHERE type = 'withdrawal'
AND DATE(created_at) IN (CURRENT_DATE, CURRENT_DATE - INTERVAL '1 day')
ORDER BY created_at;

-- Check if there are any withdrawal requests that might give us clues
SELECT 
    wr.id,
    wr.transaction_id,
    wr.amount,
    wr.created_at,
    wr.status
FROM withdrawal_requests wr
WHERE DATE(wr.created_at) IN (CURRENT_DATE, CURRENT_DATE - INTERVAL '1 day')
ORDER BY wr.created_at;

-- Let's also check what the actual withdrawal amounts should be based on the data you mentioned
-- You mentioned: -70, -470, -1750
-- That's a total of -2290, not the -2090 I calculated

-- Check user balance changes to see what was actually added back
SELECT 
    u.email,
    u.income_wallet as current_income_wallet,
    -- We need to compare with previous data to see the actual change
    'Need previous data to calculate actual reversal amount'
FROM users u
WHERE u.id IN (
    SELECT DISTINCT user_id 
    FROM transactions 
    WHERE type = 'withdrawal' 
    AND DATE(created_at) IN (CURRENT_DATE, CURRENT_DATE - INTERVAL '1 day')
    AND status = 'completed'
)
ORDER BY u.email;
