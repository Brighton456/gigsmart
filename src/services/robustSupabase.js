/**
 * Robust Supabase Client Wrapper
 * Provides enhanced error handling and retry logic for Supabase operations
 */

import { supabase } from './supabaseClient';
import { isOnline, waitForConnection, fetchWithRetry } from '../utils/networkStatus';

/**
 * Enhanced Supabase query with network error handling
 */
export const robustQuery = async (queryBuilder, options = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    timeout = 10000,
    fallbackData = null,
    silent = false
  } = options;

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Check network connectivity before attempting query
      if (!isOnline()) {
        if (!silent) console.log('🌐 Network offline, waiting for connection...');
        const connected = await waitForConnection(5000);
        if (!connected) {
          throw new Error('Network unavailable - please check your internet connection');
        }
      }

      // Add timeout to the query
      const queryPromise = queryBuilder;
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout')), timeout);
      });

      const result = await Promise.race([queryPromise, timeoutPromise]);

      if (result.error) {
        throw new Error(`Supabase error: ${result.error.message}`);
      }

      if (!silent) {
        console.log(`✅ Supabase query successful (attempt ${attempt + 1})`);
      }

      return result;

    } catch (error) {
      lastError = error;
      
      const isNetworkError = error.message.includes('Failed to fetch') ||
                           error.message.includes('Network request failed') ||
                           error.message.includes('ERR_NAME_NOT_RESOLVED') ||
                           error.message.includes('ERR_NETWORK_CHANGED') ||
                           error.message.includes('Network unavailable') ||
                           error.message.includes('Query timeout');

      if (!silent) {
        console.error(`❌ Supabase query failed (attempt ${attempt + 1}):`, error.message);
      }

      // If it's not a network error or we've exhausted retries, return fallback or throw
      if (!isNetworkError || attempt === maxRetries) {
        if (fallbackData !== null) {
          if (!silent) {
            console.log('🔄 Using fallback data due to persistent failures');
          }
          return { data: fallbackData, error: null };
        }
        throw error;
      }

      // Wait before retrying with exponential backoff
      const delay = retryDelay * Math.pow(2, attempt);
      if (!silent) {
        console.log(`🔄 Retrying Supabase query in ${delay}ms...`);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but just in case
  throw lastError || new Error('Unknown error in robustQuery');
};

/**
 * Robust Supabase insert operation
 */
export const robustInsert = async (table, data, options = {}) => {
  return robustQuery(
    supabase.from(table).insert(data),
    options
  );
};

/**
 * Robust Supabase update operation
 */
export const robustUpdate = async (table, data, filter, options = {}) => {
  let query = supabase.from(table).update(data);
  
  // Apply filter conditions
  if (filter.id) {
    query = query.eq('id', filter.id);
  }
  if (filter.user_id) {
    query = query.eq('user_id', filter.user_id);
  }
  
  return robustQuery(query, options);
};

/**
 * Robust Supabase select operation
 */
export const robustSelect = async (table, columns = '*', filter = {}, options = {}) => {
  let query = supabase.from(table).select(columns);
  
  // Apply filter conditions
  Object.entries(filter).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });
  
  return robustQuery(query, options);
};

/**
 * Robust Supabase RPC call
 */
export const robustRPC = async (functionName, params = {}, options = {}) => {
  return robustQuery(
    supabase.rpc(functionName, params),
    options
  );
};

/**
 * Batch multiple Supabase operations with error handling
 */
export const robustBatch = async (operations, options = {}) => {
  const { failFast = false } = options;
  const results = [];
  const errors = [];

  for (let i = 0; i < operations.length; i++) {
    try {
      const result = await robustQuery(operations[i], options);
      results.push({ success: true, data: result.data, index: i });
    } catch (error) {
      errors.push({ error: error.message, index: i });
      results.push({ success: false, error: error.message, index: i });
      
      if (failFast) {
        throw new Error(`Batch operation failed at index ${i}: ${error.message}`);
      }
    }
  }

  return {
    results,
    errors,
    success: errors.length === 0,
    totalOperations: operations.length,
    successfulOperations: results.filter(r => r.success).length,
    failedOperations: errors.length
  };
};

/**
 * Health check for Supabase connection
 */
export const healthCheck = async () => {
  try {
    const result = await robustQuery(
      supabase.from('users').select('count').limit(1),
      { maxRetries: 2, timeout: 5000, silent: true }
    );
    
    return {
      healthy: true,
      latency: Date.now(),
      message: 'Supabase connection healthy'
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      message: 'Supabase connection failed'
    };
  }
};

export default {
  robustQuery,
  robustInsert,
  robustUpdate,
  robustSelect,
  robustRPC,
  robustBatch,
  healthCheck
};
