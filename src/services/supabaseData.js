import supabase from './supabaseClient';
import { normalizeProfile } from '../utils/profile';
import * as Crypto from 'expo-crypto';

const TRANSACTION_TYPE_MAP = {
  RECHARGE: 'deposit',
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  TASK_EARNING: 'task_earning',
  LEVEL_UPGRADE: 'level_upgrade',
  INVESTMENT: 'investment',
  INVESTMENT_RETURN: 'investment_return',
  REFERRAL_BONUS: 'referral_bonus',
  GIFT_CODE: 'gift_code',
  SPIN_BET: 'spin_bet',
  SPIN_WIN: 'spin_win',
};

const ALLOWED_TRANSACTION_TYPES = new Set([
  'deposit',
  'withdrawal',
  'task_earning',
  'referral_bonus',
  'level_upgrade',
  'investment',
  'investment_return',
  'gift_code',
  'spin_bet',
  'spin_win',
  'admin_adjustment',
  'penalty',
]);

const normalizeTransactionType = (transactionType) => {
  if (!transactionType) return 'admin_adjustment';

  const mapped = TRANSACTION_TYPE_MAP[transactionType.toUpperCase?.()];
  if (mapped) return mapped;

  const lowered = transactionType.toLowerCase?.();
  return ALLOWED_TRANSACTION_TYPES.has(lowered) ? lowered : 'admin_adjustment';
};

export const supabaseData = {
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return { data: data ? normalizeProfile(data) : null, error: null };
    } catch (error) {
      console.error('Get profile error:', error);
      return { data: null, error };
    }
  },

  // Earnings by period (excludes deposits/withdrawals via DB view)
  async getEarningsByPeriod(userId) {
    try {
      const { data, error } = await supabase
        .from('user_earnings_by_period')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        // If view doesn't exist, fallback to calculating from transactions
        if (error.code === 'PGRST116') {
          return await this.calculateEarningsFromTransactions(userId);
        }
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Get earnings by period error:', error);
      return { data: null, error };
    }
  },

  // Fallback method to calculate earnings from transactions
  async calculateEarningsFromTransactions(userId) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const weekStart = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
      const monthStart = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

      const { data: todayData, error: todayError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'EARNING')
        .gte('created_at', today);

      const { data: yesterdayData, error: yesterdayError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'EARNING')
        .gte('created_at', yesterday)
        .lt('created_at', today);

      const { data: weekData, error: weekError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'EARNING')
        .gte('created_at', weekStart);

      const { data: monthData, error: monthError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'EARNING')
        .gte('created_at', monthStart);

      const { data: totalData, error: totalError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'EARNING');

      const calculateSum = (data) => data?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

      return {
        data: {
          today: calculateSum(todayData),
          yesterday: calculateSum(yesterdayData),
          this_week: calculateSum(weekData),
          this_month: calculateSum(monthData),
          total: calculateSum(totalData)
        },
        error: null
      };
    } catch (error) {
      console.error('Calculate earnings from transactions error:', error);
      return { data: null, error };
    }
  },

  async getGiftCodeEarnings(userId) {
    try {
      const { data, error } = await supabase
        .from('user_gift_code_earnings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get gift code earnings error:', error);
      return { data: null, error };
    }
  },

  async getTaskProgressToday(userId) {
    try {
      // Fallback: calculate from task_completions table since view doesn't exist
      const today = new Date().toISOString().slice(0, 10);
      const { data: completions, error: completionsError } = await supabase
        .from('task_completions')
        .select('earnings, completion_date')
        .eq('user_id', userId)
        .gte('completion_date', today)
        .gte('created_at', new Date().toISOString().slice(0, 10));

      if (completionsError) throw completionsError;
      
      const completedTasks = completions?.length || 0;
      const todayEarnings = completions?.reduce((sum, task) => sum + (task.earnings || 0), 0) || 0;
      
      const fallbackData = {
        user_id: userId,
        completed_tasks: completedTasks,
        today_earnings: todayEarnings,
        completion_date: today
      };
      
      return { data: fallbackData, error: null };
    } catch (error) {
      console.error('Get task progress today error:', error);
      return { data: null, error };
    }
  },

  async dailyCheckIn(userId, deviceInfo) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const payload = {
        user_id: userId,
        activity_date: today,
        last_seen_at: new Date().toISOString(),
        device_info: deviceInfo || null,
      };
      const { error } = await supabase
        .from('user_daily_activity')
        .upsert([payload], { onConflict: 'user_id,activity_date' });
      if (error) throw error;
      
      return { ok: true };
    } catch (error) {
      console.error('Daily check-in error:', error);
      return { ok: false };
    }
  },

  async resetDailyStatsIfNeeded(userId) {
    try {
      // Simplified version - just return success since we don't have reset tracking columns
      return { data: { success: true }, error: null };
    } catch (error) {
      console.error('Reset daily stats error:', error);
      return { data: null, error };
    }
  },

  async getAvailableTasks() {
    try {
      // Return empty array since task tables don't exist - use fallback tasks
      return { data: [], error: null };
    } catch (error) {
      console.error('Get available tasks error:', error);
      return { data: [], error };
    }
  },

  // Task management with completion tracking
  async getTaskCatalog() {
    try {
      // Return empty array since task tables don't exist - use fallback tasks
      return { data: [], error: null };
    } catch (error) {
      console.error('Get task catalog error:', error);
      return { data: [], error };
    }
  },

  async getUserTaskHistory(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('task_completions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get user task history error:', error);
      return { data: null, error };
    }
  },

  async enqueueReferralBonus(referrerId, referredId, amount, level = 1) {
    try {
      const suspicion = await this.checkSuspiciousReferralActivity(referredId);
      const referrerRisk = await this.calculateReferralRisk(referrerId);
      const combinedRisk = Math.min(100, (suspicion?.riskScore ?? 0) + referrerRisk);

      const payload = {
        referrer_id: referrerId,
        referred_id: referredId,
        amount,
        level,
        status: suspicion ? 'pending-review' : 'pending',
        is_recruit: true,
        is_suspicious: Boolean(suspicion) || combinedRisk >= 60,
        risk_score: combinedRisk,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('referral_bonus_queue')
        .insert([payload]);

      if (error) throw error;

      if (payload.is_suspicious) {
        await this.logEvent(referredId, 'suspicious_referral_detected', 'warning', {
          referrer_id: referrerId,
          referred_id: referredId,
          risk_score: combinedRisk,
          reasons: suspicion?.reasons || [],
        });
      }

      return { ok: true };
    } catch (error) {
      console.error('Enqueue referral bonus error:', error);
      return { ok: false };
    }
  },

  async checkSuspiciousReferralActivity(userId) {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('id, last_sign_in_ip, created_at')
        .eq('id', userId)
        .maybeSingle();

      if (!user?.last_sign_in_ip) {
        return null;
      }

      const nowIso = new Date().toISOString();
      const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: recentAccounts } = await supabase
        .from('users')
        .select('id, created_at')
        .eq('last_sign_in_ip', user.last_sign_in_ip)
        .gte('created_at', windowStart);

      const reasons = [];
      let riskScore = 0;

      if ((recentAccounts?.length ?? 0) > 3) {
        reasons.push('Multiple accounts from same IP in 24h');
        riskScore += 40;
      }

      if (recentAccounts && recentAccounts.length > 1) {
        const ordered = [...recentAccounts].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        for (let i = 1; i < ordered.length; i++) {
          const diffMs = new Date(ordered[i].created_at) - new Date(ordered[i - 1].created_at);
          if (diffMs <= 2 * 60 * 1000) {
            reasons.push('Rapid sequential sign-ups detected');
            riskScore += 30;
            break;
          }
        }
      }

      return riskScore >= 40 ? { riskScore, reasons, lastSeen: nowIso } : null;
    } catch (error) {
      console.error('Check suspicious referral activity error:', error);
      return null;
    }
  },

  async calculateReferralRisk(referrerId) {
    try {
      let score = 0;

      const { data: pendingBonuses } = await supabase
        .from('referral_bonus_queue')
        .select('id')
        .eq('referrer_id', referrerId)
        .eq('status', 'pending');

      if (pendingBonuses && pendingBonuses.length > 5) {
        score += 20;
      }

      return Math.min(100, score);
    } catch (error) {
      console.error('Calculate referral risk error:', error);
      return 0;
    }
  },

  async getLevels() {
    const tryFetch = async (table) => {
      return supabase
        .from(table)
        .select('*')
        .order('id', { ascending: true });
    };

    try {
      // Try levels table first
      let { data, error } = await tryFetch('levels');
      if (error) throw error;
      if (data && data.length > 0) {
        return { data, error: null };
      }
      
      // Fallback to job_levels if exists
      const fallback = await tryFetch('job_levels');
      return { data: fallback.data, error: fallback.error };
    } catch (error) {
      console.error('Get levels error:', error);
      return { data: null, error };
    }
  },

  // Fetch notifications for a page and user level
  async getNotifications(pageName, userLevel) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('page_name', pageName)
        .eq('status', true)
        .order('priority', { ascending: true })
        .limit(10);
      if (error) throw error;
      const filtered = (data || []).filter((row) => {
        const levels = row.apply_to_levels || [];
        return levels.length === 0 || levels.includes?.(userLevel);
      });
      return { data: filtered.slice(0, 3), error: null };
    } catch (error) {
      console.error('Get notifications error:', error);
      return { data: null, error };
    }
  },

  // Fetch investment banks/options
  async getInvestmentBanks() {
    try {
      const { data, error } = await supabase
        .from('investment_banks')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      const normalized = (data || []).map((row) => {
        const rate = Number(row.rate ?? row.daily_rate ?? 0);
        const days = Number(row.days ?? row.duration_days ?? row.term_days ?? 0);
        const minAmount = Number(row.min_amount ?? row.minAmount ?? 0);
        const name = row.name ?? row.bank_name ?? row.title ?? 'Partner Bank';
        const color = row.color || '#2563EB';
        const description = row.description || '';
        return {
          id: row.id,
          name,
          rate,
          days,
          minAmount,
          color,
          description,
          raw: row,
        };
      });
      return { data: normalized, error: null };
    } catch (error) {
      console.error('Get investment banks error:', error);
      return { data: null, error };
    }
  },

  // Record spin attempt
  async recordSpinAttempt(userId, betAmount, prizeValue, isWin) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const payload = {
        user_id: userId,
        prize_value: prizeValue,
        prize_won: isWin ? 'WIN' : 'LOSE',
        spin_date: today,
        created_at: new Date().toISOString(),
        metadata: { bet_amount: betAmount },
      };
      const { data, error } = await supabase
        .from('spin_attempts')
        .insert([payload])
        .select('*')
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Record spin attempt error:', error);
      return { data: null, error };
    }
  },

  async updateWithdrawalSettings(userId, accountType, accountDetails, password) {
    try {
      const passwordHash = password
        ? await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password)
        : null;

      const updates = {
        withdrawal_account_type: accountType,
        withdrawal_account_details: accountDetails,
        updated_at: new Date().toISOString(),
      };

      if (passwordHash) {
        updates.withdrawal_password_hash = passwordHash;
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data: normalizeProfile(data), error: null };
    } catch (error) {
      console.error('Update withdrawal settings error:', error);
      return { data: null, error };
    }
  },

  // Wallet Operations
  async updateWallet(userId, walletType, amount, description, transactionType) {
    try {
      // Update wallet balance
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('recharge_wallet, income_wallet, main_wallet, total_earnings, level_investment, today_earnings, week_earnings, month_earnings, yesterday_earnings, referral_rebate_total, gift_code_earnings, total_withdrawals, tasks_completed_today, is_active')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      const updates = { updated_at: new Date().toISOString() };
      const now = new Date().toISOString();
      const normalizedType = normalizeTransactionType(transactionType);
      const isRechargeTransaction = normalizedType === 'deposit' && walletType === 'recharge';

      if (normalizedType === 'withdrawal') {
        updates.total_withdrawals = (profile.total_withdrawals ?? 0) + Math.abs(amount);
      }

      // IMPORTANT: Do NOT update earnings fields for recharge transactions
      if (!isRechargeTransaction) {
        if (walletType === 'recharge') {
          updates.recharge_wallet = profile.recharge_wallet + amount;
        } else if (walletType === 'income') {
          updates.income_wallet = profile.income_wallet + amount;
          // Only update earnings for income wallet deposits (actual earnings)
          updates.total_earnings = (profile.total_earnings ?? 0) + amount;
          updates.today_earnings = (profile.today_earnings ?? 0) + amount;
          updates.week_earnings = (profile.week_earnings ?? 0) + amount;
          updates.month_earnings = (profile.month_earnings ?? 0) + amount;
        }
      } else {
        // For recharge transactions, ONLY update the recharge wallet - NO earnings updates
        updates.recharge_wallet = profile.recharge_wallet + amount;
      }

      const { data: updatedProfile, error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      const balanceAfter = walletType === 'income'
        ? updatedProfile.income_wallet
        : updatedProfile.recharge_wallet;

      // Record transaction using supported columns only
      let insertTx = await supabase
        .from('transactions')
        .insert([
          {
            user_id: userId,
            amount,
            net_amount: amount,
            fee: 0,
            status: 'completed',
            description,
            type: normalizedType,
            processed_at: now,
            created_at: now,
            metadata: { wallet_type: walletType, balance_after: balanceAfter },
          }
        ])
        .select('id')
        .single();

      // If type violates check constraint, retry with alternate case, then fallback
      if (insertTx.error && insertTx.error.code === '23514') {
        const altType = normalizedType === normalizedType.toLowerCase()
          ? normalizedType.toUpperCase()
          : normalizedType.toLowerCase();
        insertTx = await supabase
          .from('transactions')
          .insert([
            {
              user_id: userId,
              amount,
              net_amount: amount,
              fee: 0,
              status: 'completed',
              description,
              type: altType,
              processed_at: now,
              created_at: now,
              metadata: { wallet_type: walletType, balance_after: balanceAfter },
            }
          ])
          .select('id')
          .single();

        if (insertTx.error && insertTx.error.code === '23514') {
          insertTx = await supabase
            .from('transactions')
            .insert([
              {
                user_id: userId,
                amount,
                net_amount: amount,
                fee: 0,
                status: 'completed',
                description,
                type: 'admin_adjustment',
                processed_at: now,
                created_at: now,
                metadata: { wallet_type: walletType, balance_after: balanceAfter },
              }
            ])
            .select('id')
            .single();
        }
      }
      if (insertTx.error) {
        console.error('Transaction recording error:', insertTx.error);
      }

      return { data: normalizeProfile(updatedProfile), lastTransactionId: insertTx.data?.id || null, error: null };
    } catch (error) {
      console.error('Update wallet error:', error);
      return { data: null, error };
    }
  },

  // Investment Operations
  async createInvestment(userId, bank, amount, rate, days) {
    try {
      const now = new Date();
      const maturityDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('investments')
        .insert([
          {
            user_id: userId,
            bank_name: bank?.name || 'Partner Bank',
            amount,
            daily_rate: rate,
            duration_days: days,
            current_value: amount,
            status: 'active',
            maturity_date: maturityDate.toISOString().slice(0, 10),
            metadata: bank?.id ? { bank_id: bank.id } : null,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Create investment error:', error);
      return { data: null, error };
    }
  },

  async getInvestments(userId) {
    try {
      // Use basic investments table
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Calculate current_value and status on the client-side
        const updatedInvestments = data.map(investment => {
          const now = new Date();
          const createdDate = new Date(investment.created_at);
          const elapsedDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

          const dailyRate = investment.daily_rate / 100;
          const currentValue = Math.max(investment.amount, investment.amount * Math.pow(1 + dailyRate, elapsedDays));

          let status = investment.status;
          if (elapsedDays >= investment.duration_days && status !== 'completed') {
            status = 'completed';
          }

          return {
            ...investment,
            current_value: currentValue,
            status: status
          };
        });

        return { data: updatedInvestments, error: null };
      }
      
      return { data: [], error: null };
    } catch (error) {
      console.error('Get investments error:', error);
      return { data: null, error };
    }
  },

  async withdrawInvestment(userId, investmentId) {
    try {
      const { data: investment, error: investmentError } = await supabase
        .from('investments')
        .select('*')
        .eq('id', investmentId)
        .eq('user_id', userId)
        .single();

      if (investmentError) throw investmentError;

      // Check if investment is already withdrawn or completed
      if (investment.status === 'completed' || investment.withdrawn_at) {
        throw new Error('Investment has already been withdrawn or is not eligible for withdrawal');
      }

      // Update investment status to prevent multiple withdrawals
      const { error: updateError } = await supabase
        .from('investments')
        .update({ 
          status: 'completed',
          withdrawn_at: new Date().toISOString(),
        })
        .eq('id', investmentId);

      if (updateError) throw updateError;

      // Add the current value to income wallet
      const { data: walletResult, error: walletError } = await this.updateWallet(
        userId,
        'income',
        investment.current_value || investment.amount,
        `Investment withdrawal (${investment.bank_name})`,
        'INVESTMENT_RETURN'
      );

      if (walletError) throw walletError;

      return { data: walletResult, error: null };
    } catch (error) {
      console.error('Withdraw investment error:', error);
      return { data: null, error };
    }
  },

  // Task Operations
  async completeTask(userId, taskId, taskName, reward) {
    try {
      // Monitor task completion for suspicious patterns
      await this.monitorUserActions(userId, 'task_completion', { taskId, taskName, reward });
      
      const completionPayload = {
        user_id: userId,
        app_id: taskId?.toString() || 'task',
        app_name: taskName || taskId?.toString() || 'Task',
        earnings: reward,
      };

      const { error: taskError } = await supabase
        .from('task_completions')
        .insert([completionPayload]);

      if (taskError) throw taskError;

      const { data: walletResult, error: walletError } = await this.updateWallet(
        userId,
        'income',
        reward,
        `Task earning (${completionPayload.app_name})`,
        'TASK_EARNING'
      );

      if (walletError) throw walletError;

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('tasks_completed_today, today_earnings, week_earnings, month_earnings, total_earnings')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // NOTE: updateWallet above already credited the reward to income_wallet and the
      // earnings columns (total/today/week/month). Only increment the task counter here
      // to avoid double-counting the reward.
      const updatedTotals = {
        tasks_completed_today: (profile.tasks_completed_today ?? 0) + 1,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedProfile, error: updateError } = await supabase
        .from('users')
        .update(updatedTotals)
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      await this.recordDailyStats(userId, {
        tasksCompleted: updatedTotals.tasks_completed_today,
        earnings: updatedTotals.today_earnings,
      });

      // Monitor earnings for unusual patterns
      await this.monitorUserActions(userId, 'earning', { amount: reward, source: 'task_completion' });

      return { data: normalizeProfile(updatedProfile), error: null };
    } catch (error) {
      console.error('Complete task error:', error);
      return { data: null, error };
    }
  },

  async redeemGiftCode(userId, code) {
    try {
      const rawCode = (code || '').trim();
      if (!rawCode) throw new Error('Please enter a valid gift code.');

      // Match by code (case-insensitive)
      let { data: giftRow, error: fetchError } = await supabase
        .from('gift_codes')
        .select('*')
        .ilike('code', rawCode)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!giftRow) {
        // Try additional strategies: exact match on upper/lower, then contains
        let alt = await supabase.from('gift_codes').select('*').eq('code', rawCode.toUpperCase()).maybeSingle();
        if (!alt.data) alt = await supabase.from('gift_codes').select('*').eq('code', rawCode.toLowerCase()).maybeSingle();
        if (!alt.data) alt = await supabase.from('gift_codes').select('*').ilike('code', `%${rawCode}%`).maybeSingle();
        giftRow = alt.data || null;
        if (!giftRow) throw new Error('Gift code not found.');
      }

      // Business rules based on provided schema
      if (giftRow.is_active === false) throw new Error('Gift code is inactive.');
      if (giftRow.expires_at && new Date(giftRow.expires_at) < new Date()) throw new Error('Gift code has expired.');
      const maxUses = Number(giftRow.max_uses ?? 1);
      const currentUses = Number(giftRow.current_uses ?? 0);
      if (currentUses >= maxUses) throw new Error('Gift code usage limit reached.');

      const incomeAmount = Number(giftRow.income_wallet_amount ?? 0);
      const mainAmount = Number(giftRow.main_wallet_amount ?? 0);
      
      if (!Number.isFinite(incomeAmount) || !Number.isFinite(mainAmount) || (incomeAmount <= 0 && mainAmount <= 0)) {
        throw new Error('Gift code amount is invalid.');
      }

      // Update wallets separately if both have amounts
      let totalAmount = 0;
      let walletTypes = [];
      
      if (incomeAmount > 0) {
        const { error: incomeErr } = await this.updateWallet(
          userId,
          'income',
          incomeAmount,
          `Gift code ${giftRow.code} (income wallet)`,
          'GIFT_CODE'
        );
        if (incomeErr) throw incomeErr;
        totalAmount += incomeAmount;
        walletTypes.push('income');
      }
      
      if (mainAmount > 0) {
        const { error: mainErr } = await this.updateWallet(
          userId,
          'recharge',
          mainAmount,
          `Gift code ${giftRow.code} (recharge wallet)`,
          'GIFT_CODE'
        );
        if (mainErr) throw mainErr;
        totalAmount += mainAmount;
        walletTypes.push('recharge');
      }

      // Increment usage and deactivate if limit reached
      const now = new Date().toISOString();
      const nextUses = currentUses + 1;
      const updates = {
        current_uses: nextUses,
        is_active: nextUses >= maxUses ? false : giftRow.is_active,
        description: giftRow.description,
        metadata: giftRow.metadata,
        updated_at: now,
      };

      const { error: updateError } = await supabase
        .from('gift_codes')
        .update(updates)
        .eq('id', giftRow.id);
      if (updateError) throw updateError;

      // Record redemption row (for admin audit and triggers)
      try {
        const redemption = {
          gift_code_id: giftRow.id,
          user_id: userId,
          redeemed_at: now,
          income_wallet_reward: incomeAmount,
          main_wallet_reward: mainAmount,
        };
        let ins = await supabase.from('gift_code_redemptions').insert([redemption]).select('id').single();
        if (ins.error && (ins.error.code === '42703' || ins.error.code === 'PGRST204')) {
          // Retry with minimal required columns if some columns are missing
          ins = await supabase.from('gift_code_redemptions').insert([
            { gift_code_id: giftRow.id, user_id: userId, redeemed_at: now }
          ]).select('id').single();
        }
        if (ins.error) {
          console.error('Gift redemption audit insert error:', ins.error);
        }
      } catch (e) {
        console.error('Gift redemption audit unexpected error:', e);
      }

      return { 
        data: { 
          amount: totalAmount, 
          walletTypes,
          incomeAmount,
          mainAmount
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Redeem gift code error:', error);
      return { data: null, error };
    }
  },

  // Referral Operations
  async createWithdrawalRequest(userId, amount, method, accountInfo) {
    try {
      // Monitor the withdrawal request for suspicious patterns
      await this.monitorWithdrawalRequest(userId, amount, { method, accountInfo });
      
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .insert([{
          user_id: userId,
          amount,
          method,
          account_info: accountInfo,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Create withdrawal request error:', error);
      return { data: null, error };
    }
  },

  async addReferral(referrerId, referredUserId) {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .insert([
          {
            referrer_id: referrerId,
            referred_id: referredUserId,
            level: 1,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Add referral error:', error);
      return { data: null, error };
    }
  },

  async getReferrals(userId) {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referred_user:users!referrals_referred_id_fkey(id, name, email, created_at)
        `)
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get referrals error:', error);
      return { data: null, error };
    }
  },

  // Level Operations
  async upgradeLevel(userId, newLevelId, cost) {
    try {
      // Deduct cost from recharge wallet and update level
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('recharge_wallet, current_level')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      if (profile.recharge_wallet < cost) {
        throw new Error('Insufficient funds');
      }

      // Update profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from('users')
        .update({
          current_level: newLevelId,
          level_investment: cost,
          recharge_wallet: profile.recharge_wallet - cost,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Record transaction (log deduction)
      const now = new Date().toISOString();
      let txInsert = await supabase
        .from('transactions')
        .insert([
          {
            user_id: userId,
            amount: -cost,
            net_amount: -cost,
            fee: 0,
            status: 'completed',
            description: `Level upgrade to Level ${newLevelId}`,
            type: normalizeTransactionType('LEVEL_UPGRADE'),
            processed_at: now,
            created_at: now,
            metadata: { wallet_type: 'recharge' },
          }
        ])
        .select('id')
        .single();
      if (txInsert.error && txInsert.error.code === '23514') {
        const norm = normalizeTransactionType('LEVEL_UPGRADE');
        const altType = norm === norm.toLowerCase() ? norm.toUpperCase() : norm.toLowerCase();
        txInsert = await supabase
          .from('transactions')
          .insert([
            {
              user_id: userId,
              amount: -cost,
              net_amount: -cost,
              fee: 0,
              status: 'completed',
              description: `Level upgrade to Level ${newLevelId}`,
              type: altType,
              processed_at: now,
              created_at: now,
              metadata: { wallet_type: 'recharge' },
            }
          ])
          .select('id')
          .single();

        if (txInsert.error && txInsert.error.code === '23514') {
          txInsert = await supabase
            .from('transactions')
            .insert([
              {
                user_id: userId,
                amount: -cost,
                net_amount: -cost,
                fee: 0,
                status: 'completed',
                description: `Level upgrade to Level ${newLevelId}`,
                type: 'admin_adjustment',
                processed_at: now,
                created_at: now,
                metadata: { wallet_type: 'recharge' },
              }
            ])
            .select('id')
            .single();
        }
      }
      if (txInsert.error) {
        console.error('Transaction recording error:', txInsert.error);
      }

      // Referral bonus processing (grant immediately for non-recruits, else enqueue)
      try {
        const { data: userRow } = await supabase
          .from('users')
          .select('referred_by, is_recruit')
          .eq('id', userId)
          .maybeSingle();

        if (userRow && userRow.referred_by) {
          // fetch level cost to compute pct; fallback 4%
          const { data: settings } = await this.getSystemSettings();
          const l1Pct = Number(settings?.referral_level1_percentage ?? 4);
          const bonus = Math.max(0, (l1Pct / 100) * cost);
          if (bonus > 0) {
            if (userRow.is_recruit === false) {
              await this.updateWallet(userRow.referred_by, 'income', bonus, `Referral bonus (level upgrade L1)`, 'REFERRAL_BONUS');
              await this.logEvent(userId, 'referral_bonus_granted', 'info', { referrer_id: userRow.referred_by, amount: bonus, level: 1 });
            } else {
              await this.enqueueReferralBonus(userId ? userRow.referred_by : null, userId, bonus, 1);
              await this.logEvent(userId, 'referral_bonus_enqueued', 'warning', { referrer_id: userRow.referred_by, amount: bonus, level: 1 });
            }
          }
        }
      } catch (e) {
        console.warn('Referral bonus hook failed:', e?.message);
      }

      return { data: normalizeProfile(updatedProfile), error: null };
    } catch (error) {
      console.error('Upgrade level error:', error);
      return { data: null, error };
    }
  },

  // Transaction History
  async getTransactions(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get transactions error:', error);
      return { data: null, error };
    }
  },

  // Real-time subscriptions
  subscribeToProfile(userId, callback) {
    return supabase
      .channel(`profile:${userId}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'users',
          filter: `id=eq.${userId}`
        }, 
        callback
      )
      .subscribe();
  },

  subscribeToTransactions(userId, callback) {
    return supabase
      .channel(`transactions:${userId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe();
  },

  async recordDailyStats(userId, stats = {}) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const payload = {
        user_id: userId,
        stats_date: today,
        tasks_completed: stats.tasksCompleted || 0,
        last_updated: new Date().toISOString(),
        metadata: stats.metadata || null,
      };
      const { error } = await supabase
        .from('user_daily_activity')
        .upsert([payload], { onConflict: 'user_id,stats_date', ignoreDuplicates: false });
      if (error) throw error;
      return { ok: true };
    } catch (error) {
      console.error('Record daily stats error:', error);
      return { ok: false };
    }
  },

  async getSystemSettings() {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      const map = {};
      (data || []).forEach((row) => {
        map[row.key] = row.value;
      });
      return { data: map, error: null };
    } catch (error) {
      console.error('Get system settings error:', error);
      return { data: null, error };
    }
  },

  // Enhanced system settings with typed values
  async getTypedSystemSettings() {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      
      const settings = {};
      (data || []).forEach((row) => {
        const value = row.value;
        // Auto-convert common types
        if (value === 'true' || value === 'false') {
          settings[row.key] = value === 'true';
        } else if (!isNaN(value) && value.includes('.')) {
          settings[row.key] = parseFloat(value);
        } else if (!isNaN(value)) {
          settings[row.key] = parseInt(value);
        } else {
          settings[row.key] = value;
        }
      });
      
      return { data: settings, error: null };
    } catch (error) {
      console.error('Get typed system settings error:', error);
      return { data: null, error };
    }
  },

  async getAvailableTasks() {
    try {
      // Return empty array since task tables don't exist - use fallback tasks
      return { data: [], error: null };
    } catch (error) {
      console.error('Get available tasks error:', error);
      return { data: [], error };
    }
  },

  // Task management with completion tracking
  async getTaskCatalog() {
    try {
      // Return empty array since task tables don't exist - use fallback tasks
      return { data: [], error: null };
    } catch (error) {
      console.error('Get task catalog error:', error);
      return { data: [], error };
    }
  },

  async getUserTaskHistory(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('task_completions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get user task history error:', error);
      return { data: null, error };
    }
  },

  async createWithdrawalRequest(userId, amount, fee, netAmount, transactionId, paymentMethod, paymentDetails, userMeta) {
    try {
      const payload = {
        user_id: userId,
        amount,
        fee,
        net_amount: netAmount,
        status: 'pending',
        created_at: new Date().toISOString(),
        transaction_id: transactionId || null,
        payment_method: paymentMethod || null,
        payment_details: paymentDetails || null,
        withdrawal_account_type: paymentMethod || null,
        withdrawal_account_details: paymentDetails || null,
        user_name: userMeta?.name || null,
        user_phone: userMeta?.phone || null,
        user_email: userMeta?.email || null,
        metadata: {
          current_level: userMeta?.current_level || null,
          level_name: userMeta?.level_name || null,
        },
      };
      let ins = await supabase
        .from('withdrawal_requests')
        .insert([payload])
        .select('id')
        .single();
      if (ins.error && ins.error.code === 'PGRST204') {
        const base = {
          user_id: userId,
          amount,
          fee,
          net_amount: netAmount,
          status: 'pending',
          created_at: new Date().toISOString(),
          transaction_id: transactionId || null,
          withdrawal_account_type: paymentMethod || null,
          withdrawal_account_details: paymentDetails || null,
        };
        ins = await supabase
          .from('withdrawal_requests')
          .insert([base])
          .select('id')
          .single();
      }
      if (ins.error) throw ins.error;
      return { data: ins.data, error: null };
    } catch (error) {
      console.error('Create withdrawal request error:', error);
      return { data: null, error };
    }
  },

  // Admin function to approve withdrawal request and create transaction
  async approveWithdrawalRequest(requestId) {
    try {
      // Get the withdrawal request
      const { data: request, error: fetchError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError) throw fetchError;

      // Create the actual transaction
      const { data: transactionData, error: transactionError } = await this.updateWallet(
        request.user_id,
        'income',
        -request.amount,
        `Withdrawal: KES ${request.net_amount.toLocaleString()} (Fee: KES ${request.fee.toLocaleString()})`,
        'WITHDRAWAL'
      );

      if (transactionError) throw transactionError;

      // Update withdrawal request status and add transaction ID
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'approved',
          transaction_id: transactionData?.lastTransactionId || null,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      return { data: { ...request, status: 'approved', transaction_id: transactionData?.lastTransactionId }, error: null };
    } catch (error) {
      console.error('Approve withdrawal request error:', error);
      return { data: null, error };
    }
  },

  // Admin function to reject withdrawal request
  async rejectWithdrawalRequest(requestId, reason) {
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'rejected',
          rejection_reason: reason || 'Rejected by admin',
          rejected_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      return { data: { status: 'rejected' }, error: null };
    } catch (error) {
      console.error('Reject withdrawal request error:', error);
      return { data: null, error };
    }
  },

  // Additional helpers needed by context
  async getWallet(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('recharge_wallet, income_wallet, main_wallet')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get wallet error:', error);
      return { data: null, error };
    }
  },

  async getTaskCompletion(userId) {
    try {
      const { data, error } = await supabase
        .from('task_completions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get task completion error:', error);
      return { data: null, error };
    }
  },

  async getWithdrawalRequests(userId) {
    try {
      // Try withdrawal_requests_status_view first (has status_style)
      let { data, error } = await supabase
        .from('withdrawal_requests_status_view')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        return { data, error: null };
      }
      
      // Fallback to withdrawal_requests table
      const fallback = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      return { data: fallback.data, error: fallback.error };
    } catch (error) {
      console.error('Get withdrawal requests error:', error);
      return { data: null, error };
    }
  },

  async logEvent(userId, eventType, severity = 'info', metadata = {}) {
    if (!userId || !eventType) {
      console.warn('logEvent skipped due to missing userId or eventType', {
        userId,
        eventType,
      });
      return { ok: false, skipped: true };
    }

    try {
      const payload = {
        user_id: userId,
        event_type: eventType,
        severity,
        details: {
          ...metadata,
          timestamp: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('activity_logs').insert([payload]);
      if (error) throw error;

      return { ok: true };
    } catch (error) {
      console.error('logEvent error:', error);
      return { ok: false, error };
    }
  },

  // Activity logging wrapper (alias for logEvent)
  async logActivityEvent(userId, eventType, eventData) {
    return this.logEvent(userId, eventType, 'info', eventData);
  },

  // Bot monitoring and suspicious activity detection
  async logBotActivity(userId, eventType, details = {}) {
    try {
      const payload = {
        user_id: userId,
        event_type: `bot_${eventType}`,
        severity: 'warning',
        details: {
          ...details,
          timestamp: new Date().toISOString(),
          ip: details.ip || null,
          user_agent: details.userAgent || null,
        },
        created_at: new Date().toISOString(),
      };
      
      const { error } = await supabase.from('activity_logs').insert([payload]);
      if (error) throw error;
      
      // Auto-flag high-risk activities
      const highRiskEvents = ['multiple_accounts', 'rapid_actions', 'unusual_earnings', 'script_detected'];
      if (highRiskEvents.includes(eventType)) {
        await this.flagSuspiciousUser(userId, eventType, details);
      }
      
      return { ok: true };
    } catch (error) {
      console.error('Log bot activity error:', error);
      return { ok: false };
    }
  },

  async flagSuspiciousUser(userId, reason, details) {
    try {
      const { error } = await supabase
        .from('suspicious_activity')
        .insert([{
          user_id: userId,
          activity_type: reason,
          description: `Automated flag: ${reason}`,
          risk_score: this.calculateActivityRiskScore(reason),
          ip_address: details.ip || null,
          user_agent: details.userAgent || null,
          metadata: details,
          created_at: new Date().toISOString(),
        }]);
      
      if (error) throw error;
      return { ok: true };
    } catch (error) {
      console.error('Flag suspicious user error:', error);
      return { ok: false };
    }
  },

  calculateActivityRiskScore(activityType) {
    const riskMap = {
      'multiple_accounts': 80,
      'rapid_actions': 60,
      'unusual_earnings': 70,
      'script_detected': 90,
      'suspicious_referral': 50,
      'account_breach': 100,
    };
    return riskMap[activityType] || 30;
  },

  // Enhanced monitoring hooks
  async monitorUserActions(userId, actionType, metadata = {}) {
    try {
      // Log the action
      await this.logActivityEvent(userId, `user_action_${actionType}`, metadata);
      
      // Check for suspicious patterns
      const suspicious = await this.analyzeActionPattern(userId, actionType, metadata);
      if (suspicious) {
        await this.logBotActivity(userId, suspicious.type, suspicious.details);
      }
      
      return { ok: true };
    } catch (error) {
      console.error('Monitor user actions error:', error);
      return { ok: false };
    }
  },

  async analyzeActionPattern(userId, actionType, metadata) {
    try {
      // Check for rapid successive actions
      if (actionType === 'task_completion') {
        const { data: recentTasks } = await supabase
          .from('task_completions')
          .select('created_at')
          .eq('user_id', userId)
          .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Last 5 minutes
        
        if (recentTasks && recentTasks.length > 10) {
          return {
            type: 'rapid_actions',
            details: {
              action_count: recentTasks.length,
              time_window: '5 minutes',
              action_type: 'task_completion',
            },
          };
        }
      }
      
      // Check for unusual earnings patterns
      if (actionType === 'earning') {
        const { data: todayEarnings } = await supabase
          .from('transactions')
          .select('amount, created_at')
          .eq('user_id', userId)
          .eq('type', 'task_earning')
          .gte('created_at', new Date().toISOString().slice(0, 10));
        
        if (todayEarnings) {
          const totalEarned = todayEarnings.reduce((sum, tx) => sum + (tx.amount || 0), 0);
          if (totalEarned > 5000) { // Unusually high daily earnings
            return {
              type: 'unusual_earnings',
              details: {
                daily_total: totalEarned,
                transaction_count: todayEarnings.length,
              },
            };
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Analyze action pattern error:', error);
      return null;
    }
  },

  // Withdrawal request monitoring
  async monitorWithdrawalRequest(userId, amount, details) {
    try {
      // Log the withdrawal attempt
      await this.logActivityEvent(userId, 'withdrawal_attempt', { amount, ...details });
      
      // Check for suspicious withdrawal patterns
      const suspicious = await this.analyzeWithdrawalPattern(userId, amount);
      if (suspicious) {
        await this.logBotActivity(userId, suspicious.type, suspicious.details);
      }
      
      return { ok: true };
    } catch (error) {
      console.error('Monitor withdrawal request error:', error);
      return { ok: false };
    }
  },

  async analyzeWithdrawalPattern(userId, amount) {
    try {
      // Check for multiple withdrawal requests in short time
      const { data: recentWithdrawals } = await supabase
        .from('withdrawal_requests')
        .select('amount, created_at')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours
      
      if (recentWithdrawals && recentWithdrawals.length > 3) {
        return {
          type: 'rapid_withdrawals',
          details: {
            request_count: recentWithdrawals.length,
            time_window: '24 hours',
            amounts: recentWithdrawals.map(w => w.amount),
          },
        };
      }
      
      // Check for unusually large withdrawal
      if (amount > 10000) {
        return {
          type: 'large_withdrawal',
          details: {
            amount,
            threshold: 10000,
          },
        };
      }
      
      return null;
    } catch (error) {
      console.error('Analyze withdrawal pattern error:', error);
      return null;
    }
  },

  // Spin wheel management
  async getSpinConfiguration() {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .like('key', 'spin_%');
      if (error) throw error;
      
      const config = {};
      (data || []).forEach(row => {
        config[row.key] = row.value;
      });
      
      return { data: config, error: null };
    } catch (error) {
      console.error('Get spin configuration error:', error);
      return { data: null, error };
    }
  },

  async getUserSpinStats(userId) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from('spin_attempts')
        .select('*')
        .eq('user_id', userId)
        .gte('spin_date', today)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get user spin stats error:', error);
      return { data: null, error };
    }
  },

  // Daily check-in system
  async getUserCheckins(userId) {
    try {
      const { data, error } = await supabase
        .from('user_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('checkin_date', { ascending: false })
        .limit(30);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get user checkins error:', error);
      return { data: null, error };
    }
  },

  async performDailyCheckin(userId) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from('user_checkins')
        .upsert({
          user_id: userId,
          checkin_date: today,
          checkin_time: new Date().toISOString(),
          reward_claimed: false
        }, {
          onConflict: 'user_id,checkin_date'
        })
        .select()
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Perform daily checkin error:', error);
      return { data: null, error };
    }
  },

  // Bank management for withdrawals
  async getKenyanBanks() {
    try {
      const { data, error } = await supabase
        .from('kenyan_banks')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get Kenyan banks error:', error);
      return { data: null, error };
    }
  },

  // Enhanced notifications with targeting
  async getTargetedNotifications(pageName, userLevel, userId = null) {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('status', true)
        .eq('page_name', pageName);
      
      // Filter by user level if specified
      if (userLevel) {
        query = query.or(`apply_to_levels.is.null,apply_to_levels.cs.{${userLevel}}`);
      }
      
      const { data, error } = await query
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      // Filter out expired notifications
      const now = new Date();
      const filtered = (data || []).filter(notification => {
        if (notification.expires_at && new Date(notification.expires_at) < now) {
          return false;
        }
        return true;
      });
      
      return { data: filtered, error: null };
    } catch (error) {
      console.error('Get targeted notifications error:', error);
      return { data: null, error };
    }
  },

  // Real balance tracking
  async getRealBalanceTransactions(userId) {
    try {
      const { data, error } = await supabase
        .from('real_balance_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get real balance transactions error:', error);
      return { data: null, error };
    }
  },

  // Update user profile
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data: data ? normalizeProfile(data) : null, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { data: null, error };
    }
  },
};

export default supabaseData;
