import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import supabaseData from '../services/supabaseData';

const BankContext = createContext(null);

export const BankProvider = ({ children }) => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBanks = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabaseData.getKenyanBanks();
      if (fetchError) throw fetchError;
      setBanks(data || []);
    } catch (e) {
      console.error('Failed to load banks:', e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const getBankByCode = useCallback((code) => {
    return banks.find(bank => bank.code === code);
  }, [banks]);

  const getBankByName = useCallback((name) => {
    return banks.find(bank => bank.name.toLowerCase().includes(name.toLowerCase()));
  }, [banks]);

  const getBankOptions = useCallback(() => {
    return banks.map(bank => ({
      label: bank.name,
      value: bank.code,
      paybillNumber: bank.paybill_number,
      ...bank
    }));
  }, [banks]);

  useEffect(() => {
    loadBanks();
  }, [loadBanks]);

  return (
    <BankContext.Provider value={{
      banks,
      loading,
      error,
      loadBanks,
      getBankByCode,
      getBankByName,
      getBankOptions
    }}>
      {children}
    </BankContext.Provider>
  );
};

export const useBank = () => {
  const context = useContext(BankContext);
  if (!context) {
    throw new Error('useBank must be used within a BankProvider');
  }
  return context;
};
