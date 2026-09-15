-- Create missing tables for the new features
-- Run this if you get "relation does not exist" errors

-- Create referral_bonus_queue table
CREATE TABLE IF NOT EXISTS referral_bonus_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 3),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','pending-review')),
  is_recruit BOOLEAN DEFAULT TRUE,
  is_suspicious BOOLEAN DEFAULT FALSE,
  risk_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  admin_notes TEXT,
  UNIQUE(referrer_id, referred_id, level)
);

CREATE INDEX IF NOT EXISTS idx_referral_bonus_queue_referrer ON referral_bonus_queue(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_bonus_queue_status ON referral_bonus_queue(status);

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

-- Create activity_logs table for comprehensive logging
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  details JSONB,
  ip INET,
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_event ON activity_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);

-- Create user_daily_activity table for daily check-ins
CREATE TABLE IF NOT EXISTS user_daily_activity (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip INET,
  device_info JSONB,
  PRIMARY KEY (user_id, activity_date)
);

CREATE INDEX IF NOT EXISTS idx_user_daily_activity_date ON user_daily_activity(activity_date);

-- Add missing columns to users table if they don't exist
DO $$
BEGIN
    -- Check and add is_recruit column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'is_recruit') THEN
        ALTER TABLE users ADD COLUMN is_recruit BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- Check and add tasks_reset_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'tasks_reset_date') THEN
        ALTER TABLE users ADD COLUMN tasks_reset_date DATE DEFAULT CURRENT_DATE;
    END IF;
    
    -- Check and add yesterday_earnings column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'yesterday_earnings') THEN
        ALTER TABLE users ADD COLUMN yesterday_earnings DECIMAL(15,2) DEFAULT 0.00;
    END IF;
END $$;

-- Create user_activity_summary view
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT
  u.id,
  u.name,
  u.phone,
  u.email,
  u.created_at::date AS created_date,
  (CURRENT_DATE - u.created_at::date) AS account_age_days,
  COUNT(uda.activity_date) AS checkins,
  GREATEST(0, (CURRENT_DATE - u.created_at::date) - COUNT(uda.activity_date)) AS days_missed
FROM users u
LEFT JOIN user_daily_activity uda ON uda.user_id = u.id
GROUP BY u.id;
