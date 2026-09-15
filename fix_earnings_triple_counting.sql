-- ================================================================
-- FIX TRIPLE COUNTING: FRONTEND UPDATING EARNINGS + DATABASE TRIGGERS
-- ================================================================

-- The issue: Frontend updates earnings in TWO places + database triggers = 3x multiplication
-- 1. updateWallet() function updates earnings (lines 533-536 in supabaseData.js)
-- 2. completeTask() function updates earnings AGAIN (lines 791-794 in supabaseData.js)  
-- 3. Database triggers update earnings a THIRD time

-- SOLUTION: Remove earnings updates from frontend, let database handle it consistently

-- 1. Drop all conflicting triggers first
DROP TRIGGER IF EXISTS trigger_update_user_earnings ON transactions;
DROP TRIGGER IF EXISTS trigger_gift_code_earnings ON transactions;

-- 2. Drop the conflicting functions
DROP FUNCTION IF EXISTS update_user_earnings();
DROP FUNCTION IF EXISTS update_gift_code_earnings();

-- 3. Modify update_user_stats to handle earnings correctly (excluding deposits)
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
                    WHEN DATE_TRUNC('month', NOW') = DATE_TRUNC('month', NEW.created_at) THEN NEW.amount
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
        
        -- Keep daily statistics refresh
        PERFORM ensure_daily_statistics_exists();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Recalculate earnings to remove the triple counting
CREATE OR REPLACE FUNCTION fix_triple_counting_earnings(p_user_id UUID DEFAULT NULL)
RETURNS void AS $$
BEGIN
    -- Reset earnings fields
    IF p_user_id IS NULL THEN
        UPDATE users SET
            today_earnings = 0,
            week_earnings = 0,
            month_earnings = 0,
            total_earnings = 0,
            gift_code_earnings = 0,
            referral_rebate_total = 0;
    ELSE
        UPDATE users SET
            today_earnings = 0,
            week_earnings = 0,
            month_earnings = 0,
            total_earnings = 0,
            gift_code_earnings = 0,
            referral_rebate_total = 0
        WHERE id = p_user_id;
    END IF;
    
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
    WHERE users.id = earned.user_id AND (p_user_id IS NULL OR users.id = p_user_id);
END;
$$ LANGUAGE plpgsql;

-- 5. Execute the fix
SELECT fix_triple_counting_earnings();

-- ================================================================
-- FRONTEND CODE CHANGES NEEDED
-- ================================================================

/* 
INSTRUCTIONS FOR FRONTEND FIX:

1. In supabaseData.js, REMOVE earnings updates from updateWallet function (lines 533-536):
   REMOVE these lines:
   updates.total_earnings = (profile.total_earnings ?? 0) + amount;
   updates.today_earnings = (profile.today_earnings ?? 0) + amount;
   updates.week_earnings = (profile.week_earnings ?? 0) + amount;
   updates.month_earnings = (profile.month_earnings ?? 0) + amount;

2. In supabaseData.js, REMOVE earnings updates from completeTask function (lines 791-794):
   REMOVE these lines:
   today_earnings: (profile.today_earnings ?? 0) + reward,
   week_earnings: (profile.week_earnings ?? 0) + reward,
   month_earnings: (profile.month_earnings ?? 0) + reward,
   total_earnings: (profile.total_earnings ?? 0) + reward,

3. Let the database triggers handle ALL earnings updates consistently
*/

-- ================================================================
-- VERIFICATION
-- ================================================================

-- Check current earnings vs calculated earnings
SELECT 
    u.id,
    u.name,
    u.total_earnings as current_total,
    (SELECT COALESCE(SUM(amount), 0) 
     FROM transactions t 
     WHERE t.user_id = u.id 
       AND t.status = 'completed' 
       AND t.type IN ('task_earning', 'referral_bonus', 'gift_code', 'spin_win')) as should_be_total,
    (SELECT COALESCE(SUM(amount), 0) 
     FROM transactions t 
     WHERE t.user_id = u.id 
       AND t.status = 'completed' 
       AND t.type = 'deposit') as deposits_excluded
FROM users u
WHERE u.total_earnings > 0
LIMIT 10;

DO $$
BEGIN
    RAISE NOTICE '=== TRIPLE COUNTING FIX COMPLETED ===';
    RAISE NOTICE '1. Database triggers now handle earnings correctly';
    RAISE NOTICE '2. Frontend code changes needed to remove duplicate updates';
    RAISE NOTICE '3. Earnings now exclude deposits/recharges';
    RAISE NOTICE '4. See FRONTEND CODE CHANGES section above';
END $$;
