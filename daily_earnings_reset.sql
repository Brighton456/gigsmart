-- Daily earnings reset function and pgCron job
-- This moves today's earnings to yesterday and resets daily counters

-- Create the function to reset daily stats for all users
CREATE OR REPLACE FUNCTION reset_daily_earnings_for_all_users()
RETURNS void AS $$
DECLARE
    user_record RECORD;
    today_date DATE := CURRENT_DATE;
BEGIN
    -- Loop through all users who haven't been reset today
    FOR user_record IN 
        SELECT id, today_earnings, tasks_completed_today
        FROM users 
        WHERE tasks_reset_date IS NULL 
           OR tasks_reset_date != today_date
    LOOP
        -- Update the user's daily stats
        UPDATE users 
        SET 
            yesterday_earnings = user_record.today_earnings,
            today_earnings = 0,
            tasks_completed_today = 0,
            tasks_reset_date = today_date,
            updated_at = NOW()
        WHERE id = user_record.id;
        
        -- Log the reset for audit purposes
        INSERT INTO user_activity_logs (user_id, action, details, created_at)
        VALUES (
            user_record.id, 
            'daily_stats_reset', 
            json_build_object(
                'previous_earnings', user_record.today_earnings,
                'previous_tasks', user_record.tasks_completed_today,
                'reset_date', today_date
            ),
            NOW()
        );
    END LOOP;
    
    RAISE LOG 'Daily earnings reset completed for % users', 
               (SELECT COUNT(*) FROM users WHERE tasks_reset_date = today_date);
END;
$$ LANGUAGE plpgsql;

-- Create the activity logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);

-- Enable pgCron extension if not exists
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the daily reset job to run at 12:05 AM every day
SELECT cron.schedule(
    'daily-earnings-reset',
    '5 0 * * *',  -- 5 minutes after midnight every day
    'SELECT reset_daily_earnings_for_all_users();'
);

-- Create a manual trigger function for immediate resets (optional)
CREATE OR REPLACE FUNCTION reset_user_daily_stats(user_uuid UUID)
RETURNS void AS $$
DECLARE
    today_date DATE := CURRENT_DATE;
    current_today_earnings DECIMAL;
    current_tasks_completed INTEGER;
BEGIN
    -- Get current user stats
    SELECT today_earnings, tasks_completed_today 
    INTO current_today_earnings, current_tasks_completed
    FROM users 
    WHERE id = user_uuid;
    
    -- Update the user's daily stats
    UPDATE users 
    SET 
        yesterday_earnings = current_today_earnings,
        today_earnings = 0,
        tasks_completed_today = 0,
        tasks_reset_date = today_date,
        updated_at = NOW()
    WHERE id = user_uuid;
    
    -- Log the reset
    INSERT INTO user_activity_logs (user_id, action, details, created_at)
    VALUES (
        user_uuid, 
        'daily_stats_reset', 
        json_build_object(
            'previous_earnings', current_today_earnings,
            'previous_tasks', current_tasks_completed,
            'reset_date', today_date,
            'triggered_by', 'manual_function'
        ),
        NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION reset_daily_earnings_for_all_users() TO authenticated;
GRANT EXECUTE ON FUNCTION reset_user_daily_stats(UUID) TO authenticated;
