-- Real Balance Tracking System
-- This system tracks actual money flow for each user

-- Add real balance tracking columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS real_balance DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_category VARCHAR(20) DEFAULT 'new';
ALTER TABLE users ADD COLUMN IF NOT EXISTS category_updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS restrictions JSONB DEFAULT '{}';

-- Create real balance transactions table for audit trail
CREATE TABLE IF NOT EXISTS real_balance_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- 'referral_payout', 'deposit', 'withdrawal', 'upgrade_commission', etc.
    amount DECIMAL(10,2) NOT NULL, -- positive for credits, negative for debits
    previous_balance DECIMAL(10,2) NOT NULL,
    new_balance DECIMAL(10,2) NOT NULL,
    description TEXT,
    related_transaction_id UUID, -- link to main transactions table
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_real_balance_transactions_user_id ON real_balance_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_real_balance_transactions_created_at ON real_balance_transactions(created_at);

-- Function to update real balance
CREATE OR REPLACE FUNCTION update_real_balance(
    p_user_id UUID,
    p_amount DECIMAL(10,2),
    p_transaction_type VARCHAR(50),
    p_description TEXT DEFAULT NULL,
    p_related_transaction_id UUID DEFAULT NULL
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    v_previous_balance DECIMAL(10,2);
    v_new_balance DECIMAL(10,2);
    v_level_investment DECIMAL(10,2);
    v_new_category VARCHAR(20);
BEGIN
    -- Get current real balance
    SELECT real_balance INTO v_previous_balance 
    FROM users WHERE id = p_user_id;
    
    IF v_previous_balance IS NULL THEN
        v_previous_balance := 0.00;
    END IF;
    
    -- Calculate new balance
    v_new_balance := v_previous_balance + p_amount;
    
    -- Update user's real balance
    UPDATE users 
    SET real_balance = v_new_balance,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Record the transaction
    INSERT INTO real_balance_transactions (
        user_id, transaction_type, amount, previous_balance, 
        new_balance, description, related_transaction_id
    ) VALUES (
        p_user_id, p_transaction_type, p_amount, v_previous_balance,
        v_new_balance, p_description, p_related_transaction_id
    );
    
    -- Update user category based on real balance vs level investment
    SELECT level_investment INTO v_level_investment
    FROM users WHERE id = p_user_id;
    
    IF v_level_investment IS NULL OR v_level_investment = 0 THEN
        v_new_category := 'new';
    ELSE
        DECLARE
            v_percentage DECIMAL(5,2);
        BEGIN
            v_percentage := (v_new_balance / v_level_investment) * 100;
            
            IF v_percentage >= 70 THEN
                v_new_category := 'rich';
            ELSIF v_percentage >= 50 THEN
                v_new_category := 'middle_class';
            ELSIF v_percentage >= 20 THEN
                v_new_category := 'poor';
            ELSE
                v_new_category := 'broke';
            END IF;
        END;
    END IF;
    
    -- Update category if changed
    UPDATE users 
    SET user_category = v_new_category,
        category_updated_at = NOW()
    WHERE id = p_user_id AND user_category != v_new_category;
    
    RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate referral payouts and update real balances
CREATE OR REPLACE FUNCTION process_referral_payouts(p_new_user_id UUID, p_level_cost DECIMAL(10,2))
RETURNS VOID AS $$
DECLARE
    v_referrer_id UUID;
    v_level1_payout DECIMAL(10,2);
    v_level2_payout DECIMAL(10,2);
    v_level3_payout DECIMAL(10,2);
    v_level2_referrer_id UUID;
    v_level3_referrer_id UUID;
BEGIN
    -- Get the direct referrer
    SELECT referred_by INTO v_referrer_id 
    FROM users WHERE id = p_new_user_id;
    
    IF v_referrer_id IS NULL THEN
        RETURN; -- No referrer
    END IF;
    
    -- Calculate payouts based on level cost
    -- Level 1: 4% of level cost
    -- Level 2: 2% of level cost  
    -- Level 3: 0.25% of level cost
    v_level1_payout := p_level_cost * 0.04;
    v_level2_payout := p_level_cost * 0.02;
    v_level3_payout := p_level_cost * 0.0025;
    
    -- Pay level 1 referrer
    PERFORM update_real_balance(
        v_referrer_id,
        -v_level1_payout,
        'referral_payout_level1',
        'Level 1 referral payout for user registration',
        NULL
    );
    
    -- Get level 2 referrer
    SELECT referred_by INTO v_level2_referrer_id 
    FROM users WHERE id = v_referrer_id;
    
    IF v_level2_referrer_id IS NOT NULL THEN
        -- Pay level 2 referrer
        PERFORM update_real_balance(
            v_level2_referrer_id,
            -v_level2_payout,
            'referral_payout_level2',
            'Level 2 referral payout for user registration',
            NULL
        );
        
        -- Get level 3 referrer
        SELECT referred_by INTO v_level3_referrer_id 
        FROM users WHERE id = v_level2_referrer_id;
        
        IF v_level3_referrer_id IS NOT NULL THEN
            -- Pay level 3 referrer
            PERFORM update_real_balance(
                v_level3_referrer_id,
                -v_level3_payout,
                'referral_payout_level3',
                'Level 3 referral payout for user registration',
                NULL
            );
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to initialize real balance for new users
CREATE OR REPLACE FUNCTION initialize_real_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Set initial real balance to 0
    NEW.real_balance := 0.00;
    NEW.user_category := 'new';
    NEW.category_updated_at := NOW();
    NEW.restrictions := '{}';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_initialize_real_balance
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION initialize_real_balance();

-- Trigger to handle level upgrades and referral payouts
CREATE OR REPLACE FUNCTION handle_level_upgrade()
RETURNS TRIGGER AS $$
BEGIN
    -- If level changed, process referral payouts and update real balance
    IF OLD.current_level IS DISTINCT FROM NEW.current_level THEN
        -- Add the upgrade cost to user's real balance (they paid real money)
        PERFORM update_real_balance(
            NEW.id,
            NEW.level_investment,
            'level_upgrade',
            'Level upgrade investment',
            NULL
        );
        
        -- Process referral payouts (deduct from uplines' real balances)
        PERFORM process_referral_payouts(NEW.id, NEW.level_investment);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_handle_level_upgrade
    AFTER UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION handle_level_upgrade();

-- Function to check user restrictions
CREATE OR REPLACE FUNCTION check_user_restrictions(p_user_id UUID, p_action VARCHAR(50))
RETURNS BOOLEAN AS $$
DECLARE
    v_restrictions JSONB;
    v_restriction_end TIMESTAMP;
BEGIN
    SELECT restrictions INTO v_restrictions 
    FROM users WHERE id = p_user_id;
    
    IF v_restrictions IS NULL THEN
        RETURN TRUE; -- No restrictions
    END IF;
    
    -- Check if action is restricted
    IF v_restrictions ? p_action THEN
        v_restriction_end := (v_restrictions->p_action->>'end_time')::TIMESTAMP;
        
        IF v_restriction_end IS NULL OR v_restriction_end > NOW() THEN
            RETURN FALSE; -- Action is restricted
        ELSE
            -- Remove expired restriction
            v_restrictions := v_restrictions - p_action;
            UPDATE users SET restrictions = v_restrictions WHERE id = p_user_id;
            RETURN TRUE;
        END IF;
    END IF;
    
    RETURN TRUE; -- Action not restricted
END;
$$ LANGUAGE plpgsql;

-- Function to apply user restrictions
CREATE OR REPLACE FUNCTION apply_user_restriction(
    p_user_id UUID, 
    p_action VARCHAR(50), 
    p_duration_hours INTEGER DEFAULT NULL,
    p_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_restrictions JSONB;
    v_end_time TIMESTAMP;
BEGIN
    SELECT restrictions INTO v_restrictions 
    FROM users WHERE id = p_user_id;
    
    IF v_restrictions IS NULL THEN
        v_restrictions := '{}';
    END IF;
    
    -- Calculate end time if duration provided
    IF p_duration_hours IS NOT NULL THEN
        v_end_time := NOW() + (p_duration_hours || ' hours')::INTERVAL;
    END IF;
    
    -- Add restriction
    v_restrictions := v_restrictions || jsonb_build_object(
        p_action, jsonb_build_object(
            'applied_at', NOW(),
            'end_time', v_end_time,
            'reason', p_reason
        )
    );
    
    UPDATE users 
    SET restrictions = v_restrictions,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- View for admin to see user categories and real balances
CREATE OR REPLACE VIEW admin_user_real_balance AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.phone,
    u.real_balance,
    u.user_category,
    u.level_investment,
    CASE 
        WHEN u.level_investment > 0 THEN 
            ROUND((u.real_balance / u.level_investment * 100), 2)
        ELSE 0 
    END as balance_percentage,
    u.category_updated_at,
    u.restrictions,
    u.created_at,
    u.updated_at
FROM users u
ORDER BY u.real_balance DESC;

-- View for withdrawal requests with real balance info
CREATE OR REPLACE VIEW admin_withdrawal_requests_with_balance AS
SELECT 
    wr.*,
    u.name as user_name,
    u.email as user_email,
    u.phone as user_phone,
    u.real_balance,
    u.user_category,
    CASE 
        WHEN u.real_balance >= wr.amount THEN 'sufficient'
        ELSE 'insufficient'
    END as real_balance_status
FROM withdrawal_requests wr
JOIN users u ON wr.user_id = u.id
ORDER BY wr.created_at DESC;

-- Success message
