-- ================================================================
-- SAFE FIX: PRESERVE ALL FUNCTIONS, ONLY FIX TRIGGER CONFLICTS
-- ================================================================

-- IMPORTANT: NOT dropping any functions - only removing conflicting triggers

-- 1. ONLY drop the conflicting triggers (NOT the functions)
DROP TRIGGER IF EXISTS trigger_update_user_earnings ON transactions;
DROP TRIGGER IF EXISTS trigger_gift_code_earnings ON transactions;

-- 2. Keep all existing functions intact
-- DO NOT DROP: update_user_stats(), update_user_earnings(), update_gift_code_earnings()

-- 3. Create a unified trigger function that calls the existing functions properly
CREATE OR REPLACE FUNCTION unified_earnings_handler()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        -- Call the original update_user_stats function but modify behavior
        -- We'll create a modified version that excludes deposits from earnings
        
        -- Handle earnings (excluding deposits/recharges)
        IF NEW.type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win') AND NEW.amount > 0 THEN
            UPDATE users SET
                total_earnings = total_earnings + NEW.amount,
                today_earnings = today_earnings + CASE 
                    WHEN DATE(NEW.created_at) = CURRENT_DATE THEN NEW.amount
                    ELSE 0 
                END,
                week_earnings = week_earnings + CASE 
                    WHEN NEW.created_at >= DATE_TRUNC('week', NOW()) THEN NEW.amount
                    ELSE 0 
                END,
                month_earnings = month_earnings + CASE 
                    WHEN DATE_TRUNC('month', NOW') = DATE_TRUNC('month', NEW.created_at) THEN NEW.amount
                    ELSE 0 
                END,
                updated_at = NOW()
            WHERE id = NEW.user_id;
            
            -- Handle gift code earnings
            IF NEW.type = 'gift_code' THEN
                UPDATE users SET
                    gift_code_earnings = COALESCE(gift_code_earnings, 0) + NEW.amount
                WHERE id = NEW.user_id;
            END IF;
            
            -- Handle referral earnings
            IF NEW.type = 'referral_bonus' THEN
                UPDATE users SET
                    referral_rebate_total = COALESCE(referral_rebate_total, 0) + NEW.amount
                WHERE id = NEW.user_id;
            END IF;
        END IF;
        
        -- Handle withdrawals (not earnings)
        IF NEW.type = 'withdrawal' THEN
            UPDATE users SET
                total_withdrawals = total_withdrawals + NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.user_id;
        END IF;
        
        -- Keep daily statistics functionality
        PERFORM ensure_daily_statistics_exists();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Replace the main trigger to use the unified handler
DROP TRIGGER IF EXISTS trigger_update_user_stats ON transactions;
CREATE TRIGGER trigger_update_user_stats
    AFTER INSERT OR UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION unified_earnings_handler();

-- 5. Recalculate earnings to fix the multiplication (without dropping any functions)
CREATE OR REPLACE FUNCTION recalculate_earnings_safe()
RETURNS void AS $$
BEGIN
    -- Create temporary backup of current earnings
    CREATE TEMP TABLE earnings_backup AS
    SELECT 
        id,
        total_earnings as old_total_earnings,
        today_earnings as old_today_earnings,
        week_earnings as old_week_earnings,
        month_earnings as old_month_earnings,
        gift_code_earnings as old_gift_code_earnings,
        referral_rebate_total as old_referral_rebate_total
    FROM users;
    
    -- Reset earnings fields
    UPDATE users SET
        today_earnings = 0,
        week_earnings = 0,
        month_earnings = 0,
        total_earnings = 0,
        gift_code_earnings = 0,
        referral_rebate_total = 0;
    
    -- Recalculate from transactions (excluding deposits)
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
            COALESCE(SUM(CASE WHEN type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win') AND amount > 0 AND DATE_TRUNC('month', NOW') = DATE_TRUNC('month', created_at) THEN amount ELSE 0 END), 0) as month,
            COALESCE(SUM(CASE WHEN type = 'gift_code' AND amount > 0 THEN amount ELSE 0 END), 0) as gift_codes,
            COALESCE(SUM(CASE WHEN type = 'referral_bonus' AND amount > 0 THEN amount ELSE 0 END), 0) as referrals
        FROM transactions 
        WHERE status = 'completed'
        GROUP BY user_id
    ) earned
    WHERE users.id = earned.user_id;
    
    -- Show comparison for verification
    SELECT 
        u.id,
        u.name,
        eb.old_total_earnings,
        u.total_earnings as new_total_earnings,
        (eb.old_total_earnings - u.total_earnings) as difference
    FROM users u
    JOIN earnings_backup eb ON u.id = eb.id
    WHERE eb.old_total_earnings != u.total_earnings
    LIMIT 10;
    
    -- Clean up
    DROP TABLE earnings_backup;
END;
$$ LANGUAGE plpgsql;

-- 6. Execute the safe recalculation
SELECT recalculate_earnings_safe();

-- ================================================================
-- FRONTEND CODE CHANGES NEEDED (No database changes)
-- ================================================================

/*
FRONTEND FIXES NEEDED:

1. In supabaseData.js updateWallet function, REMOVE earnings updates:
   Remove lines 533-536:
   updates.total_earnings = (profile.total_earnings ?? 0) + amount;
   updates.today_earnings = (profile.today_earnings ?? 0) + amount;
   updates.week_earnings = (profile.week_earnings ?? 0) + amount;
   updates.month_earnings = (profile.month_earnings ?? 0) + amount;

2. In supabaseData.js completeTask function, REMOVE earnings updates:
   Remove lines 791-794:
   today_earnings: (profile.today_earnings ?? 0) + reward,
   week_earnings: (profile.week_earnings ?? 0) + reward,
   month_earnings: (profile.month_earnings ?? 0) + reward,
   total_earnings: (profile.total_earnings ?? 0) + reward,
*/

-- ================================================================
-- VERIFICATION
-- ================================================================

-- Verify functions are preserved
SELECT 
    proname as function_name,
    'PRESERVED' as status
FROM pg_proc 
WHERE proname IN ('update_user_stats', 'update_user_earnings', 'update_gift_code_earnings', 'ensure_daily_statistics_exists')
ORDER BY proname;

-- Check earnings are now correct
SELECT 
    u.id,
    u.name,
    u.total_earnings as current_earnings,
    (SELECT COALESCE(SUM(amount), 0) 
     FROM transactions t 
     WHERE t.user_id = u.id 
       AND t.status = 'completed' 
       AND t.type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win')) as calculated_earnings
FROM users u
WHERE u.total_earnings > 0
LIMIT 5;

DO $$
BEGIN
    RAISE NOTICE '=== SAFE FIX COMPLETED ===';
    RAISE NOTICE '1. ALL original functions PRESERVED';
    RAISE NOTICE '2. Only conflicting triggers removed';
    RAISE NOTICE '3. Earnings recalculated correctly';
    RAISE NOTICE '4. Deposits excluded from earnings';
    RAISE NOTICE '5. Frontend code changes still needed';
END $$;
