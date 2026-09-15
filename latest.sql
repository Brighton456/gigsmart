
-- 1. Drop and Recreate Notifications Table
-- =============================================
DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    page_name VARCHAR(64) NOT NULL,
    poster_number INTEGER NOT NULL CHECK (poster_number BETWEEN 1 AND 3),
    status BOOLEAN NOT NULL DEFAULT TRUE,
    apply_to_levels INTEGER[] NOT NULL,
    type VARCHAR(32) NOT NULL,
    icon VARCHAR(32) NOT NULL,
    heading VARCHAR(129) NOT NULL,
    content TEXT NOT NULL,
    button_1 VARCHAR(32),
    button_2 VARCHAR(32),
    show_on_startup BOOLEAN DEFAULT FALSE,
    dismissible BOOLEAN DEFAULT TRUE,
    has_image BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    link_url TEXT,
    show_once BOOLEAN DEFAULT FALSE,
    show_for_days INTEGER,
    priority INTEGER DEFAULT 1,
    background_color VARCHAR(16),
    text_color VARCHAR(16),
    border_color VARCHAR(16),
    animation VARCHAR(32),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 2. Insert Sample Notifications (30 records)
-- =============================================
INSERT INTO notifications (page_name, poster_number, status, apply_to_levels, type, icon, heading, content, button_1, button_2, show_on_startup, dismissible, show_once, show_for_days, priority, background_color, text_color, border_color, animation) VALUES
-- Home (3)
('Home', 1, TRUE, '{1,2,3,4,5,6}', 'news', 'star', 'Welcome!', 'Start your day with new tasks.', 'Ok', 'Later', TRUE, TRUE, FALSE, 1, 1, '#fff', '#000', '#007bff', 'fade'),
('Home', 2, TRUE, '{1,2,3,4,5,6}', 'advertisement', 'gift', 'Invite Friends', 'Earn KES 100 for every referral!', 'Invite', 'Dismiss', FALSE, TRUE, FALSE, 2, 2, '#f8f9fa', '#333', '#28a745', 'slide'),
('Home', 3, TRUE, '{1,2,3,4,5,6}', 'info', 'information-circle', 'Upgrade Now', 'Unlock more tasks and earnings by upgrading your level.', 'Upgrade', 'No thanks', FALSE, TRUE, TRUE, 3, 3, '#fff', '#007bff', '#6c757d', 'bounce'),
-- Task (3)
('Task', 1, TRUE, '{2,3,4,5,6}', 'news', 'checkmark-circle', 'Daily Tasks', 'Complete all tasks to maximize your earnings.', 'Ok', NULL, TRUE, TRUE, FALSE, 1, 1, '#fff', '#000', '#28a745', 'fade'),
('Task', 2, TRUE, '{1,2,3,4,5,6}', 'advertisement', 'gift', 'Spin to Win!', 'Try your luck in the Spin Wheel for extra rewards.', 'Spin Now', 'Later', FALSE, TRUE, FALSE, 1, 2, '#fff', '#000', '#fd7e14', 'slide'),
('Task', 3, TRUE, '{1,2,3,4,5,6}', 'info', 'information-circle', 'Need Help?', 'Check the Help Book for tips on completing tasks.', 'Help Book', NULL, FALSE, TRUE, FALSE, 1, 3, '#fff', '#000', '#007bff', 'bounce'),
-- Upgrade (3)
('Upgrade', 1, TRUE, '{1,2,3,4,5,6}', 'news', 'trending-up-outline', 'Upgrade Offer', 'Special discount on upgrades this week!', 'Upgrade', 'Later', TRUE, TRUE, FALSE, 2, 1, '#fff', '#000', '#28a745', 'fade'),
('Upgrade', 2, TRUE, '{1,2,3,4,5,6}', 'advertisement', 'cash-outline', 'Bonus Earnings', 'Upgrade to J2 and earn double for 7 days.', 'Upgrade', NULL, FALSE, TRUE, FALSE, 2, 2, '#fff', '#000', '#fd7e14', 'slide'),
('Upgrade', 3, TRUE, '{1,2,3,4,5,6}', 'info', 'information-circle', 'Level Comparison', 'See the benefits of each level in the comparison table.', 'View Table', NULL, FALSE, TRUE, FALSE, 2, 3, '#fff', '#000', '#007bff', 'bounce'),
-- Team (3)
('Team', 1, TRUE, '{1,2,3,4,5,6}', 'news', 'people', 'Team Bonus', 'Earn more by building a strong team.', 'Invite', NULL, TRUE, TRUE, FALSE, 3, 1, '#fff', '#000', '#28a745', 'fade'),
('Team', 2, TRUE, '{1,2,3,4,5,6}', 'advertisement', 'gift', 'Referral Bonus', 'Get KES 100 for every friend who joins and upgrades.', 'Invite', 'Dismiss', FALSE, TRUE, FALSE, 3, 2, '#fff', '#000', '#fd7e14', 'slide'),
('Team', 3, TRUE, '{1,2,3,4,5,6}', 'info', 'information-circle', 'Team Reports', 'Check your team\'s progress in Team Reports.', 'View', NULL, FALSE, TRUE, FALSE, 3, 3, '#fff', '#000', '#007bff', 'bounce'),
-- Account (3)
('Account', 1, TRUE, '{1,2,3,4,5,6}', 'news', 'wallet-outline', 'Wallet Update', 'Track your income and recharge wallet balances here.', 'Ok', NULL, TRUE, TRUE, FALSE, 4, 1, '#fff', '#000', '#28a745', 'fade'),
('Account', 2, TRUE, '{1,2,3,4,5,6}', 'advertisement', 'cash-outline', 'Withdraw Funds', 'Withdraw your earnings easily and securely.', 'Withdraw', NULL, FALSE, TRUE, FALSE, 4, 2, '#fff', '#000', '#fd7e14', 'slide'),
('Account', 3, TRUE, '{1,2,3,4,5,6}', 'info', 'information-circle', 'Profile Info', 'Keep your personal info up to date.', 'Update', NULL, FALSE, TRUE, FALSE, 4, 3, '#fff', '#000', '#007bff', 'bounce'),
-- Wealth Fund (3)
('WealthFund', 1, TRUE, '{1,2,3,4,5,6}', 'news', 'bank', 'New Investment Options', 'Explore new banks for higher returns.', 'View', NULL, TRUE, TRUE, FALSE, 5, 1, '#fff', '#000', '#28a745', 'fade'),
('WealthFund', 2, TRUE, '{1,2,3,4,5,6}', 'advertisement', 'cash-outline', 'Limited Offer', 'Invest now and get a bonus on your returns.', 'Invest', NULL, FALSE, TRUE, FALSE, 5, 2, '#fff', '#000', '#fd7e14', 'slide'),
('WealthFund', 3, TRUE, '{1,2,3,4,5,6}', 'info', 'information-circle', 'Investment Guide', 'Check our guide for smart investing.', 'Guide', NULL, FALSE, TRUE, FALSE, 5, 3, '#fff', '#000', '#007bff', 'bounce'),
-- Recharge (3)
('Recharge', 1, TRUE, '{1,2,3,4,5,6}', 'news', 'add-circle', 'Recharge Bonus', 'Recharge today and get 5% extra.', 'Recharge', NULL, TRUE, TRUE, FALSE, 6, 1, '#fff', '#000', '#28a745', 'fade'),
('Recharge', 2, TRUE, '{1,2,3,4,5,6}', 'advertisement', 'gift', 'Top-up Offer', 'Top up your wallet and stand a chance to win prizes.', 'Top Up', NULL, FALSE, TRUE, FALSE, 6, 2, '#fff', '#000', '#fd7e14', 'slide'),
('Recharge', 3, TRUE, '{1,2,3,4,5,6}', 'info', 'information-circle', 'Recharge Info', 'Check recharge limits and offers here.', 'Info', NULL, FALSE, TRUE, FALSE, 6, 3, '#fff', '#000', '#007bff', 'bounce'),
-- Withdraw (3)
('Withdrawal', 1, TRUE, '{1,2,3,4,5,6}', 'news', 'arrow-down-circle', 'Withdrawal Info', 'Withdrawals are processed Monday to Friday.', 'Ok', NULL, TRUE, TRUE, FALSE, 7, 1, '#fff', '#000', '#28a745', 'fade'),
('Withdrawal', 2, TRUE, '{1,2,3,4,5,6}', 'advertisement', 'gift', 'Withdraw Bonus', 'Withdraw KES 10,000+ to get a bonus entry in Spin Wheel.', 'Spin Now', NULL, FALSE, TRUE, FALSE, 7, 2, '#fff', '#000', '#fd7e14', 'slide'),
('Withdrawal', 3, TRUE, '{1,2,3,4,5,6}', 'info', 'information-circle', 'Withdrawal Guide', 'See our withdrawal guide for tips.', 'Guide', NULL, FALSE, TRUE, FALSE, 7, 3, '#fff', '#000', '#007bff', 'bounce'),
-- SpinWheel (3)
('SpinWheel', 1, TRUE, '{1,2,3,4,5,6}', 'news', 'refresh-circle', 'Spin to Win', 'Try your luck every day for big rewards!', 'Spin', NULL, TRUE, TRUE, FALSE, 8, 1, '#fff', '#000', '#28a745', 'fade'),
('SpinWheel', 2, TRUE, '{1,2,3,4,5,6}', 'advertisement', 'gift', 'Spin Offer', 'Get a free spin after every 3 spins.', 'Spin Now', NULL, FALSE, TRUE, FALSE, 8, 2, '#fff', '#000', '#fd7e14', 'slide'),
('SpinWheel', 3, TRUE, '{1,2,3,4,5,6}', 'info', 'information-circle', 'Spin Rules', 'Read the rules before spinning.', 'Rules', NULL, FALSE, TRUE, FALSE, 8, 3, '#fff', '#000', '#007bff', 'bounce');

-- =============================================
-- 3. Create Spin Attempts Table
-- =============================================
CREATE TABLE IF NOT EXISTS spin_attempts (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    bet_amount INTEGER NOT NULL,
    result INTEGER NOT NULL,
    is_win BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 4. Create Investment Banks Table
-- =============================================
CREATE TABLE IF NOT EXISTS investment_banks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    rate NUMERIC(5,2) NOT NULL,
    days INTEGER NOT NULL,
    min_amount INTEGER NOT NULL,
    description TEXT,
    color VARCHAR(16)
);

-- =============================================
-- 5. Insert Sample Investment Banks (15 records)
-- =============================================
INSERT INTO investment_banks (name, rate, days, min_amount, description, color) VALUES
('Thames Royal Bank', 0.20, 7, 500, 'Low risk, short term investment', '#007bff'),
('Barcliff Trust Bank', 0.50, 14, 1000, 'Balanced risk and return profile', '#28a745'),
('Mersey Crown Bank', 0.80, 21, 2000, 'Medium risk, medium term investment', '#ffc107'),
('Edinburgh Capital Bank', 1.50, 30, 5000, 'Higher risk with attractive returns', '#dc3545'),
('Windsor Elite Bank', 2.00, 45, 10000, 'Premium investment option', '#6f42c1'),
('Liverpool Sovereign Bank', 3.00, 60, 20000, 'Maximum return investment package', '#fd7e14'),
('Kenya Growth Fund', 1.00, 30, 3000, 'Local growth investment', '#1e88e5'),
('Nairobi Secure Fund', 0.60, 14, 1500, 'Secure and stable returns', '#43a047'),
('Africa Opportunity Trust', 2.50, 60, 25000, 'High growth African markets', '#fbc02d'),
('Global Wealth Partners', 1.80, 21, 4000, 'International diversified fund', '#1976d2'),
('Emerging Markets Bank', 2.20, 45, 12000, 'Emerging market focus', '#8e24aa'),
('Prime Investors Ltd.', 1.30, 30, 3500, 'Prime investment for steady returns', '#c62828'),
('Diamond Capital', 2.80, 60, 30000, 'Diamond-grade returns', '#ad1457'),
('Savannah Investment', 1.10, 14, 2000, 'Savannah region special', '#388e3c'),
('Safari Wealth Bank', 2.60, 21, 7000, 'Safari themed high yield', '#fbc02d');

-- =============================================
-- 6. Update Levels Table (if needed)
-- =============================================
-- This assumes you already have a levels table
-- If not, you'll need to create it with appropriate columns
-- ALTER TABLE levels ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;
-- ALTER TABLE levels ADD COLUMN IF NOT EXISTS tasks_required INTEGER DEFAULT 0;