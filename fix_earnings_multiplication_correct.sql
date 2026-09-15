-- ================================================================
-- CORRECTED FIX: PRESERVE IMPORTANT FUNCTIONS, FIX MULTIPLICATION
-- ================================================================

-- 1. Only drop the CONFLICTING earnings triggers, NOT the main stats function
DROP TRIGGER IF EXISTS trigger_update_user_earnings ON transactions;
DROP TRIGGER IF EXISTS trigger_gift_code_earnings ON transactions;

-- 2. Drop the conflicting earnings functions (but keep update_user_stats)
DROP FUNCTION IF EXISTS update_user_earnings();
DROP FUNCTION IF EXISTS update_gift_code_earnings();

-- 3. Modify the original update_user_stats function to exclude deposits from earnings
-- This preserves all the important daily statistics functionality
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        -- ONLY update earnings for actual earning transactions, NOT deposits/recharges
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
                    WHEN DATE_TRUNC('month', NOW()) = DATE_TRUNC('month', NEW.created_at) THEN NEW.amount
                    ELSE 0 
                END,
                updated_at = NOW()
            WHERE id = NEW.user_id;
            
            -- Update specific gift code earnings separately
            IF NEW.type = 'gift_code' THEN
                UPDATE users SET
                    gift_code_earnings = COALESCE(gift_code_earnings, 0) + NEW.amount
                WHERE id = NEW.user_id;
            END IF;
            
            -- Update referral earnings separately
            IF NEW.type = 'referral_bonus' THEN
                UPDATE users SET
                    referral_rebate_total = COALESCE(referral_rebate_total, 0) + NEW.amount
                WHERE id = NEW.user_id;
            END IF;
        END IF;
        
        -- Handle withdrawals separately (not earnings)
        IF NEW.type = 'withdrawal' THEN
            UPDATE users SET
                total_withdrawals = total_withdrawals + NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.user_id;
        END IF;
        
        -- IMPORTANT: Keep the daily statistics refresh for all transaction types
        PERFORM ensure_daily_statistics_exists();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. The main trigger should already exist and be correct
-- No need to recreate it since it uses the updated function

-- 5. Create a function to recalculate earnings correctly (without affecting other functions)
CREATE OR REPLACE FUNCTION recalculate_user_earnings_fix(p_user_id UUID DEFAULT NULL)
RETURNS void AS $$
BEGIN
    -- If no user_id provided, recalculate for all users
    IF p_user_id IS NULL THEN
        -- Reset only earnings fields (keep other fields intact)
        UPDATE users SET
            today_earnings = 0,
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
                COALESCE(SUM(CASE WHEN type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win') AND amount > 0 AND DATE_TRUNC('month', NOW') = DATE_TRUNC('month', created_at) THEN amount ELSE 0 END), 0) as month,
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
                COALESCE(SUM(CASE WHEN type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win') AND amount > 0 AND DATE_TRUNC('month', NOW') = DATE_TRUNC('month', created_at) THEN amount ELSE 0 END), 0) as month,
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
SELECT recalculate_user_earnings_fix();

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Check that earnings are now correct (should exclude deposits)
SELECT 
    u.id,
    u.name,
    u.total_earnings as current_total_earnings,
    -- Calculate what earnings should be from transactions (excluding deposits)
    (SELECT COALESCE(SUM(amount), 0) 
     FROM transactions t 
     WHERE t.user_id = u.id 
       AND t.status = 'completed' 
       AND t.type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win')) as calculated_earnings,
    -- Show deposits that should NOT be counted
    (SELECT COALESCE(SUM(amount), 0) 
     FROM transactions t 
     WHERE t.user_id = u.id 
       AND t.status = 'completed' 
       AND t.type = 'deposit') as deposit_amount
FROM users u
WHERE u.total_earnings > 0
LIMIT 10;

-- Verify that the important functions still exist
SELECT 
    proname as function_name,
    prosrc as function_definition
FROM pg_proc 
WHERE proname IN ('update_user_stats', 'ensure_daily_statistics_exists')
ORDER BY proname;

-- ================================================================
-- COMPLETION MESSAGE
-- ================================================================

DO $$
BEGIN
    RAISE NOTICE '=== CORRECTED EARNINGS FIX COMPLETED ===';
    RAISE NOTICE '1. Preserved update_user_stats function (used by multiple triggers)';
    RAISE NOTICE '2. Only removed conflicting earnings triggers';
    RAISE NOTICE '3. Modified update_user_stats to exclude deposits from earnings';
    RAISE NOTICE '4. Kept all daily statistics functionality intact';
    RAISE NOTICE '5. Recalculated earnings to remove multiplication and deposits';
    RAISE NOTICE '=== IMPORTANT FUNCTIONS PRESERVED ===';
END $$;
