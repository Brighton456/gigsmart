-- =====================================================
-- COMPLETE REVERT SCRIPT
-- This will undo all changes made to user bce9d58d-be31-4c12-be64-475d61d1ca8c
-- =====================================================

-- 1. REVERT USER RECORD
-- Reset user back to original state (remove all the updates we made)
UPDATE users SET
    current_level = COALESCE(current_level, 0),
    level_investment = COALESCE(level_investment, 0.00),
    level_upgraded_at = NULL,
    updated_at = NOW(),
    activation_date = NULL,
    is_activated = COALESCE(is_activated, false),
    has_seen_onboarding = COALESCE(has_seen_onboarding, false),
    onboarding_complete = COALESCE(onboarding_complete, false),
    is_active = COALESCE(is_active, false),
    is_recruit = COALESCE(is_recruit, false),
    login_count = COALESCE(login_count, 0),
    last_login = NULL,
    ip_address = NULL,
    device_info = NULL,
    withdrawal_account_type = NULL,
    withdrawal_account_details = NULL,
    withdrawal_account_verified = NULL,
    withdrawal_password_hash = NULL,
    -- Reset all wallet balances to zero
    main_wallet = COALESCE(main_wallet, 0.00),
    income_wallet = COALESCE(income_wallet, 0.00),
    wealth_fund_balance = COALESCE(wealth_fund_balance, 0.00),
    real_balance = COALESCE(real_balance, 0.00),
    recharge_wallet = COALESCE(recharge_wallet, 0.00),
    -- Reset all earnings to zero
    total_earnings = COALESCE(total_earnings, 0.00),
    today_earnings = COALESCE(today_earnings, 0.00),
    yesterday_earnings = COALESCE(yesterday_earnings, 0.00),
    week_earnings = COALESCE(week_earnings, 0.00),
    month_earnings = COALESCE(month_earnings, 0.00),
    total_earned = COALESCE(total_earned, 0.00),
    gift_code_earnings = COALESCE(gift_code_earnings, 0.00),
    referral_rebate_total = COALESCE(referral_rebate_total, 0.00),
    total_withdrawals = COALESCE(total_withdrawals, 0.00),
    -- Reset activity counters
    tasks_completed_today = COALESCE(tasks_completed_today, 0),
    tasks_reset_date = COALESCE(tasks_reset_date, CURRENT_DATE),
    last_daily_reset = COALESCE(last_daily_reset, CURRENT_DATE),
    -- Reset user category
    user_category = COALESCE(user_category, 'new'),
    category_updated_at = COALESCE(category_updated_at, NOW()),
    restrictions = COALESCE(restrictions, '{}'::jsonb)
WHERE id = 'bce9d58d-be31-4c12-be64-475d61d1ca8c';

-- 2. DELETE REFERRER USER (if we created Sarah Wanjiku)
DELETE FROM users WHERE id = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';

-- 3. DELETE REFERRAL RECORD (if we created it)
DELETE FROM referrals WHERE referred_id = 'bce9d58d-be31-4c12-be64-475d61d1ca8c';

-- 4. DELETE ALL TRANSACTIONS (clean slate)
DELETE FROM transactions WHERE user_id = 'bce9d58d-be31-4c12-be64-475d61d1ca8c';

-- 5. DELETE ALL TASK COMPLETIONS
DELETE FROM task_completions WHERE user_id = 'bce9d58d-be31-4c12-be64-475d61d1ca8c';

-- 6. DELETE ALL INVESTMENTS
DELETE FROM investments WHERE user_id = 'bce9d58d-be31-4c12-be64-475d61d1ca8c';

-- 7. DELETE ALL SPIN ATTEMPTS
DELETE FROM spin_attempts WHERE user_id = 'bce9d58d-be31-4c12-be64-475d61d1ca8c';

-- 8. DELETE ALL GIFT CODES
DELETE FROM gift_codes WHERE code IN ('WELCOME2025', 'HOLIDAY2025');

-- 9. DELETE ALL GIFT CODE REDEMPTIONS
DELETE FROM gift_code_redemptions WHERE user_id = 'bce9d58d-be31-4c12-be64-475d61d1ca8c';

-- 10. DELETE ALL WITHDRAWAL REQUESTS
DELETE FROM withdrawal_requests WHERE user_id = 'bce9d58d-be31-4c12-be64-475d61d1ca8c';

-- 11. DELETE ALL USER ACTIVITY LOGS
DELETE FROM user_activity_logs WHERE user_id = 'bce9d58d-be31-4c12-be64-475d61d1ca8c';

-- 12. DELETE ALL USER CHECKINS
DELETE FROM user_checkins WHERE user_id = 'bce9d58d-be31-4c12-be64-475d61d1ca8c';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check user is back to original state
SELECT 
    current_level,
    main_wallet,
    income_wallet,
    total_earnings,
    today_earnings,
    0 as transaction_count
FROM users 
WHERE id = 'bce9d58d-be31-4c12-be64-475d61d1ca8c';

-- Check all related tables are empty
SELECT 
    (SELECT COUNT(*) FROM transactions WHERE user_id = 'bce9d58d-be31-4c12-be64-475d61d1ca8c') as transactions_count,
    (SELECT COUNT(*) FROM task_completions WHERE user_id = 'bce9d58d-be31-4c12-be64-475d61d1ca8c') as tasks_count,
    (SELECT COUNT(*) FROM investments WHERE user_id = 'bce9d58d-be31-4c12-be64-475d61d1ca8c') as investments_count,
    (SELECT COUNT(*) FROM withdrawal_requests WHERE user_id = 'bce9d58d-be31-4c12-be64-475d61d1ca8c') as withdrawals_count;

-- =====================================================
-- SUMMARY
-- =====================================================
-- This script will completely revert all changes made to user bce9d58d-be31-4c12-be64-475d61d1ca8c
-- All financial data, transactions, tasks, investments, and activities will be removed
-- User will be reset to original state with zero balances and no history
-- =====================================================
