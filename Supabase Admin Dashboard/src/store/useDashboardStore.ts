import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { 
  AdminUserSummary, 
  AdminTransaction, 
  AdminWithdrawalRequest,
  AdminInvestment,
  AdminTaskCompletion,
  AdminReferral,
  AdminSpinAttempt,
  DailyStatistics,
  SuspiciousActivity
} from '../lib/supabase';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEYS = {
  users: 'users_cache',
  transactions: 'transactions_cache',
  withdrawals: 'withdrawals_cache',
  investments: 'investments_cache',
  tasks: 'tasks_cache',
  referrals: 'referrals_cache',
  spins: 'spins_cache',
  dailyStats: 'dailyStats_cache',
  suspicious: 'suspicious_cache'
};

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

// Simple cache implementation
const cache = new Map<string, CacheItem<any>>();

const getCachedData = <T>(key: string): T | null => {
  const item = cache.get(key);
  if (!item) return null;
  
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  
  return item.data;
};

const setCachedData = <T>(key: string, data: T): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    expiry: Date.now() + CACHE_DURATION
  });
};

const invalidateCache = (key: string): void => {
  cache.delete(key);
};

const invalidateAllCache = (): void => {
  cache.clear();
};

interface DashboardState {
  // Data
  users: AdminUserSummary[];
  transactions: AdminTransaction[];
  withdrawalRequests: AdminWithdrawalRequest[];
  investments: AdminInvestment[];
  taskCompletions: AdminTaskCompletion[];
  referrals: AdminReferral[];
  spinAttempts: AdminSpinAttempt[];
  dailyStats: DailyStatistics[];
  suspiciousActivities: SuspiciousActivity[];
  
  // Loading states
  loading: {
    users: boolean;
    transactions: boolean;
    withdrawalRequests: boolean;
    investments: boolean;
    taskCompletions: boolean;
    referrals: boolean;
    spinAttempts: boolean;
    dailyStats: boolean;
    suspiciousActivities: boolean;
  };
  
  // Error states
  errors: {
    users: string | null;
    transactions: string | null;
    withdrawalRequests: string | null;
    investments: string | null;
    taskCompletions: string | null;
    referrals: string | null;
    spinAttempts: string | null;
    dailyStats: string | null;
    suspiciousActivities: string | null;
  };
  
  // General error
  error: string | null;

  // Actions
  fetchUsers: (page?: number, limit?: number, forceRefresh?: boolean) => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchWithdrawalRequests: () => Promise<void>;
  fetchInvestments: () => Promise<void>;
  fetchTaskCompletions: (page?: number, limit?: number, forceRefresh?: boolean) => Promise<void>;
  fetchReferrals: () => Promise<void>;
  fetchSpinAttempts: () => Promise<void>;
  fetchDailyStats: (days?: number) => Promise<void>;
  fetchSuspiciousActivities: () => Promise<void>;
  
  // CRUD operations with optimistic updates
  updateUser: (id: string, updates: Partial<AdminUserSummary>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<AdminTransaction>) => Promise<void>;
  updateWithdrawalRequest: (id: string, updates: Partial<AdminWithdrawalRequest>) => Promise<void>;
  updateSuspiciousActivity: (id: string, updates: Partial<SuspiciousActivity>) => Promise<void>;
  
  // Cache management
  clearCache: () => void;
  refreshAllData: () => Promise<void>;
  
  // Real-time subscriptions
  subscribeToRealtimeUpdates: () => void;
  unsubscribeFromRealtimeUpdates: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state
  users: [],
  transactions: [],
  withdrawalRequests: [],
  investments: [],
  taskCompletions: [],
  referrals: [],
  spinAttempts: [],
  dailyStats: [],
  suspiciousActivities: [],
  
  loading: {
    users: false,
    transactions: false,
    withdrawalRequests: false,
    investments: false,
    taskCompletions: false,
    referrals: false,
    spinAttempts: false,
    dailyStats: false,
    suspiciousActivities: false,
  },
  
  errors: {
    users: null,
    transactions: null,
    withdrawalRequests: null,
    investments: null,
    taskCompletions: null,
    referrals: null,
    spinAttempts: null,
    dailyStats: null,
    suspiciousActivities: null,
  },
  
  // General error
  error: null,

  // Fetch actions with pagination and caching
  fetchUsers: async (page = 1, limit = 50, forceRefresh = false) => {
    // Check cache first
    if (!forceRefresh) {
      const cachedUsers = getCachedData<AdminUserSummary[]>(CACHE_KEYS.users);
      if (cachedUsers) {
        set(state => ({ users: cachedUsers }));
        return;
      }
    }

    set(state => ({ 
      loading: { ...state.loading, users: true },
      errors: { ...state.errors, users: null }
    }));
    
    try {
      const { data, error } = await supabase
        .from('admin_user_summary')
        .select('*')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;
      
      // Cache data and update state
      const cachedData = get().users;
      const newData = page === 1 ? data : [...cachedData, ...(data || [])];
      
      setCachedData(CACHE_KEYS.users, newData);
      set(state => ({ 
        users: newData, 
        loading: { ...state.loading, users: false }
      }));
    } catch (error: any) {
      set(state => ({ 
        errors: { ...state.errors, users: error.message },
        loading: { ...state.loading, users: false }
      }));
    }
  },

  fetchTransactions: async () => {
    set(state => ({ 
      loading: { ...state.loading, transactions: true },
      errors: { ...state.errors, transactions: null }
    }));
    
    try {
      const { data, error } = await supabase
        .from('admin_transactions_with_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set(state => ({ 
        transactions: data || [], 
        loading: { ...state.loading, transactions: false }
      }));
    } catch (error: any) {
      set(state => ({ 
        errors: { ...state.errors, transactions: error.message },
        loading: { ...state.loading, transactions: false }
      }));
    }
  },

  fetchWithdrawalRequests: async () => {
    set(state => ({ 
      loading: { ...state.loading, withdrawalRequests: true },
      errors: { ...state.errors, withdrawalRequests: null }
    }));
    
    try {
      const { data, error } = await supabase
        .from('admin_withdrawal_requests_with_balance')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      set(state => ({ 
        withdrawalRequests: data || [], 
        loading: { ...state.loading, withdrawalRequests: false }
      }));
    } catch (error: any) {
      set(state => ({ 
        errors: { ...state.errors, withdrawalRequests: error.message },
        loading: { ...state.loading, withdrawalRequests: false }
      }));
    }
  },

  fetchInvestments: async () => {
    set(state => ({ 
      loading: { ...state.loading, investments: true },
      errors: { ...state.errors, investments: null }
    }));
    
    try {
      const { data, error } = await supabase
        .from('admin_investments_with_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set(state => ({ 
        investments: data || [], 
        loading: { ...state.loading, investments: false }
      }));
    } catch (error: any) {
      set(state => ({ 
        errors: { ...state.errors, investments: error.message },
        loading: { ...state.loading, investments: false }
      }));
    }
  },

  fetchTaskCompletions: async (page = 1, limit = 50) => {
    set(state => ({ 
      loading: { ...state.loading, taskCompletions: true },
      errors: { ...state.errors, taskCompletions: null }
    }));
    
    try {
      const { data, error } = await supabase
        .from('admin_task_completions_with_users')
        .select('*')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;
      
      // Cache data and update state
      const cachedData = get().taskCompletions;
      const newData = page === 1 ? data : [...cachedData, ...(data || [])];
      
      set(state => ({ 
        taskCompletions: newData, 
        loading: { ...state.loading, taskCompletions: false }
      }));
    } catch (error: any) {
      set(state => ({ 
        errors: { ...state.errors, taskCompletions: error.message },
        loading: { ...state.loading, taskCompletions: false }
      }));
    }
  },

  fetchReferrals: async () => {
    set(state => ({ 
      loading: { ...state.loading, referrals: true },
      errors: { ...state.errors, referrals: null }
    }));
    
    try {
      const { data, error } = await supabase
        .from('admin_referrals_with_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set(state => ({ 
        referrals: data || [], 
        loading: { ...state.loading, referrals: false }
      }));
    } catch (error: any) {
      set(state => ({ 
        errors: { ...state.errors, referrals: error.message },
        loading: { ...state.loading, referrals: false }
      }));
    }
  },

  fetchSpinAttempts: async () => {
    set(state => ({ 
      loading: { ...state.loading, spinAttempts: true },
      errors: { ...state.errors, spinAttempts: null }
    }));
    
    try {
      const { data, error } = await supabase
        .from('admin_spin_attempts_with_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set(state => ({ 
        spinAttempts: data || [], 
        loading: { ...state.loading, spinAttempts: false }
      }));
    } catch (error: any) {
      set(state => ({ 
        errors: { ...state.errors, spinAttempts: error.message },
        loading: { ...state.loading, spinAttempts: false }
      }));
    }
  },

  fetchDailyStats: async (days = 30) => {
    set(state => ({ 
      loading: { ...state.loading, dailyStats: true },
      errors: { ...state.errors, dailyStats: null }
    }));
    
    try {
      const { data, error } = await supabase
        .from('admin_daily_statistics')
        .select('*')
        .gte('stat_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('stat_date', { ascending: false });

      if (error) throw error;
      set(state => ({ 
        dailyStats: data || [], 
        loading: { ...state.loading, dailyStats: false }
      }));
    } catch (error: any) {
      set(state => ({ 
        errors: { ...state.errors, dailyStats: error.message },
        loading: { ...state.loading, dailyStats: false }
      }));
    }
  },

  fetchSuspiciousActivities: async () => {
    set(state => ({ 
      loading: { ...state.loading, suspiciousActivities: true },
      errors: { ...state.errors, suspiciousActivities: null }
    }));
    
    try {
      const { data, error } = await supabase
        .from('suspicious_activity')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set(state => ({ 
        suspiciousActivities: data || [], 
        loading: { ...state.loading, suspiciousActivities: false }
      }));
    } catch (error: any) {
      set(state => ({ 
        errors: { ...state.errors, suspiciousActivities: error.message },
        loading: { ...state.loading, suspiciousActivities: false }
      }));
    }
  },

  // CRUD operations
  updateWithdrawalRequest: async (id: string, updates: Partial<AdminWithdrawalRequest>) => {
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      // Refresh the data
      get().fetchWithdrawalRequests();
    } catch (error: any) {
      console.error('Error updating withdrawal request:', error);
      throw error;
    }
  },

  updateUser: async (id: string, updates: Partial<AdminUserSummary>) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      // Refresh the data
      get().fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  updateTransaction: async (id: string, updates: Partial<AdminTransaction>) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      // Refresh the data
      get().fetchTransactions();
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  updateSuspiciousActivity: async (id: string, updates: Partial<SuspiciousActivity>) => {
    try {
      const { error } = await supabase
        .from('suspicious_activity')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      // Refresh the data
      get().fetchSuspiciousActivities();
    } catch (error: any) {
      console.error('Error updating suspicious activity:', error);
      throw error;
    }
  },

  // Cache management implementation
  clearCache: () => {
    invalidateAllCache();
  },

  refreshAllData: async () => {
    invalidateAllCache();
    await Promise.all([
      get().fetchUsers(1, 50, true),
      get().fetchTransactions(),
      get().fetchWithdrawalRequests(),
      get().fetchTaskCompletions(1, 50, true)
    ]);
  },

  // Real-time subscriptions
  subscribeToRealtimeUpdates: () => {
    const subscriptions = [
      supabase
        .channel('users_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'users' },
          () => get().fetchUsers()
        )
        .subscribe(),
      
      supabase
        .channel('transactions_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'transactions' },
          () => get().fetchTransactions()
        )
        .subscribe(),
      
      supabase
        .channel('withdrawal_requests_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'withdrawal_requests' },
          () => get().fetchWithdrawalRequests()
        )
        .subscribe(),
    ];

    return subscriptions;
  },

  unsubscribeFromRealtimeUpdates: () => {
    supabase.removeAllChannels();
  },
}));
