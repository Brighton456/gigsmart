-- Payment System Setup for Gig-Smart
-- Run this SQL in your Supabase SQL Editor

-- 1. Create payment_callbacks table to store all payment webhook data
CREATE TABLE IF NOT EXISTS payment_callbacks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    external_reference TEXT NOT NULL,
    callback_data JSONB,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_callbacks_external_ref ON payment_callbacks(external_reference);
CREATE INDEX IF NOT EXISTS idx_payment_callbacks_status ON payment_callbacks(status);
CREATE INDEX IF NOT EXISTS idx_payment_callbacks_created_at ON payment_callbacks(created_at);

-- 2. Create activation_payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS activation_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    external_reference TEXT UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 500.00,
    status TEXT DEFAULT 'PENDING',
    payhero_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for activation_payments
CREATE INDEX IF NOT EXISTS idx_activation_payments_user_id ON activation_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_activation_payments_external_ref ON activation_payments(external_reference);
CREATE INDEX IF NOT EXISTS idx_activation_payments_status ON activation_payments(status);

-- 3. Ensure users table has activation fields (add if they don't exist)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_activated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS activation_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS income_wallet DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS recharge_wallet DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_earned DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS withdrawal_account_type TEXT,
ADD COLUMN IF NOT EXISTS withdrawal_account_details TEXT,
ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS today_earnings DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS yesterday_earnings DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS tasks_completed_today INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tasks_reset_date DATE;

-- 4. Create transaction function for activation payments
CREATE OR REPLACE FUNCTION record_activation_payment(
    p_user_id UUID,
    p_external_reference TEXT,
    p_amount DECIMAL DEFAULT 500.00
) RETURNS UUID AS $$
DECLARE
    payment_id UUID;
BEGIN
    -- Insert activation payment record
    INSERT INTO activation_payments (user_id, external_reference, amount)
    VALUES (p_user_id, p_external_reference, p_amount)
    RETURNING id INTO payment_id;
    
    RETURN payment_id;
EXCEPTION
    WHEN unique_violation THEN
        -- Payment already exists, return existing ID
        SELECT id INTO payment_id 
        FROM activation_payments 
        WHERE external_reference = p_external_reference;
        RETURN payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update RLS policies for payment tables
ALTER TABLE payment_callbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activation_payments ENABLE ROW LEVEL SECURITY;

-- Policies for payment_callbacks (only service role can insert)
CREATE POLICY "Service role can manage payment callbacks" ON payment_callbacks
    FOR ALL USING (auth.role() = 'service_role');

-- Policies for activation_payments
CREATE POLICY "Users can view their own activation payments" ON activation_payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage activation payments" ON activation_payments
    FOR ALL USING (auth.role() = 'service_role');

-- 6. Create function to distribute referral commissions (if not exists)
CREATE OR REPLACE FUNCTION distribute_referral_commissions(new_user_id UUID)
RETURNS void AS $$
DECLARE
    referrer_id UUID;
    referral_level INTEGER := 1;
    commission_rate DECIMAL;
BEGIN
    -- Get direct referrer
    SELECT referred_by INTO referrer_id
    FROM users
    WHERE id = new_user_id AND referred_by IS NOT NULL;
    
    IF referrer_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Loop through referral levels (up to 5 levels)
    WHILE referrer_id IS NOT NULL AND referral_level <= 5 LOOP
        -- Set commission rates by level
        CASE referral_level
            WHEN 1 THEN commission_rate := 0.40;  -- 40%
            WHEN 2 THEN commission_rate := 0.30;  -- 30%
            WHEN 3 THEN commission_rate := 0.20;  -- 20%
            WHEN 4 THEN commission_rate := 0.10;  -- 10%
            WHEN 5 THEN commission_rate := 0.05;  -- 5%
            ELSE commission_rate := 0;
        END CASE;
        
        -- Add commission to referrer's income wallet
        UPDATE users
        SET income_wallet = income_wallet + (500 * commission_rate),
            total_earned = total_earned + (500 * commission_rate)
        WHERE id = referrer_id;
        
        -- Record commission transaction
        INSERT INTO transactions (
            user_id, 
            type, 
            amount, 
            balance_after, 
            source, 
            description,
            created_at
        )
        SELECT 
            referrer_id,
            'Referral Commission',
            500 * commission_rate,
            income_wallet,
            'Referral System',
            format('Level %s referral commission from user activation', referral_level),
            NOW()
        FROM users
        WHERE id = referrer_id;
        
        -- Get next level referrer
        SELECT referred_by INTO referrer_id
        FROM users
        WHERE id = referrer_id;
        
        referral_level := referral_level + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant necessary permissions
GRANT ALL ON payment_callbacks TO service_role;
GRANT ALL ON activation_payments TO service_role;
GRANT EXECUTE ON FUNCTION record_activation_payment TO service_role;
GRANT EXECUTE ON FUNCTION distribute_referral_commissions TO service_role;

-- 8. Create updated_at trigger for payment tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_payment_callbacks_updated_at
    BEFORE UPDATE ON payment_callbacks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activation_payments_updated_at
    BEFORE UPDATE ON activation_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Verify setup
SELECT 'Payment system setup completed successfully!' as status;
