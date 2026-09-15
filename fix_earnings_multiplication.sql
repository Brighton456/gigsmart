-- ================================================================
-- FIX EARNINGS MULTIPLICATION AND RECHARGE ISSUES
-- ================================================================

-- 1. Drop all conflicting triggers that cause multiplication
DROP TRIGGER IF EXISTS trigger_update_user_stats ON transactions;
DROP TRIGGER IF EXISTS trigger_update_user_earnings ON transactions;
DROP TRIGGER IF EXISTS trigger_gift_code_earnings ON transactions;
DROP TRIGGER IF EXISTS trigger_update_user_stats ON transactions;

-- 2. Drop the functions to recreate them correctly
DROP FUNCTION IF EXISTS update_user_stats();
DROP FUNCTION IF EXISTS update_user_earnings();
DROP FUNCTION IF EXISTS update_gift_code_earnings();

-- 3. Create a single, correct earnings trigger that excludes deposits/recharges
CREATE OR REPLACE FUNCTION update_earnings_correctly()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update earnings for actual earning transactions, NOT deposits/recharges
    IF NEW.status = 'completed' AND NEW.type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win') AND NEW.amount > 0 THEN
        UPDATE users SET
            total_earnings = total_earnings + NEW.amount,
            today_earnings = CASE 
                WHEN DATE(NEW.created_at) = CURRENT_DATE THEN today_earnings + NEW.amount
                ELSE today_earnings 
            END,
            week_earnings = CASE 
                WHEN NEW.created_at >= DATE_TRUNC('week', NOW()) THEN week_earnings + NEW.amount
                ELSE week_earnings 
            END,
            month_earnings = CASE 
                WHEN DATE_TRUNC('month', NOW()) = DATE_TRUNC('month', NEW.created_at) THEN month_earnings + NEW.amount
                ELSE month_earnings 
            END,
            updated_at = NOW()
        WHERE id = NEW.user_id;
        
        -- Update gift code earnings specifically
        IF NEW.type = 'gift_code' THEN
            UPDATE users SET
                gift_code_earnings = COALESCE(gift_code_earnings, 0) + NEW.amount
            WHERE id = NEW.user_id;
        END IF;
        
        -- Refresh daily statistics
        PERFORM ensure_daily_statistics_exists();
    END IF;
    
    -- Update withdrawals separately (not earnings)
    IF NEW.status = 'completed' AND NEW.type = 'withdrawal' THEN
        UPDATE users SET
            total_withdrawals = total_withdrawals + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create the single correct trigger
CREATE TRIGGER trigger_update_earnings_correctly
    AFTER INSERT OR UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_earnings_correctly();

-- 5. Fix existing users' earnings data by recalculating from transactions
-- This removes the multiplied amounts and recharge deposits from earnings

-- Create a function to recalculate earnings correctly
CREATE OR REPLACE FUNCTION recalculate_user_earnings(p_user_id UUID DEFAULT NULL)
RETURNS void AS $$
BEGIN
    -- If no user_id provided, recalculate for all users
    IF p_user_id IS NULL THEN
        -- Reset all earnings to 0 first
        UPDATE users SET
            today_earnings = 0,
            yesterday_earnings = 0,
            week_earnings = 0,
            month_earnings = 0,
            total_earnings = 0,
            gift_code_earnings = 0,
            referral_rebate_total = 0;
            
        -- Recalculate earnings from transactions (excluding deposits)
        UPDATE users 
        SET 
            total_earnings = earned.total,
            today_earnings = earned.today,
            week_earnings = earned.week,
            month_earnings = earned.month,
            gift_code_earnings = earned.gift_codes,
            referral_rebate_total = earned.referrals
        FROM (
            SELECT 
                user_id,
                COALESCE(SUM(CASE WHEN type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win') AND amount > 0 THEN amount ELSE 0 END), 0) as total,
                COALESCE(SUM(CASE WHEN type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win') AND amount > 0 AND DATE(created_at) = CURRENT_DATE THEN amount ELSE 0 END), 0) as today,
                COALESCE(SUM(CASE WHEN type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win') AND amount > 0 AND created_at >= DATE_TRUNC('week', NOW()) THEN amount ELSE 0 END), 0) as week,
                COALESCE(SUM(CASE WHEN type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win') AND amount > 0 AND DATE_TRUNC('month', NOW()) = DATE_TRUNC('month', created_at) THEN amount ELSE 0 END), 0) as month,
                COALESCE(SUM(CASE WHEN type = 'gift_code' AND amount > 0 THEN amount ELSE 0 END), 0) as gift_codes,
                COALESCE(SUM(CASE WHEN type = 'referral_bonus' AND amount > 0 THEN amount ELSE 0 END), 0) as referrals
            FROM transactions 
            WHERE status = 'completed'
            GROUP BY user_id
        ) earned
        WHERE users.id = earned.user_id;
    ELSE
        -- Recalculate for specific user
        UPDATE users SET
            today_earnings = 0,
            yesterday_earnings = 0,
            week_earnings = 0,
            month_earnings = 0,
            total_earnings = 0,
            gift_code_earnings = 0,
            referral_rebate_total = 0
        WHERE id = p_user_id;
            
        UPDATE users 
        SET 
            total_earnings = earned.total,
            today_earnings = earned.today,
            week_earnings = earned.week,
            month_earnings = earned.month,
            gift_code_earnings = earned.gift_codes,
            referral_rebate_total = earned.referrals
        FROM (
            SELECT 
                COALESCE(SUM(CASE WHEN type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win') AND amount > 0 THEN amount ELSE 0 END), 0) as total,
                COALESCE(SUM(CASE WHEN type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win') AND amount > 0 AND DATE(created_at) = CURRENT_DATE THEN amount ELSE 0 END), 0) as today,
                COALESCE(SUM(CASE WHEN type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win') AND amount > 0 AND created_at >= DATE_TRUNC('week', NOW()) THEN amount ELSE 0 END), 0) as week,
                COALESCE(SUM(CASE WHEN type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win') AND amount > 0 AND DATE_TRUNC('month', NOW()) = DATE_TRUNC('month', created_at) THEN amount ELSE 0 END), 0) as month,
                COALESCE(SUM(CASE WHEN type = 'gift_code' AND amount > 0 THEN amount ELSE 0 END), 0) as gift_codes,
                COALESCE(SUM(CASE WHEN type = 'referral_bonus' AND amount > 0 THEN amount ELSE 0 END), 0) as referrals
            FROM transactions 
            WHERE status = 'completed' AND user_id = p_user_id
        ) earned
        WHERE users.id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Execute the recalculation for all users
SELECT recalculate_user_earnings();

-- 7. Update the frontend updateWallet function to be more explicit
-- This needs to be done in the code, but here's what should be changed:
-- The updateWallet function in supabaseData.js already has the correct logic
-- The issue was the database triggers overriding it

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Check that earnings are now correct (should exclude deposits)
SELECT 
    u.id,
    u.name,
    u.total_earnings,
    u.today_earnings,
    u.week_earnings,
    u.month_earnings,
    -- Calculate what earnings should be from transactions
    (SELECT COALESCE(SUM(amount), 0) 
     FROM transactions t 
     WHERE t.user_id = u.id 
       AND t.status = 'completed' 
       AND t.type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win')) as calculated_earnings
FROM users u
WHERE u.total_earnings > 0
LIMIT 10;

-- Check that deposits are not counted as earnings
SELECT 
    'Deposits (should NOT be in earnings)' as type,
    COUNT(*) as count,
    COALESCE(SUM(amount), 0) as total_amount
FROM transactions 
WHERE type = 'deposit' AND status = 'completed'

UNION ALL

SELECT 
    'Task Earnings (should be in earnings)' as type,
    COUNT(*) as count,
    COALESCE(SUM(amount), 0) as total_amount
FROM transactions 
WHERE type = 'task_earning' AND status = 'completed';

-- ================================================================
-- COMPLETION MESSAGE
-- ================================================================

DO $$
BEGIN
    RAISE NOTICE '=== EARNINGS FIX COMPLETED ===';
    RAISE NOTICE '1. Removed conflicting triggers that caused 3x multiplication';
    RAISE NOTICE '2. Created single correct trigger that excludes deposits/recharges';
    RAISE NOTICE '3. Recalculated all user earnings from transaction history';
    RAISE NOTICE '4. Only income wallet transactions now count as earnings';
    RAISE NOTICE '5. Recharge wallet deposits no longer affect earnings totals';
    RAISE NOTICE '=== RUN VERIFICATION QUERIES ABOVE TO CONFIRM ===';
END $$;
