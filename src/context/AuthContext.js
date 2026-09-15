import React, { createContext, useState, useEffect, useContext } from 'react';

const storage = {
  getItem: async (key) => (typeof window !== 'undefined' ? localStorage.getItem(key) : null),
  setItem: async (key, value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: async (key) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};
import { api } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for stored authentication on app start
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedUser = await storage.getItem('@GigSmart:user');
        const storedToken = await storage.getItem('@GigSmart:token');
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          api.defaults.headers.Authorization = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error('Failed to load authentication from storage', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStoredAuth();
  }, []);

  const signIn = async ({ email, password }) => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an actual API call
      // const response = await api.post('/auth/login', { email, password });
      
      // Mock response for development
      const mockResponse = {
        data: {
          user: {
            id: '1',
            name: 'John Doe',
            email: email,
            phone: '0712345678',
            referralCode: 'JOHND123',
          },
          token: 'mock-jwt-token',
        },
      };
      
      const { user: userData, token } = mockResponse.data;
      
      await storage.setItem('@GigSmart:user', JSON.stringify(userData));
      await storage.setItem('@GigSmart:token', token);
      
      api.defaults.headers.Authorization = `Bearer ${token}`;
      
      setUser(userData);
    } catch (error) {
      console.error('Sign in failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData) => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an actual API call
      // const response = await api.post('/auth/register', userData);
      
      // Mock successful registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // After registration, sign in the user
      await signIn({ email: userData.email, password: userData.password });
    } catch (error) {
      console.error('Sign up failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await storage.removeItem('@GigSmart:user');
      await storage.removeItem('@GigSmart:token');
      setUser(null);
    } catch (error) {
      console.error('Sign out failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
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
