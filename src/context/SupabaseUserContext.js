import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import SafeIonicons from '../components/SafeIonicons';
import { useAuth } from './SupabaseAuthContext';
import supabaseData from '../services/supabaseData';
import supabase from '../services/supabaseClient';
import { robustSelect, robustUpdate, robustInsert } from '../services/robustSupabase';
import { levels as defaultLevels } from '../constants/levels';
import { APP_NAME } from '../constants/branding';
import { normalizeProfile } from '../utils/profile';
import { useNotification } from './NotificationContext';

const UserContext = createContext({});

export const UserProvider = ({ children }) => {
  const { user, profile: authProfile } = useAuth();
  const { showNotification } = useNotification();
  
  const [profile, setProfile] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [levelsData, setLevelsData] = useState(defaultLevels);
  const [earningsByPeriod, setEarningsByPeriod] = useState(null);
  const [giftCodeEarnings, setGiftCodeEarnings] = useState(null);
  const [taskProgressToday, setTaskProgressToday] = useState(null);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [taskCompletion, setTaskCompletion] = useState(null);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);

  const currentLevelId = profile?.currentLevelId ?? profile?.current_level ?? 0;
  const currentLevel = useMemo(() => {
    return levelsData.find(level => level.id === currentLevelId) || levelsData[0] || defaultLevels[0];
  }, [levelsData, currentLevelId]);

  const normalizeTransaction = (tx) => {
    if (!tx) return null;

    const amount = Number.isFinite(tx.net_amount) ? Number(tx.net_amount) : Number(tx.amount ?? 0);
    return {
      id: tx.id,
      type: tx.type?.toUpperCase?.() || tx.transaction_type?.toUpperCase?.() || 'ADMIN_ADJUSTMENT',
      amount,
      fee: Number(tx.fee ?? 0),
      netAmount: amount,
      status: tx.status || 'pending',
      description: tx.description || 'No description provided',
      timestamp: tx.processed_at || tx.created_at || new Date().toISOString(),
      metadata: tx.metadata || {},
      raw: tx,
    };
  };

  const redeemGiftCode = async (code) => {
    try {
      const { data, error } = await supabaseData.redeemGiftCode(user.id, code);

      if (error) throw error;

      if (data?.amount) {
        let message = `KES ${data.amount.toLocaleString()} added to your `;
        
        if (data.walletTypes.length === 2) {
          message += `income wallet (KES ${data.incomeAmount.toLocaleString()}) and recharge wallet (KES ${data.mainAmount.toLocaleString()})`;
        } else if (data.walletTypes.includes('income')) {
          message += 'income wallet';
        } else {
          message += 'recharge wallet';
        }
        
        showNotification({
          type: 'success',
          title: 'Gift Redeemed!',
          message: message,
        });
        await loadUserData();
      }

      return data?.amount ?? 0;
    } catch (error) {
      console.error('Redeem gift error:', error);
      showNotification({
        type: 'error',
        title: 'Redemption Failed',
        message: error.message || 'Unable to redeem gift code.',
      });
      return 0;
    }
  };

  const normalizeLevel = (levelRow) => {
    if (!levelRow) return null;

    const toNumber = (value, fallback = 0) => {
      const num = Number(value);
      return Number.isFinite(num) ? num : fallback;
    };

    const id = levelRow.id ?? levelRow.level_id ?? levelRow.level ?? null;
    if (id === null || id === undefined) {
      return null;
    }

    const name = levelRow.name || levelRow.title || `Level ${id}`;
    const cost = toNumber(levelRow.cost ?? levelRow.upgrade_cost ?? levelRow.price, 0);
    const tasks = toNumber(levelRow.tasks ?? levelRow.tasks_per_day ?? levelRow.daily_task_limit, 0);
    const earningsPerTask = toNumber(levelRow.earnings_per_task ?? levelRow.task_reward ?? levelRow.earnings, 0);
    const dailyEarnings = toNumber(levelRow.daily_earnings ?? levelRow.daily_total, tasks * earningsPerTask);
    const annualEarnings = toNumber(levelRow.annual_earnings, dailyEarnings * 365);
    const color = levelRow.color || levelRow.level_color || '#1E88E5';
    const multiplier = toNumber(levelRow.multiplier ?? levelRow.level_multiplier, 1);
    const iconRaw = levelRow.icon || levelRow.icon_name || 'trophy-outline';
    const icon = SafeIonicons?.glyphMap?.[iconRaw] ? iconRaw : ((iconRaw === 'diamond' || iconRaw === 'diamond-outline') ? 'shield-checkmark-outline' : 'trophy-outline');
    const nextLevelId = levelRow.next_level_id ?? levelRow.nextLevelId ?? null;
    const isLocked = Boolean(levelRow.is_locked ?? levelRow.locked ?? false);
    const isActive = levelRow.is_active ?? levelRow.active;

    return {
      id: Number(id),
      name,
      cost,
      tasks,
      earningsPerTask,
      dailyEarnings,
      annualEarnings,
      color,
      multiplier,
      icon,
      nextLevelId: nextLevelId === null || nextLevelId === undefined ? null : Number(nextLevelId),
      isLocked,
      isActive: isActive === undefined ? true : Boolean(isActive),
      description: levelRow.description || levelRow.summary || '',
    };
  };

  // Load user data when user changes
  useEffect(() => {
    if (user && authProfile) {
      setProfile((current) => {
        if (!current || current.id !== authProfile.id) {
          return normalizeProfile(authProfile);
        }
        return current;
      });
      loadUserData();
    } else {
      // Clear data when user logs out
      setProfile(null);
      setInvestments([]);
      setTransactions([]);
      setReferrals([]);
      setWallet(null);
      setTaskCompletion(null);
      setWithdrawalRequests([]);
      setEarningsByPeriod(null);
      setGiftCodeEarnings(null);
      setTaskProgressToday(null);
      setHasCheckedInToday(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authProfile]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const profileSubscription = supabaseData.subscribeToProfile(user.id, (payload) => {
      if (payload.new) {
        setProfile(normalizeProfile(payload.new));
      }
    });

    const transactionSubscription = supabaseData.subscribeToTransactions(user.id, (payload) => {
      if (payload.new) {
        const normalized = normalizeTransaction(payload.new);
        if (normalized) {
          setTransactions(prev => [normalized, ...prev]);
        }
      }
    });

    return () => {
      profileSubscription?.unsubscribe();
      transactionSubscription?.unsubscribe();
    };
  }, [user]);

  // Load earnings by period (excludes deposits per requirement 1)
  const loadEarningsByPeriod = async () => {
    if (!user) return;
    try {
      const data = await supabaseData.getEarningsByPeriod(user.id);
      // Ensure earnings exclude deposits by filtering
      const filteredData = {
        ...data,
        today: data?.today || 0,
        yesterday: data?.yesterday || 0,
        this_week: data?.this_week || 0,
        this_month: data?.this_month || 0,
        total: data?.total || 0
      };
      setEarningsByPeriod(filteredData);
    } catch (error) {
      console.error('Error loading earnings by period:', error);
    }
  };

  // Load gift code earnings
  const loadGiftCodeEarnings = async () => {
    if (!user) return;
    try {
      const data = await supabaseData.getGiftCodeEarnings(user.id);
      setGiftCodeEarnings(data);
    } catch (error) {
      console.error('Error loading gift code earnings:', error);
    }
  };

  // Load task progress today
  const loadTaskProgressToday = async () => {
    if (!user) return;
    try {
      const result = await robustSelect('user_task_progress_today', '*', { user_id: user.id }, { 
        maxRetries: 1, 
        timeout: 5000,
        fallbackData: null 
      });
      
      if (result.data && result.data.length > 0) {
        setTaskProgressToday(result.data[0]);
      } else {
        // Create default progress if none exists
        setTaskProgressToday({
          user_id: user.id,
          completed_tasks: 0,
          today_earnings: 0
        });
      }
    } catch (error) {
      console.error('Error loading task progress:', error.message);
      setTaskProgressToday({
        user_id: user.id,
        completed_tasks: 0,
        today_earnings: 0
      });
    }
  };

  // Daily check-in
  const performDailyCheckIn = async () => {
    if (!user) return;
    try {
      const deviceInfo = {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        platform: typeof Platform !== 'undefined' ? Platform.OS : 'unknown',
        timestamp: new Date().toISOString(),
      };
      
      const success = await supabaseData.dailyCheckIn(user.id, deviceInfo);
      if (success.ok) {
        setHasCheckedInToday(true);
        showNotification({
          type: 'success',
          title: 'Daily Check-in',
          message: 'You have successfully checked in for today!',
        });
      } else {
        showNotification({
          type: 'error',
          title: 'Check-in Failed',
          message: 'Failed to record daily check-in.',
        });
      }
    } catch (error) {
      console.error('Error performing daily check-in:', error);
      showNotification({
        type: 'error',
        title: 'Check-in Error',
        message: 'An error occurred during daily check-in.',
      });
    }
  };

  // Log activity
  const logActivity = async (eventType, eventData) => {
    if (!user) return;
    try {
      await supabaseData.logActivityEvent(user.id, eventType, eventData);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  // Load wallet
  const fetchWallet = async () => {
    if (!user) return;
    try {
      const { data } = await supabaseData.getWallet(user.id);
      setWallet(data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  // Load task completion
  const fetchTaskCompletion = async () => {
    if (!user) return;
    try {
      const { data } = await supabaseData.getTaskCompletion(user.id);
      setTaskCompletion(data);
    } catch (error) {
      console.error('Error fetching task completion:', error);
    }
  };

  // Load withdrawal requests
  const fetchWithdrawalRequests = async () => {
    if (!user) return;
    try {
      const { data } = await supabaseData.getWithdrawalRequests(user.id);
      setWithdrawalRequests(data || []);
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
    }
  };

  // Refresh functions
  const refreshProfile = () => fetchProfile();
  const refreshInvestments = () => fetchInvestments();
  const refreshTransactions = () => fetchTransactions();
  const refreshReferrals = () => fetchReferrals();
  const refreshWallet = () => fetchWallet();
  const refreshTaskCompletion = () => fetchTaskCompletion();
  const refreshWithdrawalRequests = () => fetchWithdrawalRequests();

  // Combined data loading function
  const fetchLevels = async () => {
    try {
      const result = await robustSelect('levels', '*', {}, { 
        maxRetries: 1, 
        timeout: 5000, // Reduced from 8000
        fallbackData: defaultLevels 
      });
      
      if (result.data && result.data.length > 0) {
        const normalizedLevels = result.data.map(level => {
          const tasks = level.tasks_required || 0;
          const earningsPerTask = level.earnings_per_task || 0;
          const dailyEarnings = tasks * earningsPerTask;
          const annualEarnings = dailyEarnings * 365;
          
          return {
            id: level.id,
            name: level.name,
            cost: level.cost || 0,
            tasks: tasks,
            earningsPerTask: earningsPerTask,
            dailyEarnings: dailyEarnings,
            annualEarnings: annualEarnings,
            multiplier: earningsPerTask / 10, // Base recruit earns 10 per task
            isLocked: level.is_locked || false,
            description: level.description || '',
            color: level.color || '#007bff',
            icon: (level.icon === 'diamond' || level.icon === 'diamond-outline') ? 'shield-checkmark-outline' : (level.icon || 'shield-checkmark-outline'),
            daily_rate: level.daily_rate || 0,
            // Map invalid icons to valid ones
            mappedIcon: (level.icon === 'diamond' || level.icon === 'diamond-outline') ? 'shield-checkmark-outline' : (level.icon || 'shield-checkmark-outline')
          };
        });
        setLevelsData(normalizedLevels);
      } else {
        setLevelsData(defaultLevels);
      }
    } catch (error) {
      console.error('Error loading levels:', error.message);
      // Keep default levels on error
    }
  };

  const loadUserData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Reset daily/weekly/monthly stats if needed (with error handling)
      try {
        await supabaseData.resetDailyStatsIfNeeded(user.id);
      } catch (error) {
        console.warn('Failed to reset daily stats:', error.message);
      }

      // Load data with error handling for each function
      const loadFunctions = [
        { name: 'profile', fn: fetchProfile },
        { name: 'investments', fn: fetchInvestments },
        { name: 'transactions', fn: fetchTransactions },
        { name: 'referrals', fn: fetchReferrals },
        { name: 'wallet', fn: fetchWallet },
        { name: 'taskCompletion', fn: fetchTaskCompletion },
        { name: 'withdrawalRequests', fn: fetchWithdrawalRequests },
        { name: 'earningsByPeriod', fn: loadEarningsByPeriod },
        { name: 'giftCodeEarnings', fn: loadGiftCodeEarnings },
        { name: 'taskProgressToday', fn: loadTaskProgressToday },
      ];

      // Load functions in parallel with individual error handling
      await Promise.allSettled(
        loadFunctions.map(async ({ name, fn }) => {
          try {
            await fn();
          } catch (error) {
            console.error(`Failed to load ${name}:`, error.message);
            // Continue loading other data even if this fails
          }
        })
      );

      // Also fetch levels from Supabase
      await fetchLevels();

      // Perform daily check-in if not already done
      if (!hasCheckedInToday) {
        try {
          await performDailyCheckIn();
        } catch (error) {
          console.warn('Failed to perform daily check-in:', error.message);
        }
      }
    } catch (error) {
      console.error('Critical error loading user data:', error);
      showNotification({
        type: 'error',
        title: 'Connection Error',
        message: 'Having trouble connecting to the server. Some features may be limited.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch functions
  const fetchProfile = async () => {
    try {
      const result = await robustSelect('users', '*', { id: user.id }, { 
        maxRetries: 1, 
        timeout: 8000
      });
      
      const profileRow = Array.isArray(result.data) ? result.data[0] : result.data;

      if (profileRow) {
        const normalizedProfile = normalizeProfile(profileRow);
        setProfile(normalizedProfile);
        return;
      }
    } catch (error) {
      console.error('Error loading user profile:', error.message);
    }

    // Use cached profile as a resilient fallback only when we have nothing fresher
    if (!profile && authProfile) {
      const normalizedProfile = normalizeProfile(authProfile);
      setProfile(normalizedProfile);
    }
  };

  const fetchInvestments = async () => {
    try {
      const result = await robustSelect('investments', '*', { user_id: user.id }, { 
        maxRetries: 1, 
        timeout: 5000, // Reduced from 10000
        fallbackData: [] 
      });
      
      if (result.data && result.data.length > 0) {
        const normalizedInvestments = result.data.map((inv) => {
          const principal = Number(inv.principal ?? inv.amount ?? 0);
          const currentValue = Number(inv.current_value ?? inv.currentValue ?? principal);
          const rate = Number(inv.daily_rate ?? inv.rate ?? 0);
          const days = Number(inv.duration_days ?? inv.days ?? 0);
          const bankName = inv.bank_name ?? inv.bankName ?? inv.name ?? 'Partner Bank';
          const rawStatus = inv.status ?? 'active';
          return {
            id: inv.id,
            bankName,
            principal,
            currentValue,
            rate,
            days,
            endDate: inv.maturity_date ?? inv.endDate ?? null,
            status: rawStatus.toString().toUpperCase(),
            start_date: inv.start_date ?? inv.created_at ?? null,
          };
        });
        setInvestments(normalizedInvestments);
      } else {
        setInvestments([]);
      }
    } catch (error) {
      console.error('Error loading investments:', error.message);
      // Keep existing investments on error
    }
  };

  const fetchTransactions = async () => {
    try {
      // Fetch all transactions without limit
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const normalizedTransactions = data
          .map(normalizeTransaction)
          .filter(Boolean);
        setTransactions(normalizedTransactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error.message);
      // Keep existing transactions on error
    }
  };

  const fetchReferrals = async () => {
    try {
      const result = await robustSelect('referrals', '*', { referrer_id: user.id }, { 
        maxRetries: 2, 
        timeout: 5000,
        fallbackData: [] 
      });
      
      if (result.data) {
        setReferrals(result.data);
      }
    } catch (error) {
      console.error('Error loading referrals:', error.message);
      // Keep existing referrals on error
    }
  };

  // Wallet operations
  const addToRechargeWallet = async (amount, description, transactionType = 'RECHARGE') => {
    try {
      const { data, error } = await supabaseData.updateWallet(
        user.id, 
        'recharge', 
        amount, 
        description, 
        transactionType
      );

      if (error) throw error;

      if (data) {
        setProfile(data);
        showNotification({
          type: 'success',
          title: 'Recharge Successful',
          message: `KES ${amount.toLocaleString()} added to your recharge wallet`,
        });
      }

      return true;
    } catch (error) {
      console.error('Add to recharge wallet error:', error);
      showNotification({
        type: 'error',
        title: 'Transaction Failed',
        message: 'Failed to update wallet balance',
      });
      return false;
    }
  };

  // Withdrawal account details (set once, reset via customer care)
  const setWithdrawalAccount = async (accountType, accountDetails, password) => {
    if (profile?.withdrawal_account_type && profile?.withdrawal_account_details) {
      showNotification({
        type: 'info',
        title: 'Account Already Set',
        message: 'Withdrawal account can only be set once. Contact customer care to reset.'
      });
      return false;
    }
    const { data, error } = await supabaseData.updateWithdrawalSettings(user.id, accountType, accountDetails, password);
    if (error) {
      showNotification({
        type: 'error',
        title: 'Failed to Set Withdrawal Account',
        message: error.message || 'Could not set withdrawal account.'
      });
      return false;
    }
    setProfile(data);
    showNotification({
      type: 'success',
      title: 'Withdrawal Account Set',
      message: 'Your withdrawal account details have been saved.'
    });
    return true;
  };

  const addToIncomeWallet = async (amount, description, transactionType = 'TASK_EARNING') => {
    try {
      const { data, error } = await supabaseData.updateWallet(
        user.id, 
        'income', 
        amount, 
        description, 
        transactionType
      );

      if (error) throw error;

      if (data) {
        setProfile(data);
        showNotification({
          type: 'success',
          title: 'Income Updated',
          message: `KES ${amount.toLocaleString()} ${amount > 0 ? 'earned' : 'deducted'}`,
        });
      }

      return true;
    } catch (error) {
      console.error('Add to income wallet error:', error);
      return false;
    }
  };

  const withdraw = async (amount, fee) => {
    try {
      const netAmount = amount - fee;
      
      // Check if user has sufficient balance
      if ((profile?.income_wallet || 0) < amount) {
        showNotification({
          type: 'error',
          title: 'Insufficient Funds',
          message: 'You do not have enough balance in your income wallet for this withdrawal.',
        });
        return false;
      }
      
      // Create withdrawal request (don't create transaction yet)
      try {
        await supabaseData.createWithdrawalRequest(
          user.id,
          amount,
          fee,
          netAmount,
          null, // No transaction ID until approved
          profile?.withdrawal_account_type || null,
          profile?.withdrawal_account_details || null,
          {
            name: profile?.name || null,
            phone: profile?.phone || null,
            email: user?.email || null,
            current_level: profile?.current_level || null,
            level_name: profile?.level_name || null,
          }
        );
        
        showNotification({
          type: 'success',
          title: 'Withdrawal Request Submitted',
          message: `Your withdrawal request for KES ${netAmount.toLocaleString()} has been submitted for approval.`,
        });
        
        // Refresh withdrawal requests to show the new request
        await fetchWithdrawalRequests();
        
      } catch (e) {
        console.error('Create withdrawal request error:', e);
        showNotification({
          type: 'error',
          title: 'Withdrawal Failed',
          message: 'Failed to submit withdrawal request. Please try again.',
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Withdrawal error:', error);
      showNotification({
        type: 'error',
        title: 'Withdrawal Failed',
        message: 'An error occurred while processing your withdrawal request.',
      });
      return false;
    }
  };

  // Investment operations
  const createInvestment = async (bank, amount, rate, days) => {
    try {
      const availableIncome = profile?.incomeWallet ?? profile?.income_wallet ?? 0;

      if (amount <= 0) {
        showNotification({
          type: 'error',
          title: 'Invalid Amount',
          message: 'Enter an amount greater than zero to invest.',
        });
        return false;
      }

      if (amount > availableIncome) {
        showNotification({
          type: 'error',
          title: 'Insufficient Funds',
          message: 'You do not have enough balance in your income wallet for this investment.',
        });
        return false;
      }

      const description = bank?.name
        ? `Investment in ${bank.name}`
        : 'Investment purchase';

      const { data: walletProfile, error: walletError } = await supabaseData.updateWallet(
        user.id,
        'income',
        -amount,
        description,
        'INVESTMENT'
      );

      if (walletError) throw walletError;

      const { data: investmentData, error: investmentError } = await supabaseData.createInvestment(
        user.id,
        bank,
        amount,
        rate,
        days
      );

      if (investmentError) throw investmentError;

      if (walletProfile) {
        setProfile(walletProfile);
      }

      if (investmentData) {
        setInvestments(prev => [investmentData, ...prev]);
        showNotification({
          type: 'success',
          title: 'Investment Created',
          message: `Successfully invested KES ${amount.toLocaleString()} from your income wallet.`,
        });
      }

      return true;
    } catch (error) {
      console.error('Create investment error:', error);
      showNotification({
        type: 'error',
        title: 'Investment Failed',
        message: error.message || 'Failed to create investment',
      });
      return false;
    }
  };

  const withdrawInvestment = async (investmentId) => {
    try {
      const { data: amount, error } = await supabaseData.withdrawInvestment(user.id, investmentId);

      if (error) throw error;

      if (amount) {
        // Update investments list
        setInvestments(prev => 
          prev.map(inv => 
            inv.id === investmentId 
              ? { ...inv, status: 'COMPLETED', completed_at: new Date().toISOString() }
              : inv
          )
        );

        // Refresh profile to get updated wallet balance
        loadUserData();

        showNotification({
          type: 'success',
          title: 'Investment Withdrawn',
          message: `KES ${amount.toLocaleString()} returned to your income wallet.`,
        });

        return amount;
      }

      return 0;
    } catch (error) {
      console.error('Withdraw investment error:', error);
      showNotification({
        type: 'error',
        title: 'Withdrawal Failed',
        message: 'Failed to withdraw investment',
      });
      return 0;
    }
  };

  const updateInvestments = () => {
    setInvestments(prev => prev.map(investment => {
      if (investment.status === 'COMPLETED') {
        return investment;
      }

      const now = new Date();
      const startDate = investment.start_date ? new Date(investment.start_date) : new Date();
      const endDate = investment.endDate ? new Date(investment.endDate) : new Date(startDate.getTime() + (investment.days || 0) * 24 * 60 * 60 * 1000);

      const totalDays = Math.max(1, investment.days || Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
      const elapsedDays = Math.min(totalDays, Math.max(0, Math.floor((now - startDate) / (1000 * 60 * 60 * 24))));
      const elapsedRatio = elapsedDays / totalDays;

      // Daily compounded profit
      const dailyRate = investment.rate / 100;
      const compoundedValue = investment.principal * Math.pow(1 + dailyRate, elapsedDays);
      const simpleProjectedValue = investment.principal * (1 + dailyRate * totalDays);
      const targetValue = Math.max(compoundedValue, simpleProjectedValue * elapsedRatio);
      const maxMaturityValue = investment.principal * (1 + dailyRate * totalDays);
      const currentValue = Math.max(investment.principal, Math.min(maxMaturityValue, targetValue));

      let status = investment.status;
      if (now >= endDate || elapsedDays >= totalDays) {
        status = 'COMPLETED';
      }

      return {
        ...investment,
        current_value: currentValue,
        status,
      };
    }));
  };

  // Task operations
  const completeTask = async (taskId, taskName, reward) => {
    try {
      const { data, error } = await supabaseData.completeTask(user.id, taskId, taskName, reward);

      if (error) throw error;

      if (data) {
        setProfile(data);
        showNotification({
          type: 'success',
          title: 'Task Completed!',
          message: `Earned KES ${reward.toLocaleString()} from ${taskName}`,
        });
        await loadUserData();
      }

      return true;
    } catch (error) {
      console.error('Complete task error:', error);
      showNotification({
        type: 'error',
        title: 'Task Failed',
        message: 'Failed to complete task',
      });
      return false;
    }
  };

  // Level operations
  const upgradeLevel = async (levelId, cost) => {
    try {
      if (cost > profile.recharge_wallet) {
        showNotification({
          type: 'error',
          title: 'Insufficient Funds',
          message: 'You don\'t have enough balance in your recharge wallet for this upgrade',
        });
        return false;
      }

      const { data, error } = await supabaseData.upgradeLevel(user.id, levelId, cost);

      if (error) throw error;

      if (data) {
        setProfile(data);
        const newLevel = levelsData.find(level => level.id === levelId);
        showNotification({
          type: 'success',
          title: 'Level Upgraded!',
          message: `Welcome to ${newLevel?.name}! Enjoy your new perks and higher earnings.`,
        });
      }

      return true;
    } catch (error) {
      console.error('Upgrade level error:', error);
      showNotification({
        type: 'error',
        title: 'Upgrade Failed',
        message: error.message || 'Failed to upgrade level',
      });
      return false;
    }
  };

  // Referral operations
  const updateWithdrawalAccount = async (accountType, accountDetails, password) => {
    try {
      const { data, error } = await supabaseData.updateWithdrawalSettings(user.id, accountType, accountDetails, password);

      if (error) throw error;

      if (data) {
        setProfile(data);
        showNotification({
          type: 'success',
          title: 'Withdrawal Account Updated',
          message: 'Your withdrawal details are secure and ready to use.',
        });
      }

      return true;
    } catch (error) {
      console.error('Update withdrawal account error:', error);
      showNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Could not update withdrawal account',
      });
      return false;
    }
  };

  const addReferral = async (referredUserId) => {
    try {
      const { data, error } = await supabaseData.addReferral(user.id, referredUserId);

      if (error) throw error;

      if (data) {
        setReferrals(prev => [data, ...prev]);
        
        // Add referral bonus
        const bonusAmount = 100; // KES 100 referral bonus
        await addToIncomeWallet(bonusAmount, 'Referral bonus', 'REFERRAL_BONUS');
      }

      return true;
    } catch (error) {
      console.error('Add referral error:', error);
      return false;
    }
  };

  const value = {
    profile,
    currentLevel,
    investments,
    transactions,
    referrals,
    wallet,
    taskCompletion,
    withdrawalRequests,
    earningsByPeriod,
    giftCodeEarnings,
    taskProgressToday,
    hasCheckedInToday,
    isLoading,
    levels: levelsData,
    
    // Wallet operations
    addToRechargeWallet,
    addToIncomeWallet,
    withdraw,
    setWithdrawalAccount,
    
    // Investment operations
    createInvestment,
    withdrawInvestment,
    updateInvestments,
    
    // Task operations
    completeTask,
    
    // Level operations
    upgradeLevel,
    updateWithdrawalAccount,
    redeemGiftCode,
    
    // Referral operations
    addReferral,
    
    // Data refresh
    refreshProfile,
    refreshInvestments,
    refreshTransactions,
    refreshReferrals,
    refreshWallet,
    refreshTaskCompletion,
    refreshWithdrawalRequests,
    refreshEarningsByPeriod: loadEarningsByPeriod,
    loadEarningsByPeriod,
    loadGiftCodeEarnings,
    loadTaskProgressToday,
    performDailyCheckIn,
    loadUserData, // Add loadUserData to exposed functions
    logActivity,
    
    // Utility functions
    getReferralCount: () => referrals.length,
    getActiveReferralCount: () => referrals.filter(r => r.status === 'active').length,
    getTotalReferralEarnings: () => referrals.reduce((sum, r) => sum + (r.earnings || 0), 0),
    getTotalEarnings: () => transactions.filter(t => t.type === 'EARNING').reduce((sum, t) => sum + t.amount, 0),
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
};

export default UserContext;
