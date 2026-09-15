-- Fix Issue #5: Gift code earnings not showing in account page
-- Problem: Gift code earnings not being displayed in gift_code_earnings field
-- Solution: Create trigger to update gift_code_earnings when gift code transaction occurs

-- Function to update gift code earnings
CREATE OR REPLACE FUNCTION update_gift_code_earnings()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update for gift code transactions
    IF NEW.type = 'gift_code' AND NEW.amount > 0 THEN
        UPDATE users 
        SET 
            gift_code_earnings = gift_code_earnings + NEW.amount,
            total_earnings = total_earnings + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_gift_code_earnings_trigger ON transactions;

-- Create new trigger
CREATE TRIGGER update_gift_code_earnings_trigger
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_gift_code_earnings();

-- Function to recalculate gift code earnings for existing data
CREATE OR REPLACE FUNCTION recalculate_gift_code_earnings(user_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_gift_earnings DECIMAL;
BEGIN
    -- Sum all gift code transactions for the user
    SELECT COALESCE(SUM(amount), 0) INTO total_gift_earnings
    FROM transactions 
    WHERE user_id = user_uuid 
        AND type = 'gift_code' 
        AND amount > 0;
    
    -- Update user's gift code earnings
    UPDATE users 
    SET 
        gift_code_earnings = total_gift_earnings,
        updated_at = NOW()
    WHERE id = user_uuid;
    
    RETURN total_gift_earnings;
END;
$$ LANGUAGE plpgsql;

-- Update existing users' gift code earnings
UPDATE users 
SET gift_code_earnings = recalculate_gift_code_earnings(id)
WHERE gift_code_earnings IS NULL 
    OR gift_code_earnings != recalculate_gift_code_earnings(id);

-- Create view to show gift code earnings summary
CREATE OR REPLACE VIEW user_gift_code_summary AS
SELECT 
    u.id as user_id,
    u.username,
    u.gift_code_earnings as current_gift_earnings,
    -- Calculate actual gift code earnings from transactions
    COALESCE(t.gift_total, 0) as calculated_gift_earnings,
    -- Count of gift code transactions
    COALESCE(t.gift_count, 0) as gift_code_transactions,
    CASE 
        WHEN u.gift_code_earnings = COALESCE(t.gift_total, 0) THEN 'Correct'
        ELSE 'Needs Update'
    END as status
FROM users u
LEFT JOIN (
    SELECT 
        user_id,
        SUM(amount) as gift_total,
        COUNT(*) as gift_count
    FROM transactions 
    WHERE type = 'gift_code' 
        AND amount > 0
    GROUP BY user_id
) t ON u.id = t.user_id;
