-- Safe migration additions - only creates what doesn't exist
-- Run this after create_missing_tables.sql

-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create views that don't exist or recreate with correct column names
-- Earnings eligible transactions view
CREATE OR REPLACE VIEW earnings_eligible_transactions AS
SELECT * FROM transactions t
WHERE t.status = 'completed'
  AND t.type IN (
    'task_earning','referral_bonus','investment_return','gift_code','spin_win','admin_adjustment'
  );

-- User earnings by period view
CREATE OR REPLACE VIEW user_earnings_by_period AS
SELECT
  user_id,
  SUM(CASE WHEN created_at::date = CURRENT_DATE THEN net_amount ELSE 0 END) AS today_earnings,
  SUM(CASE WHEN created_at::date = CURRENT_DATE - INTERVAL '1 day' THEN net_amount ELSE 0 END) AS yesterday_earnings,
  SUM(CASE WHEN created_at >= date_trunc('week', CURRENT_DATE) THEN net_amount ELSE 0 END) AS week_earnings,
  SUM(CASE WHEN created_at >= date_trunc('month', CURRENT_DATE) THEN net_amount ELSE 0 END) AS month_earnings,
  SUM(net_amount) AS total_earnings
FROM earnings_eligible_transactions
GROUP BY user_id;

-- Gift code earnings view
CREATE OR REPLACE VIEW user_gift_code_earnings AS
SELECT u.id AS user_id, COALESCE(SUM(gcr.income_wallet_reward + gcr.main_wallet_reward), 0) AS gift_code_earnings
FROM users u
LEFT JOIN gift_code_redemptions gcr ON gcr.user_id = u.id
GROUP BY u.id;

-- Task progress today view (fixed column names)
CREATE OR REPLACE VIEW user_task_progress_today AS
SELECT 
  user_id,
  COUNT(*) AS completed_tasks,
  SUM(earnings) AS today_earnings
FROM task_completions
WHERE created_at::date = CURRENT_DATE
GROUP BY user_id;

-- Investments with status view
CREATE OR REPLACE VIEW investments_with_status AS
SELECT *,
  CASE
    WHEN status = 'cancelled' THEN 'cancelled'
    WHEN maturity_date <= CURRENT_DATE THEN 'completed'
    ELSE status
  END AS derived_status
FROM investments;

-- Add missing columns to withdrawal_requests if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'withdrawal_requests' AND column_name = 'requested_at') THEN
        ALTER TABLE withdrawal_requests ADD COLUMN requested_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'withdrawal_requests' AND column_name = 'processed_at') THEN
        ALTER TABLE withdrawal_requests ADD COLUMN processed_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'withdrawal_requests' AND column_name = 'admin_notes') THEN
        ALTER TABLE withdrawal_requests ADD COLUMN admin_notes TEXT;
    END IF;
END $$;

-- Create admin withdrawal requests view safely
DROP VIEW IF EXISTS admin_withdrawal_requests;
CREATE VIEW admin_withdrawal_requests AS
SELECT 
  wr.id,
  wr.user_id,
  wr.amount,
  wr.fee,
  wr.net_amount,
  wr.status,
  wr.payment_details,
  wr.transaction_id,
  COALESCE(wr.requested_at, wr.created_at, NOW()) AS requested_at,
  wr.processed_at,
  wr.admin_notes,
  u.name AS user_name,
  u.phone AS user_phone,
  u.email AS user_email,
  u.withdrawal_account_type,
  u.withdrawal_account_details
FROM withdrawal_requests wr
JOIN users u ON u.id = wr.user_id;

-- Create indexes for performance (removed function-based indexes that cause errors)
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_task_completions_created_at ON task_completions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_daily_activity_date ON user_daily_activity(activity_date);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_suspicious_activity_created_at ON suspicious_activity(created_at);

-- Add is_recruit column to users if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_recruit BOOLEAN DEFAULT TRUE;
