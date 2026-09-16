import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import { AuthProvider, useAuth } from './src/context/SupabaseAuthContext';
import { UserProvider } from './src/context/SupabaseUserContext';
import { AppProvider } from './src/context/AppContext';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { TasksProvider } from './src/context/TasksContext';
import { LevelsProvider } from './src/context/LevelsContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { PlatformAlertHost } from './src/utils/platformAlert';
import PwaInstallPrompt from './src/components/PwaInstallPrompt';
import PwaTracker from './src/components/PwaTracker';
import { SpinProvider } from './src/context/SpinContext';
import { CheckInProvider } from './src/context/CheckInContext';
import { BankProvider } from './src/context/BankContext';
import AppLoading from './src/components/AppLoading';
import NetworkStatusIndicator from './src/components/NetworkStatusIndicator';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { gradients, colors } from './src/constants/theme';

if (typeof window !== 'undefined') {
  window.onerror = function (msg, url, line, col, error) {
    console.log('🔥 GLOBAL ERROR:', msg, error);
  };
}

let GestureHandlerRootView = View;
if (Platform.OS !== 'web') {
  const gestureHandler = require('react-native-gesture-handler');
  GestureHandlerRootView = gestureHandler.GestureHandlerRootView;
}

console.log("🔥 App.js START");
console.log('📦 App.js module evaluated at', new Date().toISOString());
if (typeof window !== 'undefined') {
  window.__APP_MODULE_LOADED_AT__ = new Date().toISOString();
  window.__APP_LAST_RENDER_STATE__ = 'module loaded';
}

// Gates the install prompt on settings readiness so admin toggles apply.
const PwaGate = () => {
  const { settings, loading: settingsLoading } = useSettings();
  return <PwaInstallPrompt settings={settings || {}} settingsReady={!settingsLoading} />;
};

const RootNavigator = () => {
  console.log('🎯 RootNavigator render start');
  const { user, isLoading, isProfileReady, isConnecting } = useAuth();

  console.log('🎯 RootNavigator render:', {
    hasUser: !!user,
    isLoading,
    isProfileReady,
    isConnecting,
    userId: user?.id,
  });
  if (typeof window !== 'undefined') {
    window.__APP_LAST_RENDER_STATE__ = {
      stage: 'RootNavigator',
      hasUser: !!user,
      isLoading,
      isProfileReady,
      isConnecting,
      timestamp: new Date().toISOString(),
    };
  }

  // Add fallback to prevent blank screen
  if (isLoading && !user) {
    console.log('⏳ Still loading auth state, showing fallback');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#fff', marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }

  if (isLoading) {
    console.log('⏳ Still loading auth...');
    return <AppLoading message="Loading..." />;
  }

  if (user && (isConnecting || !isProfileReady)) {
    console.log('🔄 Loading your dashboard...');
    return <AppLoading message="Loading your dashboard..." />;
  }

  console.log('✅ Rendering navigator:', user ? 'MainNavigator' : 'AuthNavigator');
  return (
    <>
      <StatusBar style="light" />
      {user ? <MainNavigator /> : <AuthNavigator />}
    </>
  );
};

const App = () => {
  console.log('🔥 App component is mounting...');
  console.log('🧭 App component mounting');
  const [fontsLoaded, setFontsLoaded] = React.useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const navigationRef = useNavigationContainerRef();
  const RootContainer = Platform.OS === 'web' ? View : GestureHandlerRootView;

  React.useEffect(() => {
    console.log('🧭 useEffect[webStyles] triggered, Platform.OS =', Platform.OS);
    if (Platform.OS === 'web') {
      console.log('🎨 Applying web-specific body styles');
      const previousBackground = document.body.style.background;
      const previousColor = document.body.style.backgroundColor;
      const previousMargin = document.body.style.margin;
      const previousPadding = document.body.style.padding;
      const previousHeight = document.body.style.height;
      const previousMinHeight = document.body.style.minHeight;

      document.body.style.background = `linear-gradient(180deg, ${gradients.primary[0]} 0%, ${gradients.primary[1]} 50%, ${gradients.primary[2]} 100%)`;
      document.body.style.backgroundColor = gradients.primary[0];
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.height = '100vh';
      document.body.style.minHeight = '100vh';

      const html = document.documentElement;
      const previousHtmlHeight = html.style.height;
      const previousHtmlMargin = html.style.margin;
      const previousHtmlPadding = html.style.padding;

      html.style.height = '100%';
      html.style.margin = '0';
      html.style.padding = '0';

      return () => {
        console.log('🧽 Cleaning up web-specific body styles');
        document.body.style.background = previousBackground;
        document.body.style.backgroundColor = previousColor;
        document.body.style.margin = previousMargin;
        document.body.style.padding = previousPadding;
        document.body.style.height = previousHeight;
        document.body.style.minHeight = previousMinHeight;
        html.style.height = previousHtmlHeight;
        html.style.margin = previousHtmlMargin;
        html.style.padding = previousHtmlPadding;
      };
    }
    return undefined;
  }, []);

  React.useEffect(() => {
    console.log('🔍 useEffect[referral] triggered');
    if (Platform.OS === 'web') {
      console.log('🌐 Checking URL and storage for referral parameters');
      try {
        const params = new URLSearchParams(window.location.search);
        const urlRef = params.get('ref') || params.get('referral') || params.get('code');
        const storedRef = window.localStorage?.getItem('gigsmart_referral_code');
        const ref = urlRef || storedRef;
        const path = (window.location.pathname || '').replace(/^\//, '');

        if (urlRef && storedRef !== urlRef) {
          window.localStorage?.setItem('gigsmart_referral_code', urlRef);
        }

        if (ref && (path === '' || path === 'register' || path === 'signup')) {
          console.log('🔁 Navigating to Register with referral code', ref);
          setTimeout(() => {
            navigationRef.current?.navigate('Register', { referralCode: ref });
          }, 0);
        }
      } catch (error) {
        console.warn('Failed to parse referral params', error);
      }
    }
  }, [navigationRef]);

  React.useEffect(() => {
    console.log('🎚️ useEffect[fonts] triggered');
    let cancelled = false;
    
    // Force font loading to true immediately for web builds
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform detected, skipping font loading');
      setFontsLoaded(true);
      return;
    }
    
    const timeout = setTimeout(() => {
      if (!cancelled) {
        console.warn('Font loading timeout reached (30s), continuing without blocking.');
        setFontsLoaded(true);
      }
    }, 30000);

    const loadFonts = async () => {
      try {
        console.log('🔤 Loading Ionicons font');
        await Font.loadAsync(Ionicons.font);
        if (!cancelled) {
          console.log('✅ Fonts loaded successfully');
          setFontsLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load fonts', error);
        if (!cancelled) {
          console.log('⚠️ Proceeding despite font load failure');
          setFontsLoaded(true);
        }
      } finally {
        clearTimeout(timeout);
      }
    };

    loadFonts();

    return () => {
      console.log('🛑 Cleaning up font loader effect');
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  if (!fontsLoaded) {
    console.log('⏳ Fonts not yet loaded, showing AppLoading');
    console.log('📊 Current fontsLoaded state:', fontsLoaded);
  } else {
    console.log('🚀 Fonts loaded, rendering application tree');
  }

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform detected, checking fonts...');
      
      if (fontsLoaded) {
        console.log('✅ Fonts loaded, checking render...');
        
        // Add a small delay to ensure the DOM is ready
        const timer = setTimeout(() => {
          console.log('🚀 Attempting to mount React app...');
          
          // Force a re-render to ensure the app mounts
          setForceUpdate(prev => !prev);
          
          // Signal mount after a small delay
          window.__EXPO_APP_MOUNTED__ = true;
          window.dispatchEvent(new Event('expo-app-mounted'));
          console.log('📡 Mount event dispatched');
        }, 100);
        
        return () => clearTimeout(timer);
      }
    }
  }, [fontsLoaded]);

  console.log('🎬 App component about to render');
  
  // Emergency fallback to ensure something renders
  if (!fontsLoaded) {
    console.log('🚨 Emergency fallback: fonts not loaded, showing simple loading');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#fff', marginTop: 16, fontSize: 16 }}>Loading assets...</Text>
      </View>
    );
  }

  return (
    <RootContainer style={styles.root}>
      {/* <LinearGradient colors={gradients.primary} style={StyleSheet.absoluteFill} pointerEvents="none" /> */}
      <NetworkStatusIndicator />
      <PlatformAlertHost />
      <NavigationContainer ref={navigationRef}>
        <NotificationProvider>
          <AuthProvider>
            <UserProvider>
              <SettingsProvider>
                <TasksProvider>
                  <LevelsProvider>
                    <SpinProvider>
                      <CheckInProvider>
                        <BankProvider>
                          <AppProvider>
                            <PwaTracker />
                            <PwaGate />
                            <RootNavigator />
                          </AppProvider>
                        </BankProvider>
                      </CheckInProvider>
                    </SpinProvider>
                  </LevelsProvider>
                </TasksProvider>
              </SettingsProvider>
            </UserProvider>
          </AuthProvider>
        </NotificationProvider>
      </NavigationContainer>
    </RootContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.gradientBlue1,
  },
});

console.log("🔥 App.js END");

// Export RootNavigator globally for HTML template access
if (typeof window !== 'undefined') {
  window.RootNavigator = RootNavigator;
  window.App = App;
}

export default App;