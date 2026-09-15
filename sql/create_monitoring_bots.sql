-- Fix Issue #13: Add activity monitoring bots system
-- Problem: Need virtual bots to monitor suspicious activities
-- Solution: Create monitoring system with automated bot detection and alerting

-- Create monitoring_bots table
CREATE TABLE IF NOT EXISTS monitoring_bots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_name VARCHAR(100) NOT NULL,
    bot_type VARCHAR(50) NOT NULL, -- 'activity', 'security', 'fraud', 'performance'
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    monitoring_rules JSONB NOT NULL DEFAULT '[]',
    alert_thresholds JSONB NOT NULL DEFAULT '{}',
    last_run TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create suspicious_activities table for logging
CREATE TABLE IF NOT EXISTS suspicious_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES monitoring_bots(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    activity_data JSONB NOT NULL DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    location JSONB,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create activity_patterns table for ML-based detection
CREATE TABLE IF NOT EXISTS activity_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_name VARCHAR(100) NOT NULL,
    pattern_type VARCHAR(50) NOT NULL, -- 'behavioral', 'temporal', 'frequency', 'anomaly'
    detection_logic JSONB NOT NULL DEFAULT '{}',
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default monitoring bots
INSERT INTO monitoring_bots (bot_name, bot_type, monitoring_rules, alert_thresholds) VALUES
(
    'ActivityMonitorBot',
    'activity',
    '[
        {"rule": "multiple_accounts_same_ip", "threshold": 3, "timeframe": "1h"},
        {"rule": "rapid_task_completion", "threshold": 10, "timeframe": "5m"},
        {"rule": "unusual_earning_spike", "threshold": 500, "timeframe": "1h"},
        {"rule": "suspicious_referral_pattern", "threshold": 5, "timeframe": "24h"}
    ]',
    '{"high": 80, "medium": 50, "low": 20}'
),
(
    'SecurityMonitorBot',
    'security',
    '[
        {"rule": "failed_login_attempts", "threshold": 5, "timeframe": "15m"},
        {"rule": "password_reset_requests", "threshold": 3, "timeframe": "1h"},
        {"rule": "unusual_withdrawal_pattern", "threshold": 3, "timeframe": "1h"},
        {"rule": "suspicious_device_access", "threshold": 2, "timeframe": "1h"}
    ]',
    '{"critical": 90, "high": 70, "medium": 40}'
),
(
    'FraudMonitorBot',
    'fraud',
    '[
        {"rule": "referral_self_signups", "threshold": 1},
        {"rule": "gift_code_abuse", "threshold": 10, "timeframe": "24h"},
        {"rule": "deposit_withdrawal_loop", "threshold": 2, "timeframe": "1h"},
        {"rule": "vpn_concurrent_access", "threshold": 3, "timeframe": "1h"}
    ]',
    '{"critical": 95, "high": 75, "medium": 45}'
),
(
    'PerformanceMonitorBot',
    'performance',
    '[
        {"rule": "slow_response_times", "threshold": 5000, "timeframe": "5m"},
        {"rule": "error_rate_spike", "threshold": 10, "timeframe": "5m"},
        {"rule": "database_timeout", "threshold": 30, "timeframe": "1h"}
    ]',
    '{"high": 60, "medium": 30, "low": 15}'
);

-- Function to detect suspicious activity
CREATE OR REPLACE FUNCTION detect_suspicious_activity(
    user_uuid UUID,
    activity_type_param VARCHAR,
    activity_data_param JSONB,
    user_ip_param INET DEFAULT NULL,
    user_agent_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    bot_record RECORD;
    pattern_record RECORD;
    risk_score_total INTEGER := 0;
    suspicious_found BOOLEAN := FALSE;
    activity_id UUID;
BEGIN
    -- Get active monitoring bots
    FOR bot_record IN 
        SELECT * FROM monitoring_bots 
        WHERE status = 'active' 
            AND bot_type IN ('activity', 'security', 'fraud')
    LOOP
        -- Check each monitoring rule
        FOR pattern_record IN 
            SELECT * FROM activity_patterns 
            WHERE is_active = TRUE
        LOOP
            -- Evaluate suspicious activity based on patterns
            IF evaluate_activity_pattern(
                user_uuid, 
                activity_type_param, 
                activity_data_param, 
                pattern_record.detection_logic,
                bot_record.alert_thresholds
            ) THEN
                risk_score_total := risk_score_total + pattern_record.risk_score;
                suspicious_found := TRUE;
            END IF;
        END LOOP;
        
        EXIT WHEN suspicious_found;
    END LOOP;
    
    -- Log suspicious activity if found
    IF suspicious_found THEN
        INSERT INTO suspicious_activities (
            bot_id, user_id, activity_type, severity, 
            activity_data, ip_address, user_agent, created_at
        ) VALUES (
            bot_record.id, user_uuid, activity_type_param,
            CASE 
                WHEN risk_score_total >= 80 THEN 'critical'
                WHEN risk_score_total >= 50 THEN 'high'
                WHEN risk_score_total >= 20 THEN 'medium'
                ELSE 'low'
            END,
            activity_data_param, user_ip_param, user_agent_param, NOW()
        ) 
        RETURNING id INTO activity_id;
        
        -- Update bot last run
        UPDATE monitoring_bots 
        SET last_run = NOW()
        WHERE id = bot_record.id;
    END IF;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

-- Function to evaluate activity patterns
CREATE OR REPLACE FUNCTION evaluate_activity_pattern(
    user_uuid UUID,
    activity_type VARCHAR,
    activity_data JSONB,
    detection_logic JSONB,
    thresholds JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    rule_name TEXT;
    rule_value INTEGER;
    timeframe TEXT;
    threshold_value INTEGER;
    count_result INTEGER;
BEGIN
    -- Parse detection logic
    rule_name := detection_logic->>'rule';
    rule_value := COALESCE((detection_logic->>'value')::INTEGER, 0);
    timeframe := detection_logic->>'timeframe';
    
    -- Get threshold from bot thresholds
    threshold_value := COALESCE((thresholds->>'medium')::INTEGER, 50);
    
    -- Evaluate based on rule type
    CASE rule_name
        WHEN 'multiple_accounts_same_ip' THEN
            SELECT COUNT(*) INTO count_result
            FROM users 
            WHERE created_at >= NOW() - INTERVAL '1 hour'
                AND last_login_ip = (SELECT last_login_ip FROM users WHERE id = user_uuid);
            RETURN count_result >= rule_value;
            
        WHEN 'rapid_task_completion' THEN
            SELECT COUNT(*) INTO count_result
            FROM user_daily_activity 
            WHERE user_id = user_uuid 
                AND stats_date = CURRENT_DATE 
                AND tasks_completed >= rule_value;
            RETURN count_result >= 1;
            
        WHEN 'unusual_earning_spike' THEN
            SELECT COALESCE(SUM(earnings), 0) INTO count_result
            FROM user_daily_activity 
            WHERE user_id = user_uuid 
                AND stats_date = CURRENT_DATE;
            RETURN count_result >= threshold_value;
            
        WHEN 'failed_login_attempts' THEN
            SELECT COUNT(*) INTO count_result
            FROM activity_logs 
            WHERE user_id = user_uuid 
                AND action = 'failed_login'
                AND created_at >= NOW() - INTERVAL '15 minutes';
            RETURN count_result >= rule_value;
            
        WHEN 'referral_self_signups' THEN
            SELECT EXISTS(
                SELECT 1 FROM users 
                WHERE referred_by = user_uuid 
                    AND created_at >= NOW() - INTERVAL '1 hour'
                    AND last_login_ip = (SELECT last_login_ip FROM users WHERE id = user_uuid)
            );
            
        WHEN 'gift_code_abuse' THEN
            SELECT COUNT(*) INTO count_result
            FROM transactions 
            WHERE user_id = user_uuid 
                AND type = 'gift_code'
                AND created_at >= NOW() - INTERVAL '24 hours';
            RETURN count_result >= rule_value;
            
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- View for monitoring dashboard
CREATE OR REPLACE VIEW monitoring_dashboard AS
SELECT 
    mb.id as bot_id,
    mb.bot_name,
    mb.bot_type,
    mb.status,
    mb.last_run,
    -- Activity counts
    COUNT(sa.id) as total_alerts,
    COUNT(CASE WHEN sa.severity = 'critical' THEN 1 END) as critical_alerts,
    COUNT(CASE WHEN sa.severity = 'high' THEN 1 END) as high_alerts,
    COUNT(CASE WHEN sa.severity = 'medium' THEN 1 END) as medium_alerts,
    COUNT(CASE WHEN sa.severity = 'low' THEN 1 END) as low_alerts,
    -- Unresolved alerts
    COUNT(CASE WHEN sa.is_resolved = FALSE THEN 1 END) as unresolved_alerts,
    -- Recent activity (last 24h)
    COUNT(CASE WHEN sa.created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as alerts_24h,
    -- Most recent alert
    (SELECT created_at FROM suspicious_activities 
     WHERE bot_id = mb.id 
     ORDER BY created_at DESC 
     LIMIT 1) as last_alert
FROM monitoring_bots mb
LEFT JOIN suspicious_activities sa ON mb.id = sa.bot_id
GROUP BY mb.id, mb.bot_name, mb.bot_type, mb.status, mb.last_run;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_user_id ON suspicious_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_severity ON suspicious_activities(severity);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_created_at ON suspicious_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_patterns_active ON activity_patterns(is_active);

-- Scheduled job to run monitoring bots
-- Note: This requires pg_cron extension
SELECT cron.schedule(
    '*/5 * * * *',  -- Run every 5 minutes
    $$ 
    DECLARE
        bot_record RECORD;
        recent_activity RECORD;
    BEGIN
        -- Run active monitoring bots
            FOR bot_record IN 
                SELECT * FROM monitoring_bots 
                WHERE status = 'active' 
                    AND (last_run IS NULL OR last_run < NOW() - INTERVAL '5 minutes')
            LOOP
                -- Process recent activities for monitoring
                FOR recent_activity IN 
                    SELECT user_id, 'login', jsonb_build_object('ip_address', last_login_ip), 
                           last_login_ip, user_agent
                    FROM users 
                    WHERE last_login_at >= NOW() - INTERVAL '5 minutes'
                LOOP
                    PERFORM detect_suspicious_activity(
                        recent_activity.user_id, 
                        recent_activity.activity_type, 
                        recent_activity.activity_data,
                        recent_activity.ip_address,
                        recent_activity.user_agent
                    );
                END LOOP;
                
                -- Update bot last run
                UPDATE monitoring_bots 
                SET last_run = NOW() 
                WHERE id = bot_record.id;
            END LOOP;
        END;
    $$
);
