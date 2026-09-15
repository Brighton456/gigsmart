import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
// import 'react-native-url-polyfill/auto'; // Disabled for web compatibility

// Try multiple ways to get environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://rtomjtqrxcjcfqjhndtr.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_JMetc5HhwGS9bL9_rel0hQ_pq05Ggmy';

// Debug environment variables
console.log('Environment check:', {
  supabaseUrl: supabaseUrl ? 'present' : 'missing',
  supabaseKey: supabaseAnonKey ? 'present' : 'missing',
  source: Constants.expoConfig?.extra ? 'expo-constants' : 'process.env'
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key. Please check your environment variables.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'earnings-app-v1.0',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Test connectivity on client creation
const testConnection = async (retryCount = 0) => {
  const maxRetries = 3;
  const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
  
  const startTime = Date.now();
  try {
    console.log(`🔌 Testing Supabase connectivity... (attempt ${retryCount + 1}/${maxRetries})`);
    
    // Simple query to test connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    const endTime = Date.now();
    
    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`);
    }
    
    console.log(`✅ Supabase connection test: ${endTime - startTime}ms`, { 
      success: true, 
      error: null 
    });
    return true;
  } catch (err) {
    const endTime = Date.now();
    console.error(`❌ Supabase connection test failed: ${endTime - startTime}ms`, err.message);
    
    // Retry logic
    if (retryCount < maxRetries - 1) {
      console.log(`🔄 Retrying Supabase connection in ${retryDelay}ms...`);
      setTimeout(() => testConnection(retryCount + 1), retryDelay);
      return false;
    }
    
    console.error('💥 All Supabase connection attempts failed. App may have limited functionality.');
    return false;
  }
};

// Run connection test (but don't block app startup)
setTimeout(testConnection, 1000);

export default supabase;
