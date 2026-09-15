# Diagnostic Report

## package.json
```json
{
  "name": "gig-smart",
  "version": "2.0.0",
  "main": "App.js",
  "description": "Gig-Smart - Your Partner for Smarter Gig Earnings",
  "keywords": [
    "gig",
    "earnings",
    "tasks",
    "investment",
    "mobile"
  ],
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "web:metro": "set EXPO_USE_METRO_WEB=true&& expo start --web",
    "build:android": "expo build:android",
    "build:ios": "expo build:ios",
    "build:web": "expo export --platform web --output-dir web-build && node scripts/remove-unused-fonts.js",
    "build:web:optimized": "npm run build:web && npm run optimize:assets",
    "analyze": "source-map-explorer 'web-build/bundles/*.js'",
    "optimize:logo": "node scripts/optimize-favicon.js",
    "convert:webp": "node scripts/convert-to-webp.js",
    "optimize:assets": "npm run optimize:logo && npm run convert:webp",
    "prebuild": "npm run optimize:assets",
    "eject": "expo eject",
    "test": "jest",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx"
  },
  "dependencies": {
    "@babel/runtime": "^7.28.4",
    "@expo/vector-icons": "^13.0.0",
    "@expo/webpack-config": "^19.0.1",
    "@react-native-async-storage/async-storage": "1.18.2",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/native-stack": "^6.9.20",
    "@react-navigation/stack": "^6.3.20",
    "@supabase/functions-js": "https://registry.npmjs.org/@supabase/functions-js/-/functions-js-2.4.1.tgz",
    "@supabase/postgrest-js": "^1.21.4",
    "@supabase/realtime-js": "https://registry.npmjs.org/@supabase/realtime-js/-/realtime-js-2.10.0.tgz",
    "@supabase/supabase-js": "^2.39.3",
    "axios": "^1.6.2",
    "dotenv": "^17.2.3",
    "es-abstract": "^1.24.0",
    "expo": "^49.0.23",
    "expo-crypto": "~12.4.1",
    "expo-font": "~11.4.0",
    "expo-linear-gradient": "~12.3.0",
    "expo-splash-screen": "~0.20.5",
    "expo-status-bar": "~1.6.0",
    "graphql": "^15.8.0",
    "image-size": "^1.1.1",
    "json-schema-deref-sync": "^0.14.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-joyride": "^2.9.3",
    "react-native": "0.72.10",
    "react-native-gesture-handler": "~2.12.0",
    "react-native-reanimated": "~3.3.0",
    "react-native-safe-area-context": "4.6.3",
    "react-native-screens": "~3.22.0",
    "react-native-svg": "13.9.0",
    "react-native-url-polyfill": "^2.0.0",
    "react-native-web": "~0.19.13",
    "traverse": "^0.6.11",
    "typedarray.prototype.slice": "^1.0.5"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@babel/plugin-transform-runtime": "^7.28.5",
    "@types/react": "~18.2.14",
    "@types/react-native": "~0.72.2",
    "eslint": "^8.50.0",
    "eslint-config-expo": "^7.0.0",
    "jest": "^29.2.1",
    "pngjs": "^7.0.0",
    "sharp": "^0.32.6",
    "source-map-explorer": "^2.5.3",
    "typescript": "^5.1.3"
  },
  "jest": {
    "preset": "react-native"
  },
  "private": true,
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/gig-smart.git"
  },
  "author": "Gig-Smart Team",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/yourusername/gig-smart/issues"
  },
  "homepage": "https://gig-smart.com"
}
```

## metro.config.js
```javascript
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ensure Metro can locate packages when using pnpm's node_modules layout
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, 'node_modules/.pnpm')
];

if (config?.resolver?.sourceExts) {
  config.resolver.sourceExts = Array.from(
    new Set([...config.resolver.sourceExts, 'mjs', 'cjs'])
  );
}

if (config?.resolver?.assetExts) {
  config.resolver.assetExts = Array.from(
    new Set([...config.resolver.assetExts, 'bin', 'txt', 'md', 'csv', 'xml'])
  );
}

config.transformer.minifierConfig = {
  keep_fnames: false,
  mangle: {
    keep_fnames: false,
  },
  compress: {
    drop_console: false,
    drop_debugger: false,
    pure_funcs: [],
  },
  output: {
    comments: false,
  },
};

config.transformer.assetRegistryPath = require.resolve(
  'react-native/Libraries/Image/AssetRegistry'
);

module.exports = config;
```

## app.config.js
```javascript
module.exports = {
  expo: {
    name: "Gig-Smart",
    slug: "gig-smart",
    version: "2.0.0",
    orientation: "portrait",
    icon: "./assets/gigs-logo.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#2e40af"
    },
    assetBundlePatterns: [
      "**/*",
      "!node_modules/**/*",
      "!assets/node_modules/**/*"
    ],
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
      lazy: false,
      assetBundlePatterns: [
        "assets/**/*"
      ],
      build: {
        babel: {
          include: ["@babel/plugin-transform-runtime"]
        }
      }
    },
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.anonymous.gigsmart",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1e40af"
      },
      hermesEnabled: false
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
    },
    plugins: []
  }
};
```

## public/index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta httpEquiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gig-Smart</title>
  <script>
    // Force web platform
    window.EXPO_PLATFORM = 'web';
  </script>
</head>
<body>
  <div id="root"></div>
  <script src="/App.bundle?platform=web&dev=true&hot=false&lazy=false" defer></script>
</body>
</html>
```

## expo/build/launch/registerRootComponent.js
```javascript
import 'expo/build/Expo.fx';
import * as React from 'react';
import { AppRegistry, Platform } from 'react-native';
import { createRoot } from './createRoot';
export default function registerRootComponent(component) {
    let qualifiedComponent = component;
    if (process.env.NODE_ENV !== 'production') {
        const { withDevTools } = require('./withDevTools');
        qualifiedComponent = withDevTools(component);
    }
    if (Platform.OS !== 'web') {
        AppRegistry.registerComponent('main', () => qualifiedComponent);
    }
    else if (
    // Skip querying the DOM if we're in a Node.js environment.
    typeof document !== 'undefined') {
        let tag = document.getElementById('root');
        if (!tag) {
            tag = document.getElementById('main');
            if (process.env.NODE_ENV !== 'production') {
                // This block will be removed in production
                if (tag) {
                    console.warn('Mounting the root React component to an HTML element with id "main" is deprecated. Use id "root" instead.');
                }
            }
        }
        if (!tag) {
            throw new Error('Required HTML element with id "root" was not found in the document HTML. This is required for mounting the root React component.');
        }
        const rootTag = createRoot(tag);
        rootTag.render(React.createElement(qualifiedComponent));
    }
}
```

## App.js
```javascript
import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, View } from 'react-native';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import { AuthProvider, useAuth } from './src/context/SupabaseAuthContext';
import { UserProvider } from './src/context/SupabaseUserContext';
import { AppProvider } from './src/context/AppContext';
import { NotificationProvider } from './src/context/NotificationContext';
import AppLoading from './src/components/AppLoading';
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

const RootNavigator = () => {
  const { user, isLoading, isProfileReady, isConnecting } = useAuth();

  console.log('🎯 RootNavigator render:', {
    hasUser: !!user,
    isLoading,
    isProfileReady,
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
      console.log('🌐 Checking URL for referral parameters');
      try {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref') || params.get('referral') || params.get('code');
        const path = (window.location.pathname || '').replace(/^\//, '');
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
    const timeout = setTimeout(() => {
      if (!cancelled) {
        console.warn('Font loading timeout reached, continuing without blocking.');
        setFontsLoaded(true);
      }
    }, 4000);

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
  } else {
    console.log('🚀 Fonts loaded, rendering application tree');
  }

  return (
    <RootContainer style={styles.root}>
      {/* <LinearGradient colors={gradients.primary} style={StyleSheet.absoluteFill} pointerEvents="none" /> */}
      <NavigationContainer ref={navigationRef}>
        <NotificationProvider>
          <AuthProvider>
            <UserProvider>
              <AppProvider>
                {fontsLoaded ? <RootNavigator /> : <AppLoading message="Loading assets..." />}
              </AppProvider>
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

export default App;
```

## src/services/supabaseClient.js
```javascript
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
// import 'react-native-url-polyfill/auto'; // Disabled for web compatibility

// Try multiple ways to get environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://mbqoeqxxohjxlifsynuo.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icW9lcXh4b2hqeGxpZnN5bnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTYxNjAsImV4cCI6MjA3ODQzMjE2MH0.xR6LjAAJnrh9yksXua12ha6tsbfDRMGStTJt1wJwgOg';

console.log('Environment check:', {
  supabaseUrl: supabaseUrl ? 'present' : 'missing',
  supabaseKey: supabaseAnonKey ? 'present' : 'missing',
  source: Constants.expoConfig?.extra ? 'expo-constants' : 'process.env'
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key. Please check your environment variables.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'earnings-app-v1.0',
    },
  },
});

const testConnection = async () => {
  try {
    console.log('🔌 Testing Supabase connectivity...');
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    const endTime = Date.now();
    console.log(`✅ Supabase connection test: ${endTime - startTime}ms`, { 
      success: !error, 
      error: error?.message 
    });
  } catch (err) {
    console.error('❌ Supabase connection test failed:', err);
  }
};

setTimeout(testConnection, 1000);

export default supabase;

## Appendix

### src/navigation/MainNavigator.js
```javascript
import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

// Main screens for bottom tabs
import HomeScreen from '../screens/main/HomeScreen';
import TaskScreen from '../screens/main/TaskScreen';
import UpgradeScreen from '../screens/main/UpgradeScreen';
import TeamScreen from '../screens/main/TeamScreen';
import AccountScreen from '../screens/main/AccountScreen';

// Additional screens for each section
import WealthFundScreen from '../screens/main/WealthFundScreen';
import DepositScreen from '../screens/main/DepositScreen';
import WithdrawalScreen from '../screens/main/WithdrawalScreen';
import HistoryScreen from '../screens/main/HistoryScreen';
import SpinWheelScreen from '../screens/main/SpinWheelScreen';
import UpgradeDetailScreen from '../screens/main/UpgradeDetailScreen';
import ReferralScreen from '../screens/main/ReferralScreen';
import PersonalInfoScreen from '../screens/main/PersonalInfoScreen';
import TeamReportsScreen from '../screens/main/TeamReportsScreen';
import RedeemGiftsScreen from '../screens/main/RedeemGiftsScreen';
import HelpBookScreen from '../screens/main/HelpBookScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const sharedStackOptions = {
  headerShown: false,
  animation: Platform.OS === 'web' ? 'fade' : 'slide_from_right',
  contentStyle: { backgroundColor: 'transparent' },
};

const HomeStack = React.memo(() => (
  <Stack.Navigator screenOptions={sharedStackOptions}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="WealthFund" component={WealthFundScreen} />
    <Stack.Screen name="RedeemGifts" component={RedeemGiftsScreen} />
    <Stack.Screen name="HelpBook" component={HelpBookScreen} />
  </Stack.Navigator>
));

const TaskStack = React.memo(() => (
  <Stack.Navigator screenOptions={sharedStackOptions}>
    <Stack.Screen name="TaskMain" component={TaskScreen} />
  </Stack.Navigator>
));

const UpgradeStack = React.memo(() => (
  <Stack.Navigator screenOptions={sharedStackOptions}>
    <Stack.Screen name="UpgradeMain" component={UpgradeScreen} />
    <Stack.Screen name="UpgradeDetail" component={UpgradeDetailScreen} />
  </Stack.Navigator>
));

const TeamStack = React.memo(() => (
  <Stack.Navigator screenOptions={sharedStackOptions}>
    <Stack.Screen name="TeamMain" component={TeamScreen} />
    <Stack.Screen name="Referral" component={ReferralScreen} />
  </Stack.Navigator>
));

const AccountStack = React.memo(() => (
  <Stack.Navigator screenOptions={sharedStackOptions}>
    <Stack.Screen name="AccountMain" component={AccountScreen} />
    <Stack.Screen name="Recharge" component={DepositScreen} />
    <Stack.Screen name="Withdrawal" component={WithdrawalScreen} />
    <Stack.Screen name="History" component={HistoryScreen} />
    <Stack.Screen name="SpinWheel" component={SpinWheelScreen} />
    <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
    <Stack.Screen name="TeamReports" component={TeamReportsScreen} />
  </Stack.Navigator>
));

const MainNavigator = React.memo(() => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.gradientBlue1,
          borderTopColor: colors.gradientBlue1,
          paddingTop: 5,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Task') {
            iconName = focused ? 'checkbox' : 'checkbox-outline';
          } else if (route.name === 'Upgrade') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'Team') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        unmountOnBlur: false,
        lazy: false,
        animationEnabled: false,
        animationTypeForReplace: 'push',
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Task" component={TaskStack} />
      <Tab.Screen name="Upgrade" component={UpgradeStack} />
      <Tab.Screen name="Team" component={TeamStack} />
      <Tab.Screen name="Account" component={AccountStack} />
    </Tab.Navigator>
  );
});

export default MainNavigator;
```

### src/components/AppLoading.js
```javascript
import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, fontSizes, spacing, responsiveFontSizes, responsiveSpacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { useResponsive } from '../hooks/useResponsive';

const AppLoading = ({ message = 'Loading...' }) => {
  console.log(' AppLoading rendered with message:', message);
  const { settings } = useApp();
  const { breakpoint, isSmall, isMedium, isLarge } = useResponsive();
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, { toValue: 1, duration: 500, delay, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(dot, { toValue: 0, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
        ])
      ).start();
    };
    animateDot(dot1, 0);
    animateDot(dot2, 200);
    animateDot(dot3, 400);
  }, [dot1, dot2, dot3]);

  const title = settings?.welcome_title || 'Welcome to GigSmart';
  const subtitle = settings?.welcome_subtitle || 'Earnings made simple, engaging and fast';
  const promo = settings?.welcome_promo || 'Daily bonuses · Instant payouts · Secure wallets';

  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      {/* Decorative background circles */}
      <View style={[styles.circle, styles.circleA, isSmall && styles.circleASmall]} />
      <View style={[styles.circle, styles.circleB, isSmall && styles.circleBSmall]} />
      <View style={[styles.circle, styles.circleC, isSmall && styles.circleCSmall]} />

      <View style={styles.content}>
        <Text style={[styles.brand, { fontSize: responsiveFontSizes.heading1[breakpoint] }]}>{title}</Text>
        <Text style={[styles.subtitle, { fontSize: responsiveFontSizes.md[breakpoint] }]}>{subtitle}</Text>
        <View style={styles.promoPill}>
          <Text style={[styles.promoText, { fontSize: responsiveFontSizes.sm[breakpoint] }]}>{promo}</Text>
        </View>

        <View style={{ height: responsiveSpacing.lg[breakpoint] }} />

        <View style={styles.loaderRow}>
          <ActivityIndicator size="small" color={colors.white} />
          <Text style={styles.message}>{message}</Text>
          <View style={styles.dots}>
            <Animated.View style={[styles.dot, { opacity: dot1 }]} />
            <Animated.View style={[styles.dot, { opacity: dot2 }]} />
            <Animated.View style={[styles.dot, { opacity: dot3 }]} />
          </View>
        </View>

        <View style={[styles.tipsBox, isSmall && styles.tipsBoxSmall]}>
          <Text style={styles.tipTitle}>Tips</Text>
          <Text style={styles.tipText}>• Keep your income wallet funded to join spins and tasks faster.</Text>
          <Text style={styles.tipText}>• Complete daily tasks early to unlock bonus rewards.</Text>
          <Text style={styles.tipText}>• Verify withdrawal details once to speed up payouts.</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.15,
  },
  circleA: { width: 220, height: 220, top: 60, left: -40, backgroundColor: '#fff' },
  circleB: { width: 300, height: 300, bottom: -60, right: -60, backgroundColor: '#93C5FD' },
  circleC: { width: 160, height: 160, bottom: 120, left: 40, backgroundColor: '#BFDBFE' },
  circleASmall: { width: 140, height: 140, top: 40, left: -20 },
  circleBSmall: { width: 200, height: 200, bottom: -40, right: -40 },
  circleCSmall: { width: 120, height: 120, bottom: 80, left: 20 },
  content: {
    alignItems: 'center',
  },
  brand: {
    fontSize: 28,
    color: colors.white,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 6,
    fontSize: fontSizes.md,
    color: '#E0EAFF',
    fontWeight: '600',
  },
  promoPill: {
    marginTop: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  promoText: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  message: {
    marginLeft: spacing.sm,
    fontSize: fontSizes.md,
    color: colors.white,
    fontWeight: '600',
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    marginLeft: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
    marginHorizontal: 2,
  },
  tipsBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    width: 300,
  },
  tipsBoxSmall: {
    width: '90%',
    maxWidth: 280,
  },
  tipTitle: {
    color: colors.white,
    fontWeight: '700',
    marginBottom: 6,
  },
  tipText: {
    color: '#E0EAFF',
    fontSize: fontSizes.sm,
    marginBottom: 3,
  },
});

export default AppLoading;
