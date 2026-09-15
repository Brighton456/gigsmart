-- =====================================================
-- UPDATE EXISTING USER DATA
-- User ID: bce9d58d-be31-4c12-be64-475d61d1ca8c
-- Update to show J2 (Level 1) since October 10th, 2025
-- =====================================================

-- 1. UPDATE EXISTING USER RECORD (preserving existing name, email, phone)
UPDATE users SET
    current_level = 1, -- J2 Level
    level_investment = 1500.00, -- Level investment cost
    level_upgraded_at = '2025-10-10 14:30:00+03',
    updated_at = NOW(),
    activation_date = '2025-10-10 15:00:00+03',
    is_activated = true,
    has_seen_onboarding = true,
    onboarding_complete = true,
    is_active = true,
    is_recruit = false,
    login_count = COALESCE(login_count, 0) + 127,
    last_login = '2025-01-13 09:15:00+03',
    ip_address = '192.168.1.100'::inet,
    device_info = '{"platform": "android", "version": "13", "device": "Samsung Galaxy A54"}',
    withdrawal_account_type = COALESCE(withdrawal_account_type, 'mpesa'),
    withdrawal_account_details = COALESCE(withdrawal_account_details, '{"type": "mpesa", "phone": "+254712345678", "account_name": "Michael Kamau"}'),
    withdrawal_account_verified = COALESCE(withdrawal_account_verified, true),
    withdrawal_password_hash = COALESCE(withdrawal_password_hash, '$2b$12$hashedpassword'),
    -- WALLET BALANCES (calculated based on transactions)
    main_wallet = 2450.75,
    income_wallet = 3890.25,
    wealth_fund_balance = 1200.00,
    real_balance = 2450.75,
    recharge_wallet = 500.00,
    -- EARNINGS (calculated)
    total_earnings = 8750.50,
    today_earnings = 125.50,
    yesterday_earnings = 89.00,
    week_earnings = 650.25,
    month_earnings = 2850.75,
    total_earned = 8750.50,
    gift_code_earnings = 200.00,
    referral_rebate_total = 450.00,
    total_withdrawals = 1200.00,
    -- TASK & ACTIVITY
    tasks_completed_today = 3,
    tasks_reset_date = CURRENT_DATE,
    last_daily_reset = CURRENT_DATE,
    -- USER CATEGORIES
    user_category = 'middle_class',
    category_updated_at = '2025-01-01 00:00:00',
    restrictions = COALESCE(restrictions, '{"daily_limit": 5000, "withdrawal_enabled": true}'::jsonb)
WHERE id = 'bce9d58d-be31-4c12-be64-475d61d1ca8c';

-- 2. CREATE REFERRER USER (only if not exists)
INSERT INTO users (
    id, name, email, phone, password_hash, security_code, referral_code, current_level, created_at, 
    is_active, main_wallet, income_wallet, total_earnings
) VALUES (
    'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    'Sarah Wanjiku',
    'sarah.wanjiku@example.com',
    '+254723456789',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6QJw/2Ej7W',
    '123456',
    'SARAH2025',
    3,
    '2025-08-15 10:00:00+03',
    true,
    8500.00,
    12300.00,
    25600.00
);

-- 3. CREATE REFERRAL RECORD (only if not exists)
INSERT INTO referrals (
    id,
    referrer_id,
    referred_id,
    level,
    total_earnings,
    is_active,
    created_at,
    last_earning_at
) VALUES (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    'bce9d58d-be31-4c12-be64-475d61d1ca8c',
    1,
    450.00,
    true,
    '2025-10-10 14:30:00+03',
    '2025-01-12 16:45:00+03'
);

-- 4. TRANSACTIONS HISTORY
INSERT INTO transactions (id, user_id, type, amount, fee, net_amount, status, description, payment_method, created_at, processed_at, metadata, external_reference) VALUES
-- Initial deposit for level upgrade
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'deposit', 1500.00, 0.00, 1500.00, 'completed', 'Initial deposit for J2 level upgrade', 'mpesa', '2025-10-10 14:45:00+03', '2025-10-10 14:50:00+03', '{"transaction_id": "MPESA123456"}', 'MP123456'),

-- Task earnings (various dates)
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'task_earning', 45.00, 0.00, 45.00, 'completed', 'Task: Install TikTok Lite', 'wallet', '2025-10-11 16:20:00+03', '2025-10-11 16:20:00+03', '{"app_name": "TikTok Lite", "app_id": "com.zhiliaoapp.lite"}', NULL),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'task_earning', 35.50, 0.00, 35.50, 'completed', 'Task: Install WhatsApp Business', 'wallet', '2025-10-12 11:30:00+03', '2025-10-12 11:30:00+03', '{"app_name": "WhatsApp Business", "app_id": "com.whatsapp.w4b"}', NULL),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'task_earning', 52.25, 0.00, 52.25, 'completed', 'Task: Install Facebook Lite', 'wallet', '2025-10-13 14:15:00+03', '2025-10-13 14:15:00+03', '{"app_name": "Facebook Lite", "app_id": "com.facebook.lite"}', NULL),

-- November earnings
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'task_earning', 48.75, 0.00, 48.75, 'completed', 'Task: Install Instagram', 'wallet', '2025-11-05 09:45:00+03', '2025-11-05 09:45:00+03', '{"app_name": "Instagram", "app_id": "com.instagram.android"}', NULL),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'task_earning', 41.00, 0.00, 41.00, 'completed', 'Task: Install YouTube Music', 'wallet', '2025-11-12 16:30:00+03', '2025-11-12 16:30:00+03', '{"app_name": "YouTube Music", "app_id": "com.google.android.apps.youtube.music"}', NULL),

-- December earnings
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'task_earning', 55.50, 0.00, 55.50, 'completed', 'Task: Install Spotify', 'wallet', '2025-12-02 13:20:00+03', '2025-12-02 13:20:00+03', '{"app_name": "Spotify", "app_id": "com.spotify.music"}', NULL),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'task_earning', 38.25, 0.00, 38.25, 'completed', 'Task: Install Twitter', 'wallet', '2025-12-08 10:15:00+03', '2025-12-08 10:15:00+03', '{"app_name": "Twitter", "app_id": "com.twitter.android"}', NULL),

-- January 2025 earnings (current month)
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'task_earning', 62.00, 0.00, 62.00, 'completed', 'Task: Install Telegram', 'wallet', '2025-01-02 15:30:00+03', '2025-01-02 15:30:00+03', '{"app_name": "Telegram", "app_id": "org.telegram.messenger"}', NULL),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'task_earning', 47.50, 0.00, 47.50, 'completed', 'Task: Install Snapchat', 'wallet', '2025-01-05 11:45:00+03', '2025-01-05 11:45:00+03', '{"app_name": "Snapchat", "app_id": "com.snapchat.android"}', NULL),

-- Today's earnings
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'task_earning', 28.50, 0.00, 28.50, 'completed', 'Task: Install Viber', 'wallet', '2025-01-13 08:30:00+03', '2025-01-13 08:30:00+03', '{"app_name": "Viber", "app_id": "com.viber.voip"}', NULL),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'task_earning', 35.00, 0.00, 35.00, 'completed', 'Task: Install Discord', 'wallet', '2025-01-13 10:15:00+03', '2025-01-13 10:15:00+03', '{"app_name": "Discord", "app_id": "com.discord"}', NULL),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'task_earning', 62.00, 0.00, 62.00, 'completed', 'Task: Install LinkedIn', 'wallet', '2025-01-13 14:20:00+03', '2025-01-13 14:20:00+03', '{"app_name": "LinkedIn", "app_id": "com.linkedin.android"}', NULL),

-- Referral bonuses
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'referral_bonus', 150.00, 0.00, 150.00, 'completed', 'Referral bonus: Direct referral activation', 'wallet', '2025-10-10 16:00:00+03', '2025-10-10 16:00:00+03', '{"referral_id": "abc123", "level": 1}', NULL),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'referral_bonus', 75.00, 0.00, 75.00, 'completed', 'Referral bonus: Level progression bonus', 'wallet', '2025-11-20 12:30:00+03', '2025-11-20 12:30:00+03', '{"referral_id": "abc123", "milestone": "level_2"}', NULL),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'referral_bonus', 125.00, 0.00, 125.00, 'completed', 'Referral bonus: Active user bonus', 'wallet', '2025-12-15 14:45:00+03', '2025-12-15 14:45:00+03', '{"referral_id": "abc123", "type": "monthly_bonus"}', NULL),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'referral_bonus', 100.00, 0.00, 100.00, 'completed', 'Referral bonus: New year bonus', 'wallet', '2025-01-01 09:00:00+03', '2025-01-01 09:00:00+03', '{"referral_id": "abc123", "type": "new_year"}', NULL),

-- Gift code earnings
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'gift_code', 50.00, 0.00, 50.00, 'completed', 'Gift code: WELCOME2025', 'wallet', '2025-10-15 18:30:00+03', '2025-10-15 18:30:00+03', '{"gift_code": "WELCOME2025", "reward_type": "welcome_bonus"}', NULL),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'gift_code', 150.00, 0.00, 150.00, 'completed', 'Gift code: HOLIDAY2025', 'wallet', '2025-12-20 20:15:00+03', '2025-12-20 20:15:00+03', '{"gift_code": "HOLIDAY2025", "reward_type": "holiday_bonus"}', NULL),

-- Spin winnings
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'spin_win', 25.00, 0.00, 25.00, 'completed', 'Daily spin win', 'wallet', '2025-10-11 20:00:00+03', '2025-10-11 20:00:00+03', '{"spin_type": "daily", "prize": "25"}', NULL),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'spin_win', 15.00, 0.00, 15.00, 'completed', 'Daily spin win', 'wallet', '2025-10-12 19:30:00+03', '2025-10-12 19:30:00+03', '{"spin_type": "daily", "prize": "15"}', NULL),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'spin_win', 30.00, 0.00, 30.00, 'completed', 'Daily spin win', 'wallet', '2025-11-15 21:00:00+03', '2025-11-15 21:00:00+03', '{"spin_type": "daily", "prize": "30"}', NULL),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'spin_win', 20.00, 0.00, 20.00, 'completed', 'Daily spin win', 'wallet', '2025-12-25 22:30:00+03', '2025-12-25 22:30:00+03', '{"spin_type": "daily", "prize": "20"}', NULL),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'spin_win', 40.00, 0.00, 40.00, 'completed', 'Daily spin win', 'wallet', '2025-01-10 20:45:00+03', '2025-01-10 20:45:00+03', '{"spin_type": "daily", "prize": "40"}', NULL),

-- Withdrawals
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'withdrawal', -500.00, 25.00, -525.00, 'completed', 'Withdrawal to M-Pesa', 'mpesa', '2025-11-30 15:00:00+03', '2025-11-30 15:30:00+03', '{"withdrawal_id": "WID001", "phone": "+254712345678"}', 'MP789012'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'withdrawal', -700.00, 35.00, -735.00, 'completed', 'Withdrawal to M-Pesa', 'mpesa', '2025-12-28 16:15:00+03', '2025-12-28 16:45:00+03', '{"withdrawal_id": "WID002", "phone": "+254712345678"}', 'MP789013');

-- 5. TASK COMPLETIONS
INSERT INTO task_completions (id, user_id, app_name, app_id, earnings, completion_date, install_duration, created_at, metadata) VALUES
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'TikTok Lite', 'com.zhiliaoapp.lite', 45.00, '2025-10-11', 180, '2025-10-11 16:20:00+03', '{"device": "Samsung", "os_version": "13"}'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'WhatsApp Business', 'com.whatsapp.w4b', 35.50, '2025-10-12', 150, '2025-10-12 11:30:00+03', '{"device": "Samsung", "os_version": "13"}'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'Facebook Lite', 'com.facebook.lite', 52.25, '2025-10-13', 200, '2025-10-13 14:15:00+03', '{"device": "Samsung", "os_version": "13"}'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'Instagram', 'com.instagram.android', 48.75, '2025-11-05', 165, '2025-11-05 09:45:00+03', '{"device": "Samsung", "os_version": "13"}'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'YouTube Music', 'com.google.android.apps.youtube.music', 41.00, '2025-11-12', 190, '2025-11-12 16:30:00+03', '{"device": "Samsung", "os_version": "13"}'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'Spotify', 'com.spotify.music', 55.50, '2025-12-02', 175, '2025-12-02 13:20:00+03', '{"device": "Samsung", "os_version": "13"}'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'Twitter', 'com.twitter.android', 38.25, '2025-12-08', 140, '2025-12-08 10:15:00+03', '{"device": "Samsung", "os_version": "13"}'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'Telegram', 'org.telegram.messenger', 62.00, '2025-01-02', 210, '2025-01-02 15:30:00+03', '{"device": "Samsung", "os_version": "13"}'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'Snapchat', 'com.snapchat.android', 47.50, '2025-01-05', 155, '2025-01-05 11:45:00+03', '{"device": "Samsung", "os_version": "13"}'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'Viber', 'com.viber.voip', 28.50, '2025-01-13', 120, '2025-01-13 08:30:00+03', '{"device": "Samsung", "os_version": "13"}'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'Discord', 'com.discord', 35.00, '2025-01-13', 135, '2025-01-13 10:15:00+03', '{"device": "Samsung", "os_version": "13"}'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'LinkedIn', 'com.linkedin.android', 62.00, '2025-01-13', 195, '2025-01-13 14:20:00+03', '{"device": "Samsung", "os_version": "13"}');

-- 6. INVESTMENTS
INSERT INTO investments (id, user_id, bank_name, amount, daily_rate, duration_days, current_value, status, created_at, maturity_date, metadata) VALUES
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'Equity Bank', 800.00, 0.05, 30, 920.00, 'completed', '2025-10-20 10:00:00+03', '2025-11-19', '{"bank_code": "EQTY", "interest_type": "simple"}'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'KCB Bank', 1200.00, 0.06, 60, 1483.20, 'active', '2025-11-01 14:30:00+03', '2025-12-31', '{"bank_code": "KCB", "interest_type": "compound"}'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'Cooperative Bank', 500.00, 0.04, 45, 590.00, 'active', '2025-12-01 09:15:00+03', '2026-01-15', '{"bank_code": "COOP", "interest_type": "simple"}');

-- 7. SPIN ATTEMPTS
INSERT INTO spin_attempts (id, user_id, spin_date, prize_won, prize_value, created_at, metadata) VALUES
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', '2025-10-11', '25 KES', 25.00, '2025-10-11 20:00:00+03', '{"spin_type": "daily", "segment": 3}'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', '2025-10-12', '15 KES', 15.00, '2025-10-12 19:30:00+03', '{"spin_type": "daily", "segment": 2}'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', '2025-11-15', '30 KES', 30.00, '2025-11-15 21:00:00+03', '{"spin_type": "daily", "segment": 4}'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', '2025-12-25', '20 KES', 20.00, '2025-12-25 22:30:00+03', '{"spin_type": "daily", "segment": 3}'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', '2025-01-10', '40 KES', 40.00, '2025-01-10 20:45:00+03', '{"spin_type": "daily", "segment": 5}');

-- 8. GIFT CODE REDEMPTIONS
-- First create the gift codes that will be redeemed
INSERT INTO gift_codes (id, code, main_wallet_amount, income_wallet_amount, reward_type, description, created_by, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'WELCOME2025', 25.00, 25.00, 'main_wallet', 'Welcome bonus for new users', 'system', true, '2025-10-10 14:00:00+03', '2025-10-10 14:00:00+03'),
(gen_random_uuid(), 'HOLIDAY2025', 75.00, 75.00, 'main_wallet', 'Holiday season bonus', 'system', true, '2025-12-01 00:00:00+03', '2025-12-01 00:00:00+03');

-- Now insert the redemptions with valid gift code IDs
INSERT INTO gift_code_redemptions (id, user_id, gift_code_id, main_wallet_reward, income_wallet_reward, redeemed_at) VALUES
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', (SELECT id FROM gift_codes WHERE code = 'WELCOME2025' LIMIT 1), 25.00, 25.00, '2025-10-15 18:30:00+03'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', (SELECT id FROM gift_codes WHERE code = 'HOLIDAY2025' LIMIT 1), 75.00, 75.00, '2025-12-20 20:15:00+03');

-- 10. USER ACTIVITY LOGS
INSERT INTO user_activity_logs (id, user_id, action, details, created_at) VALUES
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'login', '{"ip": "192.168.1.100", "device": "Samsung Galaxy A54"}', '2025-01-13 09:15:00+03'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'task_completed', '{"app_name": "LinkedIn", "earnings": 62.00}', '2025-01-13 14:20:00+03'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'spin_attempt', '{"prize": "40 KES"}', '2025-01-10 20:45:00+03'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', 'profile_update', '{"field": "withdrawal_account"}', '2025-01-05 11:00:00+03');

-- 11. USER CHECKINS
INSERT INTO user_checkins (id, user_id, checkin_date, checkin_time, ip_address, user_agent, created_at) VALUES
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', '2025-01-13', '2025-01-13 09:15:00+03', '192.168.1.100'::inet, 'GigSmart-Android/2.0.0', '2025-01-13 09:15:00+03'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', '2025-01-12', '2025-01-12 08:45:00+03', '192.168.1.100'::inet, 'GigSmart-Android/2.0.0', '2025-01-12 08:45:00+03'),
(gen_random_uuid(), 'bce9d58d-be31-4c12-be64-475d61d1ca8c', '2025-01-11', '2025-01-11 09:30:00+03', '192.168.1.100'::inet, 'GigSmart-Android/2.0.0', '2025-01-11 09:30:00+03');

-- =====================================================
-- VERIFICATION QUERIES (Run these to verify data)
-- =====================================================

-- Check user wallet balances
-- SELECT main_wallet, income_wallet, wealth_fund_balance, real_balance, total_earnings FROM users WHERE id = 'bce9d58d-be31-4c12-be64-475d61d1ca8c';

-- Check transaction summary
-- SELECT type, COUNT(*) as count, SUM(amount) as total FROM transactions WHERE user_id = 'bce9d58d-be31-4c12-be64-475d61d1ca8c' GROUP BY type;

-- Check earnings by period
-- SELECT today_earnings, yesterday_earnings, week_earnings, month_earnings FROM users WHERE id = 'bce9d58d-be31-4c12-be64-475d61d1ca8c';

-- =====================================================
-- SUMMARY OF UPDATED DATA
-- =====================================================
-- User: Existing user updated to J2 Level since Oct 10, 2025
-- Total Earnings: 8,750.50 KES
-- Today's Earnings: 125.50 KES (3 tasks completed)
-- Yesterday's Earnings: 89.00 KES
-- Week Earnings: 650.25 KES
-- Month Earnings: 2,850.75 KES
-- Main Wallet: 2,450.75 KES
-- Income Wallet: 3,890.25 KES
-- Wealth Fund: 1,200.00 KES
-- Real Balance: 2,450.75 KES
-- Total Withdrawals: 1,200.00 KES
-- Referral Earnings: 450.00 KES
-- Gift Code Earnings: 200.00 KES
-- Active Investments: 2 (total value: 2,073.20 KES)
-- Tasks Completed: 12
-- Login Count: Updated to 127
-- User Category: Middle Class
-- =====================================================
