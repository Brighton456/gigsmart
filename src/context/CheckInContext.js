import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import supabaseData from '../services/supabaseData';

const CheckInContext = createContext(null);

export const CheckInProvider = ({ children }) => {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canCheckInToday, setCanCheckInToday] = useState(false);
  const [consecutiveDays, setConsecutiveDays] = useState(0);

  const loadUserCheckins = useCallback(async (userId) => {
    if (!userId) return;
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabaseData.getUserCheckins(userId);
      if (fetchError) throw fetchError;
      
      const userCheckins = data || [];
      setCheckins(userCheckins);
      
      // Check if can check in today
      const today = new Date().toISOString().slice(0, 10);
      const todayCheckin = userCheckins.find(c => c.checkin_date === today);
      setCanCheckInToday(!todayCheckin);
      
      // Calculate consecutive days
      if (userCheckins.length > 0) {
        const sortedDates = userCheckins
          .map(c => c.checkin_date)
          .sort((a, b) => new Date(b) - new Date(a));
        
        let consecutive = 0;
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < sortedDates.length; i++) {
          const checkinDate = new Date(sortedDates[i]);
          checkinDate.setHours(0, 0, 0, 0);
          
          const diffDays = Math.floor((currentDate - checkinDate) / (1000 * 60 * 60 * 24));
          
          if (diffDays === consecutive) {
            consecutive++;
          } else {
            break;
          }
        }
        
        setConsecutiveDays(consecutive);
      }
      
    } catch (e) {
      console.error('Failed to load user checkins:', e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const performDailyCheckin = useCallback(async (userId) => {
    if (!userId || !canCheckInToday) return { success: false, error: 'Cannot check in today' };
    
    try {
      const { data, error } = await supabaseData.performDailyCheckin(userId);
      if (error) throw error;
      
      // Reload checkins after successful check-in
      await loadUserCheckins(userId);
      
      return { success: true, data };
    } catch (e) {
      console.error('Failed to perform daily checkin:', e);
      return { success: false, error: e };
    }
  }, [canCheckInToday, loadUserCheckins]);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <CheckInContext.Provider value={{
      checkins,
      loading,
      error,
      canCheckInToday,
      consecutiveDays,
      loadUserCheckins,
      performDailyCheckin
    }}>
      {children}
    </CheckInContext.Provider>
  );
};

export const useCheckIn = () => {
  const context = useContext(CheckInContext);
  if (!context) {
    throw new Error('useCheckIn must be used within a CheckInProvider');
  }
  return context;
};
