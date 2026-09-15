import { createClient } from '@supabase/supabase-js';

// Debug: Log environment variables
console.log('Environment check:', {
  REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL ? 'SET' : 'NOT SET',
  REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
});

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey,
  });
  throw new Error('Supabase URL and Anon Key are required. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on schema analysis
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  current_level: number;
  main_wallet: number;
  income_wallet: number;
  wealth_fund_balance: number;
  total_earnings: number;
  total_withdrawals: number;
  is_active: boolean;
  is_activated: boolean;
  created_at: string;
  last_login: string;
  referral_code: string;
  referred_by?: string;
  user_category: string;
  real_balance: number;
  today_earnings: number;
  tasks_completed_today: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  fee: number;
  net_amount: number;
  status: string;
  payment_method: string;
  external_reference?: string;
  description: string;
  metadata?: any;
  admin_notes?: string;
  created_at: string;
  processed_at?: string;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  fee: number;
  net_amount: number;
  status: string;
  withdrawal_account_type: string;
  withdrawal_account_details: string;
  payment_method: string;
  payment_details?: any;
  admin_notes?: string;
  rejection_reason?: string;
  requested_at: string;
  processed_at?: string;
  processed_by?: string;
  transaction_id?: string;
  external_reference?: string;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  amount: number;
  daily_rate: number;
  duration_days: number;
  current_value: number;
  status: string;
  bank_name: string;
  maturity_date: string;
  withdrawn_at?: string;
  metadata?: any;
  created_at: string;
}

export interface TaskCompletion {
  id: string;
  user_id: string;
  app_id: string;
  app_name: string;
  earnings: number;
  completion_date: string;
  install_duration?: number;
  metadata?: any;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  level: number;
  total_earnings: number;
  is_active: boolean;
  last_earning_at?: string;
  created_at: string;
}

export interface SpinAttempt {
  id: string;
  user_id: string;
  spin_date: string;
  prize_won: string;
  prize_value: number;
  metadata?: any;
  created_at: string;
}

export interface GiftCode {
  id: string;
  code: string;
  main_wallet_amount: number;
  income_wallet_amount: number;
  reward_type: string;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  expires_at?: string;
  description?: string;
  created_by: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface DailyStatistics {
  id: string;
  stat_date: string;
  total_users: number;
  new_users: number;
  total_deposits: number;
  total_withdrawals: number;
  total_task_earnings: number;
  total_referral_earnings: number;
  total_spin_wins: number;
  total_gift_code_credits: number;
  total_investment_volume: number;
  total_investment_returns: number;
  active_task_users: number;
  created_at: string;
  updated_at: string;
}

export interface SuspiciousActivity {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  risk_score: number;
  ip_address: string;
  user_agent?: string;
  metadata?: any;
  status: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

// Admin Views
export interface AdminUserSummary extends User {
  level_name: string;
  tasks_completed_today: number;
  joined_date: string;
  total_referrals: number;
}

export interface AdminTransaction extends Transaction {
  user_name: string;
  user_email: string;
  user_phone: string;
}

export interface AdminWithdrawalRequest extends WithdrawalRequest {
  user_name: string;
  user_email: string;
  user_phone: string;
  real_balance?: number;
  user_category?: string;
  real_balance_status?: string;
}

export interface AdminInvestment extends Investment {
  user_name: string;
  user_email: string;
  user_phone: string;
}

export interface AdminTaskCompletion extends TaskCompletion {
  user_name: string;
  user_email: string;
  user_phone: string;
}

export interface AdminReferral extends Referral {
  referrer_name: string;
  referrer_email: string;
  referrer_phone: string;
  referred_name: string;
  referred_email: string;
  referred_phone: string;
}

export interface AdminSpinAttempt extends SpinAttempt {
  user_name: string;
  user_email: string;
  user_phone: string;
}
