-- Fix Issue: Set spin to win winnings always zero
-- Problem: Spin wheel should always result in zero winnings
-- Solution: Create function to ensure spin winnings are always zero

-- Function to handle spin results with zero winnings
CREATE OR REPLACE FUNCTION process_spin_result(
    user_uuid UUID,
    bet_amount DECIMAL,
    spin_result JSONB DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    zero_winnings DECIMAL := 0;
BEGIN
    -- Always set winnings to zero regardless of spin result
    -- Record the spin bet transaction
    INSERT INTO transactions (
        user_id, amount, type, status, description, created_at
    ) VALUES (
        user_uuid, 
        -bet_amount, 
        'spin_bet', 
        'completed', 
        'Spin to Win bet', 
        NOW()
    );
    
    -- Record zero winnings transaction
    INSERT INTO transactions (
        user_id, amount, type, status, description, created_at
    ) VALUES (
        user_uuid, 
        zero_winnings, 
        'spin_win', 
        'completed', 
        'Spin to Win result', 
        NOW()
    );
    
    -- Update user stats (optional - doesn't affect earnings)
    UPDATE users 
    SET 
        updated_at = NOW()
    WHERE id = user_uuid;
    
    -- Log spin activity for monitoring
    INSERT INTO activity_logs (
        user_id, action, details, created_at
    ) VALUES (
        user_uuid, 
        'spin_played', 
        json_build_object(
            'bet_amount', bet_amount,
            'winnings', zero_winnings,
            'spin_result', spin_result,
            'timestamp', NOW()
        ), 
        NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get spin statistics (always shows zero winnings)
CREATE OR REPLACE FUNCTION get_spin_statistics(user_uuid UUID)
RETURNS TABLE(
    total_spins BIGINT,
    total_bet_amount DECIMAL,
    total_winnings DECIMAL,
    net_loss DECIMAL,
    average_bet DECIMAL,
    last_spin_time TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(CASE WHEN t.type = 'spin_bet' THEN 1 END) as total_spins,
        COALESCE(SUM(CASE WHEN t.type = 'spin_bet' THEN ABS(amount) ELSE 0 END), 0) as total_bet_amount,
        COALESCE(SUM(CASE WHEN t.type = 'spin_win' THEN amount ELSE 0 END), 0) as total_winnings,
        COALESCE(SUM(CASE WHEN t.type = 'spin_bet' THEN ABS(amount) ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN t.type = 'spin_win' THEN amount ELSE 0 END), 0) as net_loss,
        CASE 
            WHEN COUNT(CASE WHEN t.type = 'spin_bet' THEN 1 END) > 0 
            THEN COALESCE(SUM(CASE WHEN t.type = 'spin_bet' THEN ABS(amount) ELSE 0 END), 0) / 
                 COUNT(CASE WHEN t.type = 'spin_bet' THEN 1 END)
            ELSE 0
        END as average_bet,
        MAX(CASE WHEN t.type = 'spin_bet' THEN t.created_at END) as last_spin_time
    FROM transactions t
    WHERE t.user_id = user_uuid 
        AND t.type IN ('spin_bet', 'spin_win')
        AND t.created_at >= CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- View for spin analytics (always shows zero winnings)
CREATE OR REPLACE VIEW spin_analytics AS
SELECT 
    u.id as user_id,
    u.username,
    -- Spin statistics
    COALESCE(ss.total_spins, 0) as total_spins,
    COALESCE(ss.total_bet_amount, 0) as total_amount_bet,
    COALESCE(ss.total_winnings, 0) as total_winnings,
    COALESCE(ss.net_loss, 0) as net_loss,
    COALESCE(ss.average_bet, 0) as average_bet_per_spin,
    ss.last_spin_time,
    -- Today's spin activity
    COALESCE(today_spins.today_count, 0) as spins_today,
    COALESCE(today_spins.today_bet, 0) as bet_today,
    -- Ensure winnings are always zero
    0 as winnings_today,
    -- Net result (always negative or zero)
    COALESCE(today_spins.today_bet, 0) * -1 as net_result_today,
    -- Activity level
    CASE 
        WHEN COALESCE(ss.total_spins, 0) >= 50 THEN 'High Activity'
        WHEN COALESCE(ss.total_spins, 0) >= 20 THEN 'Medium Activity'
        WHEN COALESCE(ss.total_spins, 0) >= 5 THEN 'Low Activity'
        ELSE 'No Activity'
    END as activity_level
FROM users u
LEFT JOIN LATERAL get_spin_statistics(u.id) ss ON true
LEFT JOIN LATERAL (
    SELECT 
        COUNT(CASE WHEN t.type = 'spin_bet' THEN 1 END) as today_count,
        SUM(CASE WHEN t.type = 'spin_bet' THEN ABS(amount) ELSE 0 END) as today_bet
    FROM transactions t
    WHERE t.user_id = u.id 
        AND t.type = 'spin_bet'
        AND DATE(t.created_at) = CURRENT_DATE
) today_spins ON true;

-- Trigger to ensure spin winnings are always zero
CREATE OR REPLACE FUNCTION enforce_zero_spin_winnings()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is a spin win transaction, force amount to zero
    IF NEW.type = 'spin_win' THEN
        NEW.amount := 0;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS enforce_zero_spin_winnings_trigger ON transactions;

-- Create new trigger
CREATE TRIGGER enforce_zero_spin_winnings_trigger
    BEFORE INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION enforce_zero_spin_winnings();

-- Update existing spin win transactions to zero
UPDATE transactions 
SET amount = 0
WHERE type = 'spin_win' AND amount != 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_spin_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_spin ON transactions(user_id, type) 
WHERE type IN ('spin_bet', 'spin_win');
