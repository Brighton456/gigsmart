import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import supabaseData from '../services/supabaseData';

const SpinContext = createContext(null);

export const SpinProvider = ({ children }) => {
  const [config, setConfig] = useState({});
  const [userStats, setUserStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spinsToday, setSpinsToday] = useState(0);

  const loadSpinConfig = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabaseData.getSpinConfiguration();
      if (fetchError) throw fetchError;
      setConfig(data || {});
    } catch (e) {
      console.error('Failed to load spin configuration:', e);
      setError(e);
    }
  }, []);

  const loadUserStats = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const { data, error: fetchError } = await supabaseData.getUserSpinStats(userId);
      if (fetchError) throw fetchError;
      setUserStats(data || []);
      setSpinsToday((data || []).length);
    } catch (e) {
      console.error('Failed to load user spin stats:', e);
    }
  }, []);

  const refreshSpinData = useCallback(async (userId) => {
    setLoading(true);
    await Promise.all([
      loadSpinConfig(),
      loadUserStats(userId)
    ]);
    setLoading(false);
  }, [loadSpinConfig, loadUserStats]);

  useEffect(() => {
    loadSpinConfig();
    setLoading(false);
  }, [loadSpinConfig]);

  const getMaxSpinsPerDay = () => {
    return parseInt(config.spin_max_daily || '3');
  };

  const canSpinToday = () => {
    return spinsToday < getMaxSpinsPerDay();
  };

  const getSpinCost = () => {
    return parseFloat(config.spin_cost || '0');
  };

  return (
    <SpinContext.Provider value={{
      config,
      userStats,
      loading,
      error,
      spinsToday,
      refreshSpinData,
      loadUserStats,
      getMaxSpinsPerDay,
      canSpinToday,
      getSpinCost
    }}>
      {children}
    </SpinContext.Provider>
  );
};

export const useSpin = () => {
  const context = useContext(SpinContext);
  if (!context) {
    throw new Error('useSpin must be used within a SpinProvider');
  }
  return context;
};
