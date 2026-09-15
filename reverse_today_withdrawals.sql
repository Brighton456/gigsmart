-- Reverse today's withdrawals: return amounts to income wallet and delete transaction records
-- This script processes all withdrawal transactions from today

BEGIN;

-- First, let's see what withdrawals we're about to reverse (for verification)
SELECT 
    t.id,
    t.user_id,
    u.email,
    t.amount,
    t.created_at,
    t.status
FROM transactions t
JOIN users u ON t.user_id = u.id
WHERE t.type = 'withdrawal'
AND DATE(t.created_at) IN (CURRENT_DATE, CURRENT_DATE - INTERVAL '1 day')
AND t.status = 'completed';

-- Show the withdrawal_requests that will be deleted
SELECT 
    'Withdrawal Requests to Delete' as info,
    COUNT(*) as count
FROM withdrawal_requests
WHERE transaction_id IN (
    SELECT id FROM transactions
    WHERE type = 'withdrawal'
    AND DATE(created_at) IN (CURRENT_DATE, CURRENT_DATE - INTERVAL '1 day')
    AND status = 'completed'
);

-- Return withdrawal amounts to users' income wallets (handles existing positive/negative balances)
UPDATE users u
SET income_wallet = COALESCE(u.income_wallet, 0) + (
    SELECT COALESCE(SUM(t.amount), 0)
    FROM transactions t
    WHERE t.user_id = u.id
    AND t.type = 'withdrawal'
    AND DATE(t.created_at) IN (CURRENT_DATE, CURRENT_DATE - INTERVAL '1 day')
    AND t.status = 'completed'
)
WHERE EXISTS (
    SELECT 1 FROM transactions t2
    WHERE t2.user_id = u.id
    AND t2.type = 'withdrawal'
    AND DATE(t2.created_at) IN (CURRENT_DATE, CURRENT_DATE - INTERVAL '1 day')
    AND t2.status = 'completed'
);

-- First, delete any related withdrawal requests (must be done before transactions)
DELETE FROM withdrawal_requests
WHERE transaction_id IN (
    SELECT id FROM transactions
    WHERE type = 'withdrawal'
    AND DATE(created_at) IN (CURRENT_DATE, CURRENT_DATE - INTERVAL '1 day')
    AND status = 'completed'
);

-- Then delete the withdrawal transaction records
DELETE FROM transactions
WHERE type = 'withdrawal'
AND DATE(created_at) IN (CURRENT_DATE, CURRENT_DATE - INTERVAL '1 day')
AND status = 'completed';

-- Verify the results - show balance changes
SELECT 
    'Balance Changes' as action,
    u.id,
    u.email,
    u.income_wallet as new_balance,
    COALESCE((
        SELECT SUM(t.amount)
        FROM transactions t
        WHERE t.user_id = u.id
        AND t.type = 'withdrawal'
        AND DATE(t.created_at) IN (CURRENT_DATE, CURRENT_DATE - INTERVAL '1 day')
        AND t.status = 'completed'
    ), 0) as amount_returned
FROM users u
WHERE EXISTS (
    SELECT 1 FROM transactions t2
    WHERE t2.user_id = u.id
    AND t2.type = 'withdrawal'
    AND DATE(t2.created_at) IN (CURRENT_DATE, CURRENT_DATE - INTERVAL '1 day')
    AND t2.status = 'completed'
);

SELECT 
    'Transactions Deleted' as action,
    COUNT(*) as count
FROM transactions
WHERE type = 'withdrawal'
AND DATE(created_at) IN (CURRENT_DATE, CURRENT_DATE - INTERVAL '1 day')
AND status = 'completed';

COMMIT;

-- Final verification - show remaining withdrawals today (should be 0)
SELECT 
    'Remaining Withdrawals Today' as status,
    COUNT(*) as count,
    COALESCE(SUM(amount), 0) as total_amount
FROM transactions
WHERE type = 'withdrawal'
AND DATE(created_at) IN (CURRENT_DATE, CURRENT_DATE - INTERVAL '1 day');
