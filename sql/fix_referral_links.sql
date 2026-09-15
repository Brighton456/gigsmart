-- Fix Issue #3: Referral link functionality
-- Problem: Referral links not working properly
-- Solution: Create proper referral system with tracking and validation

-- Create or update referral_links table
CREATE TABLE IF NOT EXISTS referral_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    max_uses INTEGER DEFAULT 100,
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '1 year'),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create referral_tracking table for detailed tracking
CREATE TABLE IF NOT EXISTS referral_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    referral_code VARCHAR(20) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    referral_date TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'approved', 'rejected')),
    bonus_amount DECIMAL(12,2) DEFAULT 0,
    bonus_granted_at TIMESTAMP,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Function to generate referral code for user
CREATE OR REPLACE FUNCTION generate_referral_code(user_uuid UUID)
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
            SELECT 1 FROM referral_links WHERE referral_code = new_code
        ) INTO code_exists;
        
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    -- Insert or update referral link
    INSERT INTO referral_links (
        referrer_id, referral_code, is_active, usage_count
    ) VALUES (
        user_uuid, new_code, TRUE, 0
    ) 
    ON CONFLICT (referrer_id) 
    DO UPDATE SET 
        referral_code = new_code,
        is_active = TRUE,
        updated_at = NOW();
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function to track referral usage
CREATE OR REPLACE FUNCTION track_referral_usage(
    referral_code_param VARCHAR,
    referred_user_uuid UUID,
    user_ip INET DEFAULT NULL,
    user_agent_text TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    referral_record RECORD;
    referrer_record RECORD;
BEGIN
    -- Find referral code
    SELECT * INTO referral_record
    FROM referral_links 
    WHERE referral_code = referral_code_param 
        AND is_active = TRUE 
        AND expires_at > NOW();
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if already used by this IP recently (prevent abuse)
    SELECT EXISTS(
        SELECT 1 FROM referral_tracking 
        WHERE ip_address = user_ip 
            AND referral_date > NOW() - INTERVAL '1 hour'
    ) INTO referrer_record;
    
    IF referrer_record THEN
        -- Mark as suspicious
        INSERT INTO referral_tracking (
            referrer_id, referred_user_id, referral_code, 
            ip_address, user_agent, status, admin_notes
        ) VALUES (
            referral_record.referrer_id, referred_user_uuid, referral_code_param,
            user_ip, user_agent_text, 'rejected', 
            'Multiple referrals from same IP within 1 hour'
        );
        RETURN FALSE;
    END IF;
    
    -- Track referral usage
    INSERT INTO referral_tracking (
        referrer_id, referred_user_id, referral_code, 
        ip_address, user_agent, status
    ) VALUES (
        referral_record.referrer_id, referred_user_uuid, referral_code_param,
        user_ip, user_agent_text, 'pending'
    );
    
    -- Update usage count
    UPDATE referral_links 
    SET 
        usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE id = referral_record.id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to approve/refuse referral bonus
CREATE OR REPLACE FUNCTION process_referral_bonus(
    tracking_id UUID,
    approve BOOLEAN,
    bonus_amount DECIMAL DEFAULT NULL,
    admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    tracking_record RECORD;
BEGIN
    -- Get tracking record
    SELECT * INTO tracking_record
    FROM referral_tracking 
    WHERE id = tracking_id 
        AND status = 'pending';
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update tracking record
    UPDATE referral_tracking 
    SET 
        status = CASE WHEN approve THEN 'approved' ELSE 'rejected' END,
        bonus_amount = COALESCE(bonus_amount, 0),
        bonus_granted_at = CASE WHEN approve THEN NOW() ELSE NULL END,
        admin_notes = admin_notes,
        updated_at = NOW()
    WHERE id = tracking_id;
    
    -- If approved and bonus amount > 0, update referrer's wallet
    IF approve AND COALESCE(bonus_amount, 0) > 0 THEN
        UPDATE users 
        SET 
            income_wallet = income_wallet + COALESCE(bonus_amount, 0),
            total_earnings = total_earnings + COALESCE(bonus_amount, 0),
            updated_at = NOW()
        WHERE id = tracking_record.referrer_id;
        
        -- Record transaction
        INSERT INTO transactions (
            user_id, amount, type, status, description, created_at
        ) VALUES (
            tracking_record.referrer_id, 
            COALESCE(bonus_amount, 0), 
            'referral_bonus', 
            'completed', 
            'Referral bonus from ' || (
                SELECT username FROM users WHERE id = tracking_record.referred_user_id
            ), 
            NOW()
        );
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- View for referral analytics
CREATE OR REPLACE VIEW referral_analytics AS
SELECT 
    u.id as referrer_id,
    u.username as referrer_username,
    rl.referral_code,
    rl.usage_count,
    rl.is_active,
    rl.expires_at,
    -- Total referred users
    COUNT(rt.id) as total_referred,
    -- Approved referrals
    COUNT(CASE WHEN rt.status = 'approved' THEN 1 END) as approved_referrals,
    -- Pending referrals
    COUNT(CASE WHEN rt.status = 'pending' THEN 1 END) as pending_referrals,
    -- Rejected referrals
    COUNT(CASE WHEN rt.status = 'rejected' THEN 1 END) as rejected_referrals,
    -- Total bonuses paid
    COALESCE(SUM(CASE WHEN rt.status = 'approved' THEN rt.bonus_amount END), 0) as total_bonuses_paid,
    -- Success rate
    CASE 
        WHEN COUNT(rt.id) > 0 THEN 
            (COUNT(CASE WHEN rt.status = 'approved' THEN 1 END)::DECIMAL / COUNT(rt.id)) * 100
        ELSE 0
    END as success_rate
FROM users u
LEFT JOIN referral_links rl ON u.id = rl.referrer_id
LEFT JOIN referral_tracking rt ON rl.referral_code = rt.referral_code
GROUP BY u.id, u.username, rl.referral_code, rl.usage_count, rl.is_active, rl.expires_at;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_referral_links_code ON referral_links(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_links_referrer ON referral_links(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_code ON referral_tracking(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_status ON referral_tracking(status);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_date ON referral_tracking(referral_date DESC);

-- Generate referral codes for existing users
INSERT INTO referral_links (referrer_id, referral_code)
SELECT 
    id, 
    'GS' || UPPER(SUBSTRING(MD5(id::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT), 1, 8))
FROM users 
WHERE id NOT IN (SELECT referrer_id FROM referral_links);
