import supabase from './supabaseClient';
import { APP_NAME } from '../constants/branding';

export const supabaseAuth = {
  // Sign up new user
  async signUp(userData = {}) {
    try {
      const {
        email,
        password,
        name,
        phone,
        country,
        city,
        nationalId,
        dateOfBirth,
        gender,
        industry,
        occupation,
        experience,
        referrer,
        referralCode,
        securityCode,
        acceptMarketing,
      } = userData;

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (!phone) {
        throw new Error('Phone number is required');
      }

      const safeName = name?.trim() || email.split('@')[0] || 'New User';
      const safeReferralCode = (referralCode || `REF${Date.now()}`).toString().trim().toUpperCase();
      const referredBy = referrer?.trim() || null;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: safeName,
            phone,
            country,
            city,
            national_id: nationalId,
            date_of_birth: dateOfBirth,
            gender,
            industry,
            occupation,
            experience,
            referrer: referredBy,
            security_code: securityCode,
            referral_code: safeReferralCode,
            accept_marketing: acceptMarketing,
            app_name: APP_NAME,
            created_at: new Date().toISOString(),
          }
        }
      });

      if (error) throw error;

      // Create user profile in users table
      if (data.user) {
        const profilePayload = {
          id: data.user.id,
          name: safeName,
          email,
          phone,
          security_code: securityCode || null,
          referred_by: referredBy,
          referral_code: safeReferralCode,
          password_hash: 'SUPABASE_AUTH_MANAGED',
          is_active: true,
          current_level: 0,
          level_investment: 0,
          income_wallet: 0,
          recharge_wallet: 0,
          main_wallet: 0,
          wealth_fund_balance: 0,
          total_earnings: 0,
          tasks_completed_today: 0,
          tasks_reset_date: new Date().toISOString().slice(0, 10),
          yesterday_earnings: 0,
          today_earnings: 0,
          week_earnings: 0,
          month_earnings: 0,
          gift_code_earnings: 0,
          referral_rebate_total: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          level_upgraded_at: null,
          login_count: 0,
          withdrawal_account_type: null,
          withdrawal_account_details: null,
          withdrawal_password_hash: null,
          real_balance: 0,
          user_category: 'new',
          category_updated_at: new Date().toISOString(),
          restrictions: {},
        };

        const { error: profileError } = await supabase
          .from('users')
          .insert([profilePayload]);

        if (profileError) {
          throw profileError;
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  },

  // Sign in user
  async signIn({ email, password }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  },

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${APP_NAME}://reset-password`,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { data: null, error };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      console.error('Get current user error:', error);
      return { user: null, error };
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session, error: null };
    } catch (error) {
      console.error('Get session error:', error);
      return { session: null, error };
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
      return { data, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { data: null, error };
    }
  },

  // Get user profile
  async getProfile(userId) {
    try {
      console.log('🔍 supabaseAuth.getProfile called for:', userId);
      const startTime = Date.now();
      
      const TIMEOUT_MS = 8000; // Reduced from 15000 to prevent hanging
      const MAX_ATTEMPTS = 1;

      const runWithTimeout = (promise, timeoutMs) => new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Query timeout after ${timeoutMs / 1000} seconds`));
        }, timeoutMs);

        promise
          .then((result) => {
            clearTimeout(timeoutId);
            resolve(result);
          })
          .catch((err) => {
            clearTimeout(timeoutId);
            reject(err);
          });
      });

      const performQuery = async (attempt = 1) => {
        console.log(`📡 Starting Supabase query (attempt ${attempt})...`);
        try {
          return await runWithTimeout(
            supabase
              .from('users')
              .select('*')
              .eq('id', userId)
              .maybeSingle(),
            TIMEOUT_MS
          );
        } catch (err) {
          if (err.message?.includes('timeout') && attempt < MAX_ATTEMPTS) {
            console.warn(`⏱️ Profile query timeout on attempt ${attempt}. Retrying...`);
            return performQuery(attempt + 1);
          }
          throw err;
        }
      };

      let data = null;
      let error = null;

      try {
        ({ data, error } = await performQuery());
      } catch (err) {
        if (err.message?.includes('timeout')) {
          return { data: null, error: { code: 'TIMEOUT', message: err.message } };
        }
        throw err;
      } finally {
        const endTime = Date.now();
        console.log(`📊 Profile query completed in ${endTime - startTime}ms:`, {
          data: !!data,
          error: error?.message,
          errorCode: error?.code,
        });
      }

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { data: data ?? null, error: error && error.code === 'PGRST116' ? null : error };
    } catch (error) {
      console.error('❌ Get profile error:', error);
      return { data: null, error };
    }
  },

  // Ensure a profile row exists for the Supabase auth user
  async ensureUserProfile(authUser) {
    try {
      console.log('🔧 ensureUserProfile called for:', authUser?.id);
      const startTime = Date.now();
      
      if (!authUser?.id) {
        throw new Error('Missing auth user data');
      }

      const metadata = authUser.user_metadata || {};
      const safeName = metadata.name?.trim()
        || metadata.full_name?.trim()
        || authUser.email?.split('@')[0]
        || 'New User';

      const rawPhone = metadata.phone
        ?? metadata.phone_number
        ?? authUser.phone
        ?? metadata.phoneNumber;
      const phone = typeof rawPhone === 'string' ? rawPhone.trim() : rawPhone?.toString().trim();

      if (!phone) {
        throw new Error('Phone number is required to create profile');
      }

      const profilePayload = {
        id: authUser.id,
        name: safeName,
        email: authUser.email,
        phone,
        security_code: metadata.security_code || null,
        referred_by: metadata.referrer || null,
        referral_code: (metadata.referral_code || `REF${Date.now()}`).toString().toUpperCase(),
        password_hash: 'SUPABASE_AUTH_MANAGED',
        is_active: true,
        current_level: metadata.current_level ?? 0,
        level_investment: metadata.level_investment ?? 0,
        income_wallet: metadata.income_wallet ?? 0,
        recharge_wallet: metadata.recharge_wallet ?? 0,
        main_wallet: metadata.main_wallet ?? 0,
        wealth_fund_balance: metadata.wealth_fund_balance ?? 0,
        total_earnings: metadata.total_earnings ?? 0,
        tasks_completed_today: metadata.tasks_completed_today ?? 0,
        tasks_reset_date: new Date().toISOString().slice(0, 10),
        yesterday_earnings: metadata.yesterday_earnings ?? 0,
        today_earnings: metadata.today_earnings ?? 0,
        week_earnings: metadata.week_earnings ?? 0,
        month_earnings: metadata.month_earnings ?? 0,
        gift_code_earnings: metadata.gift_code_earnings ?? 0,
        referral_rebate_total: metadata.referral_rebate_total ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        level_upgraded_at: null,
        login_count: metadata.login_count ?? 0,
        withdrawal_account_type: metadata.withdrawal_account_type || null,
        withdrawal_account_details: metadata.withdrawal_account_details || null,
        withdrawal_password_hash: metadata.withdrawal_password_hash || null,
        real_balance: metadata.real_balance ?? 0,
        user_category: metadata.user_category || 'new',
        category_updated_at: new Date().toISOString(),
        restrictions: metadata.restrictions || {},
      };

      console.log('📝 Attempting to insert profile...');
      const { data, error } = await supabase
        .from('users')
        .insert([profilePayload])
        .select()
        .single();

      const endTime = Date.now();
      console.log(`📊 Profile insert completed in ${endTime - startTime}ms:`, { 
        data: !!data, 
        error: error?.message,
        errorCode: error?.code 
      });

      if (error) {
        if (error.code === '23505') {
          console.log('⚠️ Row already exists, fetching existing profile...');
          // Row already exists, fetch it
          return this.getProfile(authUser.id);
        }
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('❌ Ensure user profile error:', error);
      return { data: null, error };
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Lightweight ping to keep connection warm
  async ping() {
    try {
      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1)
        .maybeSingle();

      return { error };
    } catch (error) {
      return { error };
    }
  },
};

export default supabaseAuth;
