-- Debug RLS policies and permissions
-- Run this in Supabase SQL Editor to check if RLS is blocking queries

-- 1. Check current RLS policies on users table
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 2. Check if RLS is enabled on users table
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- 3. Test direct query as authenticated user (replace with actual user ID)
-- This should work if RLS policies are correct
SELECT 
    id, 
    name, 
    email, 
    is_active,
    created_at
FROM users 
WHERE id = 'adcb679c-130d-4604-8c84-484b8a93ff6e';

-- 4. Check auth.uid() function (should return current user ID when authenticated)
SELECT auth.uid() as current_user_id;

-- 5. Test if the user can see their own data
SELECT 
    'Can access own data' as test_result,
    count(*) as row_count
FROM users 
WHERE id = auth.uid();

-- 6. Check for any blocking triggers or functions on users table
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users';

-- 7. Check table permissions
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'users' AND table_schema = 'public';
