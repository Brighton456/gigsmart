import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import supabaseData from '../services/supabaseData';
import { levels as defaultLevels } from '../constants/levels';

const LevelsContext = createContext(null);

export const LevelsProvider = ({ children }) => {
  const [levels, setLevels] = useState(defaultLevels);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLevels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabaseData.getLevels();
      if (fetchError) throw fetchError;
      if (data && data.length > 0) {
        setLevels(data);
      }
    } catch (e) {
      console.error('Failed to load levels:', e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLevels();
  }, [loadLevels]);

  return (
    <LevelsContext.Provider value={{ levels, loading, error, refreshLevels: loadLevels }}>
      {children}
    </LevelsContext.Provider>
  );
};

export const useLevels = () => {
  const context = useContext(LevelsContext);
  if (!context) {
    throw new Error('useLevels must be used within a LevelsProvider');
  }
  return context;
};
