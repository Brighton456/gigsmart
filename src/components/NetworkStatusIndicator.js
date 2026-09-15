/**
 * Network Status Indicator
 * Shows network connectivity status to users
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import SafeIonicons from './SafeIonicons';
import { getNetworkStatus, addNetworkListener } from '../utils/networkStatus';

const NetworkStatusIndicator = () => {
  const [networkStatus, setNetworkStatus] = useState(getNetworkStatus());
  const [isVisible, setIsVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const unsubscribe = addNetworkListener((status) => {
      const wasOffline = !networkStatus.isConnected;
      const isNowOffline = !status.isConnected;

      setNetworkStatus(status);

      // Show indicator when going offline or coming back online
      if (wasOffline !== isNowOffline) {
        setIsVisible(true);
        
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();

        // Hide after 3 seconds when coming back online
        if (!isNowOffline) {
          setTimeout(() => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => setIsVisible(false));
          }, 3000);
        }
      }
    });

    return unsubscribe;
  }, [networkStatus.isConnected, fadeAnim]);

  if (!isVisible) return null;

  const isOffline = !networkStatus.isConnected;
  const isPoorConnection = networkStatus.connectionType === 'slow-2g' || networkStatus.connectionType === '2g';

  return (
    <Animated.View style={[
      styles.container,
      {
        backgroundColor: isOffline ? '#ff4757' : isPoorConnection ? '#ffa502' : '#2ed573',
        opacity: fadeAnim,
      }
    ]}>
      <View style={styles.content}>
        <SafeIonicons 
          name={isOffline ? 'wifi-off' : isPoorConnection ? 'warning' : 'wifi'} 
          size={16} 
          color="white" 
        />
        <Text style={styles.text}>
          {isOffline 
            ? 'No Internet Connection' 
            : isPoorConnection 
            ? 'Slow Connection' 
            : 'Connection Restored'
          }
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 5,
    boxShadow: '0 2px 3.84px rgba(0, 0, 0, 0.25)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default NetworkStatusIndicator;
