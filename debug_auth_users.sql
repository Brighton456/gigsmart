-- Debug script to check auth vs users table sync issues
-- Run this in Supabase SQL Editor to identify problematic users

-- 1. Check users in auth.users but not in public.users
SELECT 
    'Missing in public.users' as issue_type,
    au.id,
    au.email,
    au.email_confirmed_at,
    au.confirmed_at,
    au.created_at as auth_created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- 2. Check users in public.users but not in auth.users  
SELECT 
    'Missing in auth.users' as issue_type,
    pu.id,
    pu.email,
    pu.created_at as profile_created_at
FROM public.users pu
LEFT JOIN auth.users au ON pu.id = au.id
WHERE au.id IS NULL;

-- 3. Check users with unconfirmed emails
SELECT 
    'Unconfirmed email' as issue_type,
    au.id,
    au.email,
    au.email_confirmed_at,
    au.confirmed_at,
    au.created_at as auth_created_at,
    pu.name
FROM auth.users au
JOIN public.users pu ON au.id = pu.id
WHERE au.email_confirmed_at IS NULL OR au.confirmed_at IS NULL;

-- 4. Check the specific user that works
SELECT 
    'Working user' as issue_type,
    au.id,
    au.email,
    au.email_confirmed_at IS NOT NULL as email_confirmed,
    au.confirmed_at IS NOT NULL as account_confirmed,
    pu.name,
    pu.is_active
FROM auth.users au
JOIN public.users pu ON au.id = pu.id
WHERE au.id = 'adcb679c-130d-4604-8c84-484b8a93ff6e';

-- 5. Check all users auth status
SELECT 
    au.id,
    au.email,
    au.email_confirmed_at IS NOT NULL as email_confirmed,
    au.confirmed_at IS NOT NULL as account_confirmed,
    pu.name,
    pu.is_active,
    au.created_at as auth_created,
    pu.created_at as profile_created
FROM auth.users au
FULL OUTER JOIN public.users pu ON au.id = pu.id
ORDER BY au.created_at DESC NULLS LAST;
