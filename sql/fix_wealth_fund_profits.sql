-- Fix Issue #2: Wealth fund profit calculations (zero/negative profits)
-- Problem: Investments show zero or negative profits despite elapsed days
-- Solution: Create function to calculate and update investment profits correctly

-- Function to calculate investment profit
CREATE OR REPLACE FUNCTION calculate_investment_profit(investment_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    investment_record RECORD;
    days_elapsed INTEGER;
    profit DECIMAL;
BEGIN
    -- Get investment details
    SELECT * INTO investment_record 
    FROM investments 
    WHERE id = investment_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Calculate days elapsed since investment start
    days_elapsed := GREATEST(0, EXTRACT(DAY FROM (NOW() - investment_record.created_at)));
    
    -- Calculate daily profit: amount * (daily_rate / 100)
    profit := investment_record.amount * (investment_record.daily_rate / 100.0) * days_elapsed;
    
    -- Ensure profit is never negative
    profit := GREATEST(0, profit);
    
    RETURN profit;
END;
$$ LANGUAGE plpgsql;

-- Function to update investment profits
CREATE OR REPLACE FUNCTION update_investment_profits()
RETURNS VOID AS $$
DECLARE
    investment RECORD;
    calculated_profit DECIMAL;
BEGIN
    -- Loop through all active investments
    FOR investment IN SELECT * FROM investments WHERE status = 'active' LOOP
        -- Calculate profit for this investment
        calculated_profit := calculate_investment_profit(investment.id);
        
        -- Update the investment record
        UPDATE investments 
        SET 
            current_value = investment.amount + calculated_profit,
            profit = calculated_profit,
            days_elapsed = EXTRACT(DAY FROM (NOW() - investment.created_at)),
            updated_at = NOW()
        WHERE id = investment.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update existing investments with correct profits
UPDATE investments 
SET 
    profit = calculate_investment_profit(id),
    current_value = amount + calculate_investment_profit(id),
    days_elapsed = GREATEST(0, EXTRACT(DAY FROM (NOW() - created_at))),
    updated_at = NOW()
WHERE status = 'active';

-- Create view to show investments with calculated profits
CREATE OR REPLACE VIEW investment_summary AS
SELECT 
    i.id,
    i.user_id,
    i.bank_name,
    i.amount,
    i.daily_rate,
    i.duration_days,
    i.maturity_date,
    i.status,
    i.created_at,
    i.updated_at,
    -- Calculate days elapsed
    GREATEST(0, EXTRACT(DAY FROM (NOW() - i.created_at))) as days_elapsed,
    -- Calculate profit using function
    calculate_investment_profit(i.id) as calculated_profit,
    -- Current value with profit
    i.amount + calculate_investment_profit(i.id) as current_value_with_profit,
    -- Profit percentage
    CASE 
        WHEN i.amount > 0 THEN (calculate_investment_profit(i.id) / i.amount) * 100 
        ELSE 0 
    END as profit_percentage
FROM investments i;

-- Create scheduled job to update profits daily (requires pg_cron extension)
-- Note: This requires the pg_cron extension to be installed
SELECT cron.schedule(
    '0 2 * * *',  -- Run at 2 AM every day
    $$SELECT update_investment_profits();$$
);

-- Manual trigger to update profits when investment record is viewed/queried
CREATE OR REPLACE FUNCTION trigger_update_investment_profit()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate and update profit for the investment being accessed
    NEW.profit := calculate_investment_profit(NEW.id);
    NEW.current_value := NEW.amount + NEW.profit;
    NEW.days_elapsed := GREATEST(0, EXTRACT(DAY FROM (NOW() - NEW.created_at)));
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_investment_profit_trigger ON investments;

-- Create new trigger
CREATE TRIGGER update_investment_profit_trigger
    BEFORE SELECT ON investments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_investment_profit();
