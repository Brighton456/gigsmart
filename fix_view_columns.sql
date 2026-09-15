-- Fix for view column name mismatch
-- Run this after the main migration if you get column name errors

-- First, ensure the withdrawal_requests table has all required columns
DO $$
BEGIN
    -- Add missing columns if they don't exist
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

-- Drop and recreate admin_withdrawal_requests view with correct column names
DROP VIEW IF EXISTS admin_withdrawal_requests;

-- First check what columns actually exist in withdrawal_requests
-- Use created_at as fallback if requested_at doesn't exist
CREATE OR REPLACE VIEW admin_withdrawal_requests AS
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

-- Also fix user_task_progress_today view (column name mismatch)
DROP VIEW IF EXISTS user_task_progress_today;

CREATE OR REPLACE VIEW user_task_progress_today AS
SELECT 
  user_id,
  COUNT(*) AS completed_tasks,
  SUM(earnings) AS today_earnings
FROM task_completions
WHERE created_at::date = CURRENT_DATE
GROUP BY user_id;

-- Add missing columns to users table if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS tasks_reset_date DATE,
ADD COLUMN IF NOT EXISTS yesterday_earnings DECIMAL(15,2) DEFAULT 0.00;

-- Create suspicious_activity table for bot monitoring
CREATE TABLE IF NOT EXISTS suspicious_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','reviewed','false_positive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_suspicious_activity_user ON suspicious_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_activity_status ON suspicious_activity(status);
CREATE INDEX IF NOT EXISTS idx_suspicious_activity_risk ON suspicious_activity(risk_score);

-- Add missing columns to referral_bonus_queue
ALTER TABLE referral_bonus_queue 
ADD COLUMN IF NOT EXISTS is_recruit BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_suspicious BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0;
