/**
 * Network Status Utility
 * Handles network connectivity monitoring and provides utilities for dealing with network issues
 */

import { NetInfo } from 'react-native';

// Network status state
let networkStatus = {
  isConnected: true,
  connectionType: 'unknown',
  isInternetReachable: true,
  lastChecked: null,
};

// Network status listeners
const listeners = [];

/**
 * Initialize network monitoring
 */
export const initializeNetworkMonitoring = () => {
  // For web, use online/offline events
  if (typeof window !== 'undefined') {
    const updateNetworkStatus = () => {
      const wasConnected = networkStatus.isConnected;
      networkStatus = {
        isConnected: navigator.onLine,
        connectionType: navigator.connection?.effectiveType || 'unknown',
        isInternetReachable: navigator.onLine,
        lastChecked: new Date().toISOString(),
      };

      // Notify listeners of status change
      if (wasConnected !== networkStatus.isConnected) {
        notifyListeners();
      }

      console.log('🌐 Network status updated:', networkStatus);
    };

    // Listen for online/offline events
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    // Initial status check
    updateNetworkStatus();
  }
};

/**
 * Get current network status
 */
export const getNetworkStatus = () => {
  return { ...networkStatus };
};

/**
 * Check if device is online
 */
export const isOnline = () => {
  return networkStatus.isConnected && networkStatus.isInternetReachable;
};

/**
 * Add network status listener
 */
export const addNetworkListener = (callback) => {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

/**
 * Notify all listeners of network status change
 */
const notifyListeners = () => {
  listeners.forEach(callback => {
    try {
      callback(networkStatus);
    } catch (error) {
      console.error('Network listener error:', error);
    }
  });
};

/**
 * Wait for network connection with timeout
 */
export const waitForConnection = (timeoutMs = 30000) => {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve(true);
      return;
    }

    const timeout = setTimeout(() => {
      cleanup();
      resolve(false);
    }, timeoutMs);

    const cleanup = addNetworkListener((status) => {
      if (status.isConnected && status.isInternetReachable) {
        clearTimeout(timeout);
        cleanup();
        resolve(true);
      }
    });
  });
};

/**
 * Enhanced fetch with retry logic for network failures
 */
export const fetchWithRetry = async (url, options = {}, maxRetries = 3) => {
  const retryDelay = (attempt) => Math.pow(2, attempt) * 1000; // Exponential backoff

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Check network status before attempting
      if (!isOnline()) {
        console.log(`🌐 Network offline, waiting for connection... (attempt ${attempt + 1})`);
        await waitForConnection(5000);
      }

      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      const isNetworkError = error.message.includes('Failed to fetch') || 
                           error.message.includes('Network request failed') ||
                           error.message.includes('ERR_NAME_NOT_RESOLVED') ||
                           error.message.includes('ERR_NETWORK_CHANGED');

      console.error(`🌐 Fetch attempt ${attempt + 1} failed:`, error.message);

      // If it's not a network error or we've exhausted retries, throw the error
      if (!isNetworkError || attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying
      const delay = retryDelay(attempt);
      console.log(`🔄 Retrying fetch in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Debounced function to check network connectivity
 */
let networkCheckTimeout = null;
export const debouncedNetworkCheck = (callback, delay = 1000) => {
  if (networkCheckTimeout) {
    clearTimeout(networkCheckTimeout);
  }
  
  networkCheckTimeout = setTimeout(() => {
    callback(getNetworkStatus());
    networkCheckTimeout = null;
  }, delay);
};

// Initialize network monitoring on module load
if (typeof window !== 'undefined') {
  initializeNetworkMonitoring();
}
