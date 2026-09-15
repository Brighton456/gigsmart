-- =============================================
-- WITHDRAWAL SYSTEM ENHANCEMENTS
-- Run this SQL to add withdrawal request tracking and payment details
-- =============================================

-- 1. Add withdrawal requests table for approval workflow
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Request Details
    amount DECIMAL(15,2) NOT NULL,
    fee DECIMAL(10,2) NOT NULL,
    net_amount DECIMAL(15,2) NOT NULL,
    
    -- Status & Processing
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'failed')),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by VARCHAR(100),
    
    -- Payment Details (from user's withdrawal account)
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('mpesa', 'airtel_money', 'till', 'paybill', 'bank')),
    payment_details JSONB NOT NULL, -- Store all payment info as JSON
    
    -- Admin Notes
    admin_notes TEXT,
    rejection_reason TEXT,
    
    -- Reference
    transaction_id UUID REFERENCES transactions(id),
    external_reference VARCHAR(100)
);

-- 2. Add Kenyan banks reference table
CREATE TABLE IF NOT EXISTS kenyan_banks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    paybill_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Update users table to store detailed withdrawal account info
ALTER TABLE users ADD COLUMN IF NOT EXISTS withdrawal_account_details JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS withdrawal_account_verified BOOLEAN DEFAULT FALSE;

-- Insert Kenyan banks data
INSERT INTO kenyan_banks (name, code, paybill_number) VALUES
('Kenya Commercial Bank (KCB)', 'KCB', '522522'),
('Equity Bank', 'EQUITY', '247247'),
('Cooperative Bank', 'COOP', '400200'),
('NCBA Bank', 'NCBA', '228228'),
('Absa Bank Kenya', 'ABSA', '303030'),
('Standard Chartered Bank', 'SCB', '329329'),
('Diamond Trust Bank (DTB)', 'DTB', '521325'),
('I&M Bank', 'I&M', '141414'),
('Stanbic Bank', 'STANBIC', '909090'),
('Family Bank', 'FAMILY', '222111'),
('Sidian Bank', 'SIDIAN', '323232'),
('Bank of Africa', 'BOA', '888880'),
('Prime Bank', 'PRIME', '525252'),
('Gulf African Bank', 'GAB', '444222'),
('Credit Bank', 'CREDIT', '555666')
ON CONFLICT (code) DO NOTHING;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON withdrawal_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_kenyan_banks_active ON kenyan_banks(is_active);

-- 5. Enable RLS for withdrawal requests
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE kenyan_banks ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
CREATE POLICY user_own_withdrawal_requests ON withdrawal_requests
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY service_manage_withdrawal_requests ON withdrawal_requests
FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY public_read_active_banks ON kenyan_banks
FOR SELECT USING (is_active = TRUE);

CREATE POLICY service_manage_banks ON kenyan_banks
FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 7. Create admin view for withdrawal requests with user info
CREATE VIEW admin_withdrawal_requests AS
SELECT 
    wr.*,
    u.name AS user_name,
    u.phone AS user_phone,
    u.email AS user_email,
    u.current_level,
    l.name AS level_name
FROM withdrawal_requests wr
JOIN users u ON u.id = wr.user_id
LEFT JOIN levels l ON u.current_level = l.id
ORDER BY wr.created_at DESC;

-- 8. Function to create withdrawal request
CREATE OR REPLACE FUNCTION create_withdrawal_request(
    p_user_id UUID,
    p_amount DECIMAL(15,2),
    p_fee DECIMAL(10,2),
    p_payment_method VARCHAR(30),
    p_payment_details JSONB
)
RETURNS UUID AS $$
DECLARE
    v_request_id UUID;
    v_net_amount DECIMAL(15,2);
BEGIN
    v_net_amount := p_amount - p_fee;
    
    -- Insert withdrawal request
    INSERT INTO withdrawal_requests (
        user_id,
        amount,
        fee,
        net_amount,
        payment_method,
        payment_details
    )
    VALUES (
        p_user_id,
        p_amount,
        p_fee,
        v_net_amount,
        p_payment_method,
        p_payment_details
    )
    RETURNING id INTO v_request_id;
    
    -- Create pending transaction
    INSERT INTO transactions (
        user_id,
        type,
        amount,
        fee,
        net_amount,
        status,
        description,
        metadata
    )
    VALUES (
        p_user_id,
        'withdrawal',
        p_amount,
        p_fee,
        v_net_amount,
        'pending',
        'Withdrawal request - pending approval',
        jsonb_build_object(
            'withdrawal_request_id', v_request_id,
            'payment_method', p_payment_method,
            'payment_details', p_payment_details
        )
    );
    
    RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Update daily statistics to include withdrawal requests
CREATE OR REPLACE FUNCTION refresh_daily_statistics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS void AS $$
BEGIN
    INSERT INTO daily_statistics (
        stat_date,
        new_users,
        total_users,
        total_deposits,
        total_withdrawals,
        active_task_users,
        total_task_earnings,
        total_referral_earnings,
        total_spin_wins,
        total_gift_code_credits,
        total_investment_volume,
        total_investment_returns,
        updated_at
    )
    SELECT 
        target_date,
        (SELECT COUNT(*) FROM users WHERE DATE(created_at) = target_date),
        (SELECT COUNT(*) FROM users WHERE DATE(created_at) <= target_date),
        (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'deposit' AND status = 'completed' AND DATE(created_at) = target_date),
        (SELECT COALESCE(SUM(amount), 0) FROM withdrawal_requests WHERE status IN ('completed', 'approved') AND DATE(created_at) = target_date),
        (SELECT COUNT(DISTINCT user_id) FROM task_completions WHERE completion_date = target_date),
        (SELECT COALESCE(SUM(earnings), 0) FROM task_completions WHERE completion_date = target_date),
        (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'referral_bonus' AND status = 'completed' AND DATE(created_at) = target_date),
        (SELECT COALESCE(SUM(prize_value), 0) FROM spin_attempts WHERE spin_date = target_date),
        (SELECT COALESCE(SUM(income_wallet_reward + main_wallet_reward), 0) FROM gift_code_redemptions WHERE DATE(redeemed_at) = target_date),
        (SELECT COALESCE(SUM(amount), 0) FROM investments WHERE DATE(created_at) = target_date),
        (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'investment_return' AND status = 'completed' AND DATE(created_at) = target_date),
        NOW()
    ON CONFLICT (stat_date)
    DO UPDATE SET
        new_users = EXCLUDED.new_users,
        total_users = EXCLUDED.total_users,
        total_deposits = EXCLUDED.total_deposits,
        total_withdrawals = EXCLUDED.total_withdrawals,
        active_task_users = EXCLUDED.active_task_users,
        total_task_earnings = EXCLUDED.total_task_earnings,
        total_referral_earnings = EXCLUDED.total_referral_earnings,
        total_spin_wins = EXCLUDED.total_spin_wins,
        total_gift_code_credits = EXCLUDED.total_gift_code_credits,
        total_investment_volume = EXCLUDED.total_investment_volume,
        total_investment_returns = EXCLUDED.total_investment_returns,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Withdrawal system enhancements completed successfully!';
    RAISE NOTICE 'Added: withdrawal_requests table, kenyan_banks table, admin views';
    RAISE NOTICE 'Enhanced: users table with detailed withdrawal account info';
    RAISE NOTICE 'Created: withdrawal request creation function';
END $$;
