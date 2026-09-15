-- Fix Issue #4: Date-based earnings and task reset system
-- Problem: Today's earnings and tasks don't reset at new day, show same values for all days
-- Solution: Create functions to properly handle daily resets and time-based calculations

-- Function to reset daily stats at midnight
CREATE OR REPLACE FUNCTION reset_daily_stats()
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

-- Function to get proper date-based earnings
CREATE OR REPLACE FUNCTION get_earnings_for_period(user_uuid UUID, period_type TEXT)
RETURNS TABLE(period_earnings DECIMAL) AS $$
BEGIN
    IF period_type = 'today' THEN
        RETURN QUERY
        SELECT COALESCE(SUM(amount), 0) as period_earnings
        FROM transactions 
        WHERE user_id = user_uuid 
            AND type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win')
            AND DATE(created_at) = CURRENT_DATE
            AND type != 'deposit';
    
    ELSIF period_type = 'yesterday' THEN
        RETURN QUERY
        SELECT COALESCE(SUM(amount), 0) as period_earnings
        FROM transactions 
        WHERE user_id = user_uuid 
            AND type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win')
            AND DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
            AND type != 'deposit';
    
    ELSIF period_type = 'this_week' THEN
        RETURN QUERY
        SELECT COALESCE(SUM(amount), 0) as period_earnings
        FROM transactions 
        WHERE user_id = user_uuid 
            AND type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win')
            AND created_at >= DATE_TRUNC('week', NOW())
            AND type != 'deposit';
    
    ELSIF period_type = 'this_month' THEN
        RETURN QUERY
        SELECT COALESCE(SUM(amount), 0) as period_earnings
        FROM transactions 
        WHERE user_id = user_uuid 
            AND type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win')
            AND DATE_TRUNC('month', NOW()) = DATE_TRUNC('month', created_at)
            AND type != 'deposit';
    
    ELSE
        RETURN QUERY SELECT 0 as period_earnings;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get tasks completed for period
CREATE OR REPLACE FUNCTION get_tasks_for_period(user_uuid UUID, period_type TEXT)
RETURNS TABLE(period_tasks INTEGER) AS $$
BEGIN
    IF period_type = 'today' THEN
        RETURN QUERY
        SELECT COALESCE(COUNT(*), 0) as period_tasks
        FROM user_daily_activity 
        WHERE user_id = user_uuid 
            AND stats_date = CURRENT_DATE;
    
    ELSIF period_type = 'yesterday' THEN
        RETURN QUERY
        SELECT COALESCE(COUNT(*), 0) as period_tasks
        FROM user_daily_activity 
        WHERE user_id = user_uuid 
            AND stats_date = CURRENT_DATE - INTERVAL '1 day';
    
    ELSIF period_type = 'this_week' THEN
        RETURN QUERY
        SELECT COALESCE(COUNT(DISTINCT stats_date), 0) as period_tasks
        FROM user_daily_activity 
        WHERE user_id = user_uuid 
            AND stats_date >= DATE_TRUNC('week', NOW());
    
    ELSIF period_type = 'this_month' THEN
        RETURN QUERY
        SELECT COALESCE(COUNT(DISTINCT stats_date), 0) as period_tasks
        FROM user_daily_activity 
        WHERE user_id = user_uuid 
            AND DATE_TRUNC('month', NOW()) = DATE_TRUNC('month', stats_date);
    
    ELSE
        RETURN QUERY SELECT 0 as period_tasks;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Update users table to add last_daily_reset field if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_daily_reset DATE DEFAULT CURRENT_DATE;

-- Create view for proper period-based earnings
CREATE OR REPLACE VIEW user_earnings_proper AS
SELECT 
    u.id as user_id,
    u.username,
    -- Today's earnings (excluding deposits)
    COALESCE(today.amount, 0) as today_earnings,
    -- Yesterday's earnings
    COALESCE(yesterday.amount, 0) as yesterday_earnings,
    -- This week's earnings
    COALESCE(this_week.amount, 0) as week_earnings,
    -- This month's earnings
    COALESCE(this_month.amount, 0) as month_earnings,
    -- Total earnings
    COALESCE(total_earnings, 0) as total_earnings,
    -- Today's tasks
    COALESCE(today_tasks.tasks_completed, 0) as tasks_completed_today,
    -- Last reset date
    u.last_daily_reset
FROM users u
LEFT JOIN LATERAL (
    SELECT SUM(amount) as amount
    FROM get_earnings_for_period(u.id, 'today')
) today ON true
LEFT JOIN LATERAL (
    SELECT SUM(amount) as amount
    FROM get_earnings_for_period(u.id, 'yesterday')
) yesterday ON true
LEFT JOIN LATERAL (
    SELECT SUM(amount) as amount
    FROM get_earnings_for_period(u.id, 'this_week')
) this_week ON true
LEFT JOIN LATERAL (
    SELECT SUM(amount) as amount
    FROM get_earnings_for_period(u.id, 'this_month')
) this_month ON true
LEFT JOIN LATERAL (
    SELECT tasks_completed
    FROM get_tasks_for_period(u.id, 'today')
) today_tasks ON true;

-- Create scheduled job to reset daily stats at midnight
-- Note: This requires pg_cron extension
SELECT cron.schedule(
    '0 0 * * *',  -- Run at midnight every day
    $$SELECT reset_daily_stats();$$
);

-- Update existing users last_daily_reset
UPDATE users 
SET last_daily_reset = CURRENT_DATE
WHERE last_daily_reset IS NULL;
