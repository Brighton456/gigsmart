-- Fix for slow user profile creation
-- The issue: trigger_update_daily_stats_user runs expensive aggregation queries on every user insert
-- Solution: Remove the trigger or make it async

-- Option 1: Remove the trigger entirely (recommended for now)
DROP TRIGGER IF EXISTS trigger_update_daily_stats_user ON users;

-- Option 2: Create a lighter version that doesn't run expensive queries
CREATE OR REPLACE FUNCTION update_daily_stats_on_user_create_light()
RETURNS TRIGGER AS $$
BEGIN
    -- Just ensure the daily stats record exists, don't refresh expensive calculations
    INSERT INTO daily_statistics (stat_date)
    VALUES (CURRENT_DATE)
    ON CONFLICT (stat_date) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the lighter trigger
CREATE TRIGGER trigger_update_daily_stats_user_light
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION update_daily_stats_on_user_create_light();

-- Note: You can run refresh_daily_statistics() manually or via a cron job
-- instead of on every user creation
