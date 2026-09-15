-- Check the audit/log tables for withdrawal evidence
-- These tables might contain backup records of the withdrawals

-- First, let's see what these tables actually are
SELECT 
    table_name,
    table_type,
    table_schema
FROM information_schema.tables 
WHERE table_name LIKE '%log%' OR table_name LIKE '%audit%' OR table_name LIKE '%history%'
ORDER BY table_name;

-- Check each potential table for withdrawal records
-- We'll need to check the structure first, then look for withdrawal data

-- Try to find activity_logs table (most likely candidate)
SELECT 
    'Checking activity_logs table' as info,
    COUNT(*) as total_records
FROM information_schema.columns 
WHERE table_name = 'activity_logs';

-- If activity_logs exists, check its structure first
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'activity_logs'
ORDER BY ordinal_position;

-- Then check for withdrawal records based on actual columns
SELECT 
    'activity_logs withdrawal records' as source,
    COUNT(*) as withdrawal_count
FROM activity_logs 
WHERE action LIKE '%withdrawal%' 
OR description LIKE '%withdrawal%'
OR type LIKE '%withdrawal%'
AND created_at >= CURRENT_DATE - INTERVAL '2 days';

-- Check for any other log tables that might contain withdrawal data
SELECT 
    'Checking all log tables for withdrawals' as source
FROM information_schema.tables 
WHERE table_name LIKE '%log%' 
LIMIT 5;

-- Look for any tables that might contain transaction history
SELECT 
    table_name
FROM information_schema.tables 
WHERE table_name LIKE '%transaction%' 
OR table_name LIKE '%history%'
ORDER BY table_name;
