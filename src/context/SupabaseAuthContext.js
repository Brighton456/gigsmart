import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // Disabled for web compatibility

// Web-compatible storage helper
const storage = {
  getItem: async (key) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: async (key, value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  multiRemove: async (keys) => {
    if (typeof window !== 'undefined') {
      keys.forEach(key => localStorage.removeItem(key));
    }
  }
};
import supabaseAuth from '../services/supabaseAuth';
import { useNotifications } from './NotificationContext';
import { APP_NAME } from '../constants/branding';
import { normalizeProfile } from '../utils/profile';

const AuthContext = createContext({});
const PROFILE_CACHE_TTL_MS = 60 * 1000; // 1 minute cache window

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileReady, setIsProfileReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  // const { getNotificationsForPage } = useNotifications();
  const keepAliveIntervalRef = useRef(null);
  const lastProfileSyncRef = useRef(0);

  const restoreCachedProfile = useCallback(async () => {
    try {
      const cachedProfileString = await storage.getItem('@GigSmart:profile');
      if (!cachedProfileString) {
        return null;
      }

      const cachedProfile = normalizeProfile(JSON.parse(cachedProfileString));
      setProfile(cachedProfile);
      setIsProfileReady(true);
      lastProfileSyncRef.current = Date.now();
      console.log('🗃️ Restored profile from cache');
      return cachedProfile;
    } catch (cacheError) {
      console.warn('⚠️ Failed to restore cached profile:', cacheError);
      return null;
    }
  }, []);

  const startKeepAlive = useCallback(() => {
    if (keepAliveIntervalRef.current) {
      return;
    }

    const KEEP_ALIVE_MS = 3 * 60 * 1000; // 3 minutes
    console.log('🟢 Starting Supabase keep-alive interval');

    keepAliveIntervalRef.current = setInterval(async () => {
      try {
        const start = Date.now();
        const { error } = await supabaseAuth.ping();
        const duration = Date.now() - start;

        if (error) {
          console.warn('⚠️ Supabase keep-alive error:', error.message);
        } else {
          console.log(`💓 Supabase keep-alive ping successful (${duration}ms)`);
        }
      } catch (err) {
        console.warn('⚠️ Supabase keep-alive exception:', err);
      }
    }, KEEP_ALIVE_MS);
  }, []);

  const stopKeepAlive = useCallback(() => {
    if (keepAliveIntervalRef.current) {
      console.log('🔴 Stopping Supabase keep-alive interval');
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }
  }, []);

  const fetchUserProfile = async (supabaseUser) => {
    console.log('🔍 fetchUserProfile called with user:', supabaseUser?.id);

    if (!supabaseUser) {
      console.log('❌ No supabase user provided');
      setIsProfileReady(true);
      return null;
    }

    const now = Date.now();

    if (profile && now - lastProfileSyncRef.current < PROFILE_CACHE_TTL_MS) {
      console.log('⏭️ Using recently cached profile (within TTL)');
      setIsProfileReady(true);
      return profile;
    }

    if (!profile) {
      const cached = await restoreCachedProfile();
      if (cached) {
        console.log('📦 Using stored profile while awaiting fresh data');
      }
    }

    setIsProfileReady(false);
    setIsConnecting(true);

    try {
      console.log('📡 Fetching profile for user:', supabaseUser.id);
      let { data: userProfile, error } = await supabaseAuth.getProfile(supabaseUser.id);
      console.log('📥 getProfile response:', { hasProfile: !!userProfile, error: error?.message, errorCode: error?.code });

      if (error?.code === 'TIMEOUT') {
        console.warn('⏳ Profile fetch timed out, relying on cached data where available.');
        const cachedProfile = await restoreCachedProfile();
        setIsProfileReady(!!cachedProfile);
        setIsConnecting(false);
        // showNotification({
        //   type: 'warning',
        //   title: 'Slow Connection',
        //   message: 'Still syncing latest profile data in the background.',
        // });
        return cachedProfile;
      }

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('❌ Profile fetch error:', error);
          setIsProfileReady(true);
          return null;
        }
        console.log('⚠️ Profile not found (PGRST116), will create one');
        userProfile = null;
      }

      if (!userProfile) {
        console.log('🔧 Creating missing profile for user:', supabaseUser.id);
        const { data: ensuredProfile, error: ensureError } = await supabaseAuth.ensureUserProfile(supabaseUser);
        console.log('📥 ensureUserProfile response:', { hasProfile: !!ensuredProfile, error: ensureError?.message, errorCode: ensureError?.code });
        if (ensureError) {
          console.error('❌ Ensure profile error:', ensureError);
          setProfile(null);
          setIsProfileReady(true);
          return null;
        }
        userProfile = ensuredProfile;
        console.log('✅ Profile created successfully');
      }

      if (userProfile) {
        console.log('✅ Profile found/created, normalizing...');
        const normalizedProfile = normalizeProfile(userProfile);
        setProfile(normalizedProfile);
        setIsProfileReady(true);
        lastProfileSyncRef.current = Date.now();
        await storage.setItem('@GigSmart:profile', JSON.stringify(normalizedProfile));
        console.log('✅ Profile ready, isProfileReady set to true');
        return normalizedProfile;
      } else {
        console.log('❌ No profile after all attempts');
        setProfile(null);
        setIsProfileReady(true);
      }
      console.log('⚠️ Returning null profile after all attempts');
      return null;
    } catch (profileError) {
      console.error('❌ Profile fetch error:', profileError);
      const cached = await restoreCachedProfile();
      if (cached) {
        console.log('📦 Served cached profile after fetch error');
        return cached;
      }
      setIsProfileReady(true);
      return null;
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Check for existing session on app start
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🚀 Initializing auth...');
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('⏰ Auth initialization timeout (10s) - forcing completion');
        setIsLoading(false);
        setIsProfileReady(true);
        setIsConnecting(false);
      }, 10000);

      try {
        const { session } = await supabaseAuth.getSession();
        console.log('📱 Session found:', !!session?.user);

        if (session?.user) {
          setUser(session.user);
          startKeepAlive();
          const normalizedProfile = await fetchUserProfile(session.user);
          if (normalizedProfile) {
            await storage.setItem('@GigSmart:profile', JSON.stringify(normalizedProfile));
          }
        } else {
          console.log('❌ No session found');
          setUser(null);
          setProfile(null);
          setIsProfileReady(false);
          setIsConnecting(false);
          stopKeepAlive();
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        setIsConnecting(false);
        stopKeepAlive();
      } finally {
        clearTimeout(timeoutId);
        console.log('✅ Auth initialization complete, setting isLoading to false');
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabaseAuth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, !!session?.user);
      try {
        if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          console.log('🔄 Auth event does not require refetch, skipping');
          return;
        }
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          startKeepAlive();
          const normalizedProfile = await fetchUserProfile(session.user);
          if (normalizedProfile) {
            await storage.setItem('@GigSmart:profile', JSON.stringify(normalizedProfile));
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          setUser(null);
          setProfile(null);
          setIsProfileReady(false);
          setIsConnecting(false);
          stopKeepAlive();
          await storage.multiRemove(['@GigSmart:user', '@GigSmart:profile']);
        }
      } catch (error) {
        console.error('❌ Auth state change error:', error);
        setIsConnecting(false);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
      stopKeepAlive();
    };
  }, [startKeepAlive, stopKeepAlive]);

  const signIn = async ({ email, password }) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabaseAuth.signIn({ email, password });
      
      if (error) {
        throw new Error(error.message || 'Login failed');
      }

      if (data.user) {
        setUser(data.user);
        
        const normalizedProfile = await fetchUserProfile(data.user);
        if (normalizedProfile) {
          await storage.setItem('@GigSmart:profile', JSON.stringify(normalizedProfile));
        }

        await storage.setItem('@GigSmart:user', JSON.stringify(data.user));
        
        // showNotification({
        //   type: 'success',
        //   title: 'Welcome back!',
        //   message: `Successfully signed in to ${APP_NAME}`,
        // });
        
        return { success: true };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      
      // showNotification({
      //   type: 'error',
      //   title: 'Sign In Failed',
      //   message: error.message || 'Please check your credentials and try again',
      // });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabaseAuth.signUp(userData);
      
      if (error) {
        throw new Error(error.message || 'Registration failed');
      }

      if (data.user) {
        if (data.session?.user) {
          setUser(data.session.user);
          const normalizedProfile = await fetchUserProfile(data.session.user);
          if (normalizedProfile) {
            await storage.setItem('@GigSmart:profile', JSON.stringify(normalizedProfile));
          }
          // showNotification({
          //   type: 'success',
          //   title: 'Registration Successful!',
          //   message: `Welcome to ${APP_NAME}! Your account is ready to use.`,
          // });
        } else {
          setUser(null);
          setProfile(null);
          setIsProfileReady(false);
          // showNotification({
          //   type: 'success',
          //   title: 'Registration Submitted',
          //   message: 'Please check your email to verify your account before signing in.',
          // });
        }
        
        return { success: true, user: data.user, session: data.session };
      }
    } catch (error) {
      console.error('Sign up error:', error);
      
      // showNotification({
      //   type: 'error',
      //   title: 'Registration Failed',
      //   message: error.message || 'An error occurred during registration',
      // });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabaseAuth.signOut();
      
      if (error) {
        throw new Error(error.message);
      }

      setUser(null);
      setProfile(null);
      await storage.multiRemove(['@GigSmart:user', '@GigSmart:profile']);
      
      // showNotification({
      //   type: 'success',
      //   title: 'Signed Out',
      //   message: 'You have been successfully signed out',
      // });
      
    } catch (error) {
      console.error('Sign out error:', error);
      
      // showNotification({
      //   type: 'error',
      //   title: 'Sign Out Failed',
      //   message: error.message || 'An error occurred while signing out',
      // });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabaseAuth.resetPassword(email);
      
      if (error) {
        throw new Error(error.message);
      }

      // showNotification({
      //   type: 'success',
      //   title: 'Reset Email Sent',
      //   message: 'Please check your email for password reset instructions',
      // });
      
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      
      // showNotification({
      //   type: 'error',
      //   title: 'Reset Failed',
      //   message: error.message || 'Failed to send reset email',
      // });
      
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const { data, error } = await supabaseAuth.updateProfile(user.id, updates);
      
      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        setProfile(data);
        await storage.setItem('@GigSmart:profile', JSON.stringify(data));
        
        // showNotification({
        //   type: 'success',
        //   title: 'Profile Updated',
        //   message: 'Your profile has been successfully updated',
        // });
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Update profile error:', error);
      
      // showNotification({
      //   type: 'error',
      //   title: 'Update Failed',
      //   message: error.message || 'Failed to update profile',
      // });
      
      throw error;
    }
  };

  const value = {
    user,
    profile,
    isLoading,
    isProfileReady,
    isConnecting,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
