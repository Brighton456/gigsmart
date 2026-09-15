-- Fix Issue #11: Implement daily user check-in system
-- Problem: Need to track users who open accounts each day for activity monitoring
-- Solution: Create check-in system with daily tracking and analytics

-- Create user_checkins table
CREATE TABLE IF NOT EXISTS user_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL,
    checkin_time TIMESTAMP DEFAULT NOW(),
    app_version VARCHAR(50),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_activity_summary table for analytics
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
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Function to record daily check-in
CREATE OR REPLACE FUNCTION record_user_checkin(
    user_uuid UUID,
    app_ver VARCHAR DEFAULT NULL,
    user_ip INET DEFAULT NULL,
    user_agent_text TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    today_checkin_exists BOOLEAN;
    streak_count INTEGER;
    missed_count INTEGER;
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
        user_id, checkin_date, app_version, ip_address, user_agent
    ) VALUES (
        user_uuid, CURRENT_DATE, app_ver, user_ip, user_agent_text
    );
    
    -- Update activity summary
    INSERT INTO user_activity_summary (
        user_id, account_created_date, total_checkins, current_streak
    ) VALUES (
        user_uuid,
        (SELECT created_at::DATE FROM users WHERE id = user_uuid),
        1,
        COALESCE(
            (SELECT current_streak + 1 FROM user_activity_summary WHERE user_id = user_uuid),
            1
        )
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        total_checkins = user_activity_summary.total_checkins + 1,
        current_streak = CASE 
            WHEN (
                SELECT MAX(checkin_date) FROM user_checkins 
                WHERE user_id = user_uuid AND checkin_date >= CURRENT_DATE - INTERVAL '1 day'
            ) = CURRENT_DATE - INTERVAL '1 day'
            THEN user_activity_summary.current_streak + 1
            ELSE 1
        END,
        longest_streak = GREATEST(user_activity_summary.longest_streak, user_activity_summary.current_streak),
        last_checkin_date = CURRENT_DATE,
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate missed check-ins
CREATE OR REPLACE FUNCTION calculate_missed_checkins()
RETURNS VOID AS $$
DECLARE
    user_record RECORD;
    days_since_creation INTEGER;
    expected_checkins INTEGER;
BEGIN
    -- Update missed check-ins for all users
    FOR user_record IN 
        SELECT u.id, u.created_at::DATE as created_date, uas.total_checkins
        FROM users u
        LEFT JOIN user_activity_summary uas ON u.id = uas.user_id
    LOOP
        -- Calculate days since account creation
        days_since_creation := CURRENT_DATE - user_record.created_date;
        expected_checkins := days_since_creation + 1; -- +1 for today
        
        -- Update missed check-ins
        UPDATE user_activity_summary 
        SET 
            missed_checkins = GREATEST(0, expected_checkins - user_record.total_checkins),
            checkin_percentage = CASE 
                WHEN expected_checkins > 0 THEN (user_record.total_checkins::DECIMAL / expected_checkins) * 100
                ELSE 0
            END,
            total_days_since_creation = days_since_creation,
            updated_at = NOW()
        WHERE user_id = user_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- View for user check-in analytics
CREATE OR REPLACE VIEW user_checkin_analytics AS
SELECT 
    u.id as user_id,
    u.username,
    u.phone,
    u.email,
    u.created_at as account_created_date,
    CURRENT_DATE - u.created_at::DATE as days_since_creation,
    COALESCE(uas.total_checkins, 0) as total_checkins,
    COALESCE(uas.missed_checkins, 0) as missed_checkins,
    COALESCE(uas.current_streak, 0) as current_streak,
    COALESCE(uas.longest_streak, 0) as longest_streak,
    COALESCE(uas.checkin_percentage, 0) as checkin_percentage,
    COALESCE(uas.last_checkin_date, NULL) as last_checkin_date,
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM user_checkins uc 
            WHERE uc.user_id = u.id AND uc.checkin_date = CURRENT_DATE
        ) THEN TRUE
        ELSE FALSE
    END as checked_in_today,
    -- Activity level classification
    CASE 
        WHEN COALESCE(uas.checkin_percentage, 0) >= 90 THEN 'Highly Active'
        WHEN COALESCE(uas.checkin_percentage, 0) >= 70 THEN 'Active'
        WHEN COALESCE(uas.checkin_percentage, 0) >= 50 THEN 'Moderately Active'
        WHEN COALESCE(uas.checkin_percentage, 0) >= 30 THEN 'Low Activity'
        ELSE 'Inactive'
    END as activity_level
FROM users u
LEFT JOIN user_activity_summary uas ON u.id = uas.user_id;

-- View for daily check-in statistics
CREATE OR REPLACE VIEW daily_checkin_stats AS
SELECT 
    checkin_date,
    COUNT(*) as daily_checkins,
    COUNT(DISTINCT user_id) as unique_users,
    EXTRACT(DOW FROM checkin_date) as day_of_week,
    TO_CHAR(checkin_date, 'Month') as month_name
FROM user_checkins
WHERE checkin_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY checkin_date
ORDER BY checkin_date DESC;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_checkins_user_date ON user_checkins(user_id, checkin_date);
CREATE INDEX IF NOT EXISTS idx_user_checkins_date ON user_checkins(checkin_date DESC);
CREATE INDEX IF NOT EXISTS idx_activity_summary_user_id ON user_activity_summary(user_id);

-- Scheduled job to calculate missed check-ins daily
-- Note: This requires pg_cron extension
SELECT cron.schedule(
    '0 1 * * *',  -- Run at 1 AM every day
    $$SELECT calculate_missed_checkins();$$
);

-- Update existing users with activity summary
INSERT INTO user_activity_summary (user_id, account_created_date, total_checkins, current_streak)
SELECT 
    id, 
    created_at::DATE, 
    0, 
    0
FROM users 
WHERE id NOT IN (SELECT user_id FROM user_activity_summary);
