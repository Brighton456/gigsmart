-- Check the structure and foreign key constraints
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'withdrawal_requests';

-- Check current withdrawal_requests data
SELECT * FROM withdrawal_requests LIMIT 5;

-- Check if there are any withdrawal_requests that reference transactions we're trying to delete
SELECT 
    wr.id,
    wr.transaction_id,
    t.type,
    t.amount,
    t.created_at,
    t.status
FROM withdrawal_requests wr
JOIN transactions t ON wr.transaction_id = t.id
WHERE t.type = 'withdrawal'
AND DATE(t.created_at) IN (CURRENT_DATE, CURRENT_DATE - INTERVAL '1 day')
AND t.status = 'completed';
