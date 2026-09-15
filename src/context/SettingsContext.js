import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import supabaseData from '../services/supabaseData';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [typedSettings, setTypedSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: stringData }, { data: typedData }] = await Promise.all([
        supabaseData.getSystemSettings(),
        supabaseData.getTypedSystemSettings()
      ]);
      
      setSettings(stringData || {});
      setTypedSettings(typedData || {});
    } catch (e) {
      console.error('Failed to load system settings:', e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Helper methods to get typed settings
  const getSetting = useCallback((key, defaultValue = null) => {
    return settings?.[key] ?? defaultValue;
  }, [settings]);

  const getNumberSetting = useCallback((key, defaultValue = 0) => {
    return typedSettings?.[key] ?? defaultValue;
  }, [typedSettings]);

  const getBooleanSetting = useCallback((key, defaultValue = false) => {
    return typedSettings?.[key] ?? defaultValue;
  }, [typedSettings]);

  const getStringSetting = useCallback((key, defaultValue = '') => {
    return settings?.[key] ?? defaultValue;
  }, [settings]);

  // Business logic helpers
  const getWithdrawalFee = useCallback(() => {
    return getNumberSetting('withdrawal_fee_percentage', 10) / 100;
  }, [getNumberSetting]);

  const getMinWithdrawalAmount = useCallback(() => {
    return getNumberSetting('min_withdrawal_amount', 500);
  }, [getNumberSetting]);

  const getMaxWithdrawalAmount = useCallback(() => {
    return getNumberSetting('max_withdrawal_amount', 50000);
  }, [getNumberSetting]);

  const getReferralBonusPercentage = useCallback((level = 1) => {
    return getNumberSetting(`referral_level${level}_percentage`, 4) / 100;
  }, [getNumberSetting]);

  const getTaskRewardMultiplier = useCallback(() => {
    return getNumberSetting('task_reward_multiplier', 1);
  }, [getNumberSetting]);

  const getSpinConfig = useCallback(() => ({
    maxDailySpins: getNumberSetting('spin_max_daily', 3),
    cost: getNumberSetting('spin_cost', 0),
    enabled: getBooleanSetting('spin_enabled', true)
  }), [getNumberSetting, getBooleanSetting]);

  return (
    <SettingsContext.Provider value={{
      settings,
      typedSettings,
      loading,
      error,
      refreshSettings: loadSettings,
      getSetting,
      getNumberSetting,
      getBooleanSetting,
      getStringSetting,
      getWithdrawalFee,
      getMinWithdrawalAmount,
      getMaxWithdrawalAmount,
      getReferralBonusPercentage,
      getTaskRewardMultiplier,
      getSpinConfig
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
