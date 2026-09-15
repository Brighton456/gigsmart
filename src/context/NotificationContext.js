import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import supabaseData from '../services/supabaseData';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [targetedNotifications, setTargetedNotifications] = useState([]);
  const [ephemeralNotifications, setEphemeralNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNotifications = useCallback(async (pageName, userLevel, userId) => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabaseData.getTargetedNotifications(pageName, userLevel, userId);
      if (fetchError) throw fetchError;
      setTargetedNotifications(data || []);
    } catch (e) {
      console.error('Failed to load notifications:', e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const getNotificationsForPage = useCallback(async (pageName, userLevel, userId) => {
    return await loadNotifications(pageName, userLevel, userId);
  }, [loadNotifications]);

  const dismissNotification = useCallback((notificationId) => {
    setEphemeralNotifications(prev => prev.filter(n => n.id !== notificationId));
    setTargetedNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const showNotification = useCallback(({ type = 'info', title, message, duration = 5000, id, metadata = {} }) => {
    const notificationId = id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const createdAt = new Date().toISOString();
    const expiresAt = duration > 0 ? new Date(Date.now() + duration).toISOString() : null;
    const notification = {
      id: notificationId,
      type,
      title,
      message,
      status: 'active',
      created_at: createdAt,
      expires_at: expiresAt,
      metadata,
      source: 'local',
      isEphemeral: true,
    };

    setEphemeralNotifications(prev => [notification, ...prev.filter(item => item.id !== notificationId)]);

    if (duration > 0) {
      setTimeout(() => {
        dismissNotification(notificationId);
      }, duration);
    }

    return notificationId;
  }, [dismissNotification]);

  const combinedNotifications = useMemo(() => {
    const map = new Map();
    [...ephemeralNotifications, ...targetedNotifications].forEach(notification => {
      const key = notification.id || `${notification.source || 'notification'}-${notification.created_at}`;
      map.set(key, notification);
    });
    return Array.from(map.values());
  }, [ephemeralNotifications, targetedNotifications]);

  const getActiveNotifications = useCallback(() => {
    const now = new Date();
    return combinedNotifications.filter(notification => {
      if (notification.status && notification.status.toLowerCase() === 'inactive') {
        return false;
      }
      if (notification.expires_at && new Date(notification.expires_at) < now) {
        return false;
      }
      return true;
    });
  }, [combinedNotifications]);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications: combinedNotifications,
      targetedNotifications,
      ephemeralNotifications,
      loading,
      error,
      loadNotifications,
      getNotificationsForPage,
      dismissNotification,
      showNotification,
      getActiveNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const useNotification = () => {
  const context = useNotifications();
  return {
    showNotification: context.showNotification,
    dismissNotification: context.dismissNotification,
    loading: context.loading,
    error: context.error,
  };
};
