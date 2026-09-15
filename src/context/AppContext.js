import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import supabaseData from '../services/supabaseData';
import { useAuth } from './SupabaseAuthContext';
import { useUser } from './SupabaseUserContext';
import { useSettings } from './SettingsContext';
import { useTasks } from './TasksContext';
import { useLevels } from './LevelsContext';
import { useNotifications } from './NotificationContext';
import { useSpin } from './SpinContext';
import { useCheckIn } from './CheckInContext';
import { useBank } from './BankContext';
import { generateMockApps } from '../utils/mockData';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const { profile, loading: userLoading } = useUser();
  const { settings, loading: settingsLoading } = useSettings();
  const { tasks, loading: tasksLoading, loadTaskHistory } = useTasks();
  const { levels, loading: levelsLoading } = useLevels();
  const { getNotificationsForPage } = useNotifications();
  const { refreshSpinData, loadUserStats } = useSpin();
  const { loadUserCheckins } = useCheckIn();
  const { banks } = useBank();
  
  const [appState, setAppState] = useState({
    isLoading: true,
    isInitialized: false,
  });
  const [notifications, setNotifications] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [taskApps, setTaskApps] = useState([]);
  const [installingApps, setInstallingApps] = useState([]);
  const [completedApps, setCompletedApps] = useState([]);

  // Initialize app data when user is available
  const initializeApp = useCallback(async () => {
    if (!user || !profile) return;
    
    try {
      setAppState(prev => ({ ...prev, isLoading: true }));
      
      // Load real task apps from Supabase
      const { data: taskAppsData, error: taskError } = await supabaseData.getTaskCatalog();
      if (taskError || !taskAppsData || taskAppsData.length === 0) {
        console.warn('No tasks from Supabase, using fallback:', taskError || 'Empty data');
        // Fallback to mock data if Supabase fails or returns empty
        const mockApps = generateMockApps(50); // Generate 50 apps
        setTaskApps(mockApps);
      } else {
        setTaskApps(taskAppsData);
      }
      
      // Load all user-specific data
      await Promise.all([
        loadTaskHistory(user.id),
        refreshSpinData(user.id),
        loadUserStats(user.id),
        loadUserCheckins(user.id),
        getNotificationsForPage('home', profile.current_level, user.id)
      ]);
      
      setAppState(prev => ({ ...prev, isLoading: false, isInitialized: true }));
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setAppState(prev => ({ ...prev, isLoading: false, error }));
    }
  }, [user, profile, loadTaskHistory, refreshSpinData, loadUserStats, loadUserCheckins, getNotificationsForPage, supabaseData]);

  useEffect(() => {
    if (user && profile && !appState.isInitialized) {
      initializeApp();
    }
  }, [user, profile, appState.isInitialized, initializeApp]);

  // Use settings from Supabase with minimal fallbacks
  const mergedSettings = {
    welcome_title: settings?.welcome_title || 'Welcome to GigSmart',
    welcome_subtitle: settings?.welcome_subtitle || 'Complete tasks and earn rewards',
    app_name: settings?.app_name || 'GigSmart',
    support_email: settings?.support_email || 'support@gigsmart.com',
    support_phone: settings?.support_phone || '+254700000000',
    whatsapp_group_link: settings?.whatsapp_group_link || 'https://chat.whatsapp.com/www',
    withdrawal_fee_percentage: settings?.withdrawal_fee_percentage || 15,
    min_withdrawal_amount: settings?.min_withdrawal_amount || 500,
    max_withdrawal_amount: settings?.max_withdrawal_amount || 50000,
    referral_level1_percentage: settings?.referral_level1_percentage || 4,
    referral_level2_percentage: settings?.referral_level2_percentage || 2,
    referral_level3_percentage: settings?.referral_level3_percentage || 0.25,
    task_reward_multiplier: settings?.task_reward_multiplier || 1,
    spin_enabled: settings?.spin_enabled !== false,
    spin_max_daily: settings?.daily_spin_limit || 3,
    spin_cost: settings?.spin_cost || 0,
    daily_checkin_enabled: settings?.daily_checkin_enabled !== false,
    daily_checkin_reward: settings?.daily_checkin_reward || 0,
    // Add any other settings from Supabase
    app_maintenance_mode: settings?.app_maintenance_mode || false,
    task_reset_time: settings?.task_reset_time || '00:00',
    whatsapp_customer_care: settings?.whatsapp_customer_care || '+254720363215',
    ...settings
  };

  // Get current level info
  const currentLevelInfo = levels?.find(level => level.id === profile?.current_level) || levels?.[0];

  // Calculate user statistics
  const calculateUserStats = useCallback(() => {
    if (!profile) return null;
    
    return {
      totalEarnings: profile.total_earnings || 0,
      todayEarnings: profile.today_earnings || 0,
      weekEarnings: profile.week_earnings || 0,
      monthEarnings: profile.month_earnings || 0,
      tasksCompleted: profile.tasks_completed_today || 0,
      totalTasks: profile.total_tasks_completed || 0,
      referrals: profile.total_referrals || 0,
      level: profile.current_level || 1,
      levelName: currentLevelInfo?.name || 'Beginner',
      nextLevel: levels?.find(level => level.id === (profile.current_level || 1) + 1),
      levelProgress: profile.level_progress || 0,
      mainWallet: profile.main_wallet || 0,
      incomeWallet: profile.income_wallet || 0,
      rechargeWallet: profile.recharge_wallet || 0,
      totalWithdrawals: profile.total_withdrawals || 0,
      wealthFundBalance: profile.wealth_fund_balance || 0,
      referralEarnings: profile.referral_earnings || 0,
      giftCodeEarnings: profile.gift_code_earnings || 0,
      isActive: profile.is_active || false,
      isRecruit: profile.is_recruit || false,
      lastLogin: profile.last_sign_in_at,
      joinedDate: profile.created_at,
    };
  }, [profile, currentLevelInfo, levels]);

  useEffect(() => {
    setUserStats(calculateUserStats());
  }, [calculateUserStats]);

  // App-wide methods
  const refreshAppData = useCallback(async () => {
    if (!user || !profile) return;
    await initializeApp();
  }, [user, profile, initializeApp]);

  const installApp = useCallback((app) => {
    if (!app || installingApps.find(a => a.id === app.id)) return;
    
    const installTime = 5000 + Math.random() * 5000; // 5-10 seconds
    const installingApp = {
      ...app,
      installTime,
      startTime: Date.now()
    };
    
    setInstallingApps(prev => [...prev, installingApp]);
    
    // Simulate installation completion
    setTimeout(() => {
      setInstallingApps(prev => prev.filter(a => a.id !== app.id));
      setCompletedApps(prev => [...prev, app]);
    }, installTime);
  }, [installingApps]);

  const updateInstallProgress = useCallback((appId, progress) => {
    // Progress is handled by animation in TaskScreen
    console.log(`Install progress for ${appId}: ${progress}%`);
  }, []);

  const value = {
    // State
    appState,
    userStats,
    notifications,
    taskApps,
    installingApps,
    completedApps,
    
    // Data
    settings: mergedSettings,
    tasks,
    levels,
    banks,
    currentLevelInfo,
    
    // Loading states
    isLoading: appState.isLoading || userLoading || settingsLoading || tasksLoading || levelsLoading,
    isInitialized: appState.isInitialized,
    
    // Methods
    refreshAppData,
    initializeApp,
    installApp,
    updateInstallProgress,
    
    // Helpers
    canWithdraw: () => {
      if (!userStats) return false;
      return userStats.incomeWallet >= (mergedSettings.min_withdrawal_amount || 500);
    },
    
    getNextLevelRequirements: () => {
      const nextLevel = levels?.find(level => level.id === (profile?.current_level || 1) + 1);
      if (!nextLevel) return null;
      
      return {
        level: nextLevel.id,
        name: nextLevel.name,
        cost: nextLevel.cost,
        tasksRequired: nextLevel.tasks_required,
        currentTasks: profile?.tasks_completed_today || 0,
        canAfford: (profile?.recharge_wallet || 0) >= nextLevel.cost,
        hasTasks: (profile?.tasks_completed_today || 0) >= nextLevel.tasks_required,
      };
    },
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
