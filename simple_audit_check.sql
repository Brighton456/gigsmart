-- Simple check of audit tables to find withdrawal evidence

-- First, get all table names that might contain logs
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name LIKE '%log%' OR table_name LIKE '%audit%' OR table_name LIKE '%history%'
ORDER BY table_name;

-- Check activity_logs structure specifically
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'activity_logs'
ORDER BY ordinal_position;

-- Show sample data from activity_logs to understand its structure
SELECT *
FROM activity_logs 
LIMIT 5;

-- Check for any records containing "withdrawal" in any text column
SELECT 
    'activity_logs withdrawal search' as source,
    COUNT(*) as records_found
FROM activity_logs 
WHERE 
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = 'activity_logs' 
     AND data_type IN ('text', 'varchar', 'char')) > 0
AND (
    CAST(activity_logs.* AS text) LIKE '%withdrawal%'
    OR CAST(activity_logs.* AS text) LIKE '%WITHDRAWAL%'
);
