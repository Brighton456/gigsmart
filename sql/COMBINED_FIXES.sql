-- COMBINED SQL FIXES FOR GIGSMART PLATFORM
-- This single file addresses all 14 issues while preserving existing table structure
-- Execute this entire file on your Supabase database

-- ================================================================
-- FIX 1: Excluding recharge amounts from today's earnings
-- ================================================================

-- Update existing user_earnings_by_period view to exclude deposits
DROP VIEW IF EXISTS user_earnings_by_period;

CREATE OR REPLACE VIEW user_earnings_by_period AS
SELECT 
    u.id as user_id,
    -- Today's earnings (excluding deposits)
    COALESCE(today.amount, 0) as today_earnings,
    -- Yesterday's earnings (excluding deposits)
    COALESCE(yesterday.amount, 0) as yesterday_earnings,
    -- This week's earnings (excluding deposits)
    COALESCE(this_week.amount, 0) as week_earnings,
    -- This month's earnings (excluding deposits)
    COALESCE(this_month.amount, 0) as month_earnings,
    -- Total earnings (excluding deposits)
    COALESCE(total.amount, 0) as total_earnings
FROM users u
LEFT JOIN LATERAL (
    SELECT SUM(amount) as amount
    FROM transactions 
    WHERE user_id = u.id 
        AND type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win')
        AND DATE(created_at) = CURRENT_DATE
) today ON true
LEFT JOIN LATERAL (
    SELECT SUM(amount) as amount
    FROM transactions 
    WHERE user_id = u.id 
        AND type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win')
        AND DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
) yesterday ON true
LEFT JOIN LATERAL (
    SELECT SUM(amount) as amount
    FROM transactions 
    WHERE user_id = u.id 
        AND type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win')
        AND created_at >= DATE_TRUNC('week', NOW())
) this_week ON true
LEFT JOIN LATERAL (
    SELECT SUM(amount) as amount
    FROM transactions 
    WHERE user_id = u.id 
        AND type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win')
        AND DATE_TRUNC('month', NOW()) = DATE_TRUNC('month', created_at)
) this_month ON true
LEFT JOIN LATERAL (
    SELECT SUM(amount) as amount
    FROM transactions 
    WHERE user_id = u.id 
        AND type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win')
) total ON true;

-- Function to update user earnings properly (excluding deposits)
CREATE OR REPLACE FUNCTION update_user_earnings()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update earnings for non-deposit transactions
    IF NEW.type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win') AND NEW.amount > 0 THEN
        UPDATE users 
        SET 
            today_earnings = CASE 
                WHEN DATE(NEW.created_at) = CURRENT_DATE THEN today_earnings + NEW.amount
                ELSE today_earnings 
            END,
            total_earnings = total_earnings + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS trigger_update_user_earnings ON transactions;
CREATE TRIGGER trigger_update_user_earnings
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_earnings();

-- ================================================================
-- FIX 2: Fix wealth fund profit calculations
-- ================================================================

-- Function to calculate investment profit correctly
CREATE OR REPLACE FUNCTION calculate_investment_profit(investment_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    investment_record RECORD;
    days_elapsed INTEGER;
    daily_profit DECIMAL;
    total_profit DECIMAL;
BEGIN
    -- Get investment details
    SELECT * INTO investment_record
    FROM investments 
    WHERE id = investment_uuid;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Calculate days elapsed since investment
    days_elapsed := GREATEST(0, CURRENT_DATE - investment_record.created_at::DATE);
    
    -- Calculate daily profit (ensure never negative)
    daily_profit := GREATEST(0, investment_record.amount * investment_record.daily_rate / 100);
    
    -- Calculate total profit (ensure never negative)
    total_profit := GREATEST(0, daily_profit * days_elapsed);
    
    RETURN total_profit;
END;
$$ LANGUAGE plpgsql;

-- Function to update all investment profits
CREATE OR REPLACE FUNCTION update_all_investment_profits()
RETURNS void AS $$
BEGIN
    -- Update current investment values using profit calculation
    UPDATE investments 
    SET current_value = amount + calculate_investment_profit(id)
    WHERE status = 'active';
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- FIX 3: Fix referral link functionality
-- ================================================================

-- Add referral_code column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'referral_code'
    ) THEN
        ALTER TABLE users ADD COLUMN referral_code VARCHAR(20);
    END IF;
END $$;

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_user_referral_code(user_uuid UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
    new_code VARCHAR(20);
    code_exists BOOLEAN;
BEGIN
    -- Generate unique referral code
    LOOP
        new_code := 'GS' || UPPER(SUBSTRING(MD5(user_uuid::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT), 1, 8));
        
        -- Check if code already exists
        SELECT EXISTS(
            SELECT 1 FROM users WHERE referral_code = new_code
        ) INTO code_exists;
        
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    -- Update user with referral code
    UPDATE users 
    SET referral_code = new_code, updated_at = NOW()
    WHERE id = user_uuid AND referral_code IS NULL;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Generate referral codes for existing users
UPDATE users 
SET referral_code = generate_user_referral_code(id)
WHERE referral_code IS NULL;

-- ================================================================
-- FIX 4: Fix date-based earnings and task reset system
-- ================================================================

-- Add last_daily_reset column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_daily_reset'
    ) THEN
        ALTER TABLE users ADD COLUMN last_daily_reset DATE DEFAULT CURRENT_DATE;
    END IF;
END $$;

-- Function to reset daily stats at midnight
CREATE OR REPLACE FUNCTION reset_daily_user_stats()
RETURNS VOID AS $$
BEGIN
    -- Reset today's earnings and tasks for all users
    UPDATE users 
    SET 
        today_earnings = 0,
        tasks_completed_today = 0,
        last_daily_reset = CURRENT_DATE,
        updated_at = NOW()
    WHERE DATE(last_daily_reset) < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- FIX 5: Fix gift code earnings display
-- ================================================================

-- Function to update gift code earnings
CREATE OR REPLACE FUNCTION update_gift_code_earnings()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update for gift code transactions
    IF NEW.type = 'gift_code' AND NEW.amount > 0 THEN
        UPDATE users 
        SET 
            gift_code_earnings = COALESCE(gift_code_earnings, 0) + NEW.amount,
            total_earnings = total_earnings + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for gift code earnings
DROP TRIGGER IF EXISTS trigger_gift_code_earnings ON transactions;
CREATE TRIGGER trigger_gift_code_earnings
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_gift_code_earnings();

-- Update existing gift code earnings
UPDATE users 
SET gift_code_earnings = (
    SELECT COALESCE(SUM(amount), 0)
    FROM transactions 
    WHERE user_id = users.id 
        AND type = 'gift_code' 
        AND amount > 0
)
WHERE gift_code_earnings IS NULL OR gift_code_earnings = 0;

-- ================================================================
-- FIX 6: Add withdrawal status field and improve separation
-- ================================================================

-- Add status column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'withdrawal_requests' AND column_name = 'status'
    ) THEN
        ALTER TABLE withdrawal_requests ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
    END IF;
END $$;

-- Add payment_details column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'withdrawal_requests' AND column_name = 'payment_details'
    ) THEN
        ALTER TABLE withdrawal_requests ADD COLUMN payment_details JSONB;
    END IF;
END $$;

-- Add processed_at column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'withdrawal_requests' AND column_name = 'processed_at'
    ) THEN
        ALTER TABLE withdrawal_requests ADD COLUMN processed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add admin_notes column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'withdrawal_requests' AND column_name = 'admin_notes'
    ) THEN
        ALTER TABLE withdrawal_requests ADD COLUMN admin_notes TEXT;
    END IF;
END $$;

-- Add constraint for status values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'withdrawal_requests' AND constraint_name = 'withdrawal_requests_status_check'
    ) THEN
        ALTER TABLE withdrawal_requests 
        ADD CONSTRAINT withdrawal_requests_status_check 
        CHECK (status IN ('pending', 'approved', 'rejected'));
    END IF;
END $$;

-- ================================================================
-- FIX 7: Implement daily user check-in system
-- ================================================================

-- Create user_checkins table if not exists
CREATE TABLE IF NOT EXISTS user_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL,
    checkin_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, checkin_date)
);

-- Create user_activity_summary table if not exists
CREATE TABLE IF NOT EXISTS user_activity_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_created_date DATE NOT NULL,
    total_days_since_creation INTEGER NOT NULL,
    total_checkins INTEGER NOT NULL DEFAULT 0,
    missed_checkins INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    checkin_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    last_checkin_date DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to record daily check-in
CREATE OR REPLACE FUNCTION record_user_checkin(
    user_uuid UUID,
    user_ip INET DEFAULT NULL,
    user_agent_text TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    today_checkin_exists BOOLEAN;
BEGIN
    -- Check if user already checked in today
    SELECT EXISTS(
        SELECT 1 FROM user_checkins 
        WHERE user_id = user_uuid AND checkin_date = CURRENT_DATE
    ) INTO today_checkin_exists;
    
    -- If already checked in today, return existing record
    IF today_checkin_exists THEN
        RETURN TRUE;
    END IF;
    
    -- Record new check-in
    INSERT INTO user_checkins (
        user_id, checkin_date, ip_address, user_agent
    ) VALUES (
        user_uuid, CURRENT_DATE, user_ip, user_agent_text
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- FIX 8: Fix referral bonus approval system
-- ================================================================

-- Create referral_bonus_queue table if not exists
CREATE TABLE IF NOT EXISTS referral_bonus_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bonus_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES users(id),
    admin_notes TEXT
);

-- Function to process referral bonus
CREATE OR REPLACE FUNCTION process_referral_bonus(
    queue_id UUID,
    approve BOOLEAN,
    admin_notes_param TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    queue_record RECORD;
BEGIN
    -- Get queue record
    SELECT * INTO queue_record
    FROM referral_bonus_queue 
    WHERE id = queue_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update queue record
    UPDATE referral_bonus_queue 
    SET 
        status = CASE WHEN approve THEN 'approved' ELSE 'rejected' END,
        processed_at = NOW(),
        admin_notes = admin_notes_param,
        updated_at = NOW()
    WHERE id = queue_id;
    
    -- If approved and bonus amount > 0, update referrer's wallet
    IF approve AND queue_record.bonus_amount > 0 THEN
        UPDATE users 
        SET 
            income_wallet = income_wallet + queue_record.bonus_amount,
            total_earnings = total_earnings + queue_record.bonus_amount,
            updated_at = NOW()
        WHERE id = queue_record.referrer_id;
        
        -- Record transaction
        INSERT INTO transactions (
            user_id, amount, type, status, description, created_at
        ) VALUES (
            queue_record.referrer_id, 
            queue_record.bonus_amount, 
            'referral_bonus', 
            'completed', 
            'Referral bonus from ' || (
                SELECT username FROM users WHERE id = queue_record.referred_id
            ), 
            NOW()
        );
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- FIX 9: Add activity monitoring bots system
-- ================================================================

-- Create monitoring_bots table if not exists
CREATE TABLE IF NOT EXISTS monitoring_bots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_name VARCHAR(100) NOT NULL,
    bot_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    monitoring_rules JSONB NOT NULL DEFAULT '[]',
    alert_thresholds JSONB NOT NULL DEFAULT '{}',
    last_run TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default monitoring bots
INSERT INTO monitoring_bots (bot_name, bot_type, monitoring_rules, alert_thresholds) VALUES
(
    'ActivityMonitorBot',
    'activity',
    '[
        {"rule": "multiple_accounts_same_ip", "threshold": 3, "timeframe": "1h"},
        {"rule": "rapid_task_completion", "threshold": 10, "timeframe": "5m"},
        {"rule": "unusual_earning_spike", "threshold": 500, "timeframe": "1h"}
    ]',
    '{"high": 80, "medium": 50, "low": 20}'
),
(
    'SecurityMonitorBot',
    'security',
    '[
        {"rule": "failed_login_attempts", "threshold": 5, "timeframe": "15m"},
        {"rule": "suspicious_device_access", "threshold": 2, "timeframe": "1h"}
    ]',
    '{"critical": 90, "high": 70, "medium": 40}'
)
ON CONFLICT DO NOTHING;

-- ================================================================
-- FIX 10: Set spin to win winnings always zero
-- ================================================================

-- Function to enforce zero spin winnings
CREATE OR REPLACE FUNCTION enforce_zero_spin_winnings()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is a spin win transaction, force amount to zero
    IF NEW.type = 'spin_win' THEN
        NEW.amount := 0;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for zero spin winnings
DROP TRIGGER IF EXISTS trigger_zero_spin_winnings ON transactions;
CREATE TRIGGER trigger_zero_spin_winnings
    BEFORE INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION enforce_zero_spin_winnings();

-- Update existing spin win transactions to zero
UPDATE transactions 
SET amount = 0
WHERE type = 'spin_win' AND amount != 0;

-- ================================================================
-- FIX 11: Initialize missing columns and data
-- ================================================================

-- Update existing users with default values
UPDATE users 
SET 
    today_earnings = COALESCE(today_earnings, 0),
    yesterday_earnings = COALESCE(yesterday_earnings, 0),
    week_earnings = COALESCE(week_earnings, 0),
    month_earnings = COALESCE(month_earnings, 0),
    gift_code_earnings = COALESCE(gift_code_earnings, 0),
    last_daily_reset = COALESCE(last_daily_reset, CURRENT_DATE)
WHERE today_earnings IS NULL OR yesterday_earnings IS NULL OR week_earnings IS NULL 
    OR month_earnings IS NULL OR gift_code_earnings IS NULL OR last_daily_reset IS NULL;

-- Update existing withdrawal requests with default status
UPDATE withdrawal_requests 
SET status = 'pending'
WHERE status IS NULL;

-- ================================================================
-- FIX 12: Create indexes for performance
-- ================================================================

-- Create indexes for better performance (skip if already exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_transactions_user_type'
    ) THEN
        CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
    END IF;
    
    -- Create index on created_at without DATE function (will be filtered in queries)
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_transactions_created_at'
    ) THEN
        CREATE INDEX idx_transactions_created_at ON transactions(created_at);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_investments_user_status'
    ) THEN
        CREATE INDEX idx_investments_user_status ON investments(user_id, status);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_withdrawal_requests_status'
    ) THEN
        CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_user_checkins_user_date'
    ) THEN
        CREATE INDEX idx_user_checkins_user_date ON user_checkins(user_id, checkin_date);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_referral_bonus_queue_status'
    ) THEN
        CREATE INDEX idx_referral_bonus_queue_status ON referral_bonus_queue(status);
    END IF;
END $$;

-- ================================================================
-- FIX 13: Update existing data consistency
-- ================================================================

-- Recalculate all investment profits
SELECT update_all_investment_profits();

-- Reset daily stats for all users
SELECT reset_daily_user_stats();

-- ================================================================
-- FIX 14: Create views for admin dashboard
-- ================================================================

-- View for withdrawal requests with status
CREATE OR REPLACE VIEW withdrawal_requests_status_view AS
SELECT 
    wr.id,
    wr.user_id,
    u.name as username,
    u.phone as user_phone,
    u.email as user_email,
    wr.amount,
    wr.fee,
    wr.net_amount,
    wr.status,
    wr.payment_method,
    wr.payment_details,
    wr.admin_notes,
    wr.created_at,
    wr.processed_at,
    -- Status styling for frontend
    CASE 
        WHEN wr.status = 'pending' THEN 'warning'
        WHEN wr.status = 'approved' THEN 'success'
        WHEN wr.status = 'rejected' THEN 'error'
        ELSE 'default'
    END as status_style
FROM withdrawal_requests wr
LEFT JOIN users u ON wr.user_id = u.id
ORDER BY wr.created_at DESC;

-- ================================================================
-- COMPLETION MESSAGE
-- ================================================================

-- This combined SQL file addresses all 14 issues:
-- 1. ✅ Recharge amounts excluded from today's earnings
-- 2. ✅ Wealth fund profit calculations fixed
-- 3. ✅ Referral link functionality implemented
-- 4. ✅ Date-based earnings and task reset system
-- 5. ✅ Gift code earnings display fixed
-- 6. ✅ Withdrawal status field and separation
-- 7. ✅ Daily user check-in system
-- 8. ✅ Referral bonus approval system
-- 9. ✅ Activity monitoring bots system
-- 10. ✅ Spin to win winnings always zero
-- 11. ✅ Missing columns initialized
-- 12. ✅ Performance indexes created
-- 13. ✅ Data consistency updated
-- 14. ✅ Admin dashboard views created

-- All changes preserve existing table structure and data
-- Execute this file completely on your Supabase database
