import axios from 'axios';
import { Platform } from 'react-native';
import { APP_SHORT_NAME } from '../constants/branding';

// Base API configuration
export const api = axios.create({
  baseURL: 'https://server-5tnp.onrender.com',
  timeout: 20000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add CORS mode for web
if (Platform.OS === 'web') {
  api.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
}

// Payment API endpoint for STK push
export const initiateSTKPush = async (phoneNumber, amount, reference = APP_SHORT_NAME, userId = null) => {
  try {
    // Use CORS proxy for web to avoid browser restrictions
    const baseURL = Platform.OS === 'web' 
      ? 'https://corsproxy.io/https://server-5tnp.onrender.com'
      : 'https://server-5tnp.onrender.com';
    
    const payload = {
      phone: phoneNumber,
      amount,
      reference,
      user_id: userId
    };
    
    const response = await axios.post(`${baseURL}/api/pay`, payload);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('STK Push failed:', error);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

// Check payment status
export const checkPaymentStatus = async (externalRef) => {
  console.log('🔍 Starting payment status check for:', externalRef);
  
  try {
    // Try direct server first (no CORS proxy)
    const baseURL = 'https://server-5tnp.onrender.com';
    
    console.log('📡 Checking payment status at:', `${baseURL}/api/status/${externalRef}`);
    
    const response = await axios.get(`${baseURL}/api/status/${externalRef}`, {
      timeout: 15000, // 15 second timeout
    });
    
    console.log('✅ Payment status response:', response.data);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Payment status check failed:', error);
    console.error('❌ Error response:', error.response?.data);
    
    // If direct server fails, try CORS proxy for web
    if (Platform.OS === 'web') {
      try {
        console.log('🔄 Retrying with CORS proxy...');
        const proxyURL = 'https://corsproxy.io/https://server-5tnp.onrender.com';
        const response = await axios.get(`${proxyURL}/api/status/${externalRef}`, {
          timeout: 15000,
        });
        
        console.log('✅ CORS proxy response:', response.data);
        
        return {
          success: true,
          data: response.data
        };
      } catch (directError) {
        console.error('Direct server call also failed:', directError);
      }
    }
    
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};
