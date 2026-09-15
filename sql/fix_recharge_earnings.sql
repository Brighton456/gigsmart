-- Fix Issue #1: Recharge amounts incorrectly included in today's earnings
-- Problem: Recharge transactions are being counted as earnings in today_earnings field
-- Solution: Create a view that excludes deposits from earnings calculations

-- Create or replace view for earnings by period (excluding deposits)
CREATE OR REPLACE VIEW user_earnings_by_period AS
SELECT 
    u.id as user_id,
    u.today_earnings,
    u.yesterday_earnings, 
    u.week_earnings,
    u.month_earnings,
    u.total_earnings,
    -- Calculate actual earnings excluding deposits
    CASE 
        WHEN SUM(CASE WHEN t.type = 'deposit' THEN t.amount ELSE 0 END) > 0 
        THEN u.total_earnings - COALESCE(SUM(CASE WHEN t.type = 'deposit' THEN t.amount ELSE 0 END), 0)
        ELSE u.total_earnings
    END as adjusted_total_earnings,
    -- Calculate actual today's earnings excluding deposits
    CASE 
        WHEN SUM(CASE WHEN t.type = 'deposit' AND DATE(t.created_at) = CURRENT_DATE THEN t.amount ELSE 0 END) > 0
        THEN u.today_earnings - COALESCE(SUM(CASE WHEN t.type = 'deposit' AND DATE(t.created_at) = CURRENT_DATE THEN t.amount ELSE 0 END), 0)
        ELSE u.today_earnings
    END as adjusted_today_earnings
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.id, u.today_earnings, u.yesterday_earnings, u.week_earnings, u.month_earnings, u.total_earnings;

-- Create function to update earnings without including deposits
CREATE OR REPLACE FUNCTION update_user_earnings(user_uuid UUID, earning_amount DECIMAL, earning_type TEXT)
RETURNS VOID AS $$
BEGIN
    -- Only update if it's not a deposit transaction
    IF earning_type != 'deposit' THEN
        UPDATE users 
        SET 
            today_earnings = CASE 
                WHEN DATE(created_at) = CURRENT_DATE 
                THEN today_earnings + earning_amount 
                ELSE today_earnings 
            END,
            total_earnings = total_earnings + earning_amount,
            updated_at = NOW()
        WHERE id = user_uuid;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update earnings correctly
CREATE OR REPLACE FUNCTION trigger_update_earnings()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update earnings for non-deposit transactions
    IF NEW.type != 'deposit' THEN
        UPDATE users 
        SET 
            today_earnings = CASE 
                WHEN DATE(NEW.created_at) = CURRENT_DATE 
                THEN today_earnings + NEW.amount 
                ELSE today_earnings 
            END,
            total_earnings = total_earnings + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_earnings_trigger ON transactions;

-- Create new trigger
CREATE TRIGGER update_earnings_trigger
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_earnings();

-- Update existing users' today_earnings to exclude deposits
UPDATE users 
SET today_earnings = adjusted_today_earnings
FROM user_earnings_by_period uebp
WHERE users.id = uebp.user_id;
