// GigSmart Frontend Combined Bundle
// Generated on 2025-12-23T18:10:28.5641666+03:00

// ====== Begin File: App.js ======

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

// ====== End File: App.js ======

// ====== Begin File: app.config.js ======

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


// ====== End File: app.config.js ======

// ====== Begin File: metro.config.js ======

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


// ====== End File: metro.config.js ======

// ====== Begin File: .env ======

EXPO_PUBLIC_SUPABASE_URL=https://mbqoeqxxohjxlifsynuo.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icW9lcXh4b2hqeGxpZnN5bnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTYxNjAsImV4cCI6MjA3ODQzMjE2MH0.xR6LjAAJnrh9yksXua12ha6tsbfDRMGStTJt1wJwgOg


// ====== End File: .env ======

// ====== Begin File: app.html ======

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gig-Smart</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>


// ====== End File: app.html ======

// ====== Begin File: custom-webpack.config.js ======

const { withUnimodules } = require('@expo/webpack-config/addons');

module.exports = ({ config, ...env }) => {
  // Rely on Expo's managed Webpack config and avoid custom runtime splitting
  return withUnimodules(config, { ...env, projectRoot: __dirname });
};


// ====== End File: custom-webpack.config.js ======

// ====== Begin File: babel.config.js ======

module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    // 'react-native-reanimated/plugin', // Temporarily disabled for web debugging
  ],
};


// ====== End File: babel.config.js ======

// ====== Begin File: package.json ======

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


// ====== End File: package.json ======

// ====== Begin File: src\components\AppLoading.js ======

import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, fontSizes, spacing, responsiveFontSizes, responsiveSpacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { useResponsive } from '../hooks/useResponsive';

const AppLoading = ({ message = 'Loading...' }) => {
  console.log('🌀 AppLoading rendered with message:', message);
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


// ====== End File: src\components\AppLoading.js ======

// ====== Begin File: src\components\AppStoreCard.js ======

import React, { useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, shadows } from '../constants/theme';

const AppStoreCard = memo(({ app, onInstall, isInstalling, installProgress, isDisabled, earnAmount = 0 }) => {
  // Generate realistic app features
  const features = [
    'In-App Purchases',
    'Offline Mode',
    'Cloud Sync',
    'Push Notifications',
    'Dark Mode',
    'Multi-language',
    'HD Graphics',
    'Social Features'
  ];
  
  const randomFeatures = features.sort(() => 0.5 - Math.random()).slice(0, 3);
  
  // Simple press handler without animation
  const handlePress = () => {
    if (isDisabled || isInstalling) return;
    onInstall(app);
  };
  
  // Generate app category badge color
  const getCategoryColor = (category) => {
    const categoryColors = {
      'Finance': colors.green,
      'Social': colors.blue600,
      'Gaming': colors.purple,
      'Education': colors.orange,
      'Health': colors.red,
      'Productivity': colors.teal,
      'Travel': colors.indigo,
      'Shopping': colors.pink,
      'Entertainment': colors.amber,
      'Food & Drink': colors.deepPurple,
    };
    return categoryColors[category] || colors.gray600;
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
        style={[styles.card, isDisabled && styles.disabledCard]}
      >
        {/* App Header */}
        <View style={styles.header}>
          <View style={[styles.appIcon, { backgroundColor: app.color }]}>
            <Text style={styles.appIconText}>{app.logo}</Text>
          </View>
          
          <View style={styles.appInfo}>
            <Text style={styles.appName} numberOfLines={1}>{app.name}</Text>
            <Text style={styles.appPublisher} numberOfLines={1}>{app.publisher}</Text>
            
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.floor(parseFloat(app.rating)) ? 'star' : 'star-outline'}
                  size={12}
                  color={colors.amber}
                />
              ))}
              <Text style={styles.ratingText}>{app.rating}</Text>
              <Text style={styles.downloadsText}>({app.downloads})</Text>
            </View>
          </View>
          
          <View style={styles.categoryBadge}>
            <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(app.category) }]} />
          </View>
        </View>
        
        
        {/* App Features */}
        <View style={styles.featuresContainer}>
          {randomFeatures.map((feature, index) => (
            <View key={index} style={styles.featureTag}>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
        
        {/* App Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="download-outline" size={14} color={colors.blue300} />
            <Text style={styles.detailText}>{app.size}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="shield-checkmark-outline" size={14} color={colors.green} />
            <Text style={styles.detailText}>Verified</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color={colors.blue300} />
            <Text style={styles.detailText}>Updated recently</Text>
          </View>
        </View>
        
        {/* Install Button */}
        <TouchableOpacity
          style={[
            styles.installButton,
            isInstalling && styles.installingButton,
            isDisabled && styles.disabledButton
          ]}
          onPress={handlePress}
          disabled={isDisabled || isInstalling}
        >
          {isInstalling ? (
            <LinearGradient
              colors={[colors.orange, colors.amber]}
              style={styles.installButtonGradient}
            >
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${installProgress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{Math.floor(installProgress)}%</Text>
              </View>
            </LinearGradient>
          ) : (
            <LinearGradient
              colors={[colors.blue600, colors.blue800]}
              style={styles.installButtonGradient}
            >
              <Ionicons name="download" size={16} color={colors.white} />
              <Text style={styles.installButtonText}>Install</Text>
              {earnAmount > 0 && (
                <View style={styles.earnBadge}>
                  <Text style={styles.earnText}>+KES {earnAmount}</Text>
                </View>
              )}
            </LinearGradient>
          )}
        </TouchableOpacity>
        
        {/* Premium Badge for some apps */}
        {Math.random() > 0.7 && (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={12} color={colors.amber} />
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: 16,
    padding: spacing.md,
    ...shadows.md,
  },
  disabledCard: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  appIcon: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    ...shadows.sm,
  },
  appIconText: {
    fontSize: 30,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 2,
  },
  appPublisher: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: fontSizes.xs,
    color: colors.white,
    marginLeft: 4,
  },
  downloadsText: {
    fontSize: fontSizes.xs,
    color: colors.blue300,
    marginLeft: 4,
  },
  categoryBadge: {
    marginLeft: spacing.sm,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  screenshotsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  screenshotWrapper: {
    width: 60,
    height: 80,
    borderRadius: 8,
    marginRight: spacing.sm,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  screenshot: {
    width: '100%',
    height: '100%',
  },
  screenshotPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  featureTag: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: spacing.xs,
    marginBottom: 4,
  },
  featureText: {
    fontSize: fontSizes.xs,
    color: colors.blue300,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: fontSizes.xs,
    color: colors.blue300,
    marginLeft: 4,
  },
  installButton: {
    borderRadius: 10,
    overflow: 'hidden',
    ...shadows.sm,
  },
  installingButton: {
    opacity: 0.8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  installButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    position: 'relative',
  },
  installButtonText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.xs,
  },
  earnBadge: {
    position: 'absolute',
    right: spacing.sm,
    backgroundColor: colors.green,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  earnText: {
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
    color: colors.white,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: 2,
  },
  progressText: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.white,
  },
  premiumBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,193,7,0.2)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.amber,
  },
  premiumText: {
    fontSize: fontSizes.xs,
    color: colors.amber,
    marginLeft: 2,
    fontWeight: 'bold',
  },
});

export default AppStoreCard;


// ====== End File: src\components\AppStoreCard.js ======

// ====== Begin File: src\components\BankCard.js ======

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, shadows } from '../constants/theme';

const BankCard = ({ bank, onSelect, isSelected }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onSelect(bank)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[
          isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)',
          isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'
        ]}
        style={[
          styles.innerContainer,
          isSelected && styles.selectedContainer
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: bank.color }]}>
          <Ionicons name="business-outline" size={24} color={colors.white} />
        </View>
        
        <Text style={styles.bankName}>{bank.name}</Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Daily Rate:</Text>
            <Text style={styles.detailValue}>{bank.rate}%</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Period:</Text>
            <Text style={styles.detailValue}>{bank.days} days</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Min. Investment:</Text>
            <Text style={styles.detailValue}>KES {bank.minAmount.toLocaleString()}</Text>
          </View>
        </View>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{bank.description}</Text>
        </View>
        
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  innerContainer: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  selectedContainer: {
    borderWidth: 2,
    borderColor: colors.success,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bankName: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  detailsContainer: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  detailLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  detailValue: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.white,
  },
  descriptionContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: spacing.sm,
    borderRadius: 8,
  },
  description: {
    fontSize: fontSizes.sm,
    fontStyle: 'italic',
    color: colors.blue300,
  },
  selectedIndicator: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
});

export default BankCard;


// ====== End File: src\components\BankCard.js ======

// ====== Begin File: src\components\InteractiveOnboardingTour.js ======

import React, { useMemo } from 'react';
// import Joyride, { STATUS } from 'react-joyride';

const InteractiveOnboardingTour = ({
  run = false,
  steps = [],
  continuous = true,
  showSkipButton = true,
  showProgress = true,
  locale,
  styles,
  onFinish,
  disableOverlayClose = true,
  scrollToFirstStep = true,
  stepIndex,
  callback,
  ...rest
}) => {
  // Temporarily disabled for web compatibility
  if (typeof window !== 'undefined') {
    return null;
  }
  
  const joyrideSteps = useMemo(() => steps.filter(Boolean), [steps]);

  const handleJoyrideCallback = (data) => {
    const { status, lifecycle } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      onFinish?.(status);
    }

    if (lifecycle === 'close') {
      onFinish?.(status || 'closed');
    }
  };

  if (!Array.isArray(joyrideSteps) || joyrideSteps.length === 0) {
    return null;
  }

  return (
    <Joyride
      run={run}
      steps={joyrideSteps}
      continuous={continuous}
      showSkipButton={showSkipButton}
      showProgress={showProgress}
      scrollToFirstStep={scrollToFirstStep}
      disableOverlayClose={disableOverlayClose}
      callback={callback || handleJoyrideCallback}
      locale={locale}
      styles={styles}
      stepIndex={typeof stepIndex === 'number' ? stepIndex : undefined}
      {...rest}
    />
  );
};

export default InteractiveOnboardingTour;


// ====== End File: src\components\InteractiveOnboardingTour.js ======

// ====== Begin File: src\components\InvestmentCard.js ======

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, shadows } from '../constants/theme';

const InvestmentCard = ({ investment, onWithdraw }) => {
  const status = String(investment?.status ?? 'ACTIVE').toUpperCase();
  const isCompleted = status === 'COMPLETED';

  const principal = Number(investment?.principal ?? investment?.amount ?? 0);
  const currentValue = Number(investment?.currentValue ?? investment?.current_value ?? principal);
  const rate = Number(investment?.rate ?? investment?.daily_rate ?? 0);
  const totalDays = Number(investment?.days ?? investment?.duration_days ?? 0) || 0;

  const profit = currentValue - principal;
  const profitPercentage = principal > 0 ? ((profit / principal) * 100).toFixed(2) : '0.00';
  
  // Calculate remaining days
  const startDateRaw = investment?.start_date ?? investment?.created_at ?? null;
  const endDateRaw = investment?.endDate ?? investment?.end_date ?? investment?.maturity_date ?? null;
  const endDateCalc = endDateRaw
    ? new Date(endDateRaw).getTime()
    : startDateRaw && totalDays > 0
      ? new Date(new Date(startDateRaw).getTime() + totalDays * 24 * 60 * 60 * 1000).getTime()
      : new Date().getTime();
  const currentDate = new Date().getTime();
  const remainingMilliseconds = Math.max(0, endDateCalc - currentDate);
  const remainingDays = Math.ceil(remainingMilliseconds / (1000 * 60 * 60 * 24));
  
  // Calculate progress percentage
  const elapsedDays = Math.max(0, totalDays - remainingDays);
  const progressPercentage = totalDays > 0 ? Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100)) : 0;
  
  return (
    <LinearGradient
      colors={[
        isCompleted ? 'rgba(40,167,69,0.2)' : 'rgba(255,255,255,0.15)',
        isCompleted ? 'rgba(40,167,69,0.1)' : 'rgba(255,255,255,0.05)'
      ]}
      style={[
        styles.container,
        isCompleted && styles.completedContainer
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.bankName}>{investment.bankName}</Text>
        <View style={[
          styles.statusBadge,
          isCompleted ? styles.completedBadge : styles.activeBadge
        ]}>
          <Text style={[
            styles.statusText,
            isCompleted ? styles.completedText : styles.activeText
          ]}>
            {isCompleted ? 'COMPLETED' : 'ACTIVE'}
          </Text>
        </View>
      </View>
      
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Principal</Text>
          <Text style={styles.detailValue}>
            KES {principal.toLocaleString()}
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Current Value</Text>
          <Text style={styles.detailValue}>
            KES {currentValue.toLocaleString()}
          </Text>
        </View>
      </View>
      
      <View style={styles.profitContainer}>
        <Text style={styles.profitLabel}>Profit:</Text>
        <Text style={styles.profitValue}>
          KES {Number(profit).toLocaleString()} ({profitPercentage}%)
        </Text>
      </View>
      
      {!isCompleted ? (
        <View style={styles.progressContainer}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>
              {remainingDays} day{remainingDays !== 1 ? 's' : ''} remaining
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.floor(progressPercentage)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.withdrawButton}
          onPress={() => onWithdraw(investment.id)}
        >
          <LinearGradient
            colors={[colors.success, colors.teal]}
            style={styles.withdrawButtonGradient}
          >
            <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
            <Ionicons name="cash-outline" size={18} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      )}
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isCompleted ? (
            'Investment matured and ready for withdrawal'
          ) : (
            `Daily Interest: ${rate}% | Term: ${totalDays} days`
          )}
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  completedContainer: {
    borderColor: colors.success,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bankName: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 4,
  },
  activeBadge: {
    backgroundColor: 'rgba(25, 118, 210, 0.3)',
  },
  completedBadge: {
    backgroundColor: 'rgba(40, 167, 69, 0.3)',
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
  },
  activeText: {
    color: colors.blue300,
  },
  completedText: {
    color: colors.success,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: fontSizes.xs,
    color: colors.blue200,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  profitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  profitLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  profitValue: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.green,
  },
  progressContainer: {
    marginBottom: spacing.sm,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: fontSizes.xs,
    color: colors.blue200,
  },
  progressPercentage: {
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
    color: colors.white,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.blue500,
    borderRadius: 3,
  },
  withdrawButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  withdrawButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  withdrawButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.white,
    marginRight: spacing.xs,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: spacing.sm,
  },
  footerText: {
    fontSize: fontSizes.xs,
    color: colors.blue300,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default InvestmentCard;


// ====== End File: src\components\InvestmentCard.js ======

// ====== Begin File: src\components\LazyAsset.js ======

import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

const LazyAsset = ({ assetSource, style, children, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Simulate lazy loading - in production, this would be actual lazy loading
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!loaded) {
    return (
      <View style={[style, { justifyContent: 'center', alignItems: 'center' }]} {...props}>
        <ActivityIndicator size="small" color="#1e40af" />
      </View>
    );
  }

  return children;
};

export default LazyAsset;


// ====== End File: src\components\LazyAsset.js ======

// ====== Begin File: src\components\NotificationBanner.js ======

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, shadows } from '../constants/theme';

const ICONS = {
  success: 'checkmark-circle',
  error: 'close-circle',
  warning: 'warning',
  info: 'information-circle'
};

const COLORS = {
  success: colors.success,
  error: colors.error,
  warning: colors.warning,
  info: colors.blue500
};

const NotificationBanner = ({ notification, onHide }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (notification) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 200,
          useNativeDriver: false
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false
        })
      ]).start();
    }
  }, [notification, opacity, translateY]);

  if (!notification) {
    return null;
  }

  const icon = ICONS[notification.type] || ICONS.info;
  const accentColor = COLORS[notification.type] || COLORS.info;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity
        }
      ]}
    >
      <View style={[styles.banner, { borderLeftColor: accentColor }]}> 
        <Ionicons name={icon} size={22} color={accentColor} style={styles.icon} />
        <View style={styles.content}>
          {notification.title ? (
            <Text style={styles.title}>{notification.title}</Text>
          ) : null}
          {notification.message ? (
            <Text style={styles.message}>{notification.message}</Text>
          ) : null}
        </View>
        <TouchableOpacity onPress={onHide} style={styles.closeButton}>
          <Ionicons name="close" size={18} color={colors.white} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    backgroundColor: 'rgba(0,0,0,0.85)',
    ...shadows.md
  },
  icon: {
    marginRight: spacing.sm
  },
  content: {
    flex: 1
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white
  },
  message: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    marginTop: 2
  },
  closeButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs
  }
});

export default NotificationBanner;


// ====== End File: src\components\NotificationBanner.js ======

// ====== Begin File: src\components\OnboardingTour.js ======

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const OnboardingTour = ({ visible, onComplete, steps }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onComplete();
      setCurrentStep(0);
    });
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!visible || !steps.length) return null;

  const currentStepData = steps[currentStep];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleComplete}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.8)" barStyle="light-content" />
      
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View style={styles.spotlight} />
        
        <View style={styles.contentContainer}>
          <LinearGradient
            colors={['rgba(30,30,30,0.95)', 'rgba(20,20,20,0.98)']}
            style={styles.contentCard}
          >
            <View style={styles.header}>
              <View style={styles.stepIndicator}>
                <Text style={styles.stepText}>
                  {currentStep + 1} of {steps.length}
                </Text>
              </View>
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.iconCircle}
              >
                <Ionicons 
                  name={currentStepData.icon} 
                  size={40} 
                  color={colors.white} 
                />
              </LinearGradient>
            </View>

            <Text style={styles.title}>{currentStepData.title}</Text>
            <Text style={styles.description}>{currentStepData.description}</Text>

            {currentStepData.targetPosition && (
              <View style={styles.targetIndicator}>
                <Ionicons name="arrow-up" size={20} color={colors.primary} />
                <Text style={styles.targetText}>Look at the highlighted area</Text>
              </View>
            )}

            <View style={styles.actions}>
              {currentStep > 0 && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.previousButton]}
                  onPress={handlePrevious}
                >
                  <Ionicons name="chevron-back" size={20} color={colors.white} />
                  <Text style={styles.actionButtonText}>Previous</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionButton, styles.nextButton]}
                onPress={handleNext}
              >
                <Text style={styles.actionButtonText}>
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                </Text>
                <Ionicons 
                  name={currentStep === steps.length - 1 ? 'checkmark' : 'chevron-forward'} 
                  size={20} 
                  color={colors.white} 
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotlight: {
    position: 'absolute',
    width: width * 0.8,
    height: height * 0.3,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'rgba(30,136,229,0.1)',
  },
  contentContainer: {
    width: width * 0.9,
    maxWidth: 400,
  },
  contentCard: {
    borderRadius: 20,
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  stepIndicator: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  stepText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    fontWeight: 'bold',
  },
  skipButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  skipText: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
    fontWeight: 'bold',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: fontSizes.md,
    color: colors.gray300,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  targetIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30,136,229,0.1)',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  targetText: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
    marginLeft: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    gap: spacing.xs,
  },
  previousButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  nextButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.white,
  },
});

export default OnboardingTour;


// ====== End File: src\components\OnboardingTour.js ======

// ====== Begin File: src\components\ReferralTable.js ======

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, shadows } from '../constants/theme';
import { levels } from '../constants/levels';
import { useUser } from '../context/SupabaseUserContext';
import { APP_NAME } from '../constants/branding';

const referralEarningsData = [
  { jobLevel: 'Recruit', level1: 10, level2: 0, level3: 0 },
  { jobLevel: 'Intern', level1: 32, level2: 16, level3: 2 },
  { jobLevel: 'Job 1', level1: 80, level2: 40, level3: 5 },
  { jobLevel: 'Job 2', level1: 240, level2: 120, level3: 15 },
  { jobLevel: 'Job 3', level1: 1000, level2: 500, level3: 62.5 },
  { jobLevel: 'Job 4', level1: 2560, level2: 1280, level3: 160 },
  { jobLevel: 'Job 5', level1: 5120, level2: 2560, level3: 320 },
  { jobLevel: 'Job 6', level1: 20480, level2: 10240, level3: 1280 },
];

const ReferralTable = () => {
  const { profile, referrals, loadUserData } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const calculatePotentialEarnings = (referralCount) => {
    // Estimate potential earnings from referrals
    const avgInvestment = 5000; // Average investment per referral
    const avgUpgrade = 1000; // Average upgrade cost
    const investmentBonus = avgInvestment * 0.006; // 0.6%
    const upgradeBonus = avgUpgrade * 0.006; // 0.6%
    const signupBonus = 10;
    
    return (signupBonus + investmentBonus + upgradeBonus) * referralCount;
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Referral Stats Cards */}
      <View style={styles.statsGrid}>
        <LinearGradient
          colors={[colors.success, colors.green]}
          style={styles.statCard}
        >
          <Ionicons name="people" size={24} color={colors.white} />
          <Text style={styles.statNumber}>{referrals?.length || 0}</Text>
          <Text style={styles.statLabel}>Total Referrals</Text>
        </LinearGradient>

        <LinearGradient
          colors={[colors.warning, colors.orange]}
          style={styles.statCard}
        >
          <Ionicons name="cash" size={24} color={colors.white} />
          <Text style={styles.statNumber}>
            KES {calculatePotentialEarnings(referrals?.length || 0).toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Potential Earnings</Text>
        </LinearGradient>
      </View>

      {/* Referral Earnings Description */}
      <View style={styles.bonusStructure}>
        <Text style={styles.sectionTitle}>💰 Referral Earnings</Text>
        <Text style={styles.referralDescription}>
          Earn additional income by inviting others to join GIGS. Referral earnings are calculated as 4% (Level 1), 2% (Level 2), and 0.25% (Level 3) of your invitees' deposits.
        </Text>
        
        <View style={styles.bonusCard}>
          <LinearGradient
            colors={['rgba(16,185,129,0.1)', 'rgba(16,185,129,0.05)']}
            style={styles.bonusItem}
          >
            <View style={styles.bonusIcon}>
              <Ionicons name="person-add" size={20} color={colors.success} />
            </View>
            <View style={styles.bonusDetails}>
              <Text style={styles.bonusTitle}>Signup Bonus</Text>
              <Text style={styles.bonusDescription}>
                Earn KES 10 when someone joins with your link
              </Text>
            </View>
            <Text style={styles.bonusAmount}>KES 10</Text>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(59,130,246,0.1)', 'rgba(59,130,246,0.05)']}
            style={styles.bonusItem}
          >
            <View style={styles.bonusIcon}>
              <Ionicons name="trending-up" size={20} color={colors.blue500} />
            </View>
            <View style={styles.bonusDetails}>
              <Text style={styles.bonusTitle}>Investment Bonus</Text>
              <Text style={styles.bonusDescription}>
                Earn 0.6% of every investment your referrals make
              </Text>
            </View>
            <Text style={styles.bonusAmount}>0.6%</Text>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(139,92,246,0.1)', 'rgba(139,92,246,0.05)']}
            style={styles.bonusItem}
          >
            <View style={styles.bonusIcon}>
              <Ionicons name="arrow-up-circle" size={20} color={colors.purple500} />
            </View>
            <View style={styles.bonusDetails}>
              <Text style={styles.bonusTitle}>Upgrade Bonus</Text>
              <Text style={styles.bonusDescription}>
                Earn 0.6% when your referrals upgrade their level
              </Text>
            </View>
            <Text style={styles.bonusAmount}>0.6%</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Example Earnings */}
      <View style={styles.exampleEarnings}>
        <Text style={styles.sectionTitle}>📊 Example Earnings</Text>
        <View style={styles.exampleCard}>
          <Text style={styles.exampleTitle}>If your referral:</Text>
          
          <View style={styles.exampleItem}>
            <Text style={styles.exampleAction}>• Invests KES 10,000</Text>
            <Text style={styles.exampleEarning}>You earn: KES 60</Text>
          </View>
          
          <View style={styles.exampleItem}>
            <Text style={styles.exampleAction}>• Upgrades to J3 (KES 1,500)</Text>
            <Text style={styles.exampleEarning}>You earn: KES 9</Text>
          </View>
          
          <View style={styles.exampleItem}>
            <Text style={styles.exampleAction}>• Invests KES 50,000</Text>
            <Text style={styles.exampleEarning}>You earn: KES 300</Text>
          </View>
          
          <View style={styles.totalExample}>
            <Text style={styles.totalText}>Total from one active referral: KES 379+</Text>
          </View>
        </View>
      </View>

      <View style={styles.comparisonSection}>
        <Text style={styles.sectionTitle}>📊 Referral Earnings Table</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <Text style={[styles.tableCell, styles.headerCell, styles.levelColumn]}>Job Level</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Level 1 Earnings (4%)</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Level 2 Earnings (2%)</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Level 3 Earnings (0.25%)</Text>
          </View>

          {referralEarningsData.map((data, index) => (
            <View
              key={data.jobLevel}
              style={[
                styles.tableRow,
                index % 2 === 1 && styles.tableRowAlt,
              ]}
            >
              <View style={[styles.tableCell, styles.levelColumn]}>
                <Text style={styles.levelTitle}>{data.jobLevel}</Text>
              </View>
              <Text style={styles.tableCell}>{data.level1} KSh</Text>
              <Text style={styles.tableCell}>{data.level2} KSh</Text>
              <Text style={styles.tableCell}>{data.level3} KSh</Text>
            </View>
          ))}
        </View>

        <Text style={styles.tableNote}>This table displays earnings from referring new users to the GIGs platform, calculated as a percentage of their deposits across three referral levels.</Text>
      </View>
    </View>
  );

  const renderReferralsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>👥 Your Referrals</Text>
      
      {referrals && referrals.length > 0 ? (
        <ScrollView style={styles.referralsList}>
          {referrals.map((referral, index) => (
            <View key={referral.id} style={styles.referralItem}>
              <View style={styles.referralInfo}>
                <View style={styles.referralAvatar}>
                  <Text style={styles.referralInitial}>
                    {referral.referred_user?.name?.charAt(0) || 'U'}
                  </Text>
                </View>
                <View style={styles.referralDetails}>
                  <Text style={styles.referralName}>
                    {referral.referred_user?.name || 'User'}
                  </Text>
                  <Text style={styles.referralDate}>
                    Joined {new Date(referral.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.referralEarnings}>
                <Text style={styles.earningsAmount}>
                  KES {referral.lifetime_earnings?.toLocaleString() || '0'}
                </Text>
                <Text style={styles.earningsLabel}>Total Earned</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color={colors.blue300} />
          <Text style={styles.emptyTitle}>No Referrals Yet</Text>
          <Text style={styles.emptyDescription}>
            Share your referral link to start earning bonuses from your network
          </Text>
        </View>
      )}
    </View>
  );

  const renderLevelsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>🎯 Level Benefits</Text>
      <Text style={styles.levelDescription}>
        Higher levels unlock better earning opportunities for your referrals
      </Text>
      
      <ScrollView style={styles.levelsList}>
        {levels.map((level) => (
          <View key={level.id} style={styles.levelItem}>
            <LinearGradient
              colors={[level.color + '20', level.color + '10']}
              style={styles.levelCard}
            >
              <View style={styles.levelHeader}>
                <View style={[styles.levelIcon, { backgroundColor: level.color }]}>
                  <Ionicons name={level.icon} size={20} color={colors.white} />
                </View>
                <View style={styles.levelInfo}>
                  <Text style={styles.levelName}>{level.name}</Text>
                  <Text style={styles.levelCost}>
                    {level.cost === 0 ? 'Free' : `KES ${level.cost.toLocaleString()}`}
                  </Text>
                </View>
                {profile?.level_id === level.id && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentText}>Current</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.levelBenefits}>
                <Text style={styles.benefitItem}>
                  • {level.tasks} tasks required
                </Text>
                <Text style={styles.benefitItem}>
                  • {level.daily_rate}% daily rate
                </Text>
                <Text style={styles.benefitItem}>
                  • Enhanced referral opportunities
                </Text>
              </View>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'referrals' && styles.activeTab]}
          onPress={() => setActiveTab('referrals')}
        >
          <Text style={[styles.tabText, activeTab === 'referrals' && styles.activeTabText]}>
            Referrals
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'levels' && styles.activeTab]}
          onPress={() => setActiveTab('levels')}
        >
          <Text style={[styles.tabText, activeTab === 'levels' && styles.activeTabText]}>
            Levels
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'referrals' && renderReferralsTab()}
        {activeTab === 'levels' && renderLevelsTab()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F1FF',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: spacing.md,
    ...shadows.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.blue600,
  },
  tabText: {
    fontSize: fontSizes.md,
    color: colors.blue700,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.blue700,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.blue900,
    marginBottom: spacing.md,
  },
  referralDescription: {
    fontSize: fontSizes.md,
    color: colors.blue700,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    ...shadows.sm,
  },
  statNumber: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: spacing.xs,
  },
  bonusStructure: {
    marginBottom: spacing.lg,
  },
  bonusCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.12)',
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.sm,
  },
  bonusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  bonusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blue500,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  bonusDetails: {
    flex: 1,
  },
  bonusTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.blue900,
  },
  bonusDescription: {
    fontSize: fontSizes.sm,
    color: colors.blue600,
    marginTop: spacing.xs,
  },
  bonusAmount: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.success,
  },
  exampleEarnings: {
    marginBottom: spacing.lg,
  },
  exampleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.sm,
  },
  comparisonSection: {
    marginBottom: spacing.lg,
  },
  tableWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  table: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.12)',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: 'rgba(59,130,246,0.08)',
  },
  tableHeaderRow: {
    backgroundColor: 'rgba(59,130,246,0.18)',
  },
  tableRowAlt: {
    backgroundColor: 'rgba(59,130,246,0.08)',
  },
  tableCell: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.sm,
    color: colors.blue900,
  },
  levelColumn: {
    flex: 1.2,
    fontWeight: 'bold',
  },
  headerCell: {
    fontWeight: 'bold',
    color: colors.blue700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableCellLast: {
    borderRightWidth: 0,
  },
  levelTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.blue900,
    marginBottom: spacing.xs / 2,
  },
  cellSubtext: {
    fontSize: fontSizes.xs,
    color: colors.blue600,
  },
  tableNote: {
    marginTop: spacing.sm,
    fontSize: fontSizes.sm,
    color: colors.blue700,
  },
  exampleTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  exampleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.blue50,
  },
  exampleAction: {
    fontSize: fontSizes.sm,
    color: colors.blue900,
  },
  exampleEarning: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.success,
  },
  totalExample: {
    backgroundColor: colors.success + '20',
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  totalText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.success,
    textAlign: 'center',
  },
  referralsList: {
    maxHeight: 400,
  },
  referralItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.12)',
    ...shadows.sm,
  },
  referralInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  referralAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blue500,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  referralInitial: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  referralDetails: {
    flex: 1,
  },
  referralName: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.blue900,
  },
  referralDate: {
    fontSize: fontSizes.sm,
    color: colors.blue600,
  },
  referralEarnings: {
    alignItems: 'flex-end',
  },
  earningsAmount: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.success,
  },
  earningsLabel: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.blue900,
    marginTop: spacing.md,
  },
  emptyDescription: {
    fontSize: fontSizes.md,
    color: colors.blue600,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  levelDescription: {
    fontSize: fontSizes.md,
    color: colors.blue600,
    marginBottom: spacing.lg,
  },
  levelsList: {
    maxHeight: 400,
  },
  levelItem: {
    marginBottom: spacing.md,
  },
  levelCard: {
    borderRadius: 12,
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.12)',
    ...shadows.sm,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  levelIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  levelInfo: {
    flex: 1,
  },
  levelName: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.blue900,
  },
  levelCost: {
    fontSize: fontSizes.sm,
    color: colors.blue600,
  },
  currentBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  currentText: {
    fontSize: fontSizes.xs,
    color: colors.white,
    fontWeight: 'bold',
  },
  levelBenefits: {
    paddingLeft: spacing.lg,
  },
  benefitItem: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});

export default ReferralTable;


// ====== End File: src\components\ReferralTable.js ======

// ====== Begin File: src\components\SpinWheel.js ======

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, G, Circle, Text as SvgText, TSpan, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { colors, spacing, fontSizes, shadows } from '../constants/theme';
import supabaseData from '../services/supabaseData';
import { useUser } from '../context/SupabaseUserContext';
import { useNotification } from '../context/NotificationContext';

const { width, height } = Dimensions.get('window');
// Clamp wheel size by width and height so it fits smaller screens without cropping
const WHEEL_SIZE = Math.min(width * 0.6, height * 0.35, 240);
const CENTER_SIZE = 60;

const lightenColor = (hex, intensity = 0.25) => {
  if (typeof hex !== 'string') return '#ffffff';
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return hex;
  const num = parseInt(normalized, 16);
  const clamp = (value) => Math.min(255, Math.max(0, value));
  const r = num >> 16;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const adjust = (channel) => clamp(Math.round(channel + (255 - channel) * intensity));
  const nextR = adjust(r);
  const nextG = adjust(g);
  const nextB = adjust(b);
  return `#${((1 << 24) + (nextR << 16) + (nextG << 8) + nextB).toString(16).slice(1)}`;
};

const SpinWheel = ({ visible, onClose }) => {
  const { profile, addToIncomeWallet, loadUserData } = useUser();
  const { showNotification } = useNotification();
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(20);
  const [freeSpins, setFreeSpins] = useState(0);
  const [totalSpins, setTotalSpins] = useState(0);
  const [mockWinnings, setMockWinnings] = useState([]);

  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotationRef = useRef(0);

  const banners = useMemo(() => ([
    { id: 'promo1', title: 'Win up to KES 1,000,000', text: 'Bigger multipliers are live today!' },
    { id: 'promo2', title: 'Mega Friday', text: 'x20 jackpot chances increased by 15%.' },
    { id: 'promo3', title: 'Refer & Spin', text: 'Invite friends and earn free spins.' },
  ]), []);
  const quotes = useMemo(() => ([
    'Luck is what happens when preparation meets opportunity.',
    'Every spin is a new chance. Play smart.',
    'Set a budget. Enjoy the thrill. Celebrate the wins.',
  ]), []);

  // Spin amounts available (expanded)
  const spinAmounts = [20, 50, 100, 200, 500, 1000, 2000, 5000];

  // Wheel segments with multipliers (dynamic rewards based on selectedAmount)
  const wheelSegments = useMemo(() => ([
    { multiplier: 0,   color: '#EF4444', label: 'Try Again' },
    { multiplier: 0.5, color: '#F59E0B', label: 'x0.5' },
    { multiplier: 1,   color: '#10B981', label: 'x1' },
    { multiplier: 0,   color: '#3B82F6', label: 'Next Time' },
    { multiplier: 2,   color: '#8B5CF6', label: 'x2' },
    { multiplier: 0,   color: '#F97316', label: 'Almost' },
    { multiplier: 5,   color: '#06B6D4', label: 'x5' },
    { multiplier: 0,   color: '#EC4899', label: 'Keep Trying' },
    { multiplier: 10,  color: '#22C55E', label: 'x10' },
    { multiplier: 0,   color: '#6366F1', label: 'Miss' },
    { multiplier: 0,   color: '#F43F5E', label: 'Almost' },
    { multiplier: 20,  color: '#EAB308', label: 'x20' },
  ]), [selectedAmount]);

  useEffect(() => {
    if (visible) {
      // Start glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();

      // Generate mock recent winnings
      generateMockWinnings();
    }
  }, [visible]);

  const generateMockWinnings = () => {
    const mockNames = ['John D.', 'Mary K.', 'Peter M.', 'Sarah L.', 'David W.', 'Grace N.'];
    const mockAmounts = [20, 50, 100, 200];
    
    const winnings = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      name: mockNames[Math.floor(Math.random() * mockNames.length)],
      amount: mockAmounts[Math.floor(Math.random() * mockAmounts.length)],
      time: `${Math.floor(Math.random() * 60)} min ago`,
    }));
    
    setMockWinnings(winnings);
  };

  const canSpin = () => {
    if (freeSpins > 0) return true;
    return (profile?.income_wallet ?? 0) >= selectedAmount;
  };

  const handleSpin = async () => {
    if (!canSpin()) {
      showNotification({
        type: 'error',
        title: 'Insufficient Balance',
        message: 'You need more funds in your income wallet to spin',
      });
      return;
    }

    setIsSpinning(true);

    // Deduct spin cost (unless free spin)
    if (freeSpins === 0) {
      await addToIncomeWallet(
        -selectedAmount,
        `Spin wheel bet: KES ${selectedAmount}`,
        'SPIN_BET'
      );
    } else {
      setFreeSpins(prev => prev - 1);
    }

    // Animate wheel spin
    const baseSpin = 1440; // 4 full rotations
    const extraSpin = Math.random() * 720; // Up to 2 additional rotations
    const targetRotation = rotationRef.current + baseSpin + extraSpin;

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(spinValue, {
        toValue: targetRotation,
        duration: 3500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      rotationRef.current = ((targetRotation % 360) + 360) % 360;
      spinValue.setValue(rotationRef.current);
      const normalizedRotation = rotationRef.current;
      const numSegments = wheelSegments.length;
      const segmentIndex = Math.floor((normalizedRotation / 360) * numSegments) % numSegments;
      const resultSegment = wheelSegments[segmentIndex];

      const resolveSpin = async () => {
        const nextTotal = totalSpins + 1;
        setTotalSpins(nextTotal);

        const earnedFreeSpin = nextTotal % 2 === 0;
        if (earnedFreeSpin) {
          setFreeSpins(prev => prev + 1);
          showNotification({
            type: 'success',
            title: 'Free Spin Earned!',
            message: 'Complete two spins to unlock a free round. Enjoy your bonus spin!',
          });
        }

        const resultPrize = Math.round(selectedAmount * Math.max(resultSegment.multiplier || 0, 0));
        if (resultPrize > 0) {
          const success = await addToIncomeWallet(
            resultPrize,
            `Spin wheel reward: KES ${resultPrize}`,
            'SPIN_WIN'
          );

          if (success) {
            showNotification({
              type: 'success',
              title: 'Congratulations!',
              message: `You won KES ${resultPrize.toLocaleString()}!`,
            });
          }
        } else if (!earnedFreeSpin) {
          showNotification({
            type: 'info',
            title: 'Better Luck Next Time!',
            message: 'No winnings this time. Try again for a chance to earn cash rewards.',
          });
        }

        // Record the spin attempt in Supabase
        try {
          await supabaseData.recordSpinAttempt(
            profile?.id,
            selectedAmount,
            resultPrize,
            resultPrize > 0
          );
        } catch (e) {
          // Non-blocking
          console.log('Failed to record spin attempt', e);
        }

        // Refresh user data to update balances and history
        await loadUserData();

        setIsSpinning(false);
        spinValue.setValue(0);
      };

      resolveSpin();
    });
  };

  // SVG-based circular wheel segment rendering
  const renderWheelSVG = () => {
    const R = WHEEL_SIZE / 2;
    const center = R;
    const numSegments = wheelSegments.length;
    const anglePer = (2 * Math.PI) / numSegments;
    const defs = [];
    const segments = [];
    for (let i = 0; i < numSegments; ++i) {
      const startAngle = i * anglePer - Math.PI / 2;
      const endAngle = (i + 1) * anglePer - Math.PI / 2;
      const x1 = center + R * Math.cos(startAngle);
      const y1 = center + R * Math.sin(startAngle);
      const x2 = center + R * Math.cos(endAngle);
      const y2 = center + R * Math.sin(endAngle);
      const largeArc = anglePer > Math.PI ? 1 : 0;
      const d = `M${center},${center} L${x1},${y1} A${R},${R} 0 ${largeArc} 1 ${x2},${y2} Z`;
      const textAngle = startAngle + anglePer / 2;
      const tx = center + (R * 0.52) * Math.cos(textAngle);
      const ty = center + (R * 0.52) * Math.sin(textAngle);
      const gradientId = `wheel-segment-gradient-${i}`;
      const highlightColor = lightenColor(wheelSegments[i].color, 0.35);

      defs.push(
        <SvgGradient key={gradientId} id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={highlightColor} stopOpacity="1" />
          <Stop offset="100%" stopColor={wheelSegments[i].color} stopOpacity="1" />
        </SvgGradient>
      );

      const prizeVal = Math.round(selectedAmount * Math.max((wheelSegments[i].multiplier || 0), 0));
      const secondaryText = prizeVal > 0 ? `KES ${prizeVal.toLocaleString()}` : 'Better Luck';

      segments.push(
        <G key={`seg-${i}`}>
          <Path d={d} fill={`url(#${gradientId})`} stroke="#fff" strokeWidth={2} />
          <SvgText
            x={tx}
            y={ty}
            fill="#fff"
            fontSize={11}
            textAnchor="middle"
            fontWeight="bold"
            opacity={0.95}
          >
            <TSpan x={tx} dy={0}>{wheelSegments[i].label}</TSpan>
            <TSpan x={tx} dy={14} fontSize={9} fontWeight="600" opacity={0.9}>
              {secondaryText}
            </TSpan>
          </SvgText>
        </G>
      );
    }
    return (
      <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Defs>{defs}</Defs>
        <Circle cx={center} cy={center} r={center} fill={colors.blue900} stroke="rgba(255,255,255,0.35)" strokeWidth={4} />
        {segments}
        <Circle cx={center} cy={center} r={R * 0.18} fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" strokeWidth={2} />
      </Svg>
    );
  };

  const renderMockWinnings = () => (
    <View style={styles.recentWinnings}>
      <Text style={styles.recentWinningsTitle}>🎉 Recent Winners</Text>
      {mockWinnings.map((winner) => (
        <View key={winner.id} style={styles.winnerItem}>
          <Text style={styles.winnerName}>{winner.name}</Text>
          <Text style={styles.winnerAmount}>KES {winner.amount.toLocaleString()}</Text>
          <Text style={styles.winnerTime}>{winner.time}</Text>
        </View>
      ))}
    </View>
  );

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#1E40AF', '#3B82F6', '#60A5FA']}
          style={styles.header}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.white} />
          </TouchableOpacity>
          
          <Text style={styles.title}>🎰 Lucky Spin Wheel</Text>
          <Text style={styles.subtitle}>Spin to win up to KES 300,000!</Text>
          
          {freeSpins > 0 && (
            <View style={styles.freeSpinBadge}>
              <Text style={styles.freeSpinText}>🎁 {freeSpins} Free Spins!</Text>
            </View>
          )}
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banners */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bannersContainer}>
          {banners.map(b => (
            <LinearGradient key={b.id} colors={['#0F172A', '#1E293B']} style={styles.bannerCard}>
              <Text style={styles.bannerTitle}>{b.title}</Text>
              <Text style={styles.bannerText}>{b.text}</Text>
            </LinearGradient>
          ))}
        </ScrollView>

        {/* Recent Winners high up */}
        {renderMockWinnings()}

        {/* Spin Amount Selection */}
        <View style={styles.amountSelection}>
          <Text style={styles.sectionTitle}>Select Spin Amount:</Text>
          <View style={styles.amountGrid}>
            {spinAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.amountButton,
                  selectedAmount === amount && styles.selectedAmount,
                ]}
                onPress={() => setSelectedAmount(amount)}
                disabled={freeSpins > 0}
              >
                <Text style={[
                  styles.amountText,
                  selectedAmount === amount && styles.selectedAmountText,
                ]}>
                  KES {amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Spin Wheel */}
        <View style={styles.wheelContainer}>
          <Animated.View
            style={[
              styles.wheel,
              {
                transform: [
                  { rotate: spinValue.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  })},
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            {renderWheelSVG()}
            
            {/* Center circle */}
            <View style={styles.centerCircle}>
              <Ionicons name="star" size={24} color={colors.warning} />
            </View>
          </Animated.View>
          
          {/* Pointer */}
          <View style={styles.pointer}>
            <Ionicons name="caret-down" size={30} color={colors.error} />
          </View>
          
          {/* Glow effect */}
          <Animated.View
            style={[
              styles.glowRing,
              {
                opacity: glowAnim,
                transform: [{ scale: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1],
                })}],
              },
            ]}
          />
        </View>

        {/* Spin Button */}
        <TouchableOpacity
          style={[styles.spinButton, !canSpin() && styles.disabledButton]}
          onPress={handleSpin}
          disabled={isSpinning || !canSpin()}
        >
          <LinearGradient
            colors={canSpin() ? [colors.success, colors.green] : [colors.gray400, colors.gray500]}
            style={styles.spinButtonInner}
          >
            {isSpinning ? (
              <Text style={styles.spinButtonText}>Spinning...</Text>
            ) : freeSpins > 0 ? (
              <Text style={styles.spinButtonText}>🎁 FREE SPIN!</Text>
            ) : (
              <Text style={styles.spinButtonText}>
                SPIN - KES {selectedAmount}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Balance Display */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceText}>
            Income Balance: KES {(profile?.income_wallet ?? 0).toLocaleString()}
          </Text>
        </View>

        {/* Terms & conditions */}
        <View style={styles.termsContainer}>
          {quotes.slice(0, 1).map((q, idx) => (
            <Text key={`q-${idx}`} style={styles.quoteText}>“{q}”</Text>
          ))}
          <Text style={styles.termsText}>Play responsibly. Odds vary per segment. Free spins unlock after milestones. Winnings are credited instantly to your income wallet.</Text>
        </View>

        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    width: width * 0.95,
    maxHeight: '90%',
    backgroundColor: '#EBF2FF',
    borderRadius: 20,
    overflow: 'visible',
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.blue100,
    marginTop: spacing.xs,
  },
  freeSpinBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginTop: spacing.sm,
  },
  freeSpinText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: fontSizes.sm,
  },
  amountSelection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amountButton: {
    width: '30%',
    paddingVertical: spacing.sm,
    backgroundColor: '#DCEAFE',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAmount: {
    backgroundColor: colors.blue500,
    borderColor: colors.blue600,
  },
  amountText: {
    fontSize: fontSizes.sm,
    color: colors.blue600,
    fontWeight: '600',
  },
  selectedAmountText: {
    color: colors.white,
  },
  wheelContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
    position: 'relative',
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    position: 'relative',
    ...shadows.lg,
  },
  wheelSegment: {
    position: 'absolute',
    width: WHEEL_SIZE / 2,
    height: WHEEL_SIZE / 2,
    top: WHEEL_SIZE / 4,
    left: WHEEL_SIZE / 4,
    transformOrigin: `${WHEEL_SIZE / 4}px ${WHEEL_SIZE / 4}px`,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingBottom: spacing.lg,
  },
  segmentText: {
    color: colors.white,
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  centerCircle: {
    position: 'absolute',
    top: (WHEEL_SIZE - CENTER_SIZE) / 2,
    left: (WHEEL_SIZE - CENTER_SIZE) / 2,
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  pointer: {
    position: 'absolute',
    top: -15,
    zIndex: 10,
  },
  glowRing: {
    position: 'absolute',
    width: WHEEL_SIZE + 20,
    height: WHEEL_SIZE + 20,
    borderRadius: (WHEEL_SIZE + 20) / 2,
    borderWidth: 3,
    borderColor: colors.warning,
    top: -10,
    left: -10,
  },
  spinButton: {
    marginHorizontal: spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.md,
  },
  disabledButton: {
    opacity: 0.6,
  },
  spinButtonInner: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  spinButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
  },
  balanceContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  balanceText: {
    fontSize: fontSizes.md,
    color: colors.blue700,
  },
  recentWinnings: {
    backgroundColor: 'rgba(59,130,246,0.16)',
    padding: spacing.lg,
    borderRadius: 16,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  bannersContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  bannerCard: {
    width: 220,
    marginRight: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
  },
  bannerTitle: {
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerText: {
    color: '#E2E8F0',
    fontSize: fontSizes.sm,
  },
  termsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  quoteText: {
    color: colors.textPrimary,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  termsText: {
    color: colors.textSecondary,
    fontSize: fontSizes.xs,
  },
  recentWinningsTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  winnerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.blue100,
  },
  winnerName: {
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  winnerAmount: {
    fontSize: fontSizes.sm,
    color: colors.success,
    fontWeight: 'bold',
  },
  winnerTime: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
});

export default SpinWheel;


// ====== End File: src\components\SpinWheel.js ======

// ====== Begin File: src\components\SupabaseTest.js ======

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import supabase from '../services/supabaseClient';

const SupabaseTest = () => {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    setTestResult('Testing...');
    
    try {
      console.log('🧪 Starting Supabase test...');
      const startTime = Date.now();
      
      // Test 1: Simple count query
      console.log('📊 Test 1: Count query');
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        throw new Error(`Count query failed: ${countError.message}`);
      }
      
      console.log('✅ Count query success:', count);
      
      // Test 2: Select specific user
      console.log('📊 Test 2: Select specific user');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', 'adcb679c-130d-4604-8c84-484b8a93ff6e')
        .maybeSingle();
      
      if (userError) {
        throw new Error(`User query failed: ${userError.message}`);
      }
      
      console.log('✅ User query success:', userData);
      
      // Test 3: Check auth status
      console.log('📊 Test 3: Auth status');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw new Error(`Auth check failed: ${authError.message}`);
      }
      
      console.log('✅ Auth check success:', user?.id);
      
      const endTime = Date.now();
      const result = `✅ All tests passed in ${endTime - startTime}ms
      
Count: ${count} users
User found: ${userData ? 'Yes' : 'No'}
Auth user: ${user?.id || 'None'}`;
      
      setTestResult(result);
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      setTestResult(`❌ Test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase Connection Test</Text>
      
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={runTest}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Run Test'}
        </Text>
      </TouchableOpacity>
      
      {testResult ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{testResult}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    maxHeight: 300,
  },
  resultText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
});

export default SupabaseTest;


// ====== End File: src\components\SupabaseTest.js ======

// ====== Begin File: src\components\UpgradePrompt.js ======

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontSizes, shadows } from '../constants/theme';
import { APP_NAME } from '../constants/branding';

const { width } = Dimensions.get('window');

const UpgradePrompt = ({ visible, onUpgrade, onDismiss, nextLevel }) => {
  const slideAnim = useRef(new Animated.Value(width)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Slide in from right
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();

      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      // Slide out to right
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
  }, [visible, slideAnim, pulseAnim]);

  if (!visible || !nextLevel) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(255,193,7,0.95)', 'rgba(255,152,0,0.95)']}
        style={styles.promptCard}
      >
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Ionicons name="close" size={18} color={colors.white} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Ionicons name="trending-up" size={28} color={colors.white} />
          </Animated.View>

          <Text style={styles.title}>Ready to Upgrade?</Text>
          <Text style={styles.subtitle}>
            Unlock {nextLevel.name} level perks and earn more with {APP_NAME}!
          </Text>

          <View style={styles.benefits}>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.white} />
              <Text style={styles.benefitText}>Higher daily earnings</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.white} />
              <Text style={styles.benefitText}>Exclusive investment options</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.white} />
              <Text style={styles.benefitText}>Priority support access</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <LinearGradient
              colors={[colors.white, 'rgba(255,255,255,0.9)']}
              style={styles.upgradeButtonInner}
            >
              <Text style={styles.upgradeButtonText}>Upgrade to {nextLevel.name}</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.warning} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing.xl * 2,
    right: spacing.lg,
    left: spacing.lg,
    zIndex: 1000,
  },
  promptCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.lg,
  },
  dismissButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.sm,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
    opacity: 0.9,
  },
  benefits: {
    alignSelf: 'stretch',
    marginBottom: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  benefitText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    marginLeft: spacing.xs,
    flex: 1,
  },
  upgradeButton: {
    alignSelf: 'stretch',
  },
  upgradeButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
  },
  upgradeButtonText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.warning,
    marginRight: spacing.xs,
  },
});

export default UpgradePrompt;


// ====== End File: src\components\UpgradePrompt.js ======

// ====== Begin File: src\constants\branding.js ======

export const APP_NAME = 'GigSmart';
export const APP_SHORT_NAME = 'GIGS COMPANY';
export const APP_URL = 'https://gig-smart.netlify.app';
export const TAGLINE = 'Your Partner for Smarter Gig Earnings';


// ====== End File: src\constants\branding.js ======

// ====== Begin File: src\constants\levels.js ======

// Level definitions based on the requirements
export const levels = [
  {
    id: 0,
    name: 'Recruit',
    cost: 0,
    tasks: 0,
    earningsPerTask: 0,
    dailyEarnings: 0,
    annualEarnings: 0,
    color: '#6c757d', // Gray
    multiplier: 1.0,
    description: 'Starting level for all new users. No task earnings.',
    icon: 'person-outline',
    nextLevelId: 1
  },
  {
    id: 1,
    name: 'Intern',
    cost: 800,
    tasks: 5,
    earningsPerTask: 10,
    dailyEarnings: 50, // 5 tasks x 10 KES
    annualEarnings: 18250, // 50 x 365
    color: '#28a745', // Green
    multiplier: 1.2,
    description: 'Begin your journey with 5 daily tasks.',
    icon: 'briefcase-outline',
    nextLevelId: 2
  },
  {
    id: 2,
    name: 'J1',
    cost: 2000,
    tasks: 10,
    earningsPerTask: 10,
    dailyEarnings: 100, // 10 tasks x 10 KES
    annualEarnings: 36500, // 100 x 365
    color: '#007bff', // Blue
    multiplier: 1.5,
    description: 'Doubled tasks for higher daily earnings.',
    icon: 'trending-up-outline',
    nextLevelId: 3
  },
  {
    id: 3,
    name: 'J2',
    cost: 6000,
    tasks: 25,
    earningsPerTask: 10,
    dailyEarnings: 250, // 25 tasks x 10 KES
    annualEarnings: 91250, // 250 x 365
    color: '#6f42c1', // Purple
    multiplier: 2.0,
    description: 'Significant increase in daily task limit.',
    icon: 'star-outline',
    nextLevelId: 4
  },
  {
    id: 4,
    name: 'J3',
    cost: 25000,
    tasks: 89,
    earningsPerTask: 10,
    dailyEarnings: 890, // 89 tasks x 10 KES
    annualEarnings: 324850, // 890 x 365
    color: '#fd7e14', // Orange
    multiplier: 2.5,
    description: 'Professional level with high daily earnings.',
    icon: 'star-outline',
    nextLevelId: 5
  },
  {
    id: 5,
    name: 'J4',
    cost: 64000,
    tasks: 200,
    earningsPerTask: 10,
    dailyEarnings: 2000, // 200 tasks x 10 KES
    annualEarnings: 730000, // 2000 x 365
    color: '#dc3545', // Red
    multiplier: 3.0,
    description: 'Expert level with massive task capacity.',
    icon: 'flame-outline',
    nextLevelId: 6
  },
  {
    id: 6,
    name: 'J5',
    cost: 128000,
    tasks: 640,
    earningsPerTask: 10,
    dailyEarnings: 6400, // 640 tasks x 10 KES
    annualEarnings: 2336000, // 6400 x 365
    color: '#e83e8c', // Pink
    multiplier: 4.0,
    description: 'Master level with extraordinary earning potential.',
    icon: 'trophy-outline',
    nextLevelId: 7
  },
  {
    id: 7,
    name: 'J6',
    cost: 512000,
    tasks: 2500,
    earningsPerTask: 10,
    dailyEarnings: 25000, // 2500 tasks x 10 KES
    annualEarnings: 9125000, // 25000 x 365
    color: '#ffc107', // Gold
    multiplier: 5.0,
    description: 'Ultimate level with maximum earning capacity.',
    icon: 'trophy-outline',
    nextLevelId: null
  },
];

// Withdrawal amounts as specified in requirements
export const withdrawalAmounts = [70, 470, 1750, 3970, 49970];

// Withdrawal fee percentage
export const withdrawalFeePercentage = 0.1; // 10%

// Withdrawal time window
export const withdrawalTimeWindow = {
  startHour: 9, // 9 AM
  endHour: 22, // 10 PM
  validDays: [1, 2, 3, 4, 5], // Monday to Friday (0 = Sunday, 6 = Saturday)
};

// Task time window (any time Monday to Friday)
export const taskTimeWindow = {
  validDays: [1, 2, 3, 4, 5], // Monday to Friday
};


// ====== End File: src\constants\levels.js ======

// ====== Begin File: src\constants\theme.js ======

import { Platform } from 'react-native';

// Theme file with a variety of colors for the app
// This implements the requirement for "blue, white theme + other blended multiple colors, over 50 colors used"

// Primary color palette
export const colors = {
  // Primary brand colors
  primary: '#0055cc',
  primaryLight: '#2376e6',
  primaryDark: '#003a8c',
  
  // Secondary brand colors
  secondary: '#5e35b1',
  secondaryLight: '#7c4dff',
  secondaryDark: '#4527a0',
  
  // Essential UI colors
  white: '#ffffff',
  black: '#000000',
  
  // Background gradient colors
  gradientBlue1: '#001f3f',
  gradientBlue2: '#0a57cf',
  gradientBlue3: '#1e90ff',
  gradientPurple1: '#4a148c',
  gradientPurple2: '#7b1fa2',
  gradientPurple3: '#9c27b0',
  
  // Text colors
  textPrimary: '#ffffff',
  textSecondary: '#e1f5fe',
  textMuted: '#90caf9',
  textDark: '#212121',
  
  // Status colors
  success: '#00c853',
  warning: '#ffd600',
  error: '#d50000',
  info: '#00b0ff',
  
  // Accent colors
  accent1: '#ff6d00',
  accent2: '#00bfa5',
  accent3: '#d500f9',
  accent4: '#ffab00',
  accent5: '#ff5252',
  
  // Gray scale
  gray100: '#f5f5f5',
  gray200: '#eeeeee',
  gray300: '#e0e0e0',
  gray400: '#bdbdbd',
  gray500: '#9e9e9e',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // Blue scale
  blue100: '#e3f2fd',
  blue200: '#bbdefb',
  blue300: '#90caf9',
  blue400: '#64b5f6',
  blue500: '#42a5f5',
  blue600: '#2196f3',
  blue700: '#1976d2',
  blue800: '#1565c0',
  blue900: '#0d47a1',
  
  // Additional color variations to meet the "over 50 colors" requirement
  indigo: '#3f51b5',
  purple: '#9c27b0',
  deepPurple: '#673ab7',
  pink: '#e91e63',
  red: '#f44336',
  orange: '#ff9800',
  deepOrange: '#ff5722',
  amber: '#ffc107',
  yellow: '#ffeb3b',
  lime: '#cddc39',
  green: '#4caf50',
  lightGreen: '#8bc34a',
  teal: '#009688',
  cyan: '#00bcd4',
  lightBlue: '#03a9f4',
  brown: '#795548',
  blueGray: '#607d8b',
};

// Opacity variations for even more color combinations
export const opacity = {
  5: 0.05,
  10: 0.1,
  20: 0.2,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  80: 0.8,
  90: 0.9,
  95: 0.95,
};

// Font sizes
export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  heading1: 24,
  heading2: 22,
  heading3: 20,
  heading4: 18,
  heading5: 16,
  heading6: 14,
};

// Responsive font sizes
export const responsiveFontSizes = {
  xs: { small: 10, medium: 11, large: 12 },
  sm: { small: 11, medium: 12, large: 13 },
  md: { small: 13, medium: 14, large: 15 },
  lg: { small: 15, medium: 16, large: 17 },
  xl: { small: 17, medium: 18, large: 19 },
  xxl: { small: 19, medium: 20, large: 22 },
  heading1: { small: 22, medium: 24, large: 28 },
  heading2: { small: 20, medium: 22, large: 24 },
  heading3: { small: 18, medium: 20, large: 22 },
  heading4: { small: 16, medium: 18, large: 20 },
  heading5: { small: 15, medium: 16, large: 18 },
  heading6: { small: 14, medium: 15, large: 16 },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

// Responsive spacing
export const responsiveSpacing = {
  xs: { small: 3, medium: 4, large: 4 },
  sm: { small: 6, medium: 8, large: 10 },
  md: { small: 12, medium: 16, large: 20 },
  lg: { small: 18, medium: 24, large: 30 },
  xl: { small: 24, medium: 32, large: 40 },
  xxl: { small: 30, medium: 40, large: 48 },
};

// Border radius
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};

const createShadow = ({ boxShadow, offset, opacity, radius, elevation }) => (
  Platform.select({
    web: {
      boxShadow,
    },
    default: {
      shadowColor: colors.black,
      shadowOffset: offset,
      shadowOpacity: opacity,
      shadowRadius: radius,
      elevation,
    },
  })
);

// Shadows
export const shadows = {
  sm: createShadow({
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.18)',
    offset: { width: 0, height: 1 },
    opacity: 0.18,
    radius: 1.0,
    elevation: 1,
  }),
  md: createShadow({
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.22)',
    offset: { width: 0, height: 2 },
    opacity: 0.22,
    radius: 2.22,
    elevation: 3,
  }),
  lg: createShadow({
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.30)',
    offset: { width: 0, height: 4 },
    opacity: 0.30,
    radius: 4.65,
    elevation: 8,
  }),
  xl: createShadow({
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.44)',
    offset: { width: 0, height: 8 },
    opacity: 0.44,
    radius: 10.32,
    elevation: 16,
  }),
};

// Gradient presets
export const gradients = {
  primary: [colors.gradientBlue1, colors.gradientBlue2, colors.gradientBlue3],
  secondary: [colors.gradientPurple1, colors.gradientPurple2, colors.gradientPurple3],
  success: [colors.green, colors.lightGreen, colors.lime],
  error: [colors.red, colors.deepOrange, colors.orange],
  warning: [colors.amber, colors.yellow, colors.orange],
  info: [colors.lightBlue, colors.cyan, colors.teal],
  dark: [colors.gray900, colors.gray800, colors.gray700],
  light: [colors.gray100, colors.white, colors.blue100],
  purple: [colors.deepPurple, colors.purple, colors.pink],
  sunset: [colors.deepOrange, colors.red, colors.pink],
  ocean: [colors.blue, colors.lightBlue, colors.cyan],
  forest: [colors.green, colors.teal, colors.lightGreen],
};

// Animation timings
export const animations = {
  fast: 200,
  normal: 300,
  slow: 500,
};


// ====== End File: src\constants\theme.js ======

// ====== Begin File: src\context\AppContext.js ======

import React, { createContext, useState, useContext, useEffect } from 'react';
import { generateMockApps } from '../utils/mockData';
import supabaseData from '../services/supabaseData';

const AppContext = createContext({});

// Default settings from system_settings
const DEFAULT_SETTINGS = {
  withdrawal_fee_percentage: 10,
  whatsapp_group_link: 'https://chat.whatsapp.com/DB0Bcayi5YYLROLxEbnjVt',
  whatsapp_customer_care: '+254712345678',
  task_reset_time: '00:00',
  referral_level1_percentage: 10,
  referral_level2_percentage: 5,
  referral_level3_percentage: 2,
  daily_spin_limit: 5,
  app_maintenance_mode: false,
};

export const AppProvider = ({ children }) => {
  // Daily tasks and app installation state
  const [taskApps, setTaskApps] = useState([]);
  const [installingApps, setInstallingApps] = useState([]);
  const [completedApps, setCompletedApps] = useState([]);
  const [spinHistory, setSpinHistory] = useState([]);
  const [lastReset, setLastReset] = useState(new Date().toDateString());
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  
  // Generate mock apps on first load
  useEffect(() => {
    setTaskApps(generateMockApps(100));
    checkDayReset();
    // Fetch platform settings
    (async () => {
      try {
        const { data } = await supabaseData.getSystemSettings();
        if (data) {
          // Merge with defaults to ensure all required settings exist
          setSettings({ ...DEFAULT_SETTINGS, ...data });
        }
      } catch (e) {
        console.warn('Failed to fetch system settings:', e);
        // Keep using defaults
      }
    })();
    
    // Set up an interval to check for day reset every minute
    const interval = setInterval(checkDayReset, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Check if we need to reset daily tasks at midnight
  const checkDayReset = () => {
    const today = new Date().toDateString();
    if (today !== lastReset) {
      setTaskApps(generateMockApps(100));
      setCompletedApps([]);
      setLastReset(today);
    }
  };
  
  // Start installing an app
  const installApp = (app) => {
    if (installingApps.length >= 5) {
      return { success: false, message: 'Maximum 5 simultaneous installations' };
    }
    
    const installTime = Math.floor(Math.random() * 10000) + 10000; // 10-20 seconds
    
    const newInstallingApp = {
      ...app,
      progress: 0,
      installTime,
      startTime: Date.now(),
      interval: null
    };
    
    setInstallingApps(prev => [...prev, newInstallingApp]);
    
    return { 
      success: true, 
      message: 'Installation started',
      appId: app.id,
      installTime
    };
  };
  
  // Update installation progress
  const updateInstallProgress = (appId, progress) => {
    setInstallingApps(prev => 
      prev.map(app => 
        app.id === appId ? { ...app, progress } : app
      )
    );
    
    if (progress >= 100) {
      // Installation complete
      setCompletedApps(prev => prev.includes(appId) ? prev : [...prev, appId]);
      setTaskApps(prev => prev.filter(app => app.id !== appId));
      setInstallingApps(prev => prev.filter(app => app.id !== appId));
      
      return true;
    }
    return false;
  };
  
  // Cancel an app installation
  const cancelInstallation = (appId) => {
    setInstallingApps(prev => prev.filter(app => app.id !== appId));
  };
  
  // Add a spin result to history
  const addSpinResult = (betAmount, result, isWin) => {
    const newSpin = {
      id: Date.now().toString(),
      betAmount,
      result,
      isWin,
      timestamp: Date.now()
    };
    
    setSpinHistory(prev => [newSpin, ...prev]);
    return newSpin;
  };
  
  return (
    <AppContext.Provider value={{
      taskApps,
      installingApps,
      completedApps,
      spinHistory,
      settings,
      installApp,
      updateInstallProgress,
      cancelInstallation,
      addSpinResult
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  return context;
};


// ====== End File: src\context\AppContext.js ======

// ====== Begin File: src\context\AuthContext.js ======

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


// ====== End File: src\context\AuthContext.js ======

// ====== Begin File: src\context\NotificationContext.js ======

import React, { createContext, useCallback, useContext, useMemo, useRef, useState, useEffect } from 'react';
import NotificationBanner from '../components/NotificationBanner';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const timeoutRef = useRef(null);

  const hideNotification = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setNotification(null);
  }, []);

  const showNotification = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setNotification({ id: Date.now(), type, title, message });

    timeoutRef.current = setTimeout(() => {
      hideNotification();
    }, duration);
  }, [hideNotification]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const value = useMemo(() => ({ showNotification, hideNotification }), [showNotification, hideNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationBanner notification={notification} onHide={hideNotification} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }

  return context;
};


// ====== End File: src\context\NotificationContext.js ======

// ====== Begin File: src\context\SupabaseAuthContext.js ======

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
import { useNotification } from './NotificationContext';
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
  const { showNotification } = useNotification();
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
        showNotification({
          type: 'warning',
          title: 'Slow Connection',
          message: 'Still syncing latest profile data in the background.',
        });
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
        
        showNotification({
          type: 'success',
          title: 'Welcome back!',
          message: `Successfully signed in to ${APP_NAME}`,
        });
        
        return { success: true };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      
      showNotification({
        type: 'error',
        title: 'Sign In Failed',
        message: error.message || 'Please check your credentials and try again',
      });
      
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
          showNotification({
            type: 'success',
            title: 'Registration Successful!',
            message: `Welcome to ${APP_NAME}! Your account is ready to use.`,
          });
        } else {
          setUser(null);
          setProfile(null);
          setIsProfileReady(false);
          showNotification({
            type: 'success',
            title: 'Registration Submitted',
            message: 'Please check your email to verify your account before signing in.',
          });
        }
        
        return { success: true, user: data.user, session: data.session };
      }
    } catch (error) {
      console.error('Sign up error:', error);
      
      showNotification({
        type: 'error',
        title: 'Registration Failed',
        message: error.message || 'An error occurred during registration',
      });
      
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
      
      showNotification({
        type: 'success',
        title: 'Signed Out',
        message: 'You have been successfully signed out',
      });
      
    } catch (error) {
      console.error('Sign out error:', error);
      
      showNotification({
        type: 'error',
        title: 'Sign Out Failed',
        message: error.message || 'An error occurred while signing out',
      });
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

      showNotification({
        type: 'success',
        title: 'Reset Email Sent',
        message: 'Please check your email for password reset instructions',
      });
      
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      
      showNotification({
        type: 'error',
        title: 'Reset Failed',
        message: error.message || 'Failed to send reset email',
      });
      
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
        await AsyncStorage.setItem('@GigSmart:profile', JSON.stringify(data));
        
        showNotification({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile has been successfully updated',
        });
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Update profile error:', error);
      
      showNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update profile',
      });
      
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


// ====== End File: src\context\SupabaseAuthContext.js ======

// ====== Begin File: src\context\SupabaseUserContext.js ======

import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './SupabaseAuthContext';
import { useNotification } from './NotificationContext';
import supabaseData from '../services/supabaseData';
import supabase from '../services/supabaseClient';
import { levels as defaultLevels } from '../constants/levels';
import { APP_NAME } from '../constants/branding';
import { normalizeProfile } from '../utils/profile';

const UserContext = createContext({});

export const UserProvider = ({ children }) => {
  const { user, profile: authProfile } = useAuth();
  const { showNotification } = useNotification();
  
  const [profile, setProfile] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [levelsData, setLevelsData] = useState(defaultLevels);
  const [earningsByPeriod, setEarningsByPeriod] = useState(null);
  const [giftCodeEarnings, setGiftCodeEarnings] = useState(null);
  const [taskProgressToday, setTaskProgressToday] = useState(null);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [taskCompletion, setTaskCompletion] = useState(null);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);

  const currentLevelId = profile?.currentLevelId ?? profile?.current_level ?? 0;
  const currentLevel = useMemo(() => {
    return levelsData.find(level => level.id === currentLevelId) || levelsData[0] || defaultLevels[0];
  }, [levelsData, currentLevelId]);

  const normalizeTransaction = (tx) => {
    if (!tx) return null;

    const amount = Number.isFinite(tx.net_amount) ? Number(tx.net_amount) : Number(tx.amount ?? 0);
    return {
      id: tx.id,
      type: tx.type?.toUpperCase?.() || tx.transaction_type?.toUpperCase?.() || 'ADMIN_ADJUSTMENT',
      amount,
      fee: Number(tx.fee ?? 0),
      netAmount: amount,
      status: tx.status || 'pending',
      description: tx.description || 'No description provided',
      timestamp: tx.processed_at || tx.created_at || new Date().toISOString(),
      metadata: tx.metadata || {},
      raw: tx,
    };
  };

  const redeemGiftCode = async (code) => {
    try {
      const { data, error } = await supabaseData.redeemGiftCode(user.id, code);

      if (error) throw error;

      if (data?.amount) {
        showNotification({
          type: 'success',
          title: 'Gift Redeemed!',
          message: `KES ${data.amount.toLocaleString()} added to your income wallet.`,
        });
        await loadUserData();
      }

      return data?.amount ?? 0;
    } catch (error) {
      console.error('Redeem gift error:', error);
      showNotification({
        type: 'error',
        title: 'Redemption Failed',
        message: error.message || 'Unable to redeem gift code.',
      });
      return 0;
    }
  };

  const normalizeLevel = (levelRow) => {
    if (!levelRow) return null;

    const toNumber = (value, fallback = 0) => {
      const num = Number(value);
      return Number.isFinite(num) ? num : fallback;
    };

    const id = levelRow.id ?? levelRow.level_id ?? levelRow.level ?? null;
    if (id === null || id === undefined) {
      return null;
    }

    const name = levelRow.name || levelRow.title || `Level ${id}`;
    const cost = toNumber(levelRow.cost ?? levelRow.upgrade_cost ?? levelRow.price, 0);
    const tasks = toNumber(levelRow.tasks ?? levelRow.tasks_per_day ?? levelRow.daily_task_limit, 0);
    const earningsPerTask = toNumber(levelRow.earnings_per_task ?? levelRow.task_reward ?? levelRow.earnings, 0);
    const dailyEarnings = toNumber(levelRow.daily_earnings ?? levelRow.daily_total, tasks * earningsPerTask);
    const annualEarnings = toNumber(levelRow.annual_earnings, dailyEarnings * 365);
    const color = levelRow.color || levelRow.level_color || '#1E88E5';
    const multiplier = toNumber(levelRow.multiplier ?? levelRow.level_multiplier, 1);
    const iconRaw = levelRow.icon || levelRow.icon_name || 'trophy-outline';
    const icon = Ionicons?.glyphMap?.[iconRaw] ? iconRaw : 'trophy-outline';
    const nextLevelId = levelRow.next_level_id ?? levelRow.nextLevelId ?? null;
    const isLocked = Boolean(levelRow.is_locked ?? levelRow.locked ?? false);
    const isActive = levelRow.is_active ?? levelRow.active;

    return {
      id: Number(id),
      name,
      cost,
      tasks,
      earningsPerTask,
      dailyEarnings,
      annualEarnings,
      color,
      multiplier,
      icon,
      nextLevelId: nextLevelId === null || nextLevelId === undefined ? null : Number(nextLevelId),
      isLocked,
      isActive: isActive === undefined ? true : Boolean(isActive),
      description: levelRow.description || levelRow.summary || '',
    };
  };

  // Load user data when user changes
  useEffect(() => {
    if (user && authProfile) {
      setProfile(normalizeProfile(authProfile));
      loadUserData();
    } else {
      // Clear data when user logs out
      setProfile(null);
      setInvestments([]);
      setTransactions([]);
      setReferrals([]);
      setWallet(null);
      setTaskCompletion(null);
      setWithdrawalRequests([]);
      setEarningsByPeriod(null);
      setGiftCodeEarnings(null);
      setTaskProgressToday(null);
      setHasCheckedInToday(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authProfile]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const profileSubscription = supabaseData.subscribeToProfile(user.id, (payload) => {
      if (payload.new) {
        setProfile(normalizeProfile(payload.new));
      }
    });

    const transactionSubscription = supabaseData.subscribeToTransactions(user.id, (payload) => {
      if (payload.new) {
        const normalized = normalizeTransaction(payload.new);
        if (normalized) {
          setTransactions(prev => [normalized, ...prev]);
        }
      }
    });

    return () => {
      profileSubscription?.unsubscribe();
      transactionSubscription?.unsubscribe();
    };
  }, [user]);

  // Load earnings by period
  const loadEarningsByPeriod = async () => {
    if (!user) return;
    try {
      const data = await supabaseData.getEarningsByPeriod(user.id);
      setEarningsByPeriod(data);
    } catch (error) {
      console.error('Error loading earnings by period:', error);
    }
  };

  // Load gift code earnings
  const loadGiftCodeEarnings = async () => {
    if (!user) return;
    try {
      const data = await supabaseData.getGiftCodeEarnings(user.id);
      setGiftCodeEarnings(data);
    } catch (error) {
      console.error('Error loading gift code earnings:', error);
    }
  };

  // Load task progress today
  const loadTaskProgressToday = async () => {
    if (!user) return;
    try {
      const data = await supabaseData.getTaskProgressToday(user.id);
      setTaskProgressToday(data);
    } catch (error) {
      console.error('Error loading task progress today:', error);
    }
  };

  // Daily check-in
  const performDailyCheckIn = async () => {
    if (!user) return;
    try {
      const deviceInfo = {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        platform: typeof Platform !== 'undefined' ? Platform.OS : 'unknown',
        timestamp: new Date().toISOString(),
      };
      
      const success = await supabaseData.dailyCheckIn(user.id, deviceInfo);
      if (success.ok) {
        setHasCheckedInToday(true);
        showNotification({
          type: 'success',
          title: 'Daily Check-in',
          message: 'You have successfully checked in for today!',
        });
      } else {
        showNotification({
          type: 'error',
          title: 'Check-in Failed',
          message: 'Failed to record daily check-in.',
        });
      }
    } catch (error) {
      console.error('Error performing daily check-in:', error);
      showNotification({
        type: 'error',
        title: 'Check-in Error',
        message: 'An error occurred during daily check-in.',
      });
    }
  };

  // Log activity
  const logActivity = async (eventType, eventData) => {
    if (!user) return;
    try {
      await supabaseData.logActivityEvent(user.id, eventType, eventData);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  // Load wallet
  const fetchWallet = async () => {
    if (!user) return;
    try {
      const { data } = await supabaseData.getWallet(user.id);
      setWallet(data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  // Load task completion
  const fetchTaskCompletion = async () => {
    if (!user) return;
    try {
      const { data } = await supabaseData.getTaskCompletion(user.id);
      setTaskCompletion(data);
    } catch (error) {
      console.error('Error fetching task completion:', error);
    }
  };

  // Load withdrawal requests
  const fetchWithdrawalRequests = async () => {
    if (!user) return;
    try {
      const { data } = await supabaseData.getWithdrawalRequests(user.id);
      setWithdrawalRequests(data || []);
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
    }
  };

  // Refresh functions
  const refreshProfile = () => fetchProfile();
  const refreshInvestments = () => fetchInvestments();
  const refreshTransactions = () => fetchTransactions();
  const refreshReferrals = () => fetchReferrals();
  const refreshWallet = () => fetchWallet();
  const refreshTaskCompletion = () => fetchTaskCompletion();
  const refreshWithdrawalRequests = () => fetchWithdrawalRequests();

  // Combined data loading function
  const loadUserData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      await Promise.all([
        fetchProfile(),
        fetchInvestments(),
        fetchTransactions(),
        fetchReferrals(),
        fetchWallet(),
        fetchTaskCompletion(),
        fetchWithdrawalRequests(),
        loadEarningsByPeriod(),
        loadGiftCodeEarnings(),
        loadTaskProgressToday(),
      ]);

      // Perform daily check-in if not already done
      if (!hasCheckedInToday) {
        await performDailyCheckIn();
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch functions
  const fetchProfile = async () => {
    const { data: updatedProfile, error: updateError } = await supabaseData.getProfile(user.id);
    if (updateError) {
      console.error('Error loading user profile:', updateError);
    } else if (updatedProfile) {
      const normalizedLevelId = updatedProfile?.currentLevelId ?? updatedProfile?.current_level ?? 0;
      setProfile({ ...updatedProfile, currentLevelId: normalizedLevelId });
    }
  };

  const fetchInvestments = async () => {
    const { data: investmentData } = await supabaseData.getInvestments(user.id);
    if (investmentData) {
      const normalizedInvestments = investmentData.map((inv) => {
        const principal = Number(inv.principal ?? inv.amount ?? 0);
        const currentValue = Number(inv.current_value ?? inv.currentValue ?? principal);
        const rate = Number(inv.daily_rate ?? inv.rate ?? 0);
        const days = Number(inv.duration_days ?? inv.days ?? 0);
        const bankName = inv.bank_name ?? inv.bankName ?? inv.name ?? 'Partner Bank';
        const rawStatus = inv.status ?? 'active';
        return {
          id: inv.id,
          bankName,
          principal,
          currentValue,
          rate,
          days,
          endDate: inv.maturity_date ?? inv.endDate ?? null,
          status: rawStatus.toString().toUpperCase(),
          start_date: inv.start_date ?? inv.created_at ?? null,
        };
      });
      setInvestments(normalizedInvestments);
    }
  };

  const fetchTransactions = async () => {
    const { data: transactionData, error: transactionError } = await supabaseData.getTransactions(user.id);
    if (transactionError) {
      console.error('Transaction recording error:', transactionError);
    } else if (transactionData) {
      const normalizedTransactions = transactionData
        .map(normalizeTransaction)
        .filter(Boolean);
      setTransactions(normalizedTransactions);
    }
  };

  const fetchReferrals = async () => {
    const { data: referralData } = await supabaseData.getReferrals(user.id);
    if (referralData) {
      setReferrals(referralData);
    }
  };

  // Wallet operations
  const addToRechargeWallet = async (amount, description, transactionType = 'RECHARGE') => {
    try {
      const { data, error } = await supabaseData.updateWallet(
        user.id, 
        'recharge', 
        amount, 
        description, 
        transactionType
      );

      if (error) throw error;

      if (data) {
        setProfile(data);
        showNotification({
          type: 'success',
          title: 'Recharge Successful',
          message: `KES ${amount.toLocaleString()} added to your recharge wallet`,
        });
      }

      return true;
    } catch (error) {
      console.error('Add to recharge wallet error:', error);
      showNotification({
        type: 'error',
        title: 'Transaction Failed',
        message: 'Failed to update wallet balance',
      });
      return false;
    }
  };

  // Withdrawal account details (set once, reset via customer care)
  const setWithdrawalAccount = async (accountType, accountDetails, password) => {
    if (profile?.withdrawal_account_type && profile?.withdrawal_account_details) {
      showNotification({
        type: 'info',
        title: 'Account Already Set',
        message: 'Withdrawal account can only be set once. Contact customer care to reset.'
      });
      return false;
    }
    const { data, error } = await supabaseData.updateWithdrawalSettings(user.id, accountType, accountDetails, password);
    if (error) {
      showNotification({
        type: 'error',
        title: 'Failed to Set Withdrawal Account',
        message: error.message || 'Could not set withdrawal account.'
      });
      return false;
    }
    setProfile(data);
    showNotification({
      type: 'success',
      title: 'Withdrawal Account Set',
      message: 'Your withdrawal account details have been saved.'
    });
    return true;
  };

  const addToIncomeWallet = async (amount, description, transactionType = 'TASK_EARNING') => {
    try {
      const { data, error } = await supabaseData.updateWallet(
        user.id, 
        'income', 
        amount, 
        description, 
        transactionType
      );

      if (error) throw error;

      if (data) {
        setProfile(data);
        showNotification({
          type: 'success',
          title: 'Income Updated',
          message: `KES ${amount.toLocaleString()} ${amount > 0 ? 'earned' : 'deducted'}`,
        });
      }

      return true;
    } catch (error) {
      console.error('Add to income wallet error:', error);
      return false;
    }
  };

  const withdraw = async (amount, fee) => {
    try {
      const netAmount = amount - fee;
      const { data, error, lastTransactionId } = await supabaseData.updateWallet(
        user.id, 
        'income', 
        -amount, 
        `Withdrawal: KES ${netAmount.toLocaleString()} (Fee: KES ${fee.toLocaleString()})`, 
        'WITHDRAWAL'
      );

      if (error) throw error;

      if (data) {
        // Create a withdrawal request row for admin processing
        try {
          await supabaseData.createWithdrawalRequest(
            user.id,
            amount,
            fee,
            netAmount,
            lastTransactionId,
            profile?.withdrawal_account_type || null,
            profile?.withdrawal_account_details || null,
            {
              name: profile?.name || null,
              phone: profile?.phone || null,
              email: profile?.email || null,
              current_level: profile?.current_level ?? profile?.currentLevelId ?? null,
              level_name: (levelsData.find(l => l.id === (profile?.current_level ?? profile?.currentLevelId))?.name) || null,
            }
          );
        } catch (e) {
          console.error('Create withdrawal request error:', e);
        }

        setProfile(data);
        showNotification({
          type: 'success',
          title: 'Withdrawal Successful',
          message: `KES ${netAmount.toLocaleString()} will be sent to your account`,
        });
        // Refresh transactions and profile to reflect the withdrawal
        await loadUserData();
      }

      return true;
    } catch (error) {
      console.error('Withdrawal error:', error);
      showNotification({
        type: 'error',
        title: 'Withdrawal Failed',
        message: 'Insufficient funds or withdrawal error',
      });
      return false;
    }
  };

  // Investment operations
  const createInvestment = async (bank, amount, rate, days) => {
    try {
      const availableIncome = profile?.incomeWallet ?? profile?.income_wallet ?? 0;

      if (amount <= 0) {
        showNotification({
          type: 'error',
          title: 'Invalid Amount',
          message: 'Enter an amount greater than zero to invest.',
        });
        return false;
      }

      if (amount > availableIncome) {
        showNotification({
          type: 'error',
          title: 'Insufficient Funds',
          message: 'You do not have enough balance in your income wallet for this investment.',
        });
        return false;
      }

      const description = bank?.name
        ? `Investment in ${bank.name}`
        : 'Investment purchase';

      const { data: walletProfile, error: walletError } = await supabaseData.updateWallet(
        user.id,
        'income',
        -amount,
        description,
        'INVESTMENT'
      );

      if (walletError) throw walletError;

      const { data: investmentData, error: investmentError } = await supabaseData.createInvestment(
        user.id,
        bank,
        amount,
        rate,
        days
      );

      if (investmentError) throw investmentError;

      if (walletProfile) {
        setProfile(walletProfile);
      }

      if (investmentData) {
        setInvestments(prev => [investmentData, ...prev]);
        showNotification({
          type: 'success',
          title: 'Investment Created',
          message: `Successfully invested KES ${amount.toLocaleString()} from your income wallet.`,
        });
      }

      return true;
    } catch (error) {
      console.error('Create investment error:', error);
      showNotification({
        type: 'error',
        title: 'Investment Failed',
        message: error.message || 'Failed to create investment',
      });
      return false;
    }
  };

  const withdrawInvestment = async (investmentId) => {
    try {
      const { data: amount, error } = await supabaseData.withdrawInvestment(user.id, investmentId);

      if (error) throw error;

      if (amount) {
        // Update investments list
        setInvestments(prev => 
          prev.map(inv => 
            inv.id === investmentId 
              ? { ...inv, status: 'COMPLETED', completed_at: new Date().toISOString() }
              : inv
          )
        );

        // Refresh profile to get updated wallet balance
        loadUserData();

        showNotification({
          type: 'success',
          title: 'Investment Withdrawn',
          message: `KES ${amount.toLocaleString()} returned to your income wallet.`,
        });

        return amount;
      }

      return 0;
    } catch (error) {
      console.error('Withdraw investment error:', error);
      showNotification({
        type: 'error',
        title: 'Withdrawal Failed',
        message: 'Failed to withdraw investment',
      });
      return 0;
    }
  };

  const updateInvestments = () => {
    setInvestments(prev => prev.map(investment => {
      if (investment.status === 'COMPLETED') {
        return investment;
      }

      const now = new Date();
      const startDate = investment.start_date ? new Date(investment.start_date) : new Date();
      const endDate = investment.endDate ? new Date(investment.endDate) : new Date(startDate.getTime() + (investment.days || 0) * 24 * 60 * 60 * 1000);

      const totalDays = Math.max(1, investment.days || Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
      const elapsedDays = Math.min(totalDays, Math.max(0, Math.floor((now - startDate) / (1000 * 60 * 60 * 24))));
      const elapsedRatio = elapsedDays / totalDays;

      // Daily compounded profit
      const dailyRate = investment.rate / 100;
      const compoundedValue = investment.principal * Math.pow(1 + dailyRate, elapsedDays);
      const simpleProjectedValue = investment.principal * (1 + dailyRate * totalDays);
      const targetValue = Math.max(compoundedValue, simpleProjectedValue * elapsedRatio);
      const maxMaturityValue = investment.principal * (1 + dailyRate * totalDays);
      const currentValue = Math.max(investment.principal, Math.min(maxMaturityValue, targetValue));

      let status = investment.status;
      if (now >= endDate || elapsedDays >= totalDays) {
        status = 'COMPLETED';
      }

      return {
        ...investment,
        current_value: currentValue,
        status,
      };
    }));
  };

  // Task operations
  const completeTask = async (taskId, taskName, reward) => {
    try {
      const { data, error } = await supabaseData.completeTask(user.id, taskId, taskName, reward);

      if (error) throw error;

      if (data) {
        setProfile(data);
        showNotification({
          type: 'success',
          title: 'Task Completed!',
          message: `Earned KES ${reward.toLocaleString()} from ${taskName}`,
        });
        await loadUserData();
      }

      return true;
    } catch (error) {
      console.error('Complete task error:', error);
      showNotification({
        type: 'error',
        title: 'Task Failed',
        message: 'Failed to complete task',
      });
      return false;
    }
  };

  // Level operations
  const upgradeLevel = async (levelId, cost) => {
    try {
      if (cost > profile.recharge_wallet) {
        showNotification({
          type: 'error',
          title: 'Insufficient Funds',
          message: 'You don\'t have enough balance in your recharge wallet for this upgrade',
        });
        return false;
      }

      const { data, error } = await supabaseData.upgradeLevel(user.id, levelId, cost);

      if (error) throw error;

      if (data) {
        setProfile(data);
        const newLevel = levelsData.find(level => level.id === levelId);
        showNotification({
          type: 'success',
          title: 'Level Upgraded!',
          message: `Welcome to ${newLevel?.name}! Enjoy your new perks and higher earnings.`,
        });
      }

      return true;
    } catch (error) {
      console.error('Upgrade level error:', error);
      showNotification({
        type: 'error',
        title: 'Upgrade Failed',
        message: error.message || 'Failed to upgrade level',
      });
      return false;
    }
  };

  // Referral operations
  const updateWithdrawalAccount = async (accountType, accountDetails, password) => {
    try {
      const { data, error } = await supabaseData.updateWithdrawalSettings(user.id, accountType, accountDetails, password);

      if (error) throw error;

      if (data) {
        setProfile(data);
        showNotification({
          type: 'success',
          title: 'Withdrawal Account Updated',
          message: 'Your withdrawal details are secure and ready to use.',
        });
      }

      return true;
    } catch (error) {
      console.error('Update withdrawal account error:', error);
      showNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Could not update withdrawal account',
      });
      return false;
    }
  };

  const addReferral = async (referredUserId) => {
    try {
      const { data, error } = await supabaseData.addReferral(user.id, referredUserId);

      if (error) throw error;

      if (data) {
        setReferrals(prev => [data, ...prev]);
        
        // Add referral bonus
        const bonusAmount = 100; // KES 100 referral bonus
        await addToIncomeWallet(bonusAmount, 'Referral bonus', 'REFERRAL_BONUS');
      }

      return true;
    } catch (error) {
      console.error('Add referral error:', error);
      return false;
    }
  };

  const value = {
    profile,
    currentLevel,
    investments,
    transactions,
    referrals,
    wallet,
    taskCompletion,
    withdrawalRequests,
    earningsByPeriod,
    giftCodeEarnings,
    taskProgressToday,
    hasCheckedInToday,
    isLoading,
    levels: levelsData,
    
    // Wallet operations
    addToRechargeWallet,
    addToIncomeWallet,
    withdraw,
    setWithdrawalAccount,
    
    // Investment operations
    createInvestment,
    withdrawInvestment,
    updateInvestments,
    
    // Task operations
    completeTask,
    
    // Level operations
    upgradeLevel,
    updateWithdrawalAccount,
    redeemGiftCode,
    
    // Referral operations
    addReferral,
    
    // Data refresh
    refreshProfile,
    refreshInvestments,
    refreshTransactions,
    refreshReferrals,
    refreshWallet,
    refreshTaskCompletion,
    refreshWithdrawalRequests,
    loadEarningsByPeriod,
    loadGiftCodeEarnings,
    loadTaskProgressToday,
    performDailyCheckIn,
    logActivity,
    
    // Utility functions
    getReferralCount: () => referrals.length,
    getActiveReferralCount: () => referrals.filter(r => r.status === 'active').length,
    getTotalReferralEarnings: () => referrals.reduce((sum, r) => sum + (r.earnings || 0), 0),
    getTotalEarnings: () => transactions.filter(t => t.type === 'EARNING').reduce((sum, t) => sum + t.amount, 0),
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
};

export default UserContext;


// ====== End File: src\context\SupabaseUserContext.js ======

// ====== Begin File: src\context\UserContext.js ======

// DEPRECATED: This file is no longer used. 
// All functionality has been moved to SupabaseUserContext.js
// This file is kept for reference only and should not be imported.

console.warn('UserContext.js is deprecated. Use SupabaseUserContext.js instead.');

export {};


// ====== End File: src\context\UserContext.js ======

// ====== Begin File: src\hooks\useResponsive.js ======

import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

const getBreakpoint = (width) => {
  if (width < 380) return 'small';
  if (width < 768) return 'medium';
  return 'large';
};

export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = useState(() => 
    getBreakpoint(Dimensions.get('window').width)
  );

  useEffect(() => {
    const onChange = ({ window }) => {
      setBreakpoint(getBreakpoint(window.width));
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  return {
    breakpoint,
    isSmall: breakpoint === 'small',
    isMedium: breakpoint === 'medium',
    isLarge: breakpoint === 'large',
    isMobile: breakpoint !== 'large',
    isTablet: breakpoint === 'large' && Platform.OS !== 'web',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  };
};


// ====== End File: src\hooks\useResponsive.js ======

// ====== Begin File: src\navigation\AuthNavigator.js ======

import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'web' ? 'fade' : 'slide_from_right',
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;


// ====== End File: src\navigation\AuthNavigator.js ======

// ====== Begin File: src\navigation\MainNavigator.js ======

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


// ====== End File: src\navigation\MainNavigator.js ======

// ====== Begin File: src\screens\auth\ForgotPasswordScreen.js ======

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };
  
  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      // In a real app, this would call an API endpoint
      // For now, simulate a successful API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubmitted(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Forgot Password?</Text>
            <Text style={styles.subheaderText}>We'll help you reset it</Text>
          </View>
          
          <View style={styles.formContainer}>
            {!isSubmitted ? (
              <>
                <Text style={styles.instructionText}>
                  Enter the email address associated with your account, and we'll send you a link to reset your password.
                </Text>
                
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color={colors.blue400} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={colors.gray500}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (error) setError('');
                    }}
                  />
                </View>
                
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.resetButtonText}>Send Reset Link</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={60} color={colors.success} style={styles.successIcon} />
                <Text style={styles.successTitle}>Email Sent!</Text>
                <Text style={styles.successText}>
                  We've sent a password reset link to {email}. Please check your inbox and follow the instructions.
                </Text>
                <TouchableOpacity
                  style={styles.backToLoginButton}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.backToLoginText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Remember your password? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLinkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  backButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: spacing.lg,
  },
  headerText: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subheaderText: {
    fontSize: fontSizes.md,
    color: colors.blue200,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    ...shadows.lg,
  },
  instructionText: {
    fontSize: fontSizes.md,
    color: colors.gray700,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 10,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    color: colors.textDark,
    fontSize: fontSizes.md,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.sm,
    marginBottom: spacing.md,
    marginLeft: spacing.sm,
  },
  resetButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  resetButtonText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: colors.gray600,
    fontSize: fontSizes.md,
  },
  loginLinkText: {
    color: colors.primary,
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  successContainer: {
    alignItems: 'center',
    padding: spacing.md,
  },
  successIcon: {
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: spacing.sm,
  },
  successText: {
    fontSize: fontSizes.md,
    color: colors.gray700,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  backToLoginButton: {
    backgroundColor: colors.success,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  backToLoginText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;


// ====== End File: src\screens\auth\ForgotPasswordScreen.js ======

// ====== Begin File: src\screens\auth\LoginScreen.js ======

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/SupabaseAuthContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { APP_NAME, TAGLINE } from '../../constants/branding';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { signIn } = useAuth();
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await signIn({ email, password });
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(prevState => !prevState);
  };
  
  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>{APP_NAME}</Text>
            <Text style={styles.tagline}>{TAGLINE}</Text>
          </View>
          
          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={colors.blue400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.gray500}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.blue400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.gray500}
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                <Ionicons 
                  name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
                  size={20} 
                  color={colors.gray600} 
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            
            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLinkText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: fontSizes.md,
    color: colors.blue200,
    marginTop: spacing.xs,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    ...shadows.lg,
  },
  welcomeText: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.gray600,
    marginBottom: spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 10,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    color: colors.textDark,
    fontSize: fontSizes.md,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.sm,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: fontSizes.sm,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    color: colors.gray600,
    fontSize: fontSizes.md,
  },
  registerLinkText: {
    color: colors.primary,
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
});

export default LoginScreen;


// ====== End File: src\screens\auth\LoginScreen.js ======

// ====== Begin File: src\screens\auth\ProfessionalRegisterScreen.js ======

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/SupabaseAuthContext';
import { useNotification } from '../../context/NotificationContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { APP_NAME, APP_SHORT_NAME, TAGLINE } from '../../constants/branding';

const { width } = Dimensions.get('window');

const ProfessionalRegisterScreen = ({ navigation, route }) => {
  const referralCode = route.params?.referralCode || '';
  
  // Step 1: Basic Information
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Step 2: Personal Details
  const [country, setCountry] = useState('Kenya');
  const [city, setCity] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  
  // Step 3: Professional Information
  const [industry, setIndustry] = useState('');
  const [occupation, setOccupation] = useState('');
  const [experience, setExperience] = useState('');
  const [referrer, setReferrer] = useState(referralCode);
  
  // UI State
  const [currentStep, setCurrentStep] = useState(1);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { signUp } = useAuth();
  const { showNotification } = useNotification();

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-\s()]+$/.test(phone) || phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!country.trim()) {
      newErrors.country = 'Country is required';
    }
    
    if (!city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!nationalId.trim()) {
      newErrors.nationalId = 'National ID/Passport is required';
    }
    
    if (!dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    
    if (!gender.trim()) {
      newErrors.gender = 'Gender is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    
    if (!industry.trim()) {
      newErrors.industry = 'Industry/Profession is required';
    }
    
    if (!occupation.trim()) {
      newErrors.occupation = 'Current occupation is required';
    }
    
    if (!experience.trim()) {
      newErrors.experience = 'Work experience is required';
    }
    
    if (!acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
    }
    
    if (isValid) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
        setErrors({});
      } else {
        handleRegister();
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      await signUp({
        name,
        email,
        phone,
        password,
        country,
        city,
        nationalId,
        dateOfBirth,
        gender,
        industry,
        occupation,
        experience,
        referrer,
        acceptMarketing
      });
      
      showNotification({
        type: 'success',
        title: 'Registration Successful!',
        message: `Welcome to ${APP_NAME}! Your account has been created successfully.`,
      });
      
      navigation.navigate('Login');
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Registration Failed',
        message: error.message || 'An error occurred during registration. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(currentStep / 3) * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>Step {currentStep} of 3</Text>
    </View>
  );

  const renderInputField = (value, setValue, placeholder, error, options = {}) => (
    <View style={styles.inputContainer}>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        {options.icon && (
          <Ionicons name={options.icon} size={20} color={colors.blue300} style={styles.inputIcon} />
        )}
        <TextInput
          style={[styles.input, options.icon && styles.inputWithIcon]}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor={colors.blue200}
          secureTextEntry={options.secure}
          keyboardType={options.keyboardType || 'default'}
          autoCapitalize={options.autoCapitalize || 'words'}
          autoCorrect={false}
        />
        {options.toggleVisibility && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={options.toggleVisibility}
          >
            <Ionicons
              name={options.isVisible ? 'eye-off' : 'eye'}
              size={20}
              color={colors.blue300}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>Let's start with your basic details</Text>
      
      {renderInputField(name, setName, 'Full Name *', errors.name, { icon: 'person-outline' })}
      {renderInputField(email, setEmail, 'Email Address *', errors.email, { 
        icon: 'mail-outline', 
        keyboardType: 'email-address',
        autoCapitalize: 'none'
      })}
      {renderInputField(phone, setPhone, 'Phone Number *', errors.phone, { 
        icon: 'call-outline', 
        keyboardType: 'phone-pad' 
      })}
      {renderInputField(password, setPassword, 'Password *', errors.password, { 
        icon: 'lock-closed-outline',
        secure: !isPasswordVisible,
        toggleVisibility: () => setIsPasswordVisible(!isPasswordVisible),
        isVisible: isPasswordVisible,
        autoCapitalize: 'none'
      })}
      {renderInputField(confirmPassword, setConfirmPassword, 'Confirm Password *', errors.confirmPassword, { 
        icon: 'lock-closed-outline',
        secure: !isConfirmPasswordVisible,
        toggleVisibility: () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible),
        isVisible: isConfirmPasswordVisible,
        autoCapitalize: 'none'
      })}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Details</Text>
      <Text style={styles.stepSubtitle}>Help us know you better</Text>
      
      {renderInputField(country, setCountry, 'Country *', errors.country, { icon: 'flag-outline' })}
      {renderInputField(city, setCity, 'City *', errors.city, { icon: 'location-outline' })}
      {renderInputField(nationalId, setNationalId, 'National ID / Passport *', errors.nationalId, { 
        icon: 'card-outline' 
      })}
      {renderInputField(dateOfBirth, setDateOfBirth, 'Date of Birth (DD/MM/YYYY) *', errors.dateOfBirth, { 
        icon: 'calendar-outline',
        keyboardType: 'numeric'
      })}
      
      <View style={styles.inputContainer}>
        <Text style={styles.fieldLabel}>Gender *</Text>
        <View style={styles.genderContainer}>
          {['Male', 'Female', 'Other'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.genderOption, gender === option && styles.genderSelected]}
              onPress={() => setGender(option)}
            >
              <Text style={[styles.genderText, gender === option && styles.genderTextSelected]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Professional Information</Text>
      <Text style={styles.stepSubtitle}>Tell us about your work</Text>
      
      {renderInputField(industry, setIndustry, 'Industry/Sector *', errors.industry, { 
        icon: 'business-outline' 
      })}
      {renderInputField(occupation, setOccupation, 'Current Occupation *', errors.occupation, { 
        icon: 'briefcase-outline' 
      })}
      {renderInputField(experience, setExperience, 'Years of Experience *', errors.experience, { 
        icon: 'time-outline',
        keyboardType: 'numeric'
      })}
      {renderInputField(referrer, setReferrer, 'Referral Code (Optional)', null, { 
        icon: 'people-outline' 
      })}
      
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setAcceptTerms(!acceptTerms)}
        >
          <Ionicons
            name={acceptTerms ? 'checkbox' : 'square-outline'}
            size={24}
            color={acceptTerms ? colors.success : colors.blue300}
          />
          <Text style={styles.checkboxText}>
            I agree to the <Text style={styles.linkText}>Terms & Conditions</Text> and <Text style={styles.linkText}>Privacy Policy</Text> *
          </Text>
        </TouchableOpacity>
        {errors.acceptTerms && <Text style={styles.errorText}>{errors.acceptTerms}</Text>}
      </View>
      
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setAcceptMarketing(!acceptMarketing)}
        >
          <Ionicons
            name={acceptMarketing ? 'checkbox' : 'square-outline'}
            size={24}
            color={acceptMarketing ? colors.success : colors.blue300}
          />
          <Text style={styles.checkboxText}>
            I want to receive updates and promotional offers from {APP_NAME}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => currentStep > 1 ? handlePrevStep() : navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Join {APP_NAME}</Text>
              <Text style={styles.headerSubtitle}>{TAGLINE}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          {renderProgressBar()}

          {/* Form Content */}
          <View style={styles.formContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.formCard}
            >
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </LinearGradient>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNextStep}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[colors.success, colors.green]}
                style={styles.nextButtonInner}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Text style={styles.nextButtonText}>
                      {currentStep === 3 ? 'Create Account' : 'Continue'}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color={colors.white} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs / 2,
  },
  headerSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    opacity: 0.9,
  },
  progressContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 2,
  },
  progressText: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  formCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  stepContainer: {
    marginBottom: spacing.md,
  },
  stepTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontSize: fontSizes.md,
    color: colors.blue200,
    marginBottom: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  inputError: {
    borderColor: colors.error,
  },
  inputIcon: {
    marginLeft: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.md,
    color: colors.white,
  },
  inputWithIcon: {
    paddingLeft: spacing.xs,
  },
  eyeButton: {
    padding: spacing.md,
  },
  errorText: {
    fontSize: fontSizes.sm,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  fieldLabel: {
    fontSize: fontSizes.md,
    color: colors.white,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  genderSelected: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  genderText: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    fontWeight: '500',
  },
  genderTextSelected: {
    color: colors.white,
    fontWeight: 'bold',
  },
  checkboxContainer: {
    marginBottom: spacing.md,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.blue200,
    marginLeft: spacing.sm,
    lineHeight: 20,
  },
  linkText: {
    color: colors.accent1,
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.md,
  },
  nextButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  nextButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginRight: spacing.sm,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  loginText: {
    fontSize: fontSizes.md,
    color: colors.blue200,
  },
  loginLink: {
    fontSize: fontSizes.md,
    color: colors.accent1,
    fontWeight: 'bold',
  },
});

export default ProfessionalRegisterScreen;


// ====== End File: src\screens\auth\ProfessionalRegisterScreen.js ======

// ====== Begin File: src\screens\auth\RegisterScreen.js ======

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/SupabaseAuthContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { APP_SHORT_NAME } from '../../constants/branding';

const generateSecurityCode = () => Math.floor(1000 + Math.random() * 9000).toString();

const RegisterScreen = ({ navigation, route }) => {
  const referralCode = route.params?.referralCode || '';

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityInput, setSecurityInput] = useState('');
  const [securityCode, setSecurityCode] = useState(generateSecurityCode);
  const [referrer, setReferrer] = useState(referralCode);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { signUp } = useAuth();

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?\d[\d\s-]{8,}$/.test(phone.trim())) {
      newErrors.phone = 'Enter a valid phone number';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!securityInput.trim()) {
      newErrors.securityInput = 'Enter the security code';
    } else if (securityInput.trim() !== securityCode) {
      newErrors.securityInput = 'Security code does not match';
    }

    if (!acceptTerms) {
      newErrors.acceptTerms = 'Please agree to the terms to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await signUp({
        email,
        phone,
        password,
        referralCode: referrer,
        securityCode,
      });
    } catch (error) {
      Alert.alert('Registration Failed', 'Could not create account. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSecurityCode = () => {
    setSecurityCode(generateSecurityCode());
    setSecurityInput('');
  };

  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <StatusBar barStyle="light-content" />

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>{APP_SHORT_NAME}</Text>
            </View>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Unlock daily earnings, tasks, and mentorship in minutes.</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Ionicons name="mail-outline" size={20} color={colors.blue500} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                placeholderTextColor={colors.gray500}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <View style={styles.inputGroup}>
              <Ionicons name="call-outline" size={20} color={colors.blue500} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="+254 712 345 678"
                placeholderTextColor={colors.gray500}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

            <View style={styles.inputGroup}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.blue500} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Create your password"
                placeholderTextColor={colors.gray500}
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(prev => !prev)} style={styles.eyeButton}>
                <Ionicons
                  name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.gray600}
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <View style={styles.inputGroup}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.blue500} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor={colors.gray500}
                secureTextEntry={!isConfirmPasswordVisible}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(prev => !prev)} style={styles.eyeButton}>
                <Ionicons
                  name={isConfirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.gray600}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

            <View style={styles.inputGroup}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.blue500} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Security code"
                placeholderTextColor={colors.gray500}
                keyboardType="numeric"
                value={securityInput}
                onChangeText={setSecurityInput}
                maxLength={6}
              />
              <View style={styles.codeBox}>
                <Text style={styles.codeText}>{securityCode}</Text>
                <TouchableOpacity onPress={refreshSecurityCode} style={styles.refreshButton}>
                  <Ionicons name="refresh" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            {errors.securityInput && <Text style={styles.errorText}>{errors.securityInput}</Text>}

            <View style={styles.inputGroup}>
              <Ionicons name="person-add-outline" size={20} color={colors.blue500} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter referral code (optional)"
                placeholderTextColor={colors.gray500}
                value={referrer}
                onChangeText={setReferrer}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.checkboxRow}>
              <TouchableOpacity onPress={() => setAcceptTerms(prev => !prev)} style={styles.checkboxButton}>
                <Ionicons
                  name={acceptTerms ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={acceptTerms ? colors.primary : colors.gray500}
                />
              </TouchableOpacity>
              <Text style={styles.checkboxText}>
                I agree to the Gig-Smart Terms of Service and Privacy Policy.
              </Text>
            </View>
            {errors.acceptTerms && <Text style={styles.errorText}>{errors.acceptTerms}</Text>}

            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
              onPress={handleRegister}
              activeOpacity={0.9}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons name="person-add" size={18} color={colors.white} style={styles.buttonIcon} />
                  <Text style={styles.primaryButtonText}>Register</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.85}
            >
              <Ionicons name="log-in" size={16} color={colors.white} style={styles.buttonIcon} />
              <Text style={styles.secondaryButtonText}>Already have an account? Login here</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 140,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  logoText: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.blue200,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: spacing.xl,
    ...shadows.lg,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    height: 56,
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.textDark,
  },
  eyeButton: {
    padding: spacing.xs,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  codeText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.primary,
  },
  refreshButton: {
    padding: spacing.xs,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  checkboxButton: {
    marginTop: 2,
  },
  checkboxText: {
    flex: 1,
    color: colors.gray600,
    fontSize: fontSizes.sm,
    lineHeight: 18,
  },
  primaryButton: {
    marginTop: spacing.xl,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    ...shadows.md,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: spacing.xs,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  secondaryButton: {
    marginTop: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  secondaryButtonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
});

export default RegisterScreen;


// ====== End File: src\screens\auth\RegisterScreen.js ======

// ====== Begin File: src\screens\main\AccountScreen.js ======

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Linking,
  Platform,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/SupabaseAuthContext';
import { useUser } from '../../context/SupabaseUserContext';
import { useApp } from '../../context/AppContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { APP_NAME } from '../../constants/branding';
import InteractiveOnboardingTour from '../../components/InteractiveOnboardingTour';

const AccountScreen = React.memo(({ navigation }) => {
  const { user, signOut } = useAuth();
  const { 
    profile, 
    currentLevel, 
    levels, 
    earningsByPeriod,
    giftCodeEarnings,
    setWithdrawalAccount
  } = useUser();
  const { settings } = useApp();
  
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletAccountType, setWalletAccountType] = useState('');
  const [walletAccountDetails, setWalletAccountDetails] = useState('');
  const [walletPassword, setWalletPassword] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);

  const displayName = profile?.name?.trim?.()
    || profile?.full_name?.trim?.()
    || user?.user_metadata?.name?.trim?.()
    || user?.email?.split?.('@')?.[0]
    || APP_NAME;
  const displayEmail = profile?.email || user?.email || 'Not provided';
  const rawPhone = profile?.phone || profile?.phone_number || user?.user_metadata?.phone || user?.phone;
  const displayPhone = rawPhone?.toString?.().trim() || 'Not provided';

  if (!profile) {
    return (
      <LinearGradient colors={gradients.primary} style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={[styles.header, { justifyContent: 'center' }]}> 
          <Text style={styles.headerTitle}>Loading account...</Text>
        </View>
      </LinearGradient>
    );
  }

  const rechargeBalance = profile?.recharge_wallet ?? 0;
  const incomeBalance = profile?.income_wallet ?? 0;
  const totalEarned = profile?.total_earnings ?? 0;
  const levelInvestment = profile?.level_investment ?? 0;
  const nextLevel = Array.isArray(levels) && currentLevel
    ? levels.find(level => level.id > currentLevel.id && !level.isLocked)
    : null;
  const hasNextLevel = Boolean(nextLevel);

  // Calculate effective date (1 year from account activation)
  const activationDate = profile?.created_at ? new Date(profile.created_at) : new Date();
  const effectiveEndDate = new Date(activationDate);
  effectiveEndDate.setFullYear(effectiveEndDate.getFullYear() + 1);
  
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Use earnings data from context
  const earningsData = {
    yesterday: earningsByPeriod?.yesterday || profile?.yesterday_earnings || 0,
    today: earningsByPeriod?.today || profile?.today_earnings || 0,
    thisWeek: earningsByPeriod?.this_week || profile?.week_earnings || 0,
    thisMonth: earningsByPeriod?.this_month || profile?.month_earnings || 0,
    totalRevenue: earningsByPeriod?.total || profile?.total_earnings || 0,
    referralRebate: earningsByPeriod?.referral_rebate || profile?.referral_rebate_total || 0,
    giftCodeEarnings: giftCodeEarnings?.total || profile?.gift_code_earnings || 0
  };
  
  // Check if wallet is set before withdrawal
  const handleWithdrawalPress = () => {
    if (!profile?.withdrawal_account_type || !profile?.withdrawal_account_details) {
      setShowWalletModal(true);
    } else {
      navigation.navigate('Withdrawal');
    }
  };
  
  // Handle wallet account setup
  const handleWalletSetup = async () => {
    if (!walletAccountType || !walletAccountDetails || !walletPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    const success = await setWithdrawalAccount(walletAccountType, walletAccountDetails, walletPassword);
    if (success) {
      setShowWalletModal(false);
      setWalletAccountType('');
      setWalletAccountDetails('');
      setWalletPassword('');
      navigation.navigate('Withdrawal');
    }
  };

  const handleOnboardingComplete = async (status) => {
    setShowOnboarding(false);
    // Mark onboarding as complete in profile
    if (user) {
      try {
        await supabaseData.updateProfile(user.id, { onboarding_complete: true });
        console.log('Onboarding marked as complete');
      } catch (error) {
        console.error('Error updating onboarding status:', error);
      }
    }
  };

  // Onboarding tour steps for revisiting
  const onboardingSteps = [
    {
      target: '.hero-section',
      content: 'Welcome to GigSmart! Let us show you around the app and help you get started with earning.',
      title: 'Welcome to GigSmart!',
    },
    {
      target: '.live-stats',
      content: 'This is your live stats dashboard showing today\'s earnings and total earned. Keep track of your progress here!',
      title: 'Live Stats Dashboard',
    },
    {
      target: '.wallets-container',
      content: 'You have two wallets - Income Wallet for withdrawals and Recharge Wallet for upgrades.',
      title: 'Your Wallets',
    },
    {
      target: '.menu-grid',
      content: 'Quick access to all features. Tasks, investments, and more!',
      title: 'Quick Access Menu',
    },
    {
      target: '.featured-banks',
      content: 'Explore investment opportunities in our Wealth Fund to grow your earnings.',
      title: 'Investment Opportunities',
    },
    {
      target: '.settings-help',
      content: 'You\'re all set! Start completing tasks and watch your earnings grow. You can always revisit this tour from settings.',
      title: 'Ready to Earn!',
    },
  ];

  // WhatsApp group link
  const whatsappGroupLink = settings?.whatsapp_group_link || 'https://chat.whatsapp.com/DB0Bcayi5YYLROLxEbnjVt';
  const supportMessage = settings?.whatsapp_support_message || `Hello ${APP_NAME} Support, I need assistance with my account.`;
  
  // Generate a random profile image
  const profileImageFallback = `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`;
  const profileImage = profile?.avatar_url || profile?.profile_image_url || profileImageFallback;
  
  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{APP_NAME} Account</Text>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={Platform.OS === 'web' ? { minHeight: '100vh' } : null}
        style={Platform.OS === 'web' ? { flex: 1 } : null}
      >
        {/* Profile Card */}
        <View style={styles.profileCardContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.profileCard}
          >
            <View style={styles.profileSection}>
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
              
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{displayName}</Text>
                <Text style={styles.profileEmail}>{displayEmail}</Text>
                <Text style={styles.profilePhone}>{displayPhone}</Text>
              </View>
            </View>
            
            <View style={styles.levelSection}>
              <View style={styles.levelRow}>
                <Text style={styles.levelLabel}>Current Level:</Text>
                <View style={[styles.levelBadge, { backgroundColor: currentLevel.color }]}>
                  <Text style={styles.levelName}>{currentLevel.name}</Text>
                </View>
              </View>
              
              {hasNextLevel && nextLevel && (
                <TouchableOpacity 
                  style={styles.upgradeButton}
                  onPress={() => navigation.navigate('Upgrade')}
                >
                  <Text style={styles.upgradeButtonText}>Upgrade to {nextLevel.name}</Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.white} />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </View>
        
        {/* Balance Card */}
        <View style={styles.balanceCardContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.balanceCard}
          >
            <Text style={styles.balanceTitle}>Your Balances</Text>
            
            <View style={styles.balancesRow}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceAmount}>KES {profile?.recharge_wallet?.toLocaleString() || '0'}</Text>
                <Text style={styles.balanceType}>Recharge Wallet</Text>
              </View>
              
              <View style={styles.balanceItem}>
                <Text style={styles.balanceAmount}>KES {profile?.income_wallet?.toLocaleString() || '0'}</Text>
                <Text style={styles.balanceType}>Income Wallet</Text>
              </View>
            </View>
            
            <View style={styles.balanceRow}>
              <Text style={styles.balanceStatLabel}>Total Earned:</Text>
              <Text style={styles.balanceAmount}>KES {profile?.total_earnings?.toLocaleString() || '0'}</Text>
            </View>
            
            <View style={styles.balanceRow}>
              <Text style={styles.balanceStatLabel}>Level Investment:</Text>
              <Text style={styles.balanceStat}>KES {levelInvestment.toLocaleString()}</Text>
            </View>
            
            <View style={styles.balanceRow}>
              <Text style={styles.balanceStatLabel}>Effective Date:</Text>
              <Text style={styles.balanceStat}>{formatDate(activationDate)} ~ {formatDate(effectiveEndDate)}</Text>
            </View>
            
            <View style={styles.actionsRow}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.depositButton]}
                onPress={() => navigation.navigate('Recharge')}
              >
                <Ionicons name="add-circle" size={20} color={colors.white} />
                <Text style={styles.actionButtonText}>Recharge</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.withdrawButton]}
                onPress={handleWithdrawalPress}
              >
                <Ionicons name="arrow-down-circle" size={20} color={colors.white} />
                <Text style={styles.actionButtonText}>Withdraw</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.historyButton]}
                onPress={() => navigation.navigate('History')}
              >
                <Ionicons name="time" size={20} color={colors.white} />
                <Text style={styles.actionButtonText}>History</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
        
        {/* Earnings Overview Cards */}
        <View style={styles.earningsContainer}>
          <Text style={styles.sectionTitle}>Earnings Overview</Text>
          
          <View style={styles.earningsGrid}>
            <View style={styles.earningsCard}>
              <LinearGradient colors={[colors.blue500, colors.blue600]} style={styles.earningsCardGradient}>
                <Text style={styles.earningsAmount}>KES {earningsData.yesterday.toLocaleString()}</Text>
                <Text style={styles.earningsLabel}>Yesterday's Earnings</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.earningsCard}>
              <LinearGradient colors={[colors.green, colors.teal]} style={styles.earningsCardGradient}>
                <Text style={styles.earningsAmount}>KES {earningsData.today.toLocaleString()}</Text>
                <Text style={styles.earningsLabel}>Today's Earnings</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.earningsCard}>
              <LinearGradient colors={[colors.purple, colors.deepPurple]} style={styles.earningsCardGradient}>
                <Text style={styles.earningsAmount}>KES {earningsData.thisWeek.toLocaleString()}</Text>
                <Text style={styles.earningsLabel}>This Week's Earnings</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.earningsCard}>
              <LinearGradient colors={[colors.amber, colors.orange]} style={styles.earningsCardGradient}>
                <Text style={styles.earningsAmount}>KES {earningsData.thisMonth.toLocaleString()}</Text>
                <Text style={styles.earningsLabel}>This Month's Earnings</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.earningsCard}>
              <LinearGradient colors={[colors.red, colors.pink]} style={styles.earningsCardGradient}>
                <Text style={styles.earningsAmount}>KES {earningsData.totalRevenue.toLocaleString()}</Text>
                <Text style={styles.earningsLabel}>Total Revenue</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.earningsCard}>
              <LinearGradient colors={[colors.indigo, colors.blue800]} style={styles.earningsCardGradient}>
                <Text style={styles.earningsAmount}>KES {earningsData.referralRebate.toLocaleString()}</Text>
                <Text style={styles.earningsLabel}>Referral Rebate</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.earningsCard}>
              <LinearGradient colors={[colors.cyan, colors.blue400]} style={styles.earningsCardGradient}>
                <Text style={styles.earningsAmount}>KES {earningsData.giftCodeEarnings.toLocaleString()}</Text>
                <Text style={styles.earningsLabel}>Gift Code Earnings</Text>
              </LinearGradient>
            </View>
          </View>
        </View>
        
        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Features</Text>
          
          <View style={styles.featuresGrid}>
            <TouchableOpacity 
              style={styles.featureItem}
              onPress={() => navigation.navigate('SpinWheel')}
            >
              <LinearGradient
                colors={[colors.amber, colors.orange]}
                style={styles.featureIcon}
              >
                <Ionicons name="refresh-circle" size={24} color={colors.white} />
              </LinearGradient>
              <Text style={styles.featureText}>Spin to Win</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.featureItem}
              onPress={openWhatsAppGroup}
            >
              <LinearGradient
                colors={[colors.green, colors.teal]}
                style={styles.featureIcon}
              >
                <Ionicons name="logo-whatsapp" size={24} color={colors.white} />
              </LinearGradient>
              <Text style={styles.featureText}>WhatsApp Group</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.featureItem}
              onPress={() => navigation.navigate('WealthFund')}
            >
              <LinearGradient
                colors={[colors.blue600, colors.blue800]}
                style={styles.featureIcon}
              >
                <Ionicons name="bar-chart" size={24} color={colors.white} />
              </LinearGradient>
              <Text style={styles.featureText}>Investments</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.featureItem}
              onPress={() => navigation.navigate('Team')}
            >
              <LinearGradient
                colors={[colors.purple, colors.deepPurple]}
                style={styles.featureIcon}
              >
                <Ionicons name="people" size={24} color={colors.white} />
              </LinearGradient>
              <Text style={styles.featureText}>My Team</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.featureItem}
              onPress={() => navigation.navigate('PersonalInfo')}
            >
              <LinearGradient
                colors={[colors.blue500, colors.blue700]}
                style={styles.featureIcon}
              >
                <Ionicons name="person-circle" size={24} color={colors.white} />
              </LinearGradient>
              <Text style={styles.featureText}>Personal Information</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.featureItem}
              onPress={() => navigation.navigate('History')}
            >
              <LinearGradient
                colors={[colors.indigo, colors.purple]}
                style={styles.featureIcon}
              >
                <Ionicons name="document-text" size={24} color={colors.white} />
              </LinearGradient>
              <Text style={styles.featureText}>Financial Records</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.featureItem}
              onPress={() => navigation.navigate('TeamReports')}
            >
              <LinearGradient
                colors={[colors.cyan, colors.teal]}
                style={styles.featureIcon}
              >
                <Ionicons name="analytics" size={24} color={colors.white} />
              </LinearGradient>
              <Text style={styles.featureText}>Team Reports</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.featureItem}
              onPress={() => navigation.navigate('RedeemGifts')}
            >
              <LinearGradient
                colors={[colors.pink, colors.red]}
                style={styles.featureIcon}
              >
                <Ionicons name="gift" size={24} color={colors.white} />
              </LinearGradient>
              <Text style={styles.featureText}>Redeem Gifts</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.featureItem}
              onPress={() => navigation.navigate('HelpBook')}
              className="settings-help"
            >
              <LinearGradient
                colors={[colors.orange, colors.amber]}
                style={styles.featureIcon}
              >
                <Ionicons name="help-circle" size={24} color={colors.white} />
              </LinearGradient>
              <Text style={styles.featureText}>Help Book</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.featureItem}
              onPress={() => setShowOnboarding(true)}
            >
              <LinearGradient
                colors={[colors.teal, colors.cyan]}
                style={styles.featureIcon}
              >
                <Ionicons name="school-outline" size={24} color={colors.white} />
              </LinearGradient>
              <Text style={styles.featureText}>App Tour</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* App Info */}
        <View style={styles.appInfoContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.appInfoCard}
          >
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>App Version</Text>
              <Text style={styles.appInfoValue}>1.0.0</Text>
            </View>
            
            <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
              <Ionicons name="log-out" size={18} color={colors.red} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
      
      {/* Interactive Onboarding Tour */}
      <InteractiveOnboardingTour
        run={showOnboarding}
        steps={onboardingSteps}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        onFinish={handleOnboardingComplete}
        scrollToFirstStep={true}
        disableOverlayClose={true}
        locale={{
          last: 'Finish',
          skip: 'Skip Tour',
          next: 'Next',
          back: 'Previous',
          close: 'Close',
        }}
        styles={{
          options: {
            arrowColor: colors.primary,
            backgroundColor: colors.gradientBlue1,
            primaryColor: colors.primary,
            textColor: colors.white,
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: 12,
            padding: spacing.md,
          },
          buttonNext: {
            backgroundColor: colors.primary,
            borderRadius: 8,
          },
          buttonBack: {
            color: colors.blue300,
          },
          buttonClose: {
            color: colors.blue300,
          },
        }}
      />
      
      {/* Wallet Setup Modal */}
      <Modal
        visible={showWalletModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWalletModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Withdrawal Account</Text>
            <Text style={styles.modalDescription}>
              You need to set your withdrawal account details before you can withdraw funds.
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Type</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., MPESA, Bank Account"
                value={walletAccountType}
                onChangeText={setWalletAccountType}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Details</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Phone number, Account number"
                value={walletAccountDetails}
                onChangeText={setWalletAccountDetails}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your password"
                secureTextEntry
                value={walletPassword}
                onChangeText={setWalletPassword}
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowWalletModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleWalletSetup}
              >
                <Text style={styles.confirmButtonText}>Set Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...(Platform.OS === 'web' && { minHeight: '100vh' })
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
  },
  // Profile Card styles
  profileCardContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  profileCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: colors.white,
  },
  profileInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  profileName: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  levelSection: {
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingTop: spacing.md,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  levelLabel: {
    fontSize: fontSizes.md,
    color: colors.blue200,
  },
  levelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 4,
  },
  levelName: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.white,
  },
  levelProgress: {
    marginBottom: spacing.md,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 3,
  },
  upgradeButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.white,
    marginRight: spacing.sm,
  },
  // Balance Card styles
  balanceCardContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  balanceCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  balanceTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  balancesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  balanceItem: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    padding: spacing.md,
    width: '48%',
    alignItems: 'center',
  },
  balanceAmount: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  balanceType: {
    fontSize: fontSizes.xs,
    color: colors.blue300,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  balanceStatLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  balanceStat: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.white,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: spacing.sm,
    flex: 1,
    marginHorizontal: 4,
  },
  depositButton: {
    backgroundColor: colors.green,
  },
  withdrawButton: {
    backgroundColor: colors.blue600,
  },
  historyButton: {
    backgroundColor: colors.purple,
  },
  actionButtonText: {
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: 4,
  },
  // Earnings Overview styles
  earningsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  earningsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  earningsCard: {
    width: '48%',
    marginBottom: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.sm,
  },
  earningsCardGradient: {
    padding: spacing.md,
    alignItems: 'center',
  },
  earningsAmount: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  earningsLabel: {
    fontSize: fontSizes.sm,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  // Features Grid styles
  featuresContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  featureText: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.white,
  },
  // App Info styles
  appInfoContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl * 2, // Extra space for bottom nav
  },
  appInfoCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  appInfoLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  appInfoValue: {
    fontSize: fontSizes.sm,
    color: colors.white,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.red,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  signOutText: {
    fontSize: fontSizes.sm,
    color: colors.red,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
    ...shadows.lg,
  },
  modalTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: fontSizes.sm,
    color: colors.gray600,
    marginBottom: spacing.lg,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: fontSizes.sm,
    color: colors.dark,
    backgroundColor: colors.gray50,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.gray300,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.dark,
  },
  confirmButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.white,
  },
});

export default AccountScreen;


// ====== End File: src\screens\main\AccountScreen.js ======

// ====== Begin File: src\screens\main\DepositScreen.js ======

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../context/SupabaseUserContext';
import { initiateSTKPush, checkPaymentStatus } from '../../services/api';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { useNotification } from '../../context/NotificationContext';
import { APP_SHORT_NAME } from '../../constants/branding';

const DepositScreen = ({ navigation }) => {
  const { profile, addToRechargeWallet } = useUser();
  const { showNotification } = useNotification();
  
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const pollingIntervalRef = useRef(null);
  
  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);
  
  // Preset amounts
  const presetAmounts = [500, 1000, 2000, 5000, 10000];
  
  // Handle preset amount selection
  const handlePresetAmount = (value) => {
    setAmount(value.toString());
  };
  
  // Poll payment status
  const pollPaymentStatus = async (externalRef, depositAmount) => {
    setIsCheckingPayment(true);
    
    const maxAttempts = 20; // Maximum 20 attempts (10 minutes with 30-second intervals)
    let attempts = 0;
    
    const checkStatus = async () => {
      attempts++;
      
      try {
        const result = await checkPaymentStatus(externalRef);
        
        if (result.success) {
          const paymentStatus = result.data?.payment_status?.status?.toLowerCase();
          
          if (paymentStatus === 'success') {
            // Payment successful - clear interval and process
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
            
            await addToRechargeWallet(
              depositAmount,
              `Recharge via M-Pesa (${externalRef})`,
              'RECHARGE'
            );
            
            setIsCheckingPayment(false);
            setIsLoading(false);
            
            showNotification({
              type: 'success',
              title: 'Deposit successful',
              message: `KES ${depositAmount.toLocaleString()} has been added to your recharge wallet.`,
            });
            
            Alert.alert(
              'Recharge Successful',
              `KES ${depositAmount.toLocaleString()} has been added to your recharge wallet.`,
              [
                { 
                  text: 'OK', 
                  onPress: () => navigation.goBack() 
                }
              ]
            );
            
            // Reset form
            setAmount('');
            setPhoneNumber('');
            
          } else if (paymentStatus === 'failed') {
            // Payment failed - clear interval
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
            
            setIsCheckingPayment(false);
            setIsLoading(false);
            
            showNotification({
              type: 'error',
              title: 'Payment failed',
              message: 'The payment was not completed. Please try again.',
            });
            
            Alert.alert(
              'Payment Failed',
              'The payment was not completed. Please try again.',
              [{ text: 'OK' }]
            );
            
          } else if (paymentStatus === 'queued' || paymentStatus === 'pending') {
            // Payment still processing - continue polling
            if (attempts >= maxAttempts) {
              // Max attempts reached - stop polling
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
              }
              
              setIsCheckingPayment(false);
              setIsLoading(false);
              
              showNotification({
                type: 'warning',
                title: 'Payment status unknown',
                message: 'We could not confirm your payment status. Please check your balance later.',
              });
              
              Alert.alert(
                'Payment Status Unknown',
                'We could not confirm your payment status. Please check your balance later or contact support.',
                [{ text: 'OK' }]
              );
            }
          }
        } else {
          // Error checking status
          console.error('Error checking payment status:', result.error);
        }
      } catch (error) {
        console.error('Payment status check error:', error);
      }
    };
    
    // Start polling
    pollingIntervalRef.current = setInterval(checkStatus, 30000); // Check every 30 seconds
    
    // Check immediately once
    checkStatus();
  };
  
  // Handle deposit
  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to recharge.');
      return;
    }
    
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid M-Pesa phone number.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format phone number (remove any spaces and ensure it starts with correct format)
      let formattedPhone = phoneNumber.replace(/\s+/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254' + formattedPhone;
      }
      
      const depositAmount = parseFloat(amount);
      
      // Initiate STK push
      const result = await initiateSTKPush(
        formattedPhone,
        depositAmount,
        `${APP_SHORT_NAME}-Deposit`
      );
      
      if (result.success) {
        // Get the external reference from the response
        const externalRef = result.data?.external_reference;
        
        if (!externalRef) {
          setIsLoading(false);
          Alert.alert(
            'Payment Error',
            'Failed to initiate payment properly. Please try again.',
            [{ text: 'OK' }]
          );
          return;
        }
        
        // Show user that STK push was sent
        Alert.alert(
          'STK Push Sent',
          'Please check your phone and enter your M-Pesa PIN to complete the payment.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Start polling for payment status
                pollPaymentStatus(externalRef, depositAmount);
              }
            }
          ]
        );
      } else {
        setIsLoading(false);
        showNotification({
          type: 'error',
          title: 'Deposit failed',
          message: 'Failed to process your deposit request. Please try again later.',
        });
        Alert.alert(
          'Payment Failed',
          'Failed to process your deposit request. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      setIsLoading(false);
      showNotification({
        type: 'error',
        title: 'Deposit error',
        message: 'An error occurred while processing your deposit request.',
      });
      Alert.alert(
        'Error',
        'An error occurred while processing your deposit request.',
        [{ text: 'OK' }]
      );
    }
  };
  
  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.contentWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              disabled={isLoading}
            >
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Recharge Funds</Text>

            <View style={{ width: 24 }} />
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
          {/* Current Balance */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Recharge Wallet Balance</Text>
            <Text style={styles.balanceValue}>
              KES {profile?.rechargeWallet?.toLocaleString() || '0'}
            </Text>
          </View>
          
          {/* Deposit Form Card */}
          <View style={styles.formContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              style={styles.formCard}
            >
              <Text style={styles.formTitle}>M-Pesa Recharge</Text>
              
              {/* Preset Amounts */}
              <View style={styles.presetAmountsContainer}>
                <Text style={styles.presetLabel}>Quick Select</Text>
                
                <View style={styles.presetGrid}>
                  {presetAmounts.map((presetAmount) => (
                    <TouchableOpacity
                      key={presetAmount}
                      style={[
                        styles.presetButton,
                        amount === presetAmount.toString() && styles.selectedPreset
                      ]}
                      onPress={() => handlePresetAmount(presetAmount)}
                      disabled={isLoading}
                    >
                      <Text 
                        style={[
                          styles.presetButtonText,
                          amount === presetAmount.toString() && styles.selectedPresetText
                        ]}
                      >
                        KES {presetAmount.toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Custom Amount Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Enter Amount</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="KES 1,000"
                  placeholderTextColor={colors.gray500}
                  keyboardType="numeric"
                  editable={!isLoading}
                  autoFocus={false}
                />
              </View>
              
              {/* Phone Number Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>M-Pesa Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="e.g. 07XXXXXXXX"
                  placeholderTextColor={colors.gray500}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                  autoFocus={false}
                />
              </View>
              
              {/* Payment Information */}
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color={colors.blue300} />
                <Text style={styles.infoText}>
                  You will receive an STK push on your phone to complete the payment.
                </Text>
              </View>
              
              {/* Deposit Button */}
              <TouchableOpacity
                style={[
                  styles.depositButton,
                  (!amount || parseFloat(amount) <= 0 || !phoneNumber || isLoading) && 
                  styles.disabledButton
                ]}
                onPress={handleDeposit}
                disabled={!amount || parseFloat(amount) <= 0 || !phoneNumber || isLoading}
              >
                <LinearGradient
                  colors={[colors.green, colors.teal]}
                  style={styles.depositButtonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <>
                      <Text style={styles.depositButtonText}>Recharge Now</Text>
                      <Ionicons name="arrow-forward" size={18} color={colors.white} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
          
          {/* How it Works */}
          <View style={styles.howItWorksContainer}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            
            <View style={styles.stepsContainer}>
              <View style={styles.step}>
                <View style={styles.stepIconContainer}>
                  <Text style={styles.stepNumber}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Enter Amount</Text>
                  <Text style={styles.stepDescription}>
                    Select a preset amount or enter a custom deposit amount.
                  </Text>
                </View>
              </View>
              
              <View style={styles.step}>
                <View style={styles.stepIconContainer}>
                  <Text style={styles.stepNumber}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Provide Phone Number</Text>
                  <Text style={styles.stepDescription}>
                    Enter your M-Pesa registered phone number.
                  </Text>
                </View>
              </View>
              
              <View style={styles.step}>
                <View style={styles.stepIconContainer}>
                  <Text style={styles.stepNumber}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Confirm Payment</Text>
                  <Text style={styles.stepDescription}>
                    Confirm the STK push notification on your phone.
                  </Text>
                </View>
              </View>
              
              <View style={styles.step}>
                <View style={styles.stepIconContainer}>
                  <Text style={styles.stepNumber}>4</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Receive Funds</Text>
                  <Text style={styles.stepDescription}>
                    The amount will be added to your recharge wallet immediately.
                  </Text>
                </View>
              </View>
            </View>
          </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      {(isLoading || isCheckingPayment) && (
        <View style={styles.loadingOverlay}>
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
            style={styles.loadingContainer}
          >
            <ActivityIndicator size="large" color={colors.blue400} />
            <Text style={styles.loadingText}>
              {isCheckingPayment ? 'Checking Payment Status' : 'Processing Payment'}
            </Text>
            <Text style={styles.loadingSubtext}>
              {isCheckingPayment 
                ? 'Please wait while we confirm your payment...'
                : 'Please do not close the app...'
              }
            </Text>
          </LinearGradient>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl * 2, // Extra space for bottom nav
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  // Balance Container styles
  balanceContainer: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  balanceLabel: {
    fontSize: fontSizes.md,
    color: colors.blue200,
    marginBottom: spacing.xs,
  },
  balanceValue: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
  },
  // Form styles
  formContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  formCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  formTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  presetAmountsContainer: {
    marginBottom: spacing.md,
  },
  presetLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    marginBottom: spacing.sm,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  presetButton: {
    width: '48%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  selectedPreset: {
    backgroundColor: 'rgba(40,167,69,0.3)',
    borderColor: colors.green,
    borderWidth: 1,
  },
  presetButtonText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    fontWeight: '500',
  },
  selectedPresetText: {
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: spacing.md,
    color: colors.white,
    fontSize: fontSizes.md,
    pointerEvents: 'auto',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoText: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
    marginLeft: spacing.sm,
    flex: 1,
  },
  depositButton: {
    borderRadius: 10,
    overflow: 'hidden',
    ...shadows.md,
  },
  depositButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  depositButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginRight: spacing.sm,
  },
  disabledButton: {
    opacity: 0.5,
  },
  // How It Works styles
  howItWorksContainer: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  stepsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.sm,
  },
  step: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  stepIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.blue600,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumber: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
  },
  // Loading Overlay styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    width: '80%',
    padding: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: spacing.md,
  },
  loadingSubtext: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
    marginTop: spacing.xs,
  },
});

export default DepositScreen;


// ====== End File: src\screens\main\DepositScreen.js ======

// ====== Begin File: src\screens\main\HelpBookScreen.js ======

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';

const HelpBookScreen = ({ navigation }) => {
  const HelpSection = ({ icon, title, children }) => (
    <View style={styles.helpSection}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={24} color={colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionContent}>{children}</Text>
    </View>
  );

  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Book</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.bookCard}>
          <View style={styles.bookHeader}>
            <Text style={styles.bookTitle}>📘 Help Book</Text>
            <Text style={styles.bookSubtitle}>
              Welcome to the Gig-Smart Help Center! We're glad to have you here and dedicated to ensuring your experience on our platform is smooth, rewarding, and easy to navigate.
            </Text>
            <Text style={styles.bookIntro}>
              Here you'll find everything you need to know about recharging, completing tasks, withdrawing earnings, upgrading job levels, referrals, and getting support.
            </Text>
            <Text style={styles.supportNote}>
              For instant help, tap the Support icon on your Home Page to connect with our live team.
            </Text>
          </View>

          <HelpSection icon="person-add" title="Getting Started">
            Register an Account – Sign up with your phone number and create a secure password.{'\n\n'}
            Log In – Access your dashboard to view your earnings and available tasks.{'\n\n'}
            Recharge & Activate a Job Level – Recharge funds to unlock tasks and start earning daily.
          </HelpSection>

          <HelpSection icon="card" title="How to Recharge Your Account">
            Tap "Recharge" on your dashboard.{'\n\n'}
            Choose your preferred payment method (e.g., M-Pesa).{'\n\n'}
            Enter the amount and confirm the payment.{'\n\n'}
            Wait a few seconds for your balance to update automatically.{'\n\n'}
            💡 Tip: Always verify your account balance after recharging to ensure activation was successful.
          </HelpSection>

          <HelpSection icon="checkmark-circle" title="How to Complete Tasks">
            Tap "Tasks" or "Start" on your homepage.{'\n\n'}
            Download and install the listed apps.{'\n\n'}
            Open each app as instructed.{'\n\n'}
            Once finished, your earnings are automatically credited to your account.{'\n\n'}
            💡 Higher job levels unlock more tasks and higher earnings.
          </HelpSection>

          <HelpSection icon="arrow-up-circle" title="How to Withdraw Earnings">
            Tap "Withdraw" on your dashboard.{'\n\n'}
            Enter the amount you wish to withdraw.{'\n\n'}
            Input your transaction password for security.{'\n\n'}
            Tap "Submit" — your payment will be processed to your registered wallet.{'\n\n'}
            💡 Withdrawals are processed daily during official payout hours.
          </HelpSection>

          <HelpSection icon="trending-up" title="How to Upgrade Job Levels">
            Go to "Job Levels" in your profile.{'\n\n'}
            View available levels and their required deposits.{'\n\n'}
            Choose your preferred level and complete the recharge.{'\n\n'}
            Once confirmed, your level upgrades automatically and new tasks unlock.
          </HelpSection>

          <HelpSection icon="people" title="Referral Program">
            Invite friends and earn extra bonuses!{'\n\n'}
            Share your referral link directly from your dashboard.{'\n\n'}
            When your invitees register and activate, you'll earn referral rewards.{'\n\n'}
            Level 1: 4% of your invitee's recharge.{'\n\n'}
            Level 2: 2% of your team member's recharge.{'\n\n'}
            Level 3: 0.25% of your team member's recharge.{'\n\n'}
            💡 Build your team to increase your overall daily income.
          </HelpSection>

          <HelpSection icon="shield-checkmark" title="Account Security">
            Keep both login and transaction passwords private.{'\n\n'}
            Avoid sharing screenshots that reveal your personal details.{'\n\n'}
            Use a strong password (letters + numbers + symbols).{'\n\n'}
            If you forget your password, tap "Forgot Password" or contact Support.
          </HelpSection>

          <HelpSection icon="build" title="Common Issues & Quick Fixes">
            Payment delay: Wait a few minutes and refresh your dashboard — confirmations may take a moment.{'\n\n'}
            Task not credited: Ensure apps are fully installed and opened once before submitting.{'\n\n'}
            Withdrawal not processing: Check that you meet the withdrawal minimum and entered the correct transaction password.{'\n\n'}
            Account issue or freeze: Contact Support immediately for assistance.
          </HelpSection>

          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Need More Help?</Text>
            <Text style={styles.contactText}>
              Our support team is available 24/7 to assist you with any questions or concerns.
            </Text>
            <TouchableOpacity style={styles.contactButton} onPress={() => {
              // Fetch customer care number from settings (replace with real fetch if needed)
              const number = globalThis.customerCareNumber || '+254712345678';
              const url = `https://wa.me/${number.replace('+', '')}`;
              Linking.openURL(url);
            }}>
              <Ionicons name="chatbubbles" size={20} color={colors.white} />
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: fontSizes.xl, fontWeight: 'bold', color: colors.white },
  placeholder: { width: 40 },
  content: { flex: 1, paddingHorizontal: spacing.lg },
  bookCard: { backgroundColor: colors.white, borderRadius: 24, padding: spacing.xl, marginBottom: spacing.xl, ...shadows.lg },
  bookHeader: { marginBottom: spacing.xl },
  bookTitle: { fontSize: fontSizes.xxl, fontWeight: 'bold', color: colors.textDark, marginBottom: spacing.md },
  bookSubtitle: { fontSize: fontSizes.md, color: colors.gray700, lineHeight: 22, marginBottom: spacing.md },
  bookIntro: { fontSize: fontSizes.md, color: colors.gray600, lineHeight: 22, marginBottom: spacing.md },
  supportNote: { fontSize: fontSizes.sm, color: colors.primary, fontWeight: '600', fontStyle: 'italic' },
  helpSection: { marginBottom: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSizes.lg, fontWeight: 'bold', color: colors.textDark, marginLeft: spacing.sm },
  sectionContent: { fontSize: fontSizes.md, color: colors.gray700, lineHeight: 24, paddingLeft: spacing.xl },
  contactSection: { alignItems: 'center', paddingTop: spacing.lg },
  contactTitle: { fontSize: fontSizes.lg, fontWeight: 'bold', color: colors.textDark, marginBottom: spacing.sm },
  contactText: { fontSize: fontSizes.md, color: colors.gray600, textAlign: 'center', marginBottom: spacing.lg },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    ...shadows.sm,
  },
  contactButtonText: { fontSize: fontSizes.md, fontWeight: 'bold', color: colors.white, marginLeft: spacing.sm },
});

export default HelpBookScreen;


// ====== End File: src\screens\main\HelpBookScreen.js ======

// ====== Begin File: src\screens\main\HistoryScreen.js ======

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Platform,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../context/SupabaseUserContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';

const HistoryScreen = ({ navigation }) => {
  const { profile, transactions } = useUser();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'deposits', 'withdrawals', 'earnings', 'investments'

  const allTransactions = Array.isArray(transactions) ? transactions : [];
  
  // Filter transactions based on active tab
  const getFilteredTransactions = () => {
    switch (activeTab) {
      case 'deposits':
        return allTransactions.filter(tx => tx.type === 'DEPOSIT');
      case 'withdrawals':
        return allTransactions.filter(tx => tx.type === 'WITHDRAWAL');
      case 'earnings':
        return allTransactions.filter(tx => 
          tx.type === 'TASK_EARNING' || 
          tx.type === 'REFERRAL_BONUS' || 
          tx.type === 'REFERRAL_COMMISSION' ||
          tx.type === 'SPIN_WIN' ||
          tx.type === 'GIFT_CODE'
        );
      case 'investments':
        return allTransactions.filter(tx => tx.type === 'INVESTMENT' || tx.type === 'INVESTMENT_RETURN');
      default:
        return allTransactions;
    }
  };
  
  const filteredTransactions = getFilteredTransactions();
  
  // Tab item component
  const TabItem = ({ name, label, icon }) => {
    const isActive = activeTab === name;
    
    return (
      <TouchableOpacity
        style={[styles.tab, isActive && styles.activeTab]}
        onPress={() => setActiveTab(name)}
      >
        <Ionicons 
          name={icon} 
          size={16} 
          color={isActive ? colors.white : colors.blue300} 
        />
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Get icon and color based on transaction type
  const getTransactionIconAndColor = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return { icon: 'arrow-down', color: colors.green };
      case 'WITHDRAWAL':
        return { icon: 'arrow-up', color: colors.red };
      case 'TASK_EARNING':
        return { icon: 'checkbox', color: colors.blue600 };
      case 'REFERRAL_COMMISSION':
        return { icon: 'people', color: colors.purple };
      case 'INVESTMENT':
        return { icon: 'trending-up', color: colors.teal };
      case 'INVESTMENT_RETURN':
        return { icon: 'cash', color: colors.amber };
      case 'LEVEL_PURCHASE':
        return { icon: 'star', color: colors.orange };
      case 'SPIN_BET':
        return { icon: 'refresh-circle', color: colors.pink };
      case 'TRANSFER':
        return { icon: 'swap-horizontal', color: colors.indigo };
      default:
        return { icon: 'ellipsis-horizontal', color: colors.gray600 };
    }
  };
  
  // Render transaction item
  const renderTransactionItem = ({ item }) => {
    const { icon, color } = getTransactionIconAndColor(item.type);
    const isPositive = item.netAmount ?? item.amount > 0;
    const displayAmount = (item.netAmount ?? item.amount ?? 0).toLocaleString();
    const description = item.description || 'No description';
    const timestamp = item.timestamp || new Date().toISOString();
    
    return (
      <View style={styles.transactionItem}>
        <View style={[styles.transactionIconContainer, { backgroundColor: color }]}>
          <Ionicons name={icon} size={20} color={colors.white} />
        </View>
        
        <View style={styles.transactionInfo}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionType}>{item.type.replace(/_/g, ' ')}</Text>
            <Text 
              style={[
                styles.transactionAmount,
                isPositive ? styles.positiveAmount : styles.negativeAmount
              ]}
            >
              {isPositive ? '+' : ''}{displayAmount} KES
            </Text>
          </View>
          
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionDescription}>{description}</Text>
            <Text style={styles.transactionDate}>{formatDate(timestamp)}</Text>
          </View>
        </View>
      </View>
    );
  };
  
  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="document-text-outline" size={60} color={colors.blue300} />
      <Text style={styles.emptyStateTitle}>No Transactions Found</Text>
      <Text style={styles.emptyStateText}>
        Transactions matching your current filter will appear here.
      </Text>
    </View>
  );
  
  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Transaction History</Text>
        
        <View style={{ width: 24 }} />
      </View>
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollableTabs>
          <TabItem name="all" label="All" icon="list-outline" />
          <TabItem name="deposits" label="Deposits" icon="arrow-down-outline" />
          <TabItem name="withdrawals" label="Withdrawals" icon="arrow-up-outline" />
          <TabItem name="earnings" label="Earnings" icon="cash-outline" />
          <TabItem name="investments" label="Investments" icon="trending-up-outline" />
        </ScrollableTabs>
      </View>
      
      {/* Transaction List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<EmptyState />}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
};

// Scrollable tabs component
const ScrollableTabs = ({ children }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.scrollableTabs}
  >
    {React.Children.toArray(children).map(child => child)}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  // Tabs styles
  tabsContainer: {
    marginBottom: spacing.md,
  },
  scrollableTabs: {
    paddingHorizontal: spacing.lg,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabText: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
    marginLeft: 4,
  },
  activeTabText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  // List styles
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl * 2, // Extra space for bottom nav
  },
  transactionItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionType: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  transactionAmount: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  positiveAmount: {
    color: colors.green,
  },
  negativeAmount: {
    color: colors.red,
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionDescription: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    flex: 1,
    marginRight: spacing.sm,
  },
  transactionDate: {
    fontSize: fontSizes.xs,
    color: colors.blue300,
  },
  // Empty state styles
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: fontSizes.md,
    color: colors.blue300,
    textAlign: 'center',
  },
});

export default HistoryScreen;


// ====== End File: src\screens\main\HistoryScreen.js ======

// ====== Begin File: src\screens\main\HomeScreen.js ======

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Platform,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/SupabaseAuthContext';
import { useUser } from '../../context/SupabaseUserContext';
import { useApp } from '../../context/AppContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import UpgradePrompt from '../../components/UpgradePrompt';
import SpinWheel from '../../components/SpinWheel';
import InteractiveOnboardingTour from '../../components/InteractiveOnboardingTour';
import { APP_NAME } from '../../constants/branding';
import supabaseData from '../../services/supabaseData';


const HomeScreen = React.memo(({ navigation }) => {
  const { user } = useAuth();
  const {
    profile,
    currentLevel,
    levels,
    taskProgressToday,
    hasCheckedInToday,
    performDailyCheckIn,
    logActivity
  } = useUser();
  const { settings } = useApp();
  const [currentTime] = useState(new Date());
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [news, setNews] = useState([]);



  // Check if user should see onboarding tour
  useEffect(() => {
    if (profile && !profile?.onboardingComplete) {
      setShowOnboarding(true);
    }
  }, [profile]);

  // Onboarding tour steps
  const onboardingSteps = [
    {
      target: '.hero-section',
      content: 'Welcome to GigSmart! Let us show you around the app and help you get started with earning.',
      title: 'Welcome to GigSmart!',
    },
    {
      target: '.live-stats',
      content: 'This is your live stats dashboard showing today\'s earnings and total earned. Keep track of your progress here!',
      title: 'Live Stats Dashboard',
    },
    {
      target: '.wallets-container',
      content: 'You have two wallets - Income Wallet for withdrawals and Recharge Wallet for upgrades.',
      title: 'Your Wallets',
    },
    {
      target: '.menu-grid',
      content: 'Quick access to all features. Tasks, investments, and more!',
      title: 'Quick Access Menu',
    },
    {
      target: '.featured-banks',
      content: 'Explore investment opportunities in our Wealth Fund to grow your earnings.',
      title: 'Investment Opportunities',
    },
    {
      target: '.settings-help',
      content: 'You\'re all set! Start completing tasks and watch your earnings grow. You can always revisit this tour from settings.',
      title: 'Ready to Earn!',
    },
  ];

  // Handle onboarding completion
  const handleOnboardingComplete = async (status) => {
    setShowOnboarding(false);
    // Mark onboarding as complete in profile
    if (user) {
      try {
        await supabaseData.updateProfile(user.id, { onboarding_complete: true });
        console.log('Onboarding marked as complete');
      } catch (error) {
        console.error('Error updating onboarding status:', error);
      }
    }
  };

  // Log activity when screen loads
  useEffect(() => {
    if (user) {
      logActivity('screen_view', { screen: 'home' });
    }
  }, [user, logActivity]);

  // Navigation to WhatsApp group
  const whatsappGroupLink = settings?.whatsapp_group_link || 'https://chat.whatsapp.com/mock-group-link';

  const openWhatsAppGroup = () => {
    if (!whatsappGroupLink) {
      Alert.alert('Unavailable', 'The WhatsApp group link is not configured yet.');
      return;
    }
    Linking.canOpenURL(whatsappGroupLink).then(supported => {
      if (supported) {
        Linking.openURL(whatsappGroupLink);
      } else {
        Alert.alert('Error', "Unable to open the WhatsApp group link.");
      }
    });
  };

  // Menu items for the grid
  const menuItems = [
    {
      id: 'wealth-fund',
      title: 'Wealth Fund',
      icon: 'wallet-outline',
      screen: 'WealthFund',
      color: colors.deepPurple
    },
    {
      id: 'recharge',
      title: 'Recharge',
      icon: 'arrow-down-outline',
      screen: 'Recharge',
      color: colors.green
    },
    {
      id: 'withdraw',
      title: 'Withdraw',
      icon: 'arrow-up-outline',
      screen: 'Withdrawal',
      color: colors.orange
    },
    {
      id: 'history',
      title: 'Transaction History',
      icon: 'time-outline',
      screen: 'History',
      color: colors.teal
    },
    {
      id: 'tasks',
      title: 'Daily Tasks',
      icon: 'checkbox-outline',
      screen: 'Task',
      color: colors.lightBlue
    },
    {
      id: 'team',
      title: 'My Team',
      icon: 'people-outline',
      screen: 'Team',
      color: colors.indigo
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Group',
      icon: 'logo-whatsapp',
      onPress: openWhatsAppGroup,
      color: colors.green
    },
    {
      id: 'redeem-gifts',
      title: 'Redeem Gifts',
      icon: 'gift-outline',
      screen: 'RedeemGifts',
      color: colors.pink
    }
  ];

  // Banks for the carousel
  const [banks, setBanks] = useState([]);
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data } = await supabaseData.getInvestmentBanks();
        if (isMounted && Array.isArray(data)) {
          const sanitized = data.map((bank) => {
            const iconName = bank.icon && Ionicons.glyphMap?.[bank.icon]
              ? bank.icon
              : 'business-outline';
            return { ...bank, icon: iconName };
          });
          setBanks(sanitized);
        }
      } catch (error) {
        console.error('Failed to load investment banks:', error);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch news/notifications for Home
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const levelId = currentLevel?.id ?? profile?.currentLevelId ?? 0;
        const { data } = await supabaseData.getNotifications('home', levelId);
        if (mounted && Array.isArray(data)) {
          setNews(data);
        }
      } catch (e) {
        console.error('Failed to load news:', e);
      }
    })();
    return () => { mounted = false; };
  }, [currentLevel, profile]);

  const handleMenuPress = (item) => {
    if (item.onPress) {
      item.onPress();
    } else if (item.screen) {
      // Handle nested navigation for Account stack screens
      if (['Withdrawal', 'History', 'Recharge'].includes(item.screen)) {
        navigation.navigate('Account', {
          screen: item.screen,
          params: { origin: 'Home' }
        });
      } else {
        navigation.navigate(item.screen);
      }
    }
  };

  const handleUpgradePress = () => {
    if (nextLevel) {
      navigation.navigate('UpgradeDetail', { level: nextLevel });
    }
    setShowUpgradePrompt(false);
  };

  const handleDismissUpgrade = () => {
    setShowUpgradePrompt(false);
  };

  const displayName = profile?.name?.trim?.()
    || profile?.full_name?.trim?.()
    || user?.user_metadata?.name?.trim?.()
    || user?.email?.split?.('@')?.[0]
    || APP_NAME;
  const heroSubtitle = `${APP_NAME} · ${currentLevel?.name || 'Member'}`;
  const tasksCompletedToday = (taskProgressToday?.completed_tasks || profile?.tasksCompletedToday) ?? (profile?.tasks_completed_today ?? 0);
  const dailyTaskLimit = (taskProgressToday?.daily_limit || currentLevel?.tasks) ?? 0;
  const taskProgressPercent = dailyTaskLimit > 0
    ? Math.min((tasksCompletedToday / dailyTaskLimit) * 100, 100)
    : 0;
  const taskProgressLabel = dailyTaskLimit > 0
    ? `${tasksCompletedToday}/${dailyTaskLimit} tasks`
    : 'No tasks available';
  const dailyEarnings = (taskProgressToday?.today_earnings || profile?.todayEarnings) ?? (profile?.today_earnings ?? 0);
  const earningsPerTask = currentLevel?.earningsPerTask ?? 0;
  const nextLevel = useMemo(() => {
    if (!Array.isArray(levels) || !currentLevel) return null;
    return levels.find(level => level.id > currentLevel.id && !level.isLocked);
  }, [levels, currentLevel]);
  const incomeWalletBalance = profile?.incomeWallet ?? profile?.income_wallet ?? 0;
  const rechargeWalletBalance = profile?.rechargeWallet ?? profile?.recharge_wallet ?? 0;


  const supportNumberRaw = settings?.whatsapp_support_number || '+254712345678';
  const supportMessage = settings?.whatsapp_support_message || `Hello ${APP_NAME} Support, I need assistance with my account.`;

  const openCustomerCareWhatsApp = () => {
    if (!supportNumberRaw) {
      Alert.alert('Unavailable', 'Customer care contact is not configured yet.');
      return;
    }

    const sanitizedNumber = supportNumberRaw.replace(/[^0-9+]/g, '');
    const fallbackDigits = sanitizedNumber.replace(/[^0-9]/g, '');
    const encodedMessage = encodeURIComponent(supportMessage);
    const whatsappUrl = `whatsapp://send?phone=${sanitizedNumber}&text=${encodedMessage}`;

    Linking.openURL(whatsappUrl).catch(() => {
      const webUrl = fallbackDigits
        ? `https://wa.me/${fallbackDigits}?text=${encodedMessage}`
        : null;
      if (webUrl) {
        Linking.openURL(webUrl).catch(() => {
          Alert.alert('Error', 'Could not open WhatsApp. Please contact support directly.');
        });
      } else {
        Alert.alert('Error', 'Could not open WhatsApp. Please contact support directly.');
      }
    });
  };


  return (
    <LinearGradient
      colors={gradients.primary}
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section (Top 1/3) */}
        <View style={styles.heroSection} className="hero-section">
          {/* User Info */}
          <View style={styles.userInfoContainer}>
            <View>
              <Text style={styles.welcomeText}>Welcome Back,</Text>
              <Text style={styles.nameText}>{displayName}</Text>
              <Text style={styles.subtitleText}>{heroSubtitle}</Text>
              <View style={styles.levelBadge}>
                <Ionicons name="shield-checkmark-outline" size={14} color={colors.white} />
                <Text style={styles.levelText}>{currentLevel?.name || 'Member'} Level</Text>
              </View>
            </View>

            <View style={styles.brandContainer}>
              <Text style={styles.brandText}>GigSmart</Text>
              <LinearGradient
                colors={[colors.primary, colors.secondary, colors.accent1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.balanceBadge}
              >
                <Text style={styles.balanceLabel}>KES</Text>
                <View style={styles.sparkleContainer}>
                  <Text style={styles.sparkle}>✨</Text>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Live Stats */}
          <View style={styles.liveStatsContainer} className="live-stats">
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.2)']}
              style={styles.liveStatsCard}
            >
              <View style={styles.statsHeader}>
                <Ionicons name="pulse" size={16} color={colors.green} />
                <Text style={styles.liveLabel}>LIVE</Text>
                <Text style={styles.timeLabel}>{currentTime.toLocaleTimeString()}</Text>
              </View>

              <View style={styles.statsContent}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Today&apos;s Earnings</Text>
                  <Text style={styles.statNumber}>KES {dailyEarnings.toLocaleString()}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total Earned</Text>
                  <Text style={styles.statNumber}>KES {(profile?.totalEarned ?? profile?.total_earnings ?? 0).toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.heroProgressBar}>
                <View style={styles.heroProgressTrack}>
                  <View style={[styles.heroProgressFill, { width: `${taskProgressPercent}%` }]} />
                </View>
                <Text style={styles.heroProgressLabel}>{taskProgressLabel}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Polished Wallet Cards */}
          <View style={[styles.walletsContainer, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]} className="wallets-container">
            {/* Income Wallet Card */}
            <LinearGradient
              colors={[colors.primary, colors.green, colors.accent2]}
              start={{ x: 0.1, y: 0.1 }}
              end={{ x: 1, y: 1 }}
              style={[styles.walletCard, styles.incomeWalletCard, styles.polishedCardShadow, { width: '48%', minWidth: 160, maxWidth: 200, minHeight: 120 }]}
            >
              <View style={styles.walletHeaderRow}>
                <View style={[styles.walletIconBadge, { backgroundColor: 'rgba(255,255,255,0.18)' }]}> 
                  <Ionicons name="checkbox-outline" size={22} color={colors.white} />
                </View>
                <Text style={styles.walletTitle}>Income Wallet</Text>
              </View>
              <Text style={styles.walletBalance}>KES {incomeWalletBalance.toLocaleString()}</Text>
              <Text style={styles.walletDesc}>Available to withdraw</Text>
              <View style={styles.walletFooterRow}>
                <View style={styles.metaPill}>
                  <Ionicons name="calendar-outline" size={14} color={colors.white} />
                  <Text style={styles.metaPillText}>{taskProgressLabel}</Text>
                </View>
              </View>
            </LinearGradient>
            {/* Recharge Wallet Card */}
            <LinearGradient
              colors={[colors.blue600, colors.blue300, colors.cyan]}
              start={{ x: 0.1, y: 0.1 }}
              end={{ x: 1, y: 1 }}
              style={[styles.walletCard, styles.rechargeWalletCard, styles.polishedCardShadow, { width: '48%', minWidth: 160, maxWidth: 200, minHeight: 120 }]}
            >
              <View style={styles.walletHeaderRow}>
                <View style={[styles.walletIconBadge, { backgroundColor: 'rgba(255,255,255,0.18)' }]}> 
                  <Ionicons name="wallet-outline" size={22} color={colors.white} />
                </View>
                <Text style={styles.walletTitle}>Recharge Wallet</Text>
              </View>
              <Text style={styles.walletBalance}>KES {rechargeWalletBalance.toLocaleString()}</Text>
              <Text style={styles.walletDesc}>Upgrade funds only</Text>
              <View style={styles.walletFooterRow}>
                <TouchableOpacity
                  style={[styles.metaPill, styles.addFundsPill]}
                  onPress={() => navigation.navigate('Account', { screen: 'Recharge', params: { origin: 'Home' } })}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={16} color={colors.white} />
                  <Text style={styles.metaPillText}>Add Funds</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

        </View>

        {/* Menu Grid (Middle 1/3) */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Quick Access</Text>

          <View style={styles.menuGrid} className="menu-grid">
            {menuItems.map((item) => (
              <View key={item.id} style={styles.menuItem}>
                <TouchableOpacity
                  style={styles.menuItemTouchable}
                  onPress={() => handleMenuPress(item)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)']}
                    style={styles.menuItemInner}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: item.color }]}> 
                      <Ionicons name={item.icon} size={24} color={colors.white} />
                    </View>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Featured Banks Carousel (Bottom 1/3) */}
        {/* News & Updates */}
        {news.length > 0 && (
          <View style={[styles.banksSection, { marginBottom: spacing.lg }]}> 
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>News & Updates</Text>
            </View>
            <View>
              {news.map((item) => (
                <View key={item.id} style={{ marginBottom: spacing.sm }}>
                  <LinearGradient colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']} style={{ borderRadius: 12, padding: spacing.md }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <Ionicons name="megaphone-outline" size={16} color={colors.blue300} />
                      <Text style={{ color: colors.white, fontWeight: 'bold', marginLeft: 6 }}>{item.heading || item.title || item.header || 'Update'}</Text>
                    </View>
                    <Text style={{ color: colors.blue100, fontSize: fontSizes.sm }}>
                      {item.content || item.message || item.body || item.description || ''}
                    </Text>
                  </LinearGradient>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Featured Banks Carousel (Bottom 1/3) */}
        <View style={styles.banksSection} className="featured-banks">
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Investment Options</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('WealthFund')}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.blue300} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.banksScrollContent}
          >
            {banks.slice(0, 4).map((bank, index) => (
              <TouchableOpacity
                key={bank.id}
                style={styles.bankCard}
                onPress={() => navigation.navigate('WealthFund')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                  style={styles.bankCardInner}
                >
                  <View style={[styles.bankIconContainer, { backgroundColor: bank.color }]}> 
                    <Ionicons name="business-outline" size={24} color={colors.white} />
                  </View>

                  <Text style={styles.bankName}>{bank.name}</Text>

                  <View style={styles.bankDetails}>
                    <View style={styles.bankDetailItem}>
                      <Text style={styles.bankDetailLabel}>Daily Rate</Text>
                      <Text style={styles.bankDetailValue}>{bank.rate}%</Text>
                    </View>

                    <View style={styles.bankDetailItem}>
                      <Text style={styles.bankDetailLabel}>Period</Text>
                      <Text style={styles.bankDetailValue}>{bank.days} days</Text>
                    </View>

                    <View style={styles.bankDetailItem}>
                      <Text style={styles.bankDetailLabel}>Min Amount</Text>
                      <Text style={styles.bankDetailValue}>KES {bank.minAmount}</Text>
                    </View>
                  </View>

                  <View style={styles.investNowButton}>
                    <Text style={styles.investNowText}>Invest Now</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.paginationContainer}>
            {banks.slice(0, 4).map((_, index) => (
              <View
                key={`dot-${index}`}
                style={styles.paginationDot}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Upgrade Prompt */}
      <UpgradePrompt
        visible={showUpgradePrompt}
        onUpgrade={handleUpgradePress}
        onDismiss={handleDismissUpgrade}
        nextLevel={nextLevel}
      />

      {/* Spin Wheel Modal */}
      <SpinWheel
        visible={showSpinWheel}
        onClose={() => setShowSpinWheel(false)}
      />

      {/* Interactive Onboarding Tour */}
      <InteractiveOnboardingTour
        run={showOnboarding}
        steps={onboardingSteps}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        onFinish={handleOnboardingComplete}
        scrollToFirstStep={true}
        disableOverlayClose={true}
        locale={{
          last: 'Finish',
          skip: 'Skip Tour',
          next: 'Next',
          back: 'Previous',
          close: 'Close',
        }}
        styles={{
          options: {
            arrowColor: colors.primary,
            backgroundColor: colors.gradientBlue1,
            primaryColor: colors.primary,
            textColor: colors.white,
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: 12,
            padding: spacing.md,
          },
          buttonNext: {
            backgroundColor: colors.primary,
            borderRadius: 8,
          },
          buttonBack: {
            color: colors.blue300,
          },
          buttonClose: {
            color: colors.blue300,
          },
        }}
      />

      {/* Customer Care WhatsApp Button */}
      <TouchableOpacity
        style={styles.customerCareButton}
        onPress={openCustomerCareWhatsApp}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.green, colors.success]}
          style={styles.customerCareInner}
        >
          <Ionicons name="logo-whatsapp" size={24} color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...(Platform.OS === 'web' && { minHeight: '100vh' })
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: spacing.xl,
  },
  // Hero Section Styles
  heroSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  userInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  welcomeText: {
    fontSize: fontSizes.md,
    color: colors.blue100,
    marginBottom: spacing.xs,
  },
  nameText: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitleText: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  levelText: {
    marginLeft: spacing.xs,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.white,
  },
  brandContainer: {
    alignItems: 'flex-end',
  },
  brandText: {
    fontSize: fontSizes.sm,
    color: colors.blue100,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  heroProgressBar: {
    marginTop: spacing.md,
  },
  heroProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: '100%',
    backgroundColor: colors.green,
  },
  heroProgressLabel: {
    marginTop: spacing.xs,
    fontSize: fontSizes.xs,
    color: colors.blue100,
    fontWeight: '600',
  },
  // Live Stats Styles
  liveStatsContainer: {
    marginBottom: spacing.md,
  },
  liveStatsCard: {
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.sm,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  liveLabel: {
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
    color: colors.green,
    marginLeft: spacing.xs,
  },
  timeLabel: {
    fontSize: fontSizes.xs,
    color: colors.blue200,
    marginLeft: 'auto',
  },
  statsContent: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    marginRight: spacing.md,
  },
  statNumber: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    color: colors.blue200,
  },
  // Menu Grid Styles
  menuSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  menuItem: {
    width: '48%',
    marginBottom: spacing.md,
    minHeight: 100,
  },
  menuItemTouchable: {
    width: '100%',
    height: '100%',
  },
  menuItemInner: {
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.sm,
  },
  menuItemGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  menuItemText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
  // Banks Carousel Styles
  banksSection: {
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
    fontWeight: '600',
  },
  banksScrollContent: {
    paddingBottom: spacing.md,
  },
  bankCard: {
    width: 300,
    marginRight: spacing.lg,
  },
  bankCardInner: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  bankIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  bankName: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  bankDetails: {
    marginBottom: spacing.md,
  },
  bankDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  bankDetailLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  bankDetailValue: {
    fontSize: fontSizes.sm,
    color: colors.white,
    fontWeight: '600',
  },
  investNowButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  investNowText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
    marginHorizontal: 4,
  },
  customerCareButton: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    ...shadows.lg,
    zIndex: 100,
  },
  customerCareInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;


// ====== End File: src\screens\main\HomeScreen.js ======

// ====== Begin File: src\screens\main\PersonalInfoScreen.js ======

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  StatusBar,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/SupabaseAuthContext';
import { useUser } from '../../context/SupabaseUserContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { APP_NAME } from '../../constants/branding';

const PersonalInfoScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { profile, updateWithdrawalAccount, loadUserData } = useUser();

  const displayName = profile?.name?.trim?.()
    || profile?.full_name?.trim?.()
    || user?.user_metadata?.name?.trim?.()
    || user?.email?.split?.('@')?.[0]
    || APP_NAME;
  const displayEmail = profile?.email || user?.email || 'Not provided';
  const rawPhone = profile?.phone || profile?.phone_number || user?.user_metadata?.phone || user?.phone;
  const displayPhone = rawPhone?.toString?.().trim() || 'Not provided';
  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown';
  
  // Form states
  const [accountType, setAccountType] = useState(profile?.withdrawalAccountType || 'mpesa');
  const [withdrawalPassword, setWithdrawalPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSettingWallet, setIsSettingWallet] = useState(false);
  const storedAccountDetails = profile?.withdrawalAccountDetails;
  const storedAccountDisplay = storedAccountDetails?.display;
  const [showPasswordForm, setShowPasswordForm] = useState(!storedAccountDisplay);
  
  // Payment method specific states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [tillNumber, setTillNumber] = useState('');
  const [paybillNumber, setPaybillNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [banks, setBanks] = useState([]);

  const accountTypes = [
    { id: 'mpesa', label: 'M-Pesa', icon: 'phone-portrait', color: '#00A651' },
    { id: 'airtel_money', label: 'Airtel Money', icon: 'phone-portrait', color: '#FF0000' },
    { id: 'till', label: 'Till Number', icon: 'business', color: '#1976D2' },
    { id: 'paybill', label: 'Paybill', icon: 'receipt', color: '#FF9800' },
    { id: 'bank', label: 'Bank Account', icon: 'card', color: '#4CAF50' },
  ];

  // Kenyan banks data
  const kenyanBanks = [
    { id: 'kcb', name: 'Kenya Commercial Bank (KCB)', paybill: '522522' },
    { id: 'equity', name: 'Equity Bank', paybill: '247247' },
    { id: 'coop', name: 'Cooperative Bank', paybill: '400200' },
    { id: 'ncba', name: 'NCBA Bank', paybill: '228228' },
    { id: 'absa', name: 'Absa Bank Kenya', paybill: '303030' },
    { id: 'scb', name: 'Standard Chartered Bank', paybill: '329329' },
    { id: 'dtb', name: 'Diamond Trust Bank (DTB)', paybill: '521325' },
    { id: 'im', name: 'I&M Bank', paybill: '141414' },
    { id: 'stanbic', name: 'Stanbic Bank', paybill: '909090' },
    { id: 'family', name: 'Family Bank', paybill: '222111' },
    { id: 'sidian', name: 'Sidian Bank', paybill: '323232' },
    { id: 'boa', name: 'Bank of Africa', paybill: '888880' },
    { id: 'prime', name: 'Prime Bank', paybill: '525252' },
    { id: 'gab', name: 'Gulf African Bank', paybill: '444222' },
    { id: 'credit', name: 'Credit Bank', paybill: '555666' },
  ];

  useEffect(() => {
    setBanks(kenyanBanks);
  }, []);

  const validateAccountDetails = () => {
    switch (accountType) {
      case 'mpesa':
      case 'airtel_money':
        if (!phoneNumber.trim() || phoneNumber.length < 10) {
          Alert.alert('Error', 'Please enter a valid phone number');
          return false;
        }
        break;
      case 'till':
        if (!tillNumber.trim() || tillNumber.length < 5) {
          Alert.alert('Error', 'Please enter a valid till number');
          return false;
        }
        break;
      case 'paybill':
        if (!paybillNumber.trim() || !accountNumber.trim()) {
          Alert.alert('Error', 'Please enter both paybill number and account number');
          return false;
        }
        break;
      case 'bank':
        if (!selectedBank || !accountNumber.trim()) {
          Alert.alert('Error', 'Please select a bank and enter account number');
          return false;
        }
        break;
      default:
        return false;
    }
    return true;
  };

  const getAccountDetails = () => {
    switch (accountType) {
      case 'mpesa':
        return {
          type: 'mpesa',
          phone_number: phoneNumber,
          display: `M-Pesa: ${phoneNumber}`
        };
      case 'airtel_money':
        return {
          type: 'airtel_money',
          phone_number: phoneNumber,
          display: `Airtel Money: ${phoneNumber}`
        };
      case 'till':
        return {
          type: 'till',
          till_number: tillNumber,
          display: `Till: ${tillNumber}`
        };
      case 'paybill':
        return {
          type: 'paybill',
          paybill_number: paybillNumber,
          account_number: accountNumber,
          display: `Paybill: ${paybillNumber} - Acc: ${accountNumber}`
        };
      case 'bank':
        return {
          type: 'bank',
          bank_name: selectedBank.name,
          bank_code: selectedBank.id,
          paybill_number: selectedBank.paybill,
          account_number: accountNumber,
          display: `${selectedBank.name} - Acc: ${accountNumber}`
        };
      default:
        return null;
    }
  };

  const handleSetWithdrawalWallet = async () => {
    if (!validateAccountDetails()) {
      return;
    }

    if (!withdrawalPassword || withdrawalPassword.length < 6) {
      Alert.alert('Error', 'Withdrawal password must be at least 6 characters');
      return;
    }

    if (withdrawalPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const accountDetails = getAccountDetails();
    if (!accountDetails) {
      Alert.alert('Error', 'Could not determine account details. Please review your inputs.');
      return;
    }

    setIsSettingWallet(true);
    try {
      const success = await updateWithdrawalAccount(accountType, accountDetails, withdrawalPassword);
      if (success) {
        await loadUserData();
        setShowPasswordForm(false);
        setWithdrawalPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', 'Failed to set withdrawal wallet. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to set withdrawal wallet. Please try again.');
    } finally {
      setIsSettingWallet(false);
    }
  };

  const renderAccountTypeFields = () => {
    switch (accountType) {
      case 'mpesa':
        return (
          <View>
            <Text style={styles.inputLabel}>M-Pesa Phone Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="phone-portrait" size={20} color="#00A651" />
              <TextInput
                style={styles.input}
                placeholder="0712345678"
                placeholderTextColor={colors.gray500}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            <Text style={styles.helperText}>Enter your M-Pesa registered phone number</Text>
          </View>
        );

      case 'airtel_money':
        return (
          <View>
            <Text style={styles.inputLabel}>Airtel Money Phone Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="phone-portrait" size={20} color="#FF0000" />
              <TextInput
                style={styles.input}
                placeholder="0712345678"
                placeholderTextColor={colors.gray500}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            <Text style={styles.helperText}>Enter your Airtel Money registered phone number</Text>
          </View>
        );

      case 'till':
        return (
          <View>
            <Text style={styles.inputLabel}>Till Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="business" size={20} color="#1976D2" />
              <TextInput
                style={styles.input}
                placeholder="123456"
                placeholderTextColor={colors.gray500}
                value={tillNumber}
                onChangeText={setTillNumber}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
            <Text style={styles.helperText}>Enter the till number for payments</Text>
          </View>
        );

      case 'paybill':
        return (
          <View>
            <Text style={styles.inputLabel}>Paybill Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="receipt" size={20} color="#FF9800" />
              <TextInput
                style={styles.input}
                placeholder="123456"
                placeholderTextColor={colors.gray500}
                value={paybillNumber}
                onChangeText={setPaybillNumber}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
            
            <Text style={styles.inputLabel}>Account Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="card" size={20} color="#FF9800" />
              <TextInput
                style={styles.input}
                placeholder="Account Number"
                placeholderTextColor={colors.gray500}
                value={accountNumber}
                onChangeText={setAccountNumber}
                maxLength={20}
              />
            </View>
            <Text style={styles.helperText}>Enter paybill number and your account number</Text>
          </View>
        );

      case 'bank':
        return (
          <View>
            <Text style={styles.inputLabel}>Select Bank</Text>
            <TouchableOpacity
              style={styles.bankSelector}
              onPress={() => setShowBankModal(true)}
            >
              <Ionicons name="card" size={20} color="#4CAF50" />
              <Text style={[styles.bankSelectorText, !selectedBank && styles.placeholderText]}>
                {selectedBank ? selectedBank.name : 'Select your bank'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.gray500} />
            </TouchableOpacity>
            
            {selectedBank && (
              <View style={styles.bankInfo}>
                <Text style={styles.bankInfoText}>
                  Paybill: {selectedBank.paybill}
                </Text>
              </View>
            )}
            
            <Text style={styles.inputLabel}>Account Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="card" size={20} color="#4CAF50" />
              <TextInput
                style={styles.input}
                placeholder="Enter your account number"
                placeholderTextColor={colors.gray500}
                value={accountNumber}
                onChangeText={setAccountNumber}
                maxLength={20}
              />
            </View>
            <Text style={styles.helperText}>
              {selectedBank ? `Enter your ${selectedBank.name} account number` : 'Select a bank first'}
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{APP_NAME} Personal Information</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* User Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Details</Text>
          
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color={colors.blue500} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{displayName}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={20} color={colors.blue500} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{displayEmail}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color={colors.blue500} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{displayPhone}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color={colors.blue500} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>{memberSince}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Withdrawal Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Withdrawal Details</Text>
          
          <View style={styles.card}>
            {storedAccountDisplay && !showPasswordForm ? (
              <View>
                <View style={styles.successBanner}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                  <Text style={styles.successText}>Withdrawal wallet is set and secured</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Ionicons name="wallet" size={20} color={colors.blue500} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Withdrawal Account</Text>
                    <Text style={styles.infoValue}>
                      Set ✓
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.warningText}>
                  ⚠️ This withdrawal account can only be changed by contacting customer support for security reasons.
                </Text>
              </View>
            ) : (
              <View>
                <View style={styles.warningBanner}>
                  <Ionicons name="warning" size={24} color={colors.warning} />
                  <Text style={styles.warningBannerText}>
                    You must set up your withdrawal wallet before making any withdrawals
                  </Text>
                </View>
                
                <Text style={styles.formTitle}>Set Withdrawal Account</Text>
                
                {/* Account Type Selection */}
                <Text style={styles.inputLabel}>Payment Method</Text>
                <View style={styles.accountTypeContainer}>
                  {accountTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.accountTypeButton,
                        accountType === type.id && styles.accountTypeButtonActive
                      ]}
                      onPress={() => setAccountType(type.id)}
                    >
                      <View style={[styles.typeIconContainer, { backgroundColor: type.color + '20' }]}>
                        <Ionicons 
                          name={type.icon} 
                          size={20} 
                          color={accountType === type.id ? colors.white : type.color} 
                        />
                      </View>
                      <Text style={[
                        styles.accountTypeText,
                        accountType === type.id && styles.accountTypeTextActive
                      ]}>
                        {type.label}
                      </Text>
                      {accountType === type.id && (
                        <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                
                {/* Dynamic Account Details Fields */}
                {renderAccountTypeFields()}
                
                {/* Withdrawal Password */}
                <Text style={styles.inputLabel}>Withdrawal Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={20} color={colors.blue500} />
                  <TextInput
                    style={styles.input}
                    placeholder="Create withdrawal password"
                    placeholderTextColor={colors.gray500}
                    value={withdrawalPassword}
                    onChangeText={setWithdrawalPassword}
                    secureTextEntry
                  />
                </View>
                
                {/* Confirm Password */}
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={20} color={colors.blue500} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm withdrawal password"
                    placeholderTextColor={colors.gray500}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>
                
                <TouchableOpacity
                  style={[styles.setWalletButton, isSettingWallet && styles.setWalletButtonDisabled]}
                  onPress={handleSetWithdrawalWallet}
                  disabled={isSettingWallet}
                >
                  <Text style={styles.setWalletButtonText}>
                    {isSettingWallet ? 'Setting Wallet...' : 'Set Withdrawal Wallet'}
                  </Text>
                </TouchableOpacity>
                
                <Text style={styles.securityNote}>
                  🔒 Your withdrawal password will be required for all withdrawal requests. 
                  Keep it secure and don't share it with anyone.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bank Selection Modal */}
      <Modal
        visible={showBankModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBankModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Bank</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowBankModal(false)}
              >
                <Ionicons name="close" size={24} color={colors.gray600} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={banks}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.bankItem,
                    selectedBank?.id === item.id && styles.selectedBankItem
                  ]}
                  onPress={() => {
                    setSelectedBank(item);
                    setShowBankModal(false);
                  }}
                >
                  <View style={styles.bankItemContent}>
                    <Text style={styles.bankName}>{item.name}</Text>
                    <Text style={styles.bankPaybill}>Paybill: {item.paybill}</Text>
                  </View>
                  {selectedBank?.id === item.id && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  infoContent: {
    marginLeft: spacing.md,
    flex: 1,
  },
  infoLabel: {
    fontSize: fontSizes.sm,
    color: colors.gray600,
    marginBottom: spacing.xs / 2,
  },
  infoValue: {
    fontSize: fontSizes.md,
    color: colors.textDark,
    fontWeight: '500',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  successText: {
    marginLeft: spacing.sm,
    fontSize: fontSizes.md,
    color: colors.success,
    fontWeight: '600',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  warningBannerText: {
    marginLeft: spacing.sm,
    fontSize: fontSizes.sm,
    color: colors.warning,
    fontWeight: '500',
    flex: 1,
  },
  warningText: {
    fontSize: fontSizes.sm,
    color: colors.warning,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  formTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  accountTypeContainer: {
    marginBottom: spacing.md,
  },
  accountTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray300,
    marginBottom: spacing.sm,
  },
  accountTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  accountTypeText: {
    marginLeft: spacing.sm,
    fontSize: fontSizes.md,
    color: colors.textDark,
  },
  accountTypeTextActive: {
    color: colors.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    height: 50,
    marginLeft: spacing.sm,
    fontSize: fontSizes.md,
    color: colors.textDark,
  },
  setWalletButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.sm,
  },
  setWalletButtonDisabled: {
    opacity: 0.6,
  },
  setWalletButtonText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  securityNote: {
    fontSize: fontSizes.sm,
    color: colors.gray600,
    marginTop: spacing.md,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Enhanced payment method styles
  typeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  helperText: {
    fontSize: fontSizes.xs,
    color: colors.gray500,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  bankSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    height: 50,
    marginBottom: spacing.sm,
  },
  bankSelectorText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSizes.md,
    color: colors.textDark,
  },
  placeholderText: {
    color: colors.gray500,
  },
  bankInfo: {
    backgroundColor: colors.blue50,
    padding: spacing.sm,
    borderRadius: 6,
    marginBottom: spacing.md,
  },
  bankInfoText: {
    fontSize: fontSizes.sm,
    color: colors.blue700,
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  modalTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  selectedBankItem: {
    backgroundColor: colors.blue50,
  },
  bankItemContent: {
    flex: 1,
  },
  bankName: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: spacing.xs / 2,
  },
  bankPaybill: {
    fontSize: fontSizes.sm,
    color: colors.gray600,
  },
});

export default PersonalInfoScreen;


// ====== End File: src\screens\main\PersonalInfoScreen.js ======

// ====== Begin File: src\screens\main\RedeemGiftsScreen.js ======

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { useUser } from '../../context/SupabaseUserContext';

const RedeemGiftsScreen = ({ navigation }) => {
  const { redeemGiftCode, loadUserData } = useUser();
  const [giftCode, setGiftCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionHistory, setRedemptionHistory] = useState([]);

  const handleRedeemGift = async () => {
    if (!giftCode.trim()) {
      Alert.alert('Error', 'Please enter a gift code');
      return;
    }
    setIsRedeeming(true);
    try {
      const amountCredited = await redeemGiftCode(giftCode);
      if (amountCredited > 0) {
        setRedemptionHistory(prev => [{
          id: Date.now(),
          code: giftCode,
          amount: amountCredited,
          date: new Date().toISOString(),
          status: 'success',
        }, ...prev]);
        setGiftCode('');
        Alert.alert('Success!', `Gift code redeemed successfully! You received KES ${amountCredited}.`);
        await loadUserData();
      } else {
        Alert.alert('Error', 'Invalid gift code or redemption failed. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Redemption failed.');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Redeem Gifts</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.redeemCard}>
          <View style={styles.giftIcon}>
            <Ionicons name="gift" size={48} color={colors.primary} />
          </View>
          
          <Text style={styles.cardTitle}>Redeem Gift Code</Text>
          <Text style={styles.cardSubtitle}>
            Enter your gift code to redeem rewards.
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter gift code"
              placeholderTextColor={colors.gray500}
              value={giftCode}
              onChangeText={setGiftCode}
              autoCapitalize="characters"
            />
          </View>
          
          <TouchableOpacity
            style={[styles.redeemButton, isRedeeming && styles.redeemButtonDisabled]}
            onPress={handleRedeemGift}
            disabled={isRedeeming}
          >
            <Text style={styles.redeemButtonText}>
              {isRedeeming ? 'Redeeming...' : 'Redeem Now'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Redemption History */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Redemption History</Text>
          
          {redemptionHistory.length > 0 ? (
            <View style={styles.historyList}>
              {redemptionHistory.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                  </View>
                  <View style={styles.historyDetails}>
                    <Text style={styles.historyCode}>Code: {item.code}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(item.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.historyAmount}>+KES {item.amount}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyHistory}>
              <Ionicons name="document-outline" size={48} color={colors.gray400} />
              <Text style={styles.emptyHistoryText}>No redemption history found.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: fontSizes.xl, fontWeight: 'bold', color: colors.white },
  placeholder: { width: 40 },
  content: { flex: 1, paddingHorizontal: spacing.lg },
  redeemCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.lg,
  },
  giftIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardTitle: { fontSize: fontSizes.xl, fontWeight: 'bold', color: colors.textDark, marginBottom: spacing.sm },
  cardSubtitle: { fontSize: fontSizes.md, color: colors.gray600, textAlign: 'center', marginBottom: spacing.xl },
  inputContainer: {
    width: '100%',
    backgroundColor: colors.gray100,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  input: { height: 50, fontSize: fontSizes.md, color: colors.textDark },
  redeemButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  redeemButtonDisabled: { opacity: 0.6 },
  redeemButtonText: { fontSize: fontSizes.md, fontWeight: 'bold', color: colors.white },
  historySection: { marginBottom: spacing.xl },
  historyTitle: { fontSize: fontSizes.lg, fontWeight: 'bold', color: colors.white, marginBottom: spacing.md },
  historyList: { backgroundColor: colors.white, borderRadius: 16, padding: spacing.lg, ...shadows.md },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  historyIcon: { marginRight: spacing.md },
  historyDetails: { flex: 1 },
  historyCode: { fontSize: fontSizes.md, fontWeight: '600', color: colors.textDark },
  historyDate: { fontSize: fontSizes.sm, color: colors.gray600, marginTop: spacing.xs / 2 },
  historyAmount: { fontSize: fontSizes.md, fontWeight: 'bold', color: colors.success },
  emptyHistory: { backgroundColor: colors.white, borderRadius: 16, padding: spacing.xl, alignItems: 'center', ...shadows.md },
  emptyHistoryText: { fontSize: fontSizes.md, color: colors.gray600, marginTop: spacing.md },
});

export default RedeemGiftsScreen;


// ====== End File: src\screens\main\RedeemGiftsScreen.js ======

// ====== Begin File: src\screens\main\ReferralScreen.js ======

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Share,
  Alert,
  StatusBar,
  Clipboard,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/SupabaseAuthContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { APP_NAME, APP_URL, APP_SHORT_NAME } from '../../constants/branding';
import LazyAsset from '../../components/LazyAsset';

const ReferralScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  
  // Referral link
  const referralLink = `${APP_URL}/register?ref=${user?.id || 'user123'}`;
  
  // Referral message templates
  const messageTemplates = [
    `Hey! Join me on ${APP_NAME} and earn money daily through simple tasks and referrals. Use my referral link: ${referralLink}`,
    `Looking for an easy way to earn money? I'm using ${APP_NAME} and it's amazing! Sign up with my link: ${referralLink}`,
    `Want to make some extra cash? ${APP_SHORT_NAME} lets you earn through daily tasks and referrals. Join with my link: ${referralLink}`,
  ];
  
  // Copy referral link to clipboard
  const copyReferralLink = () => {
    Clipboard.setString(referralLink);
    Alert.alert('Success', 'Referral link copied to clipboard!');
  };
  
  // Share referral link
  const shareReferralLink = async () => {
    try {
      await Share.share({
        message: messageTemplates[selectedTemplate],
        title: `Join ${APP_NAME}`
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share referral link.');
    }
  };
  
  // Commission structure
  const commissionStructure = [
    { level: 'Level 1 (Direct)', amount: 300, description: 'For every direct referral that activates their account' },
    { level: 'Level 2 (Indirect)', amount: 100, description: 'When your direct referrals bring in new users' },
    { level: 'Level 3 (Network)', amount: 50, description: 'From the extended network of your referrals' },
  ];
  
  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
            style={styles.heroCard}
          >
            <LazyAsset style={styles.heroImage}>
              <Image
                source={{ uri: 'https://img.icons8.com/fluency/96/000000/gift.png' }}
                style={styles.heroImage}
              />
            </LazyAsset>
            
            <Text style={styles.heroTitle}>Invite Friends & Earn Together</Text>
            
            <Text style={styles.heroSubtitle}>
              Earn commissions up to 3 levels deep when your referrals join and activate their accounts
            </Text>
          </LinearGradient>
        </View>
        
        {/* Referral Link Section */}
        <View style={styles.referralLinkSection}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.linkCard}
          >
            <Text style={styles.sectionTitle}>Your Referral Link</Text>
            
            <View style={styles.linkContainer}>
              <Text style={styles.link} numberOfLines={1}>
                {referralLink}
              </Text>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={copyReferralLink}
              >
                <LinearGradient
                  colors={[colors.blue600, colors.blue800]}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="copy-outline" size={18} color={colors.white} />
                  <Text style={styles.buttonText}>Copy Link</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.shareButton}
                onPress={shareReferralLink}
              >
                <LinearGradient
                  colors={[colors.purple, colors.deepPurple]}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="share-social-outline" size={18} color={colors.white} />
                  <Text style={styles.buttonText}>Share Link</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
        
        {/* Share Message Templates */}
        <View style={styles.templateSection}>
          <Text style={styles.sectionTitle}>Share Message Templates</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.templatesContainer}
          >
            {messageTemplates.map((template, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.templateCard,
                  selectedTemplate === index && styles.selectedTemplateCard
                ]}
                onPress={() => setSelectedTemplate(index)}
              >
                <Text style={styles.templateText} numberOfLines={4}>
                  {template}
                </Text>
                
                {selectedTemplate === index && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Commission Structure */}
        <View style={styles.commissionSection}>
          <Text style={styles.sectionTitle}>Commission Structure</Text>
          
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.commissionCard}
          >
            {commissionStructure.map((item, index) => (
              <View 
                key={index} 
                style={[
                  styles.commissionItem,
                  index < commissionStructure.length - 1 && styles.commissionItemBorder
                ]}
              >
                <View style={styles.commissionHeader}>
                  <View style={[
                    styles.levelIndicator,
                    { backgroundColor: index === 0 ? colors.green : index === 1 ? colors.blue500 : colors.purple }
                  ]}>
                    <Text style={styles.levelText}>L{index + 1}</Text>
                  </View>
                  
                  <Text style={styles.commissionLevel}>{item.level}</Text>
                  
                  <Text style={styles.commissionAmount}>KES {item.amount}</Text>
                </View>
                
                <Text style={styles.commissionDescription}>{item.description}</Text>
              </View>
            ))}
          </LinearGradient>
        </View>
        
        {/* Referral Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Referral Tips</Text>
          
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.tipsCard}
          >
            <View style={styles.tipItem}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="people-outline" size={20} color={colors.white} />
              </View>
              <Text style={styles.tipText}>
                Share with friends who are interested in making extra income
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.white} />
              </View>
              <Text style={styles.tipText}>
                Explain the benefits of using the app, such as daily tasks and investment opportunities
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="help-circle-outline" size={20} color={colors.white} />
              </View>
              <Text style={styles.tipText}>
                Offer to help them get started and answer any questions they may have
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="share-social-outline" size={20} color={colors.white} />
              </View>
              <Text style={styles.tipText}>
                Share your success stories on social media to attract more referrals
              </Text>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  // Hero Section styles
  heroSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroCard: {
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  heroImage: {
    width: 80,
    height: 80,
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: fontSizes.md,
    color: colors.blue200,
    textAlign: 'center',
  },
  // Referral Link Section styles
  referralLinkSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  linkCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  linkContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  link: {
    fontSize: fontSizes.md,
    color: colors.white,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  copyButton: {
    flex: 1,
    marginRight: spacing.sm,
    borderRadius: 8,
    overflow: 'hidden',
  },
  shareButton: {
    flex: 1,
    marginLeft: spacing.sm,
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  buttonText: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.xs,
  },
  // Template Section styles
  templateSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  templatesContainer: {
    paddingBottom: spacing.sm,
  },
  templateCard: {
    width: 250,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: spacing.md,
    marginRight: spacing.md,
    ...shadows.sm,
  },
  selectedTemplateCard: {
    backgroundColor: 'rgba(25,118,210,0.3)',
    borderWidth: 1,
    borderColor: colors.blue400,
  },
  templateText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    lineHeight: 20,
  },
  selectedIndicator: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  // Commission Structure styles
  commissionSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  commissionCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  commissionItem: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
  },
  commissionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  commissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  levelIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  levelText: {
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
    color: colors.white,
  },
  commissionLevel: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
    flex: 1,
  },
  commissionAmount: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.green,
  },
  commissionDescription: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    marginLeft: 38, // To align with level text
  },
  // Tips Section styles
  tipsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl * 2, // Extra space for bottom nav
  },
  tipsCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  tipIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  tipText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    flex: 1,
  },
});

export default ReferralScreen;


// ====== End File: src\screens\main\ReferralScreen.js ======

// ====== Begin File: src\screens\main\SpinWheelScreen.enhanced.js ======

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
  StatusBar,
  Dimensions,
  ScrollView,
  FlatList,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../context/SupabaseUserContext';
import { useApp } from '../../context/AppContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

// Enhanced wheel segments with better prizes
const segments = [
  { value: 0, label: 'Try Again', color: '#6c757d', probability: 0.30 },
  { value: 100, label: '100', color: '#28a745', probability: 0.20 },
  { value: 0, label: 'Better Luck', color: '#dc3545', probability: 0.15 },
  { value: 500, label: '500', color: '#007bff', probability: 0.12 },
  { value: 0, label: 'No Win', color: '#fd7e14', probability: 0.10 },
  { value: 1000, label: '1,000', color: '#6f42c1', probability: 0.08 },
  { value: 0, label: 'Free Spin', color: '#20c997', probability: 0.03 },
  { value: 5000, label: '5,000', color: '#e83e8c', probability: 0.015 },
  { value: 50000, label: '50,000', color: '#ffc107', probability: 0.004 },
  { value: 300000, label: '300,000', color: '#ff6b35', probability: 0.001 },
];

// Bet amount options
const betOptions = [100, 500, 1000, 2500, 5000];

// Mock recent winners for marketing
const recentWinners = [
  { name: 'John M.', amount: 5000, time: '2 mins ago' },
  { name: 'Sarah K.', amount: 1000, time: '5 mins ago' },
  { name: 'Mike D.', amount: 500, time: '8 mins ago' },
  { name: 'Lisa P.', amount: 50000, time: '12 mins ago' },
  { name: 'David R.', amount: 1000, time: '15 mins ago' },
  { name: 'Emma S.', amount: 300000, time: '1 hour ago' },
];

const SpinWheelScreen = ({ navigation }) => {
  const { profile, addToIncomeWallet } = useUser();
  const { addSpinResult } = useApp();
  
  const [selectedBet, setSelectedBet] = useState(betOptions[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [spinHistory, setSpinHistory] = useState([]);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [showWinners, setShowWinners] = useState(true);
  
  const spinValue = useRef(new Animated.Value(0)).current;
  const wheelSize = width * 0.75;
  const angleBySegment = 360 / segments.length;
  
  // Animated values for marketing effects
  const flashAnim = useRef(new Animated.Value(1)).current;
  const winnersScrollX = useRef(new Animated.Value(0)).current;
  
  // Convert rounds played to determine if next spin is free
  const isFreeRound = roundsPlayed > 0 && roundsPlayed % 3 === 2;
  
  useEffect(() => {
    // Flash animation for excitement
    Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Auto-scroll winners
    Animated.loop(
      Animated.timing(winnersScrollX, {
        toValue: -width * 2,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  
  // Spin the wheel
  const spinWheel = () => {
    if ((profile.incomeWallet || 0) < selectedBet && !isFreeRound) {
      Alert.alert(
        'Insufficient Balance',
        'You don\'t have enough balance for this bet.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (isSpinning) return;
    
    // Deduct bet amount from wallet if not a free round
    if (!isFreeRound) {
      addToIncomeWallet(
        -selectedBet,
        `Spin to Win bet: KES ${selectedBet}`,
        'SPIN_BET'
      );
    }
    
    setIsSpinning(true);
    setSpinResult(null);
    
    // Calculate number of spins (random between 5-10 full rotations)
    const spinCount = 5 + Math.random() * 5;
    
    // Always land on 0 value segment (as requested)
    const zeroSegments = segments.map((seg, index) => ({ ...seg, index })).filter(seg => seg.value === 0);
    const landingSegment = zeroSegments[Math.floor(Math.random() * zeroSegments.length)];
    
    // Calculate final rotation value
    const offset = Math.random() * 0.8 - 0.4;
    const finalRotation = spinCount * 360 + (360 - (landingSegment.index * angleBySegment) - (angleBySegment / 2)) + (offset * angleBySegment);
    
    // Start animation
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: finalRotation,
      duration: 4000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start(({ finished }) => {
      if (finished) {
        setIsSpinning(false);
        setSpinResult(landingSegment);
        setRoundsPlayed(prev => prev + 1);
        
        // Add to spin history
        const newSpin = {
          id: Date.now(),
          bet: isFreeRound ? 0 : selectedBet,
          result: landingSegment.value,
          timestamp: new Date(),
          isFree: isFreeRound
        };
        setSpinHistory(prev => [newSpin, ...prev.slice(0, 9)]);
        
        // Show result
        setTimeout(() => {
          if (landingSegment.value > 0) {
            Alert.alert(
              '🎉 Congratulations!',
              `You won KES ${landingSegment.value.toLocaleString()}!`,
              [{ text: 'Awesome!' }]
            );
            addToIncomeWallet(landingSegment.value, `Spin to Win prize: KES ${landingSegment.value}`, 'SPIN_WIN');
          } else if (landingSegment.label === 'Free Spin') {
            Alert.alert(
              '🎁 Free Spin!',
              'You earned a free spin! Your next spin is on the house.',
              [{ text: 'Great!' }]
            );
          } else {
            Alert.alert(
              '😔 Better Luck Next Time',
              `${landingSegment.label}! Try again for another chance to win big!`,
              [{ text: 'Try Again' }]
            );
          }
        }, 500);
      }
    });
  };
  
  // Render wheel segment
  const renderWheelSegment = (segment, index) => {
    const rotation = (index * angleBySegment) - 90;
    const radius = wheelSize / 2 - 20;
    
    return (
      <View
        key={index}
        style={[
          styles.segment,
          {
            transform: [{ rotate: `${rotation}deg` }],
            backgroundColor: segment.color,
          }
        ]}
      >
        <View style={styles.segmentContent}>
          <Text style={styles.segmentText}>
            {segment.value > 0 ? `KES ${segment.label}` : segment.label}
          </Text>
        </View>
      </View>
    );
  };
  
  // Render recent winner item
  const renderWinnerItem = ({ item, index }) => (
    <View style={styles.winnerItem}>
      <View style={styles.winnerIcon}>
        <Ionicons name="trophy" size={16} color={colors.yellow} />
      </View>
      <Text style={styles.winnerText}>
        <Text style={styles.winnerName}>{item.name}</Text> won{' '}
        <Text style={styles.winnerAmount}>KES {item.amount.toLocaleString()}</Text>{' '}
        <Text style={styles.winnerTime}>{item.time}</Text>
      </Text>
    </View>
  );
  
  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        
        <Animated.Text style={[styles.headerTitle, { transform: [{ scale: flashAnim }] }]}>
          🎰 Spin to Win
        </Animated.Text>
        
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Recent Winners Ticker */}
        <View style={styles.winnersContainer}>
          <Text style={styles.winnersTitle}>🏆 Recent Winners</Text>
          <View style={styles.winnersScroll}>
            <Animated.View
              style={[
                styles.winnersContent,
                { transform: [{ translateX: winnersScrollX }] }
              ]}
            >
              {[...recentWinners, ...recentWinners].map((winner, index) => (
                <View key={index} style={styles.winnerTickerItem}>
                  <Ionicons name="star" size={12} color={colors.yellow} />
                  <Text style={styles.winnerTickerText}>
                    {winner.name} won KES {winner.amount.toLocaleString()}
                  </Text>
                </View>
              ))}
            </Animated.View>
          </View>
        </View>
        
        {/* Main Wheel Container */}
        <View style={styles.wheelContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
            style={styles.wheelCard}
          >
            {/* Wheel */}
            <View style={styles.wheelWrapper}>
              <Animated.View
                style={[
                  styles.wheel,
                  {
                    width: wheelSize,
                    height: wheelSize,
                    transform: [{ rotate: spinValue.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg']
                    }) }]
                  }
                ]}
              >
                {segments.map((segment, index) => renderWheelSegment(segment, index))}
                
                {/* Center circle */}
                <View style={styles.centerCircle}>
                  <LinearGradient
                    colors={[colors.yellow, colors.orange]}
                    style={styles.centerGradient}
                  >
                    <Text style={styles.centerText}>SPIN</Text>
                  </LinearGradient>
                </View>
              </Animated.View>
              
              {/* Pointer */}
              <View style={styles.pointer}>
                <View style={styles.pointerTriangle} />
              </View>
            </View>
            
            {/* Result Display */}
            {spinResult && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultText}>
                  {spinResult.value > 0 
                    ? `🎉 You Won KES ${spinResult.value.toLocaleString()}!`
                    : `${spinResult.label}`
                  }
                </Text>
              </View>
            )}
          </LinearGradient>
        </View>
        
        {/* Bet Selection */}
        <View style={styles.betContainer}>
          <Text style={styles.sectionTitle}>Select Your Bet</Text>
          <View style={styles.betOptions}>
            {betOptions.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.betOption,
                  selectedBet === amount && styles.selectedBetOption
                ]}
                onPress={() => setSelectedBet(amount)}
                disabled={isSpinning}
              >
                <Text style={[
                  styles.betOptionText,
                  selectedBet === amount && styles.selectedBetOptionText
                ]}>
                  KES {amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {isFreeRound && (
            <View style={styles.freeSpinBadge}>
              <Ionicons name="gift" size={20} color={colors.white} />
              <Text style={styles.freeSpinText}>Next Spin is FREE!</Text>
            </View>
          )}
        </View>
        
        {/* Spin Button */}
        <TouchableOpacity
          style={[styles.spinButton, isSpinning && styles.spinningButton]}
          onPress={spinWheel}
          disabled={isSpinning}
        >
          <LinearGradient
            colors={isSpinning ? [colors.gray600, colors.gray700] : [colors.red, colors.pink]}
            style={styles.spinButtonGradient}
          >
            <Text style={styles.spinButtonText}>
              {isSpinning ? 'SPINNING...' : isFreeRound ? 'SPIN FREE!' : `SPIN FOR KES ${selectedBet}`}
            </Text>
            <Ionicons 
              name={isSpinning ? "hourglass" : "play-circle"} 
              size={24} 
              color={colors.white} 
            />
          </LinearGradient>
        </TouchableOpacity>
        
        {/* Spin History */}
        {spinHistory.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.sectionTitle}>Recent Spins</Text>
            {spinHistory.slice(0, 5).map((spin) => (
              <View key={spin.id} style={styles.historyItem}>
                <Text style={styles.historyBet}>
                  {spin.isFree ? 'FREE' : `KES ${spin.bet}`}
                </Text>
                <Text style={styles.historyResult}>
                  {spin.result > 0 ? `+KES ${spin.result.toLocaleString()}` : 'No Win'}
                </Text>
                <Text style={styles.historyTime}>
                  {spin.timestamp.toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Game Rules */}
        <View style={styles.rulesContainer}>
          <Text style={styles.sectionTitle}>How to Play</Text>
          <View style={styles.ruleItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.green} />
            <Text style={styles.ruleText}>Choose your bet amount (KES 100 - 5,000)</Text>
          </View>
          <View style={styles.ruleItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.green} />
            <Text style={styles.ruleText}>Spin the wheel and wait for it to stop</Text>
          </View>
          <View style={styles.ruleItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.green} />
            <Text style={styles.ruleText}>Win up to KES 300,000 instantly!</Text>
          </View>
          <View style={styles.ruleItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.green} />
            <Text style={styles.ruleText}>Play 2 rounds and get 1 FREE spin</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  winnersContainer: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  winnersTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  winnersScroll: {
    height: 30,
    overflow: 'hidden',
  },
  winnersContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  winnerTickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 15,
  },
  winnerTickerText: {
    color: colors.white,
    fontSize: fontSizes.sm,
    marginLeft: spacing.xs,
  },
  wheelContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  wheelCard: {
    borderRadius: 20,
    padding: spacing.lg,
    alignItems: 'center',
  },
  wheelWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheel: {
    borderRadius: 1000,
    position: 'relative',
    elevation: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  segment: {
    position: 'absolute',
    width: '50%',
    height: '50%',
    top: '50%',
    left: '50%',
    transformOrigin: '0 0',
    borderWidth: 2,
    borderColor: colors.white,
  },
  segmentContent: {
    position: 'absolute',
    top: '10%',
    left: '20%',
    transform: [{ rotate: '90deg' }],
  },
  segmentText: {
    color: colors.white,
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  centerCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 80,
    height: 80,
    marginTop: -40,
    marginLeft: -40,
    borderRadius: 40,
    elevation: 15,
  },
  centerGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  pointer: {
    position: 'absolute',
    top: -10,
    zIndex: 10,
  },
  pointerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.red,
  },
  resultContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
  },
  resultText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  betContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  betOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  betOption: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.sm,
    minWidth: '30%',
    alignItems: 'center',
  },
  selectedBetOption: {
    backgroundColor: colors.yellow,
  },
  betOptionText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  selectedBetOptionText: {
    color: colors.black,
  },
  freeSpinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.green,
    padding: spacing.sm,
    borderRadius: 20,
    marginTop: spacing.md,
  },
  freeSpinText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  spinButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: 15,
    elevation: 5,
  },
  spinButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: 15,
  },
  spinButtonText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    marginRight: spacing.sm,
  },
  historyContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: spacing.sm,
    borderRadius: 10,
    marginBottom: spacing.xs,
  },
  historyBet: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
  },
  historyResult: {
    color: colors.yellow,
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
  },
  historyTime: {
    color: colors.gray300,
    fontSize: fontSizes.xs,
  },
  rulesContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ruleText: {
    color: colors.white,
    fontSize: fontSizes.md,
    marginLeft: spacing.sm,
    flex: 1,
  },
});

export default SpinWheelScreen;


// ====== End File: src\screens\main\SpinWheelScreen.enhanced.js ======

// ====== Begin File: src\screens\main\SpinWheelScreen.js ======

import React, { useState } from 'react';
import { View, StatusBar } from 'react-native';
import { colors } from '../../constants/theme';
import SpinWheel from '../../components/SpinWheel';

const SpinWheelScreen = ({ navigation }) => {
  const [showSpin, setShowSpin] = useState(true);
  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <SpinWheel visible={showSpin} onClose={() => { setShowSpin(false); navigation.goBack(); }} />
    </View>
  );
};

export default SpinWheelScreen;


// ====== End File: src\screens\main\SpinWheelScreen.js ======

// ====== Begin File: src\screens\main\TaskScreen.js ======

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { useUser } from '../../context/SupabaseUserContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { isWeekday } from '../../utils/mockData';
import AppStoreCard from '../../components/AppStoreCard';

const { width } = Dimensions.get('window');

const TaskScreen = React.memo(() => {
  const { taskApps, installingApps, completedApps, installApp, updateInstallProgress } = useApp();
  const { profile, currentLevel, completeTask } = useUser();

  if (!profile) {
    return (
      <LinearGradient colors={gradients.primary} style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      </LinearGradient>
    );
  }
  
  // Track installation progress for each app
  const [installProgress, setInstallProgress] = useState({});
  const progressAnimations = useRef({}).current;
  const tasksCompleted = profile?.tasksCompletedToday ?? profile?.tasks_completed_today ?? 0;
  const currentLevelId = profile?.currentLevelId ?? profile?.current_level ?? 0;
  // Use Supabase-driven levels for accurate data
  const { levels = [] } = useUser();
  const levelConfig = levels.find(l => l.id === currentLevelId) || currentLevel || { tasks: 0, earningsPerTask: 0 };
  const maxTasks = levelConfig.tasks || 0;
  const taskLimitReached = tasksCompleted >= maxTasks;
  const maxConcurrentInstalls = 1; // Changed to 1 to prevent over-counting
  const [currentlyInstalling, setCurrentlyInstalling] = useState(null);
  
  // Check if tasks are available (weekdays only)
  const isTaskDay = isWeekday();
  const isRecruit = currentLevelId === 0 || maxTasks === 0;
  const remainingTasks = Math.max(maxTasks - tasksCompleted, 0);
  const canPerformTasks = !isRecruit && isTaskDay;
  const canStartNewTask = canPerformTasks && !taskLimitReached && remainingTasks > 0;
  const taskStatus = useMemo(() => {
    if (isRecruit) {
      return { type: 'info', message: 'Upgrade to start performing tasks.' };
    }
    if (!isTaskDay) {
      return { type: 'warning', message: 'Tasks are only performed Monday to Friday.' };
    }
    if (taskLimitReached) {
      return { type: 'success', message: "You've completed all your daily tasks!" };
    }
    return {
      type: 'info',
      message: `${remainingTasks} task${remainingTasks === 1 ? '' : 's'} remaining today.`,
    };
  }, [isRecruit, isTaskDay, taskLimitReached, remainingTasks]);
  const taskStatusColor =
    taskStatus.type === 'success'
      ? colors.success
      : taskStatus.type === 'warning'
      ? colors.warning
      : colors.blue200;
  const taskStatusIcon =
    taskStatus.type === 'success'
      ? 'checkmark-circle'
      : taskStatus.type === 'warning'
      ? 'alert-circle'
      : 'information-circle';
  const progressPercent = maxTasks > 0 ? Math.min((tasksCompleted / maxTasks) * 100, 100) : 0;
  const taskCountLabel = `${Math.min(tasksCompleted, maxTasks)} / ${maxTasks}`;
  const visibleTaskApps = useMemo(() => {
    if (maxTasks <= 0) {
      return [];
    }
    const limit = Math.min(maxTasks, taskApps.length);
    return taskApps.slice(0, limit);
  }, [taskApps, maxTasks]);
  
  useEffect(() => {
    // Initialize animation controllers for each installing app
    installingApps.forEach(app => {
      if (!progressAnimations[app.id]) {
        progressAnimations[app.id] = new Animated.Value(0);
        
        // Start installation animation
        startInstallAnimation(app.id, app.installTime);
      }
    });
    
    // Cleanup unused animations
    Object.keys(progressAnimations).forEach(appId => {
      if (!installingApps.find(app => app.id === appId)) {
        delete progressAnimations[appId];
      }
    });
  }, [installingApps]);
  
  // Start the animated installation process
  const startInstallAnimation = (appId, installTime) => {
    setInstallProgress(prev => ({ ...prev, [appId]: 0 }));
    
    // Reset animation value
    progressAnimations[appId].setValue(0);
    
    // Start animation
    Animated.timing(progressAnimations[appId], {
      toValue: 100,
      duration: installTime,
      useNativeDriver: false
    }).start(async ({ finished }) => {
      if (finished) {
        const appName = taskApps.find(app => app.id === appId)?.name || 'App';
        const reward = levelConfig.earningsPerTask || 0;
        await completeTask(appId, appName, reward);
        updateInstallProgress(appId, 100);
        setCurrentlyInstalling(null);
      }
    });
    
    // Update progress value during animation
    const listener = progressAnimations[appId].addListener(({ value }) => {
      setInstallProgress(prev => ({ ...prev, [appId]: value }));
      updateInstallProgress(appId, value);
    });
    
    return () => {
      progressAnimations[appId].removeListener(listener);
    };
  };
  
  const handleInstallApp = useCallback((app) => {
    const levelName = currentLevel?.name || 'current';

    if (!isTaskDay) {
      Alert.alert('Tasks Unavailable', 'Tasks are only performed Monday to Friday.');
      return;
    }

    if (isRecruit) {
      Alert.alert('Upgrade Required', 'Upgrade to start performing tasks.');
      return;
    }

    if (taskLimitReached || remainingTasks <= 0) {
      Alert.alert(
        'Daily Limit Reached',
        `You've completed your daily limit of ${maxTasks} tasks for the ${levelName} level.`
      );
      return;
    }
    
    if (currentlyInstalling) {
      Alert.alert(
        'Installation in Progress',
        'Please wait for the current app installation to complete before starting another one.'
      );
      return;
    }
    
    // Start installation process
    setCurrentlyInstalling(app.id);
    installApp(app);
  }, [currentLevel, currentlyInstalling, installApp, isRecruit, isTaskDay, maxTasks, remainingTasks, taskLimitReached]);
  
  // Enhanced app item with realistic app store interface
  const renderAppItem = useCallback(({ item }) => {
    const installingApp = installingApps.find(app => app.id === item.id);
    const progress = installProgress[item.id] || 0;
    const disableApp = installingApps.length >= maxConcurrentInstalls || !canStartNewTask;
    
    return (
      <AppStoreCard
        app={item}
        onInstall={handleInstallApp}
        isInstalling={!!installingApp}
        installProgress={progress}
        isDisabled={disableApp}
        earnAmount={levelConfig.earningsPerTask || 0}
      />
    );
  }, [canStartNewTask, handleInstallApp, installProgress, installingApps, levelConfig.earningsPerTask, maxConcurrentInstalls]);
  
  // Progress bar component for installing apps
  const renderInstallationItem = ({ item }) => {
    const progress = installProgress[item.id] || 0;
    
    return (
      <View style={styles.installationItem}>
        <View style={styles.installationHeader}>
          <View style={styles.installationAppInfo}>
            <View style={[styles.miniAppIcon, { backgroundColor: item.color }]}>
              <Text style={styles.miniAppIconText}>{item.logo}</Text>
            </View>
            <Text style={styles.installationAppName}>{item.name}</Text>
          </View>
          
          <Text style={styles.installationProgress}>{Math.floor(progress)}%</Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              { width: `${progress}%` }
            ]}
          />
        </View>
      </View>
    );
  };
  
  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Tasks</Text>
      </View>
      
      {/* Task summary */}
      <View style={styles.taskSummaryContainer}>
        <LinearGradient
          colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
          style={styles.taskSummary}
        >
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryTitle}>{levelConfig.name} Level</Text>
              <Text style={styles.summarySubtitle}>
                Earning KES {levelConfig.earningsPerTask} per task
              </Text>
            </View>
            
            <View style={styles.taskCountContainer}>
              <Text style={styles.taskCount}>{taskCountLabel}</Text>
              <Text style={styles.taskCountLabel}>Tasks</Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${progressPercent}%` }
                ]}
              />
            </View>
          </View>
          
          {taskStatus?.message && (
            <View
              style={[
                styles.taskStatus,
                taskStatus.type === 'success'
                  ? styles.taskStatusSuccess
                  : taskStatus.type === 'warning'
                  ? styles.taskStatusWarning
                  : styles.taskStatusInfo,
              ]}
            >
              <Ionicons name={taskStatusIcon} size={18} color={taskStatusColor} />
              <Text style={[styles.taskStatusText, { color: taskStatusColor }]}>
                {taskStatus.message}
              </Text>
            </View>
          )}
          
          <View style={styles.refreshRow}>
            <Ionicons name="refresh" size={14} color={colors.blue200} />
            <Text style={styles.refreshText}>
              Tasks refresh at 12:00 midnight
            </Text>
          </View>
        </LinearGradient>
      </View>
      
      {/* Installing apps section */}
      {installingApps.length > 0 && (
        <View style={styles.installationsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Installing ({installingApps.length}/{maxConcurrentInstalls})
            </Text>
          </View>
          
          <FlatList
            data={installingApps}
            keyExtractor={(item) => item.id}
            renderItem={renderInstallationItem}
            contentContainerStyle={styles.installationsList}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
      
      {/* Enhanced App Store Interface */}
      <View style={styles.appsContainer}>
        <View style={styles.storeHeader}>
          <View style={styles.storeHeaderTop}>
            <Text style={styles.storeTitle}>Task App Store</Text>
          </View>
          
          <View style={styles.storeFilters}>
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterChipText}>All Categories</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterChipText}>Top Rated</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterChipText}>New</Text>
            </TouchableOpacity>
          </View>
          
          {(installingApps.length >= maxConcurrentInstalls || taskLimitReached) && (
            <View style={styles.limitBanner}>
              <Ionicons 
                name={taskLimitReached ? 'checkmark-circle' : 'warning'} 
                size={16} 
                color={taskLimitReached ? colors.success : colors.warning} 
              />
              <Text style={styles.limitBannerText}>
                {taskLimitReached ? 'Daily task limit reached!' : 'Installation queue is full'}
              </Text>
            </View>
          )}
        </View>
        
        {visibleTaskApps.length === 0 ? (
          <View style={styles.emptyStoreContainer}>
            <LinearGradient
              colors={['rgba(40,167,69,0.2)', 'rgba(40,167,69,0.1)']}
              style={styles.emptyStoreCard}
            >
              <Ionicons name="checkmark-circle" size={60} color={colors.success} />
              <Text style={styles.emptyStoreTitle}>No Tasks Available</Text>
              <Text style={styles.emptyStoreText}>
                {taskStatus.message}
              </Text>
              <Text style={styles.emptyStoreSubtext}>
                New apps will be available tomorrow at midnight.
              </Text>
              
              <View style={styles.nextRefreshContainer}>
                <Ionicons name="time-outline" size={16} color={colors.blue300} />
                <Text style={styles.nextRefreshText}>
                  Next refresh: {new Date(Date.now() + 86400000).toLocaleDateString()}
                </Text>
              </View>
            </LinearGradient>
          </View>
        ) : (
          <FlatList
            data={visibleTaskApps}
            keyExtractor={(item) => item.id}
            renderItem={renderAppItem}
            contentContainerStyle={styles.appsList}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={3}
            updateCellsBatchingPeriod={100}
            initialNumToRender={5}
            windowSize={5}
            ListHeaderComponent={
              <View style={styles.storeListHeader}>
                <Text style={styles.featuredText}>Featured Apps</Text>
                <View style={styles.sortContainer}>
                  <Ionicons name="funnel-outline" size={14} color={colors.blue300} />
                  <Text style={styles.sortText}>Sort by: Newest</Text>
                </View>
              </View>
            }
          />
        )}
      </View>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...(Platform.OS === 'web' && { minHeight: '100vh' })
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
  },
  taskSummaryContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  taskSummary: {
    borderRadius: 16,
    padding: spacing.md,
    ...shadows.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  summaryTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs / 2,
  },
  summarySubtitle: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  taskCountContainer: {
    alignItems: 'center',
  },
  taskCount: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  taskCountLabel: {
    fontSize: fontSizes.xs,
    color: colors.blue200,
  },
  progressContainer: {
    marginBottom: spacing.sm,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.green,
    borderRadius: 4,
  },
  taskWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  taskWarningText: {
    fontSize: fontSizes.sm,
    color: colors.warning,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  taskCompleteText: {
    fontSize: fontSizes.sm,
    color: colors.success,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  taskStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  taskStatusSuccess: {
    backgroundColor: 'rgba(0,200,83,0.2)',
  },
  taskStatusWarning: {
    backgroundColor: 'rgba(255,214,0,0.2)',
  },
  taskStatusInfo: {
    backgroundColor: 'rgba(0,176,255,0.2)',
  },
  taskStatusText: {
    fontSize: fontSizes.sm,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  refreshRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  refreshText: {
    fontSize: fontSizes.xs,
    color: colors.blue200,
    marginLeft: 4,
  },
  installationsContainer: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
  },
  limitBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  limitBadgeText: {
    fontSize: fontSizes.xs,
    color: colors.white,
    fontWeight: 'bold',
  },
  installationsList: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
  },
  installationItem: {
    width: 250,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: spacing.md,
    marginRight: spacing.md,
  },
  installationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  installationAppInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAppIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  miniAppIconText: {
    fontSize: fontSizes.md,
  },
  installationAppName: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.white,
  },
  installationProgress: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.green,
    borderRadius: 3,
  },
  appsContainer: {
    flex: 1,
  },
  // Enhanced Store Interface Styles
  storeHeader: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  storeHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  storeTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  storeStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeStatsText: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
    marginLeft: 4,
  },
  storeFilters: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  filterChip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginRight: spacing.sm,
  },
  filterChipText: {
    fontSize: fontSizes.xs,
    color: colors.white,
    fontWeight: '500',
  },
  limitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  limitBannerText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  storeListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featuredText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: fontSizes.xs,
    color: colors.blue300,
    marginLeft: 4,
  },
  appsList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl * 2, // Extra padding for bottom nav
  },
  emptyStoreContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  emptyStoreCard: {
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  emptyStoreTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.success,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStoreText: {
    fontSize: fontSizes.md,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyStoreSubtext: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  nextRefreshContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
  },
  nextRefreshText: {
    fontSize: fontSizes.xs,
    color: colors.blue300,
    marginLeft: 4,
  },
  // Removed old app item styles as they're now in AppStoreCard component
  // Empty container styles moved to emptyStoreContainer above
});

export default TaskScreen;


// ====== End File: src\screens\main\TaskScreen.js ======

// ====== Begin File: src\screens\main\TeamReportsScreen.js ======

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../context/SupabaseUserContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';

const TeamReportsScreen = ({ navigation }) => {
  const { profile, referrals } = useUser();
  
  // Mock team data - in real app, this would come from API
  const teamData = {
    totalTeam: referrals?.length || 0,
    levelA: referrals?.filter(r => r.level === 1)?.length || 0,
    levelB: referrals?.filter(r => r.level === 2)?.length || 0,
    levelC: referrals?.filter(r => r.level === 3)?.length || 0,
    totalMembers: referrals?.length || 0,
    activeReferrals: referrals?.filter(r => r.isActive)?.length || 0,
    directRecharge: profile?.directRecharge || 0,
    secondaryRecharge: profile?.secondaryRecharge || 0,
    tertiaryRecharge: profile?.tertiaryRecharge || 0,
    teamRecharge: profile?.teamRecharge || 0,
    directWithdrawals: profile?.directWithdrawals || 0,
    secondaryWithdrawals: profile?.secondaryWithdrawals || 0,
    tertiaryWithdrawals: profile?.tertiaryWithdrawals || 0,
    teamWithdrawals: profile?.teamWithdrawals || 0,
  };

  const StatCard = ({ title, value, icon, color, isAmount = false }) => (
    <View style={styles.statCard}>
      <LinearGradient colors={[color, color + '80']} style={styles.statCardGradient}>
        <Ionicons name={icon} size={24} color={colors.white} />
        <Text style={styles.statValue}>
          {isAmount ? `KES ${value.toLocaleString()}` : value.toLocaleString()}
        </Text>
        <Text style={styles.statTitle}>{title}</Text>
      </LinearGradient>
    </View>
  );

  const teamMembers = referrals || [];

  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team Reports</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Team Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Overview</Text>
          
          <View style={styles.statsGrid}>
            <StatCard title="Total Team" value={teamData.totalTeam} icon="people" color={colors.blue500} />
            <StatCard title="Level A" value={teamData.levelA} icon="person" color={colors.green} />
            <StatCard title="Level B" value={teamData.levelB} icon="person" color={colors.orange} />
            <StatCard title="Level C" value={teamData.levelC} icon="person" color={colors.purple} />
            <StatCard title="Total Members" value={teamData.totalMembers} icon="people-circle" color={colors.indigo} />
            <StatCard title="Active Referrals" value={teamData.activeReferrals} icon="checkmark-circle" color={colors.success} />
          </View>
        </View>

        {/* Recharge Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recharge Statistics</Text>
          
          <View style={styles.statsGrid}>
            <StatCard title="Direct Recharge" value={teamData.directRecharge} icon="arrow-down-circle" color={colors.blue600} isAmount />
            <StatCard title="Secondary Recharge" value={teamData.secondaryRecharge} icon="arrow-down-circle" color={colors.teal} isAmount />
            <StatCard title="Tertiary Recharge" value={teamData.tertiaryRecharge} icon="arrow-down-circle" color={colors.cyan} isAmount />
            <StatCard title="Team Recharge" value={teamData.teamRecharge} icon="arrow-down-circle" color={colors.blue800} isAmount />
          </View>
        </View>

        {/* Withdrawal Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Withdrawal Statistics</Text>
          
          <View style={styles.statsGrid}>
            <StatCard title="Direct Withdrawals" value={teamData.directWithdrawals} icon="arrow-up-circle" color={colors.red} isAmount />
            <StatCard title="Secondary Withdrawals" value={teamData.secondaryWithdrawals} icon="arrow-up-circle" color={colors.pink} isAmount />
            <StatCard title="Tertiary Withdrawals" value={teamData.tertiaryWithdrawals} icon="arrow-up-circle" color={colors.amber} isAmount />
            <StatCard title="Team Withdrawals" value={teamData.teamWithdrawals} icon="arrow-up-circle" color={colors.deepOrange} isAmount />
          </View>
        </View>

        {/* Team Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Performance</Text>
          
          <View style={styles.performanceCard}>
            <Text style={styles.performanceTitle}>View your team's performance below.</Text>
            
            {teamMembers.length > 0 ? (
              <View style={styles.teamList}>
                {teamMembers.slice(0, 10).map((member, index) => (
                  <View key={member.id || index} style={styles.teamMemberItem}>
                    <View style={styles.memberInfo}>
                      <View style={styles.memberAvatar}>
                        <Text style={styles.memberInitial}>
                          {member.referred_user?.name?.charAt(0) || 'U'}
                        </Text>
                      </View>
                      <View style={styles.memberDetails}>
                        <Text style={styles.memberName}>
                          {member.referred_user?.name || 'Team Member'}
                        </Text>
                        <Text style={styles.memberLevel}>Level {member.level || 1}</Text>
                      </View>
                    </View>
                    <View style={styles.memberStats}>
                      <Text style={styles.memberEarnings}>KES {(member.totalEarnings || 0).toLocaleString()}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color={colors.gray400} />
                <Text style={styles.emptyStateTitle}>No team members found.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: fontSizes.xl, fontWeight: 'bold', color: colors.white },
  placeholder: { width: 40 },
  content: { flex: 1, paddingHorizontal: spacing.lg },
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: fontSizes.lg, fontWeight: 'bold', color: colors.white, marginBottom: spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', marginBottom: spacing.md, borderRadius: 12, overflow: 'hidden', ...shadows.sm },
  statCardGradient: { padding: spacing.md, alignItems: 'center' },
  statValue: { fontSize: fontSizes.lg, fontWeight: 'bold', color: colors.white, marginVertical: spacing.xs },
  statTitle: { fontSize: fontSizes.sm, color: colors.white, opacity: 0.9, textAlign: 'center' },
  performanceCard: { backgroundColor: colors.white, borderRadius: 16, padding: spacing.lg, ...shadows.md },
  performanceTitle: { fontSize: fontSizes.md, fontWeight: '600', color: colors.textDark, marginBottom: spacing.md },
  teamList: { marginTop: spacing.md },
  teamMemberItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  memberInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  memberInitial: { fontSize: fontSizes.md, fontWeight: 'bold', color: colors.white },
  memberDetails: { marginLeft: spacing.md, flex: 1 },
  memberName: { fontSize: fontSizes.md, fontWeight: '600', color: colors.textDark },
  memberLevel: { fontSize: fontSizes.sm, color: colors.gray600 },
  memberStats: { alignItems: 'flex-end' },
  memberEarnings: { fontSize: fontSizes.md, fontWeight: 'bold', color: colors.success },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyStateTitle: { fontSize: fontSizes.lg, fontWeight: 'bold', color: colors.gray600, marginTop: spacing.md },
});

export default TeamReportsScreen;


// ====== End File: src\screens\main\TeamReportsScreen.js ======

// ====== Begin File: src\screens\main\TeamScreen.js ======

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  StatusBar,
  Clipboard,
  Alert,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/SupabaseAuthContext';
import { useUser } from '../../context/SupabaseUserContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { APP_NAME, APP_URL, APP_SHORT_NAME } from '../../constants/branding';
import ReferralTable from '../../components/ReferralTable';

const TeamScreen = React.memo(({ navigation }) => {
  const { user } = useAuth();
  const { profile, referrals } = useUser();
  
  // Generate proper referral link with user ID
  const referralLink = user?.id ? `${APP_URL}/register?ref=${user.id}` : `${APP_URL}/register`;
  
  const shareReferralLink = async () => {
    try {
      await Share.share({
        message: `Join ${APP_NAME} and earn daily through tasks and referrals! Sign up with my referral link: ${referralLink}`,
        title: `Join ${APP_NAME}`
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share referral link.');
    }
  };

  const copyReferralLink = () => {
    Clipboard.setString(referralLink);
    Alert.alert('Copied!', 'Referral link copied to clipboard');
  };

  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Team</Text>
        <Text style={styles.headerSubtitle}>Build your network and earn more</Text>
      </View>

      {/* Quick Share Section */}
      <View style={styles.shareSection}>
        <LinearGradient
          colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
          style={styles.shareCard}
        >
          <Text style={styles.shareTitle}>Share Your Referral Link</Text>
          <Text style={styles.shareSubtitle}>Earn KES 10 + 0.6% bonuses from referrals</Text>
          
          <View style={styles.linkContainer}>
            <Text style={styles.linkText} numberOfLines={1}>
              {referralLink}
            </Text>
            <TouchableOpacity style={styles.copyButton} onPress={copyReferralLink}>
              <Ionicons name="copy-outline" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.shareButton} onPress={shareReferralLink}>
            <LinearGradient
              colors={[colors.success, colors.green]}
              style={styles.shareButtonInner}
            >
              <Ionicons name="share-outline" size={20} color={colors.white} />
              <Text style={styles.shareButtonText}>Share Link</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
      
      {/* Referral Table Component */}
      <ReferralTable />
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...(Platform.OS === 'web' && { minHeight: '100vh' })
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSizes.md,
    color: colors.blue200,
    opacity: 0.9,
  },
  shareSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  shareCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  shareTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  shareSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    marginBottom: spacing.md,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  linkText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.white,
    marginRight: spacing.sm,
  },
  copyButton: {
    padding: spacing.xs,
  },
  shareButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  shareButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  shareButtonText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.sm,
  },
});

export default TeamScreen;


// ====== End File: src\screens\main\TeamScreen.js ======

// ====== Begin File: src\screens\main\TeamScreenOld.js ======

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  FlatList,
  StatusBar,
  Clipboard,
  Alert,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/SupabaseAuthContext';
import { useUser } from '../../context/SupabaseUserContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { APP_NAME, APP_URL, APP_SHORT_NAME } from '../../constants/branding';
import ReferralTable from '../../components/ReferralTable';

const TeamScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { profile } = useUser();
  const [activeLevel, setActiveLevel] = useState('all');
  
  // In a real app, this would be a proper referral link
  const referralLink = `${APP_URL}/register?ref=${user?.id || 'user123'}`;
  
  // Mock referral structure with different levels
  const mockReferrals = {
    level1: Array.from({ length: Math.floor(Math.random() * 5) + 2 }, (_, i) => ({
      id: `level1-${i + 1}`,
      name: `User ${i + 1}`,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      isActive: Math.random() > 0.3,
      level: 'L1'
    })),
    level2: Array.from({ length: Math.floor(Math.random() * 8) + 4 }, (_, i) => ({
      id: `level2-${i + 1}`,
      name: `User ${i + 10}`,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      isActive: Math.random() > 0.3,
      level: 'L2'
    })),
    level3: Array.from({ length: Math.floor(Math.random() * 12) + 6 }, (_, i) => ({
      id: `level3-${i + 1}`,
      name: `User ${i + 20}`,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      isActive: Math.random() > 0.3,
      level: 'L3'
    }))
  };
  
  // Total referral count
  const totalReferrals = 
    mockReferrals.level1.length + 
    mockReferrals.level2.length + 
    mockReferrals.level3.length;
  
  // Active referrals
  const activeReferrals =
    mockReferrals.level1.filter(ref => ref.isActive).length +
    mockReferrals.level2.filter(ref => ref.isActive).length +
    mockReferrals.level3.filter(ref => ref.isActive).length;
  
  // Copy referral link to clipboard
  const copyReferralLink = () => {
    Clipboard.setString(referralLink);
    Alert.alert('Success', 'Referral link copied to clipboard!');
  };
  
  // Share referral link
  const shareReferralLink = async () => {
    try {
      await Share.share({
        message: `Join ${APP_NAME} and earn daily through tasks and referrals! Sign up with my referral link: ${referralLink}`,
        title: `Join ${APP_NAME}`
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share referral link.');
    }
  };
  
  // Render a referral item
  const renderReferralItem = ({ item }) => (
    <View style={styles.referralItem}>
      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
        style={styles.referralItemInner}
      >
        <View style={styles.referralInfo}>
          <View style={styles.referralNameContainer}>
            <Text style={styles.referralName}>{item.name}</Text>
            <View style={[
              styles.statusBadge,
              item.isActive ? styles.activeBadge : styles.inactiveBadge
            ]}>
              <Text style={[
                styles.statusText,
                item.isActive ? styles.activeText : styles.inactiveText
              ]}>
                {item.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          <Text style={styles.referralDate}>Joined: {item.date}</Text>
        </View>
        
        <View style={styles.levelBadgeContainer}>
          <View style={[styles.levelBadge, styles[`level${item.level}Badge`]]}>
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
  
  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Team</Text>
      </View>
      
      {/* Referral Table Component */}
      <ReferralTable />
    </LinearGradient>
  );
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalReferrals}</Text>
                <Text style={styles.statLabel}>Total Referrals</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{activeReferrals}</Text>
                <Text style={styles.statLabel}>Active Members</Text>
              </View>
            </View>
            
            <View style={styles.levelBreakdownContainer}>
              <Text style={styles.levelBreakdownTitle}>Level Breakdown:</Text>
              
              <View style={styles.levelBreakdownRow}>
                <View style={styles.levelIndicator}>
                  <View style={[styles.levelDot, { backgroundColor: colors.green }]} />
                  <Text style={styles.levelLabel}>Level 1: {mockReferrals.level1.length}</Text>
                </View>
                
                <View style={styles.levelIndicator}>
                  <View style={[styles.levelDot, { backgroundColor: colors.blue500 }]} />
                  <Text style={styles.levelLabel}>Level 2: {mockReferrals.level2.length}</Text>
                </View>
                
                <View style={styles.levelIndicator}>
                  <View style={[styles.levelDot, { backgroundColor: colors.purple }]} />
                  <Text style={styles.levelLabel}>Level 3: {mockReferrals.level3.length}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
        
        {/* Referral Link Card */}
        <View style={styles.referralLinkContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.referralLinkCard}
          >
            <View style={styles.referralLinkHeader}>
              <Ionicons name="link" size={24} color={colors.blue300} />
              <Text style={styles.referralLinkTitle}>Your Referral Link</Text>
            </View>
            
            <View style={styles.referralLinkBox}>
              <Text style={styles.referralLinkText} numberOfLines={1}>
                {referralLink}
              </Text>
            </View>
            
            <View style={styles.referralActionButtons}>
              <TouchableOpacity
                style={[styles.referralAction, styles.copyButton]}
                onPress={copyReferralLink}
              >
                <Ionicons name="copy-outline" size={18} color={colors.white} />
                <Text style={styles.referralActionText}>Copy Link</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.referralAction, styles.shareButton]}
                onPress={shareReferralLink}
              >
                <Ionicons name="share-social-outline" size={18} color={colors.white} />
                <Text style={styles.referralActionText}>Share Link</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
        
        {/* Commissions Card */}
        <View style={styles.commissionsContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.commissionsCard}
          >
            <Text style={styles.commissionsTitle}>Commission Structure</Text>
            
            <View style={styles.commissionItem}>
              <View style={[styles.commissionBadge, { backgroundColor: colors.green }]}>
                <Text style={styles.commissionBadgeText}>L1</Text>
              </View>
              
              <View style={styles.commissionDetails}>
                <Text style={styles.commissionLevel}>Level 1 (Direct)</Text>
                <Text style={styles.commissionDescription}>Your direct referrals</Text>
              </View>
              
              <Text style={styles.commissionAmount}>KES 300</Text>
            </View>
            
            <View style={styles.commissionItem}>
              <View style={[styles.commissionBadge, { backgroundColor: colors.blue500 }]}>
                <Text style={styles.commissionBadgeText}>L2</Text>
              </View>
              
              <View style={styles.commissionDetails}>
                <Text style={styles.commissionLevel}>Level 2 (Indirect)</Text>
                <Text style={styles.commissionDescription}>Your referrals' referrals</Text>
              </View>
              
              <Text style={styles.commissionAmount}>KES 100</Text>
            </View>
            
            <View style={styles.commissionItem}>
              <View style={[styles.commissionBadge, { backgroundColor: colors.purple }]}>
                <Text style={styles.commissionBadgeText}>L3</Text>
              </View>
              
              <View style={styles.commissionDetails}>
                <Text style={styles.commissionLevel}>Level 3 (Network)</Text>
                <Text style={styles.commissionDescription}>Extended network</Text>
              </View>
              
              <Text style={styles.commissionAmount}>KES 50</Text>
            </View>
          </LinearGradient>
        </View>
        
        {/* Referral List Section */}
        <View style={styles.referralsContainer}>
          <Text style={styles.sectionTitle}>Your Referrals</Text>
          
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeLevel === 'all' && styles.activeTab]}
              onPress={() => setActiveLevel('all')}
            >
              <Text style={[styles.tabText, activeLevel === 'all' && styles.activeTabText]}>All Levels</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeLevel === 'level1' && styles.activeTab]}
              onPress={() => setActiveLevel('level1')}
            >
              <Text style={[styles.tabText, activeLevel === 'level1' && styles.activeTabText]}>Level 1</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeLevel === 'level2' && styles.activeTab]}
              onPress={() => setActiveLevel('level2')}
            >
              <Text style={[styles.tabText, activeLevel === 'level2' && styles.activeTabText]}>Level 2</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeLevel === 'level3' && styles.activeTab]}
              onPress={() => setActiveLevel('level3')}
            >
              <Text style={[styles.tabText, activeLevel === 'level3' && styles.activeTabText]}>Level 3</Text>
            </TouchableOpacity>
          </View>
          
          {/* Level 1 Referrals */}
          {mockReferrals.level1.length > 0 && (
            <View style={styles.levelSection}>
              <View style={styles.levelHeader}>
                <View style={[styles.levelIndicator, { marginBottom: 0 }]}>
                  <View style={[styles.levelDot, { backgroundColor: colors.green }]} />
                  <Text style={styles.levelSectionTitle}>Level 1 (Direct)</Text>
                </View>
                
                <Text style={styles.levelCount}>{mockReferrals.level1.length}</Text>
              </View>
              
              <FlatList
                data={mockReferrals.level1}
                renderItem={renderReferralItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            </View>
          )}
          
          {/* Level 2 Referrals */}
          {mockReferrals.level2.length > 0 && (
            <View style={styles.levelSection}>
              <View style={styles.levelHeader}>
                <View style={[styles.levelIndicator, { marginBottom: 0 }]}>
                  <View style={[styles.levelDot, { backgroundColor: colors.blue500 }]} />
                  <Text style={styles.levelSectionTitle}>Level 2 (Indirect)</Text>
                </View>
                
                <Text style={styles.levelCount}>{mockReferrals.level2.length}</Text>
              </View>
              
              <FlatList
                data={mockReferrals.level2}
                renderItem={renderReferralItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            </View>
          )}
          
          {/* Level 3 Referrals */}
          {mockReferrals.level3.length > 0 && (
            <View style={styles.levelSection}>
              <View style={styles.levelHeader}>
                <View style={[styles.levelIndicator, { marginBottom: 0 }]}>
                  <View style={[styles.levelDot, { backgroundColor: colors.purple }]} />
                  <Text style={styles.levelSectionTitle}>Level 3 (Network)</Text>
                </View>
                
                <Text style={styles.levelCount}>{mockReferrals.level3.length}</Text>
              </View>
              
              <FlatList
                data={mockReferrals.level3}
                renderItem={renderReferralItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
  },
  // Stats Card styles
  statsCardContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statsCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  statsTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
  },
  statDivider: {
    height: 40,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  levelBreakdownContainer: {
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingTop: spacing.md,
  },
  levelBreakdownTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  levelBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  levelDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.xs,
  },
  levelLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  // Referral Link Card styles
  referralLinkContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  referralLinkCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  referralLinkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  referralLinkTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.sm,
  },
  referralLinkBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  referralLinkText: {
    fontSize: fontSizes.sm,
    color: colors.white,
  },
  referralActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  referralAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: spacing.sm,
    flex: 1,
  },
  copyButton: {
    backgroundColor: colors.blue700,
    marginRight: spacing.sm,
  },
  shareButton: {
    backgroundColor: colors.green,
    marginLeft: spacing.sm,
  },
  referralActionText: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.xs,
  },
  // Commissions Card styles
  commissionsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  commissionsCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  commissionsTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  commissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  commissionBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  commissionBadgeText: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.white,
  },
  commissionDetails: {
    flex: 1,
  },
  commissionLevel: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.white,
  },
  commissionDescription: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  commissionAmount: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.green,
  },
  // Referrals List styles
  referralsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl * 2, // Extra space for bottom nav
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabText: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  activeTabText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  levelSection: {
    marginBottom: spacing.lg,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  levelSectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  levelCount: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
  },
  referralItem: {
    marginBottom: spacing.sm,
  },
  referralItemInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.sm,
  },
  referralInfo: {
    flex: 1,
  },
  referralNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  referralName: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.white,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeBadge: {
    backgroundColor: 'rgba(40, 167, 69, 0.3)',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(220, 53, 69, 0.3)',
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
  },
  activeText: {
    color: colors.success,
  },
  inactiveText: {
    color: colors.error,
  },
  referralDate: {
    fontSize: fontSizes.xs,
    color: colors.blue300,
  },
  levelBadgeContainer: {
    marginLeft: spacing.sm,
  },
  levelBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelL1Badge: {
    backgroundColor: colors.green,
  },
  levelL2Badge: {
    backgroundColor: colors.blue500,
  },
  levelL3Badge: {
    backgroundColor: colors.purple,
  },
  levelText: {
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
    color: colors.white,
  },
});

export default TeamScreen;


// ====== End File: src\screens\main\TeamScreenOld.js ======

// ====== Begin File: src\screens\main\UpgradeDetailScreen.js ======

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback
,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../context/SupabaseUserContext';
import { initiateSTKPush } from '../../services/api';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { useNotification } from '../../context/NotificationContext';
import { APP_NAME, APP_SHORT_NAME } from '../../constants/branding';

const UpgradeDetailScreen = ({ navigation, route }) => {
  const { level } = route.params;
  const { profile, currentLevel, levels, upgradeLevel, addToRechargeWallet } = useUser();
  const { showNotification } = useNotification();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('details'); // 'details', 'payment', 'processing', 'complete'
  
  // Calculate required amount
  const depositBalance = profile?.recharge_wallet || 0;
  const incomeBalance = profile?.incomeWallet ?? 0;
  const currentInvestment = profile?.expense ?? 0;
  const totalAvailable = depositBalance + incomeBalance + currentInvestment;
  const requiredAmount = Math.max(level.cost - totalAvailable, 0);
  
  // Can upgrade with current balance
  const canUpgradeWithBalance = totalAvailable >= level.cost;
  
  // Handle upgrade with current balance
  const handleUpgradeWithBalance = () => {
    if (!canUpgradeWithBalance) {
      Alert.alert(
        'Insufficient Balance',
        'Your current wallet balance is insufficient for this upgrade.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsLoading(true);
    
    // Simulate a delay for the upgrade process
    setTimeout(async () => {
      const success = await upgradeLevel(level.id, level.cost);
      
      setIsLoading(false);
      
      if (success) {
        showNotification({
          type: 'success',
          title: 'Upgrade successful',
          message: `You are now on the ${level.name} level. Enjoy higher earnings with ${APP_NAME}!`,
        });
        setStep('complete');
      } else {
        showNotification({
          type: 'error',
          title: 'Upgrade failed',
          message: 'There was an error processing your upgrade. Please try again.',
        });
        Alert.alert(
          'Upgrade Failed',
          'There was an error processing your upgrade. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }, 2000);
  };
  
  // Handle initiating STK push for payment
  const handleInitiatePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid M-Pesa phone number.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format phone number (remove any spaces and ensure it starts with correct format)
      let formattedPhone = phoneNumber.replace(/\s+/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254' + formattedPhone;
      }
      
      const result = await initiateSTKPush(
        formattedPhone, 
        requiredAmount, 
        `${APP_SHORT_NAME}-Upgrade-${level.name}`
      );
      
      if (result.success) {
        setStep('processing');
        
        // In a real app, you would poll the payment status endpoint
        // For this demo, we'll simulate a successful payment after 5 seconds
        setTimeout(async () => {
          setIsLoading(false);

          await addToRechargeWallet(requiredAmount, `Recharge for ${level.name} level upgrade`, 'RECHARGE');

          const upgradeSuccess = await upgradeLevel(level.id, level.cost);

          if (upgradeSuccess) {
            showNotification({
              type: 'success',
              title: 'Upgrade successful',
              message: `Your account is now on the ${level.name} level. Explore the new perks immediately!`,
            });
            setStep('complete');
          } else {
            showNotification({
              type: 'error',
              title: 'Upgrade failed',
              message: 'There was an error processing your upgrade after payment.',
            });
            Alert.alert(
              'Upgrade Failed',
              'There was an error processing your upgrade after payment.',
              [{ text: 'OK' }]
            );
          }
        }, 5000);
      } else {
        setIsLoading(false);
        showNotification({
          type: 'error',
          title: 'Payment failed',
          message: 'Failed to initiate the upgrade payment. Please try again later.',
        });
        Alert.alert(
          'Payment Failed',
          'Failed to initiate the STK push. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      setIsLoading(false);
      showNotification({
        type: 'error',
        title: 'Upgrade error',
        message: 'An unexpected error occurred while processing your payment request.',
      });
      Alert.alert(
        'Error',
        'An error occurred while processing your payment request.',
        [{ text: 'OK' }]
      );
    }
  };
  
  const renderDetailsStep = () => {
    return (
      <View style={styles.contentContainer}>
        <View style={styles.upgradeInfoCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.upgradeInfoCardInner}
          >
            <View style={styles.headerRow}>
              <View style={[styles.levelBadge, { backgroundColor: level.color }]}>
                <Ionicons name={level.icon} size={24} color={colors.white} />
              </View>
              <Text style={styles.upgradeTitle}>Upgrade to {level.name}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Level Price:</Text>
              <Text style={styles.infoValue}>KES {level.cost.toLocaleString()}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current Level Investment:</Text>
              <Text style={styles.infoValue}>KES {(profile?.expense || 0).toLocaleString()}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Recharge Wallet:</Text>
              <Text style={styles.infoValue}>KES {depositBalance.toLocaleString()}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Income Wallet:</Text>
              <Text style={styles.infoValue}>KES {incomeBalance.toLocaleString()}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current Investment:</Text>
              <Text style={styles.infoValue}>KES {currentInvestment.toLocaleString()}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Available:</Text>
              <Text style={styles.infoValue}>KES {totalAvailable.toLocaleString()}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>
                {requiredAmount > 0 ? 'Amount to Add:' : 'Ready to Upgrade:'}
              </Text>
              <Text style={styles.amountValue}>
                {requiredAmount > 0 
                  ? `KES ${requiredAmount.toLocaleString()}`
                  : 'Balance Sufficient'}
              </Text>
            </View>
            
            {requiredAmount > 0 ? (
              <TouchableOpacity
                style={styles.proceedButton}
                onPress={() => setStep('payment')}
              >
                <LinearGradient
                  colors={[colors.blue600, colors.blue800]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Proceed to Payment</Text>
                  <Ionicons name="arrow-forward" size={18} color={colors.white} />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.proceedButton}
                onPress={handleUpgradeWithBalance}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={[colors.green, colors.teal]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Upgrade Now</Text>
                      <Ionicons name="arrow-forward" size={18} color={colors.white} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>
        
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Level Benefits</Text>
          
          <View style={styles.benefitsCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              style={styles.benefitsCardInner}
            >
              <View style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
                <Text style={styles.benefitText}>
                  {level.tasks} daily tasks (vs. {currentLevel?.tasks ?? 0} current)
                </Text>
              </View>
              
              <View style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
                <Text style={styles.benefitText}>
                  KES {level.dailyEarnings.toLocaleString()} potential daily earnings
                </Text>
              </View>
              
              <View style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
                <Text style={styles.benefitText}>
                  KES {level.annualEarnings.toLocaleString()} potential annual earnings
                </Text>
              </View>
              
              <View style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
                <Text style={styles.benefitText}>
                  {level.multiplier}x earnings multiplier
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>
      </View>
    );
  };
  
  const renderPaymentStep = () => {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.contentContainer}>
          <View style={styles.paymentCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              style={styles.paymentCardInner}
            >
              <View style={styles.paymentHeader}>
                <Ionicons name="cash-outline" size={40} color={colors.green} />
                <Text style={styles.paymentTitle}>M-Pesa Payment</Text>
              </View>
              
              <View style={styles.amountBox}>
                <Text style={styles.amountBoxLabel}>Amount to Pay</Text>
                <Text style={styles.amountBoxValue}>KES {requiredAmount.toLocaleString()}</Text>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Enter M-Pesa Phone Number</Text>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="e.g. 07XXXXXXXX"
                  placeholderTextColor={colors.gray500}
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
              
              <View style={styles.paymentInfo}>
                <Ionicons name="information-circle" size={18} color={colors.blue300} />
                <Text style={styles.paymentInfoText}>
                  You will receive an STK push notification on your phone to complete the payment.
                </Text>
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.backButton]}
                  onPress={() => setStep('details')}
                  disabled={isLoading}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.payButton]}
                  onPress={handleInitiatePayment}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={[colors.green, colors.teal]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <Text style={styles.buttonText}>Pay Now</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };
  
  const renderProcessingStep = () => {
    return (
      <View style={styles.centeredContainer}>
        <LinearGradient
          colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
          style={styles.processingCard}
        >
          <ActivityIndicator size="large" color={colors.blue400} />
          <Text style={styles.processingTitle}>Processing Payment</Text>
          <Text style={styles.processingText}>
            Please wait while we verify your payment and upgrade your account...
          </Text>
        </LinearGradient>
      </View>
    );
  };
  
  const renderCompleteStep = () => {
    return (
      <View style={styles.centeredContainer}>
        <LinearGradient
          colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
          style={styles.completeCard}
        >
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color={colors.success} />
          </View>
          
          <Text style={styles.completeTitle}>Upgrade Successful!</Text>
          
          <Text style={styles.completeText}>
            Your account has been upgraded to the {level.name} level. 
            You can now enjoy all the benefits of your new level!
          </Text>
          
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => navigation.navigate('UpgradeMain')}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Done</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };
  
  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header with back button */}
      {step !== 'complete' && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButtonContainer}
            onPress={() => {
              if (step === 'details' || step === 'complete') {
                navigation.goBack();
              } else {
                setStep('details');
              }
            }}
            disabled={isLoading || step === 'processing'}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Level Upgrade</Text>
          <View style={{ width: 24 }} />
        </View>
      )}
      
      {/* Content based on current step */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={step !== 'processing' && step !== 'complete'}
      >
        {step === 'details' && renderDetailsStep()}
        {step === 'payment' && renderPaymentStep()}
        {step === 'processing' && renderProcessingStep()}
        {step === 'complete' && renderCompleteStep()}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl * 2,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  upgradeInfoCard: {
    marginBottom: spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.md,
  },
  upgradeInfoCardInner: {
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  levelBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  upgradeTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: fontSizes.md,
    color: colors.blue200,
  },
  infoValue: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  amountLabel: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.blue200,
  },
  amountValue: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.green,
  },
  proceedButton: {
    overflow: 'hidden',
    borderRadius: 10,
    ...shadows.md,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  buttonText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginRight: spacing.sm,
  },
  benefitsContainer: {
    marginBottom: spacing.lg,
  },
  benefitsTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  benefitsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.md,
  },
  benefitsCardInner: {
    padding: spacing.lg,
  },
  benefitRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  benefitIcon: {
    marginRight: spacing.sm,
  },
  benefitText: {
    fontSize: fontSizes.md,
    color: colors.white,
    flex: 1,
  },
  paymentCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.md,
  },
  paymentCardInner: {
    padding: spacing.lg,
  },
  paymentHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  paymentTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: spacing.sm,
  },
  amountBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  amountBoxLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    marginBottom: spacing.xs,
  },
  amountBoxValue: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSizes.md,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  phoneInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: spacing.md,
    fontSize: fontSizes.lg,
    color: colors.white,
    ...shadows.sm,
  },
  paymentInfo: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  paymentInfoText: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
    marginLeft: spacing.sm,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  backButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
  },
  payButton: {
    flex: 2,
    ...shadows.md,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  processingCard: {
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  processingTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  processingText: {
    fontSize: fontSizes.md,
    color: colors.blue200,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  completeCard: {
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  successIcon: {
    marginBottom: spacing.lg,
  },
  completeTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  completeText: {
    fontSize: fontSizes.md,
    color: colors.blue200,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  doneButton: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    ...shadows.md,
  },
});

export default UpgradeDetailScreen;


// ====== End File: src\screens\main\UpgradeDetailScreen.js ======

// ====== Begin File: src\screens\main\UpgradeScreen.js ======

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../context/SupabaseUserContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';

const UpgradeScreen = React.memo(({ navigation }) => {
  const { profile, currentLevel, levels } = useUser();

  if (!profile) {
    return (
      <LinearGradient colors={gradients.primary} style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Loading upgrades...</Text>
        </View>
      </LinearGradient>
    );
  }

  const currentBalance = profile?.recharge_wallet || 0;
  const currentLevelId = profile?.current_level ?? 0;
  const currentLevelData = currentLevel;
  
  // Filter out levels lower than or equal to current level
  const availableLevels = levels.filter(level => level.id > currentLevelId && !level.isLocked);
  
  const renderLevelHeader = () => {
    return (
      <View style={styles.tableHeader}>
        <View style={[styles.headerCellContainer, { flex: 1.5 }]}>
          <Text style={styles.headerCell}>Level</Text>
        </View>
        <View style={[styles.headerCellContainer, { flex: 1 }]}>
          <Text style={styles.headerCell}>Cost</Text>
        </View>
        <View style={[styles.headerCellContainer, { flex: 1 }]}>
          <Text style={styles.headerCell}>Tasks</Text>
        </View>
        <View style={[styles.headerCellContainer, { flex: 1 }]}>
          <Text style={styles.headerCell}>Earnings/Day</Text>
        </View>
      </View>
    );
  };
  
  const renderLevelRow = (level, isCurrentLevel) => {
    return (
      <View 
        style={[
          styles.tableRow, 
          isCurrentLevel && styles.currentLevelRow,
          level.isLocked && { opacity: 0.5 }
        ]}
      >
        <View style={[styles.tableCellContainer, { flex: 1.5 }]}> 
          <Text style={styles.levelCell}>
            {level.name}
            {level.isLocked && (
              <Ionicons name="lock-closed" size={14} color={colors.gray400} style={{ marginLeft: 4 }} />
            )}
            {isCurrentLevel && (
              <Text style={styles.currentLabel}> (Current)</Text>
            )}
          </Text>
        </View>
        <View style={[styles.tableCellContainer, { flex: 1 }]}> 
          <Text style={styles.tableCell}>
            KES {level.cost.toLocaleString()}
          </Text>
        </View>
        <View style={[styles.tableCellContainer, { flex: 1 }]}> 
          <Text style={styles.tableCell}>
            {level.tasks}
          </Text>
        </View>
        <View style={[styles.tableCellContainer, { flex: 1 }]}> 
          <Text style={styles.tableCell}>
            KES {level.dailyEarnings.toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };
  
  const renderLevelCard = ({ item }) => {
    return (
      <LinearGradient
        colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
        style={styles.levelCard}
      >
        <View style={[styles.levelBadge, { backgroundColor: item.color }]}> 
          <Ionicons name={item.icon} size={24} color={colors.white} />
        </View>
        
        <Text style={styles.levelName}>{item.name} {item.isLocked && <Ionicons name="lock-closed" size={16} color={colors.gray400} />}</Text>
        
        <View style={styles.levelFeature}>
          <Ionicons name="checkbox-outline" size={18} color={colors.success} />
          <Text style={styles.levelFeatureText}>
            {item.tasks} tasks per day
          </Text>
        </View>
        
        <View style={styles.levelFeature}>
          <Ionicons name="cash-outline" size={18} color={colors.success} />
          <Text style={styles.levelFeatureText}>
            KES {item.earningsPerTask} per task
          </Text>
        </View>
        
        <View style={styles.levelFeature}>
          <Ionicons name="calendar-outline" size={18} color={colors.success} />
          <Text style={styles.levelFeatureText}>
            Up to KES {item.dailyEarnings.toLocaleString()} daily
          </Text>
        </View>
        
        <View style={styles.levelFeature}>
          <Ionicons name="trending-up-outline" size={18} color={colors.success} />
          <Text style={styles.levelFeatureText}>
            KES {item.annualEarnings.toLocaleString()} annual potential
          </Text>
        </View>
        
        <View style={styles.levelFeature}>
          <Ionicons name="flash-outline" size={18} color={colors.success} />
          <Text style={styles.levelFeatureText}>
            {item.multiplier}x earnings multiplier
          </Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Upgrade Price:</Text>
          <Text style={styles.price}>KES {item.cost.toLocaleString()}</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.upgradeButton, item.isLocked && { opacity: 0.5 }]}
          disabled={item.isLocked}
          onPress={() => navigation.navigate('UpgradeDetail', { level: item })}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.upgradeButtonGradient}
          >
            <Text style={styles.upgradeButtonText}>{item.isLocked ? 'Locked' : `Upgrade to ${item.name}`}</Text>
            {!item.isLocked && <Ionicons name="arrow-forward" size={18} color={colors.white} />}
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    );
  };
  
  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Level Upgrades</Text>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={Platform.OS === 'android' ? { flexGrow: 1 } : null}
        nestedScrollEnabled={Platform.OS === 'android'}
        removeClippedSubviews={Platform.OS === 'android'}
        scrollEventThrottle={16}
        overScrollMode="always"
      >
        {/* Current level info */}
        <View style={styles.currentLevelContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.currentLevelCard}
          >
            <View style={styles.currentLevelHeader}>
              <View>
                <Text style={styles.currentLevelLabel}>Current Level</Text>
                <Text style={styles.currentLevelName}>{currentLevelData.name}</Text>
              </View>
              
              <View style={[styles.levelBadge, { backgroundColor: currentLevelData.color }]}>
                <Ionicons name={currentLevelData.icon} size={24} color={colors.white} />
              </View>
            </View>
            
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{currentLevelData.tasks}</Text>
                <Text style={styles.statLabel}>Daily Tasks</Text>
              </View>
              
              <View style={styles.stat}>
                <Text style={styles.statValue}>KES {currentLevelData.earningsPerTask}</Text>
                <Text style={styles.statLabel}>Per Task</Text>
              </View>
              
              <View style={styles.stat}>
                <Text style={styles.statValue}>KES {currentLevelData.dailyEarnings}</Text>
                <Text style={styles.statLabel}>Daily Earning</Text>
              </View>
            </View>
            
            <View style={styles.expenseContainer}>
              <Text style={styles.expenseLabel}>Investment in this level:</Text>
              <Text style={styles.expense}>KES {(profile.level_investment || 0).toLocaleString()}</Text>
            </View>
          </LinearGradient>
        </View>
        
        {/* Level comparison table */}
        <View style={styles.tableContainer}>
          <Text style={styles.sectionTitle}>Level Comparison</Text>
          
          <View style={styles.table}>
            {renderLevelHeader()}
            {levels.map(level => (
              <View key={level.id}>
                {renderLevelRow(level, level.id === currentLevelId)}
              </View>
            ))}
          </View>
        </View>
        {/* Level Descriptions */}
        <View style={styles.descriptionsContainer}>
          <Text style={styles.sectionTitle}>Level Descriptions</Text>
          <View style={styles.descriptionsCard}>
            {levels.map((level) => (
              <View key={level.id} style={{ marginBottom: 16 }}>
                <Text style={[styles.levelName, { color: colors.primary, fontSize: 18 }]}>{level.name}</Text>
                <Text style={styles.descriptionItem}>
                  Entry Cost: <Text style={{ fontWeight: 'bold' }}>KES {level.cost.toLocaleString()}</Text>{'\n'}
                  Daily Tasks: <Text style={{ fontWeight: 'bold' }}>{level.tasks}</Text>{'\n'}
                  Daily Earnings: <Text style={{ fontWeight: 'bold' }}>KES {level.dailyEarnings.toLocaleString()}</Text>{'\n'}
                  {level.description || 'Enjoy the benefits and perks of this level.'}
                </Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Available upgrades */}
        <View style={styles.upgradesContainer}>
          <Text style={styles.sectionTitle}>Available Upgrades</Text>
          
          {availableLevels.length > 0 ? (
            <FlatList
              data={availableLevels}
              renderItem={renderLevelCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.upgradesList}
            />
          ) : (
            <View style={styles.maxLevelContainer}>
              <LinearGradient
                colors={['rgba(255,215,0,0.3)', 'rgba(255,215,0,0.1)']}
                style={styles.maxLevelCard}
              >
                <Ionicons name="trophy" size={48} color={colors.amber} />
                <Text style={styles.maxLevelTitle}>Maximum Level Reached!</Text>
                <Text style={styles.maxLevelText}>
                  Congratulations! You've reached the highest level available.
                </Text>
              </LinearGradient>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...(Platform.OS === 'web' && { minHeight: '100vh' })
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
  },
  currentLevelContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  currentLevelCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  currentLevelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  currentLevelLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
    marginBottom: spacing.xs / 2,
  },
  currentLevelName: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  levelBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    color: colors.blue300,
  },
  expenseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingTop: spacing.md,
  },
  expenseLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  expense: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.green,
  },
  tableContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  descriptionsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  descriptionsCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  descriptionItem: {
    fontSize: fontSizes.md,
    color: colors.gray700,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  table: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    ...shadows.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  headerCellContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
  },
  headerCell: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.blue200,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tableCellContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
  },
  currentLevelRow: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  levelCell: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.white,
  },
  currentLabel: {
    fontSize: fontSizes.xs,
    color: colors.success,
    fontStyle: 'italic',
  },
  tableCell: {
    fontSize: fontSizes.sm,
    color: colors.white,
    textAlign: 'center',
  },
  upgradesContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl * 2, // Extra space for bottom nav
  },
  upgradesList: {
    paddingBottom: spacing.md,
  },
  levelCard: {
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  levelName: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  levelFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  levelFeatureText: {
    fontSize: fontSizes.md,
    color: colors.white,
    marginLeft: spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  priceLabel: {
    fontSize: fontSizes.md,
    color: colors.blue200,
  },
  price: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  upgradeButton: {
    overflow: 'hidden',
    borderRadius: 10,
    ...shadows.md,
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  upgradeButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginRight: spacing.sm,
  },
  maxLevelContainer: {
    marginBottom: spacing.xl,
  },
  maxLevelCard: {
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  maxLevelTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.amber,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  maxLevelText: {
    fontSize: fontSizes.md,
    color: colors.white,
    textAlign: 'center',
  },
});

export default UpgradeScreen;


// ====== End File: src\screens\main\UpgradeScreen.js ======

// ====== Begin File: src\screens\main\WealthFundScreen.js ======

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../context/SupabaseUserContext';
import supabaseData from '../../services/supabaseData';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { generateBanks } from '../../utils/mockData';
import BankCard from '../../components/BankCard';
import InvestmentCard from '../../components/InvestmentCard';
import { useNotification } from '../../context/NotificationContext';
import { APP_NAME } from '../../constants/branding';

const WealthFundScreen = ({ navigation }) => {
  const { profile, createInvestment, investments, withdrawInvestment, loadUserData } = useUser();
  const { showNotification } = useNotification();
  
  const [selectedBank, setSelectedBank] = useState(null);
  const [featuredBanks, setFeaturedBanks] = useState([]);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [showActive, setShowActive] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);
  const availableBalance = profile?.income_wallet || profile?.incomeWallet || 0;
  
  // Fetch banks from Supabase
  const [banks, setBanks] = useState([]);
  useEffect(() => {
    async function fetchBanks() {
      const { data } = await supabaseData.getInvestmentBanks();
      if (Array.isArray(data) && data.length > 0) {
        setBanks(data);
      } else {
        // Fallback to mock banks if none are configured in Supabase
        setBanks(generateBanks());
      }
    }
    fetchBanks();
  }, []);

  useEffect(() => {
    // Highlight first bank by default and rotate feature set for motion
    if (!selectedBank && banks.length > 0) {
      setSelectedBank(banks[0]);
    }

    const rotationInterval = setInterval(() => {
      setFeaturedBanks(prev => {
        if (prev.length === 0) {
          return banks.slice(0, 3);
        }
        const nextIndex = (banks.findIndex(b => b.id === prev[0].id) + 1) % banks.length;
        const windowBanks = [];
        for (let i = 0; i < 3; i++) {
          windowBanks.push(banks[(nextIndex + i) % banks.length]);
        }
        return windowBanks;
      });
    }, 10000);

    // Initialize feature set immediately
    setFeaturedBanks(banks.slice(0, 3));

    return () => clearInterval(rotationInterval);
  }, [banks, selectedBank]);
  
  // Filter investments by active/completed status
  const activeInvestments = (Array.isArray(investments) ? investments : []).filter(inv => (inv.status || '').toUpperCase() === 'ACTIVE');
  const completedInvestments = (Array.isArray(investments) ? investments : []).filter(inv => (inv.status || '').toUpperCase() === 'COMPLETED');
  
  // Calculate total invested amount
  const totalInvested = (Array.isArray(investments) ? investments : []).reduce(
    (sum, inv) => sum + (inv.status === 'ACTIVE' ? (inv.principal || inv.amount || 0) : 0), 
    0
  );
  
  // Calculate total profits
  const totalProfits = (Array.isArray(investments) ? investments : []).reduce(
    (sum, inv) => {
      const profit = (inv.current_value || inv.currentValue || 0) - (inv.principal || inv.amount || 0);
      return sum + (inv.status === 'ACTIVE' ? profit : 0);
    },
    0
  );
  
  // Update investment values periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      // updateInvestments(); // Commented out - function not defined
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Handle bank selection
  const handleSelectBank = (bank) => {
    setSelectedBank(bank);
    setInvestmentAmount('');
  };
  
  // Handle investment creation
  const handleInvest = () => {
    if (!selectedBank) {
      Alert.alert('Error', 'Please select a bank to invest in.');
      return;
    }
    
    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to invest.');
      return;
    }
    
    if (amount < selectedBank.minAmount) {
      Alert.alert(
        'Minimum Investment',
        `The minimum investment for ${selectedBank.name} is KES ${selectedBank.minAmount.toLocaleString()}.`
      );
      return;
    }
    
    if (amount > availableBalance) {
      Alert.alert(
        'Insufficient Funds',
        'You don\'t have enough balance in your income wallet for this investment.'
      );
      return;
    }
    
    const success = createInvestment(
      selectedBank, 
      amount, 
      selectedBank.rate, 
      selectedBank.days
    );
    
    if (success) {
      showNotification({
        type: 'success',
        title: 'Investment successful',
        message: `KES ${amount.toLocaleString()} invested in ${selectedBank.name}.`,
      });
      Alert.alert(
        'Investment Successful',
        `You have successfully invested KES ${amount.toLocaleString()} in ${selectedBank.name}.`
      );
      setInvestmentAmount('');
    } else {
      showNotification({
        type: 'error',
        title: 'Investment failed',
        message: 'Failed to create investment. Please try again.',
      });
      Alert.alert('Error', 'Failed to create investment. Please try again.');
    }
  };
  
  // Handle withdrawing investment
  const handleWithdraw = (investmentId) => {
    const amount = withdrawInvestment(investmentId);
    
    if (amount > 0) {
      showNotification({
        type: 'success',
        title: 'Withdrawal successful',
        message: `KES ${amount.toLocaleString()} returned to your income wallet.`,
      });
      Alert.alert(
        'Withdrawal Successful',
        `KES ${amount.toLocaleString()} has been added back to your income wallet.`
      );
    } else {
      showNotification({
        type: 'error',
        title: 'Withdrawal failed',
        message: 'Failed to withdraw investment. Please try again.',
      });
      Alert.alert('Error', 'Failed to withdraw investment. Please try again.');
    }
  };
  
  if (!profile) {
    return (
      <LinearGradient colors={gradients.primary} style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={[styles.keyboardAvoidingView, styles.loadingContainer]}>
          <Text style={styles.loadingText}>Loading wealth data...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.walletSubtitle}>Upgrade funds only</Text>
            <Text style={styles.walletNote}>Use income wallet for investments</Text>
            
            <View style={{ width: 24 }} />
          </View>
          
          {/* Investment Summary */}
          <View style={styles.summaryContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              style={styles.summaryCard}
            >
              <Text style={styles.summaryTitle}>Investment Summary</Text>
              
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    KES {totalInvested.toLocaleString()}
                  </Text>
                  <Text style={styles.statLabel}>Total Invested</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.green }]}>
                    KES {totalProfits.toLocaleString()}
                  </Text>
                  <Text style={styles.statLabel}>Current Profits</Text>
                </View>
              </View>
              
              <View style={styles.walletInfo}>
                <Text style={styles.walletLabel}>Available in Income Wallet:</Text>
                <Text style={styles.walletValue}>
                  KES {availableBalance.toLocaleString()}
                </Text>
              </View>
            </LinearGradient>
          </View>
          
          {/* Investment Form */}
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Create New Investment</Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.banksScrollContainer}
            >
              {banks.map(bank => (
                <Animated.View
                  key={bank.id}
                  style={styles.bankCardContainer}
                >
                  <BankCard
                    bank={bank}
                    onSelect={handleSelectBank}
                    isSelected={selectedBank?.id === bank.id}
                  />
                </Animated.View>
              ))}
            </ScrollView>
            
            <View style={styles.featuredBanksContainer}>
              <Text style={styles.featuredBanksTitle}>Market Pulse</Text>
              <View style={styles.featuredBanksRow}>
                {featuredBanks.map(bank => (
                  <LinearGradient
                    key={`feature-${bank.id}`}
                    colors={[`${bank.color}33`, `${bank.color}11`]}
                    style={styles.featuredBankBadge}
                  >
                    <Ionicons name="analytics" size={16} color={colors.white} />
                    <Text style={styles.featuredBankName}>{bank.name}</Text>
                    <Text style={styles.featuredBankRate}>{bank.rate}% daily</Text>
                  </LinearGradient>
                ))}
              </View>
            </View>
            
            {selectedBank && (
              <View style={styles.investmentForm}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                  style={styles.formCard}
                >
                  <Text style={styles.formTitle}>
                    Invest in {selectedBank.name}
                  </Text>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Investment Amount (KES)</Text>
                    <TextInput
                      style={styles.input}
                      value={investmentAmount}
                      onChangeText={setInvestmentAmount}
                      placeholder={`Min ${selectedBank.minAmount.toLocaleString()}`}
                      placeholderTextColor={colors.gray500}
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <View style={styles.projectionContainer}>
                    <Text style={styles.projectionTitle}>Profit Projection</Text>
                    
                    <View style={styles.projectionRow}>
                      <Text style={styles.projectionLabel}>Daily Interest:</Text>
                      <Text style={styles.projectionValue}>
                        {selectedBank.rate}%
                      </Text>
                    </View>
                    
                    <View style={styles.projectionRow}>
                      <Text style={styles.projectionLabel}>Period:</Text>
                      <Text style={styles.projectionValue}>
                        {selectedBank.days} days
                      </Text>
                    </View>
                    
                    {investmentAmount && !isNaN(parseFloat(investmentAmount)) && parseFloat(investmentAmount) > 0 && (
                      <>
                        <View style={styles.projectionRow}>
                          <Text style={styles.projectionLabel}>Principal:</Text>
                          <Text style={styles.projectionValue}>
                            KES {parseFloat(investmentAmount).toLocaleString()}
                          </Text>
                        </View>
                        
                        <View style={styles.projectionRow}>
                          <Text style={styles.projectionLabel}>Estimated Return:</Text>
                          <Text style={[styles.projectionValue, { color: colors.green }]}>
                            KES {(
                              parseFloat(investmentAmount) * 
                              Math.pow(1 + (selectedBank.rate / 100), selectedBank.days)
                            ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                  
                  <TouchableOpacity
                    style={[
                      styles.investButton,
                      (!investmentAmount || isNaN(parseFloat(investmentAmount)) || parseFloat(investmentAmount) <= 0) && 
                      styles.disabledButton
                    ]}
                    onPress={handleInvest}
                    disabled={!investmentAmount || isNaN(parseFloat(investmentAmount)) || parseFloat(investmentAmount) <= 0}
                  >
                    <LinearGradient
                      colors={[colors.green, colors.teal]}
                      style={styles.investButtonGradient}
                    >
                      <Text style={styles.investButtonText}>Invest Now</Text>
                      <Ionicons name="arrow-forward" size={18} color={colors.white} />
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}
          </View>
          
          {/* Current Investments */}
          {(activeInvestments.length > 0 || completedInvestments.length > 0) && (
            <View style={styles.investmentsContainer}>
              <View style={styles.investmentsHeader}>
                <Text style={styles.sectionTitle}>Your Investments</Text>
                
                <View style={styles.filterContainer}>
                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      showActive && styles.filterButtonActive
                    ]}
                    onPress={() => setShowActive(!showActive)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      showActive && styles.filterButtonTextActive
                    ]}>
                      Active
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      showCompleted && styles.filterButtonActive
                    ]}
                    onPress={() => setShowCompleted(!showCompleted)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      showCompleted && styles.filterButtonTextActive
                    ]}>
                      Completed
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Active Investments */}
              {showActive && activeInvestments.length > 0 && (
                <>
                  <Text style={styles.investmentTypeLabel}>Active Investments</Text>
                  {activeInvestments.map(investment => (
                    <InvestmentCard
                      key={investment.id}
                      investment={investment}
                      onWithdraw={async (id) => { await withdrawInvestment(id); await loadUserData(); }}
                    />
                  ))}
                </>
              )}
              
              {/* Completed Investments */}
              {showCompleted && completedInvestments.length > 0 && (
                <>
                  <Text style={styles.investmentTypeLabel}>Completed Investments</Text>
                  {completedInvestments.map(investment => (
                    <InvestmentCard
                      key={investment.id}
                      investment={investment}
                      onWithdraw={async (id) => { await withdrawInvestment(id); await loadUserData(); }}
                    />
                  ))}
                </>
              )}
              
              {/* No investments message */}
              {((showActive && activeInvestments.length === 0) && 
                (showCompleted && completedInvestments.length === 0)) ||
                (!showActive && !showCompleted) && (
                <View style={styles.noInvestmentsContainer}>
                  <Ionicons name="information-circle" size={48} color={colors.blue400} />
                  <Text style={styles.noInvestmentsText}>
                    No investments found. Start investing to grow your wealth!
                  </Text>
                </View>
              )}
            </View>
          )}
          
          {/* Information Card */}
          <View style={styles.infoContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              style={styles.infoCard}
            >
              <View style={styles.infoHeader}>
                <Ionicons name="information-circle" size={24} color={colors.blue300} />
                <Text style={styles.infoTitle}>How It Works</Text>
              </View>
              
              <Text style={styles.infoText}>
                Invest your funds and earn daily compound interest over the investment period.
                Upon maturity, your principal plus earned interest will be available for withdrawal
                to your main wallet.
              </Text>
              
              <View style={styles.tipContainer}>
                <Text style={styles.tipText}>
                  💡 Tip: Higher interest rates typically come with longer investment periods.
                  Choose what works best for your financial goals.
                </Text>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSizes.md,
    color: colors.white,
  },
  scrollContent: {
    paddingBottom: spacing.xl * 2,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  // Summary Card styles
  summaryContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  summaryTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    color: colors.blue200,
  },
  statDivider: {
    height: 40,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  walletInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: spacing.sm,
    borderRadius: 8,
  },
  walletLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  walletValue: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  // Form Container styles
  formContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  banksScrollContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  bankCardContainer: {
    width: 260,
    marginRight: spacing.md,
  },
  featuredBanksContainer: {
    marginTop: spacing.lg,
  },
  featuredBanksTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.blue100,
    marginBottom: spacing.sm,
  },
  featuredBanksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featuredBankBadge: {
    flexDirection: 'column',
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    width: '31%',
    alignItems: 'flex-start',
    ...shadows.sm,
  },
  featuredBankName: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: spacing.xs,
  },
  featuredBankRate: {
    fontSize: fontSizes.xs,
    color: colors.blue200,
    marginTop: spacing.xs / 2,
  },
  investmentForm: {
    marginTop: spacing.sm,
  },
  formCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  formTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: spacing.md,
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  projectionContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  projectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  projectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  projectionLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  projectionValue: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.white,
  },
  investButton: {
    borderRadius: 10,
    overflow: 'hidden',
    ...shadows.md,
  },
  disabledButton: {
    opacity: 0.5,
  },
  investButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  investButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginRight: spacing.sm,
  },
  // Investments Container styles
  investmentsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  investmentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: 2,
  },
  filterButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterButtonText: {
    fontSize: fontSizes.xs,
    color: colors.blue200,
  },
  filterButtonTextActive: {
    color: colors.white,
    fontWeight: 'bold',
  },
  investmentTypeLabel: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.blue300,
    marginBottom: spacing.sm,
  },
  noInvestmentsContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    padding: spacing.xl,
    marginTop: spacing.sm,
  },
  noInvestmentsText: {
    fontSize: fontSizes.md,
    color: colors.white,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  // Info Card styles
  infoContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl * 2, // Extra space for bottom nav
  },
  infoCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.xs,
  },
  infoText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  tipContainer: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderRadius: 8,
    padding: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.amber,
  },
  tipText: {
    fontSize: fontSizes.sm,
    color: colors.amber,
  },
});

export default WealthFundScreen;


// ====== End File: src\screens\main\WealthFundScreen.js ======

// ====== Begin File: src\screens\main\WithdrawalScreen.js ======

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../context/SupabaseUserContext';
import { useApp } from '../../context/AppContext';
import { withdrawalAmounts } from '../../constants/levels';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { isWithdrawalTimeValid } from '../../utils/mockData';
import { useNotification } from '../../context/NotificationContext';
import { APP_NAME } from '../../constants/branding';

const WithdrawalScreen = ({ navigation }) => {
  const { profile, withdraw, withdrawalRequests } = useUser();
  const { showNotification } = useNotification();
  const { settings } = useApp();
  
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWithdrawalTime, setIsWithdrawalTime] = useState(isWithdrawalTimeValid());
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Get withdrawal fee percentage from settings
  const withdrawalFeePercentage = (settings?.withdrawal_fee_percentage || 10) / 100;
  
  // Check withdrawal time window
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setIsWithdrawalTime(isWithdrawalTimeValid());
    }, 60000); // Check every minute
    
    return () => clearInterval(timer);
  }, []);
  
  // Handle amount selection
  const handleSelectAmount = (amount) => {
    setSelectedAmount(amount);
  };
  
  // Calculate withdrawal fee
  const calculateFee = (amount) => {
    return amount * withdrawalFeePercentage;
  };
  
  // Calculate amount to receive
  const calculateAmountToReceive = (amount) => {
    const fee = calculateFee(amount);
    return amount - fee;
  };
  
  // Handle withdrawal
  const balance = profile?.incomeWallet ?? profile?.income_wallet ?? 0;

  const handleWithdraw = () => {
    if (!selectedAmount) {
      Alert.alert('Error', 'Please select a withdrawal amount.');
      return;
    }
    
    // Check if wallet is set
    if (!profile?.withdrawal_account_type || !profile?.withdrawal_account_details) {
      Alert.alert(
        'Wallet Not Set',
        'You need to set your withdrawal account details before you can withdraw funds.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Set Now',
            onPress: () => navigation.navigate('PersonalInfo'),
          },
        ]
      );
      return;
    }
    
    if (!isWithdrawalTime) {
      Alert.alert(
        'Outside Withdrawal Hours',
        'Withdrawals are only available Monday to Friday, 9:00 AM to 10:00 PM.'
      );
      return;
    }
    
    if (selectedAmount > balance) {
      Alert.alert(
        'Insufficient Funds',
        'You don\'t have enough balance in your wallet for this withdrawal.'
      );
      return;
    }
    
    const fee = calculateFee(selectedAmount);
    const amountToReceive = calculateAmountToReceive(selectedAmount);
    
    if (Platform.OS === 'web') {
      (async () => {
        const success = await withdraw(selectedAmount, fee);
        if (success) {
          showNotification({
            type: 'success',
            title: 'Withdrawal Request Submitted',
            message: `KES ${amountToReceive.toLocaleString()} withdrawal request submitted for approval.`,
          });
          setSelectedAmount(null);
          navigation.goBack();
        } else {
          showNotification({
            type: 'error',
            title: 'Withdrawal Failed',
            message: 'There was an error processing your withdrawal request.',
          });
        }
      })();
      return;
    }

    Alert.alert(
      'Confirm Withdrawal',
      `You will receive KES ${amountToReceive.toLocaleString()} (Fee: KES ${fee.toLocaleString()})`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            const success = await withdraw(selectedAmount, fee);
            if (success) {
              showNotification({
                type: 'success',
                title: 'Withdrawal Request Submitted',
                message: `KES ${amountToReceive.toLocaleString()} withdrawal request submitted for approval.`,
              });
              setSelectedAmount(null);
              navigation.goBack();
            } else {
              showNotification({
                type: 'error',
                title: 'Withdrawal Failed',
                message: 'There was an error processing your withdrawal request.',
              });
            }
          }
        }
      ]
    );
  };
  
  // Format day and time for display
  const formatDayAndTime = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[date.getDay()];
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // Hour 0 should be 12
    
    return `${day}, ${hours}:${minutes} ${ampm}`;
  };
  
  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Withdraw Funds</Text>
        
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current Balance */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Income Wallet Balance</Text>
          <Text style={styles.balanceValue}>
            KES {balance.toLocaleString()}
          </Text>
        </View>
        
        {/* Withdrawal Time Status */}
        <View style={styles.timeStatusContainer}>
          <LinearGradient
            colors={[
              isWithdrawalTime ? 'rgba(40,167,69,0.2)' : 'rgba(220,53,69,0.2)',
              isWithdrawalTime ? 'rgba(40,167,69,0.1)' : 'rgba(220,53,69,0.1)'
            ]}
            style={styles.timeStatusCard}
          >
            <View style={styles.timeStatusHeader}>
              <Ionicons 
                name={isWithdrawalTime ? "time" : "time-outline"} 
                size={24} 
                color={isWithdrawalTime ? colors.success : colors.error}
              />
              <Text style={[
                styles.timeStatusTitle,
                { color: isWithdrawalTime ? colors.success : colors.error }
              ]}>
                {isWithdrawalTime ? 'Withdrawals Open' : 'Withdrawals Closed'}
              </Text>
            </View>
            
            <Text style={styles.timeStatusInfo}>
              Current Time: {formatDayAndTime(currentTime)}
            </Text>
            
            <Text style={styles.timeStatusNote}>
              Withdrawals are only available Monday to Friday, 9:00 AM to 10:00 PM.
            </Text>
          </LinearGradient>
        </View>
        
        {/* Withdrawal Requests Status */}
        {withdrawalRequests && withdrawalRequests.length > 0 && (
          <View style={styles.requestsContainer}>
            <Text style={styles.requestsTitle}>Recent Withdrawal Requests</Text>
            {withdrawalRequests.slice(0, 3).map((request) => (
              <View key={request.id} style={styles.requestItem}>
                <View style={styles.requestInfo}>
                  <Text style={styles.requestAmount}>
                    KES {request.amount.toLocaleString()}
                  </Text>
                  <Text style={styles.requestDate}>
                    {new Date(request.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { 
                    backgroundColor: 
                      request.status === 'approved' ? colors.success :
                      request.status === 'rejected' ? colors.error :
                      request.status === 'processing' ? colors.warning :
                      request.status === 'pending' ? colors.blue500 :
                      colors.gray500
                  }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { 
                      color: 
                        request.status === 'approved' ? colors.white :
                        request.status === 'rejected' ? colors.white :
                        request.status === 'processing' ? colors.white :
                        request.status === 'pending' ? colors.white :
                        colors.white
                    }
                  ]}>
                    {request.status === 'approved' ? 'Approved' :
                     request.status === 'rejected' ? 'Rejected' :
                     request.status === 'processing' ? 'Processing' :
                     request.status === 'pending' ? 'Pending' :
                     request.status?.charAt(0).toUpperCase() + request.status?.slice(1) || 'Unknown'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
        
        {/* Withdrawal Form */}
        <View style={styles.formContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.formCard}
          >
            <Text style={styles.formTitle}>Select Withdrawal Amount</Text>
            <Text style={styles.formSubtitle}>
              Choose from one of the fixed withdrawal amounts below
            </Text>
            
            <View style={styles.amountsContainer}>
              {withdrawalAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.amountButton,
                    selectedAmount === amount && styles.selectedAmountButton,
                    amount > balance && styles.disabledAmountButton
                  ]}
                  onPress={() => handleSelectAmount(amount)}
                  disabled={amount > balance || isLoading}
                >
                  <Text style={[
                    styles.amountButtonText,
                    selectedAmount === amount && styles.selectedAmountText,
                    amount > balance && styles.disabledAmountText
                  ]}>
                    KES {amount.toLocaleString()}
                  </Text>
                  
                  {selectedAmount === amount && (
                    <View style={styles.checkmarkContainer}>
                      <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            {selectedAmount && (
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Withdrawal Summary</Text>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Amount:</Text>
                  <Text style={styles.summaryValue}>
                    KES {selectedAmount.toLocaleString()}
                  </Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Fee ({(withdrawalFeePercentage * 100).toFixed(0)}%):</Text>
                  <Text style={styles.summaryValue}>
                    KES {calculateFee(selectedAmount).toLocaleString()}
                  </Text>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>You Receive:</Text>
                  <Text style={styles.totalValue}>
                    KES {calculateAmountToReceive(selectedAmount).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}
            
            <TouchableOpacity
              style={[
                styles.withdrawButton,
                (!selectedAmount || selectedAmount > balance || !isWithdrawalTime || isLoading) && 
                styles.disabledButton
              ]}
              onPress={handleWithdraw}
              disabled={!selectedAmount || selectedAmount > balance || !isWithdrawalTime || isLoading}
            >
              <LinearGradient
                colors={[colors.blue600, colors.blue800]}
                style={styles.withdrawButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.withdrawButtonText}>Withdraw Now</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
        
        {/* Information */}
        <View style={styles.infoContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.infoCard}
          >
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color={colors.blue300} />
              <Text style={styles.infoTitle}>Important Information</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color={colors.white} style={styles.infoIcon} />
              <Text style={styles.infoText}>
                Withdrawals are processed Monday to Friday, 9:00 AM to 10:00 PM.
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="cash-outline" size={20} color={colors.white} style={styles.infoIcon} />
              <Text style={styles.infoText}>
                All withdrawals incur a {(withdrawalFeePercentage * 100).toFixed(0)}% processing fee.
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="wallet-outline" size={20} color={colors.white} style={styles.infoIcon} />
              <Text style={styles.infoText}>
                Funds will be sent to your registered withdrawal account (M-Pesa, Bank, etc.).
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} style={styles.infoIcon} />
              <Text style={styles.infoText}>
                All withdrawals require admin approval before processing.
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="stopwatch-outline" size={20} color={colors.white} style={styles.infoIcon} />
              <Text style={styles.infoText}>
                Approved withdrawals are processed within 24-48 hours.
              </Text>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl * 2, // Extra space for bottom nav
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  // Balance styles
  balanceContainer: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  balanceLabel: {
    fontSize: fontSizes.md,
    color: colors.blue200,
    marginBottom: spacing.xs,
  },
  balanceValue: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
  },
  // Time Status styles
  timeStatusContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  timeStatusCard: {
    borderRadius: 16,
    padding: spacing.md,
    ...shadows.md,
  },
  timeStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  timeStatusTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  timeStatusInfo: {
    fontSize: fontSizes.md,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  timeStatusNote: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
    fontStyle: 'italic',
  },
  // Form styles
  formContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  formCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  formTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  amountsContainer: {
    marginBottom: spacing.md,
  },
  amountButton: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  selectedAmountButton: {
    backgroundColor: 'rgba(25, 118, 210, 0.3)',
    borderColor: colors.blue400,
  },
  disabledAmountButton: {
    opacity: 0.5,
  },
  amountButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  selectedAmountText: {
    color: colors.white,
  },
  disabledAmountText: {
    color: colors.gray500,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  summaryContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  summaryValue: {
    fontSize: fontSizes.sm,
    color: colors.white,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: spacing.sm,
  },
  totalLabel: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.blue200,
  },
  totalValue: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  withdrawButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.md,
  },
  withdrawButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  withdrawButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
  },
  disabledButton: {
    opacity: 0.5,
  },
  // Info styles
  infoContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  infoIcon: {
    marginRight: spacing.sm,
  },
  infoText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    flex: 1,
  },
  // Withdrawal requests styles
  requestsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  requestsTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  requestInfo: {
    flex: 1,
  },
  requestAmount: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 2,
  },
  requestDate: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
    color: colors.white,
  },
});

export default WithdrawalScreen;


// ====== End File: src\screens\main\WithdrawalScreen.js ======

// ====== Begin File: src\services\api.js ======

import axios from 'axios';
import { APP_SHORT_NAME } from '../constants/branding';

// Base API configuration
export const api = axios.create({
  baseURL: 'https://server-5tnp.onrender.com',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Payment API endpoint for STK push
export const initiateSTKPush = async (phoneNumber, amount, reference = APP_SHORT_NAME) => {
  try {
    const response = await api.post('/api/pay', {
      phone: phoneNumber,
      amount,
      reference
    });
    
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
  try {
    const response = await api.get(`/api/status/${externalRef}`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Payment status check failed:', error);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};


// ====== End File: src\services\api.js ======

// ====== Begin File: src\services\supabaseAuth.js ======

import supabase from './supabaseClient';
import { APP_NAME } from '../constants/branding';

export const supabaseAuth = {
  // Sign up new user
  async signUp(userData = {}) {
    try {
      const {
        email,
        password,
        name,
        phone,
        country,
        city,
        nationalId,
        dateOfBirth,
        gender,
        industry,
        occupation,
        experience,
        referrer,
        referralCode,
        securityCode,
        acceptMarketing,
      } = userData;

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (!phone) {
        throw new Error('Phone number is required');
      }

      const safeName = name?.trim() || email.split('@')[0] || 'New User';
      const safeReferralCode = (referralCode || `REF${Date.now()}`).toString().trim().toUpperCase();
      const referredBy = referrer?.trim() || null;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: safeName,
            phone,
            country,
            city,
            national_id: nationalId,
            date_of_birth: dateOfBirth,
            gender,
            industry,
            occupation,
            experience,
            referrer: referredBy,
            security_code: securityCode,
            referral_code: safeReferralCode,
            accept_marketing: acceptMarketing,
            app_name: APP_NAME,
            created_at: new Date().toISOString(),
          }
        }
      });

      if (error) throw error;

      // Create user profile in users table
      if (data.user) {
        const profilePayload = {
          id: data.user.id,
          name: safeName,
          email,
          phone,
          security_code: securityCode || null,
          referred_by: referredBy,
          referral_code: safeReferralCode,
          password_hash: 'SUPABASE_AUTH_MANAGED',
          is_active: true,
          current_level: 0,
          level_investment: 0,
          income_wallet: 0,
          recharge_wallet: 0,
          main_wallet: 0,
          wealth_fund_balance: 0,
          total_earnings: 0,
          tasks_completed_today: 0,
          tasks_reset_date: new Date().toISOString().slice(0, 10),
          yesterday_earnings: 0,
          today_earnings: 0,
          week_earnings: 0,
          month_earnings: 0,
          gift_code_earnings: 0,
          referral_rebate_total: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          level_upgraded_at: null,
          login_count: 0,
          withdrawal_account_type: null,
          withdrawal_account_details: null,
          withdrawal_password_hash: null,
          real_balance: 0,
          user_category: 'new',
          category_updated_at: new Date().toISOString(),
          restrictions: {},
        };

        const { error: profileError } = await supabase
          .from('users')
          .insert([profilePayload]);

        if (profileError) {
          throw profileError;
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  },

  // Sign in user
  async signIn({ email, password }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  },

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${APP_NAME}://reset-password`,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { data: null, error };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      console.error('Get current user error:', error);
      return { user: null, error };
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session, error: null };
    } catch (error) {
      console.error('Get session error:', error);
      return { session: null, error };
    }
  },

  // Update user profile
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { data: null, error };
    }
  },

  // Get user profile
  async getProfile(userId) {
    try {
      console.log('🔍 supabaseAuth.getProfile called for:', userId);
      const startTime = Date.now();
      
      const TIMEOUT_MS = 5000;
      const MAX_ATTEMPTS = 1;

      const runWithTimeout = (promise, timeoutMs) => new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Query timeout after ${timeoutMs / 1000} seconds`));
        }, timeoutMs);

        promise
          .then((result) => {
            clearTimeout(timeoutId);
            resolve(result);
          })
          .catch((err) => {
            clearTimeout(timeoutId);
            reject(err);
          });
      });

      const performQuery = async (attempt = 1) => {
        console.log(`📡 Starting Supabase query (attempt ${attempt})...`);
        try {
          return await runWithTimeout(
            supabase
              .from('users')
              .select('*')
              .eq('id', userId)
              .maybeSingle(),
            TIMEOUT_MS
          );
        } catch (err) {
          if (err.message?.includes('timeout') && attempt < MAX_ATTEMPTS) {
            console.warn(`⏱️ Profile query timeout on attempt ${attempt}. Retrying...`);
            return performQuery(attempt + 1);
          }
          throw err;
        }
      };

      let data = null;
      let error = null;

      try {
        ({ data, error } = await performQuery());
      } catch (err) {
        if (err.message?.includes('timeout')) {
          return { data: null, error: { code: 'TIMEOUT', message: err.message } };
        }
        throw err;
      } finally {
        const endTime = Date.now();
        console.log(`📊 Profile query completed in ${endTime - startTime}ms:`, {
          data: !!data,
          error: error?.message,
          errorCode: error?.code,
        });
      }

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { data: data ?? null, error: error && error.code === 'PGRST116' ? null : error };
    } catch (error) {
      console.error('❌ Get profile error:', error);
      return { data: null, error };
    }
  },

  // Ensure a profile row exists for the Supabase auth user
  async ensureUserProfile(authUser) {
    try {
      console.log('🔧 ensureUserProfile called for:', authUser?.id);
      const startTime = Date.now();
      
      if (!authUser?.id) {
        throw new Error('Missing auth user data');
      }

      const metadata = authUser.user_metadata || {};
      const safeName = metadata.name?.trim()
        || metadata.full_name?.trim()
        || authUser.email?.split('@')[0]
        || 'New User';

      const rawPhone = metadata.phone
        ?? metadata.phone_number
        ?? authUser.phone
        ?? metadata.phoneNumber;
      const phone = typeof rawPhone === 'string' ? rawPhone.trim() : rawPhone?.toString().trim();

      if (!phone) {
        throw new Error('Phone number is required to create profile');
      }

      const profilePayload = {
        id: authUser.id,
        name: safeName,
        email: authUser.email,
        phone,
        security_code: metadata.security_code || null,
        referred_by: metadata.referrer || null,
        referral_code: (metadata.referral_code || `REF${Date.now()}`).toString().toUpperCase(),
        password_hash: 'SUPABASE_AUTH_MANAGED',
        is_active: true,
        current_level: metadata.current_level ?? 0,
        level_investment: metadata.level_investment ?? 0,
        income_wallet: metadata.income_wallet ?? 0,
        recharge_wallet: metadata.recharge_wallet ?? 0,
        main_wallet: metadata.main_wallet ?? 0,
        wealth_fund_balance: metadata.wealth_fund_balance ?? 0,
        total_earnings: metadata.total_earnings ?? 0,
        tasks_completed_today: metadata.tasks_completed_today ?? 0,
        tasks_reset_date: new Date().toISOString().slice(0, 10),
        yesterday_earnings: metadata.yesterday_earnings ?? 0,
        today_earnings: metadata.today_earnings ?? 0,
        week_earnings: metadata.week_earnings ?? 0,
        month_earnings: metadata.month_earnings ?? 0,
        gift_code_earnings: metadata.gift_code_earnings ?? 0,
        referral_rebate_total: metadata.referral_rebate_total ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        level_upgraded_at: null,
        login_count: metadata.login_count ?? 0,
        withdrawal_account_type: metadata.withdrawal_account_type || null,
        withdrawal_account_details: metadata.withdrawal_account_details || null,
        withdrawal_password_hash: metadata.withdrawal_password_hash || null,
        real_balance: metadata.real_balance ?? 0,
        user_category: metadata.user_category || 'new',
        category_updated_at: new Date().toISOString(),
        restrictions: metadata.restrictions || {},
      };

      console.log('📝 Attempting to insert profile...');
      const { data, error } = await supabase
        .from('users')
        .insert([profilePayload])
        .select()
        .single();

      const endTime = Date.now();
      console.log(`📊 Profile insert completed in ${endTime - startTime}ms:`, { 
        data: !!data, 
        error: error?.message,
        errorCode: error?.code 
      });

      if (error) {
        if (error.code === '23505') {
          console.log('⚠️ Row already exists, fetching existing profile...');
          // Row already exists, fetch it
          return this.getProfile(authUser.id);
        }
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('❌ Ensure user profile error:', error);
      return { data: null, error };
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Lightweight ping to keep connection warm
  async ping() {
    try {
      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1)
        .maybeSingle();

      return { error };
    } catch (error) {
      return { error };
    }
  },
};

export default supabaseAuth;


// ====== End File: src\services\supabaseAuth.js ======

// ====== Begin File: src\services\supabaseClient.js ======

import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
// import 'react-native-url-polyfill/auto'; // Disabled for web compatibility

// Try multiple ways to get environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://mbqoeqxxohjxlifsynuo.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icW9lcXh4b2hqeGxpZnN5bnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTYxNjAsImV4cCI6MjA3ODQzMjE2MH0.xR6LjAAJnrh9yksXua12ha6tsbfDRMGStTJt1wJwgOg';

// Debug environment variables
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

// Test connectivity on client creation
const testConnection = async () => {
  try {
    console.log('🔌 Testing Supabase connectivity...');
    const startTime = Date.now();
    
    // Simple query to test connection
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

// Run connection test (but don't block app startup)
setTimeout(testConnection, 1000);

export default supabase;


// ====== End File: src\services\supabaseClient.js ======

// ====== Begin File: src\services\supabaseData.js ======

import supabase from './supabaseClient';
import { normalizeProfile } from '../utils/profile';
import * as Crypto from 'expo-crypto';

const TRANSACTION_TYPE_MAP = {
  RECHARGE: 'deposit',
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  TASK_EARNING: 'task_earning',
  LEVEL_UPGRADE: 'level_upgrade',
  INVESTMENT: 'investment',
  INVESTMENT_RETURN: 'investment_return',
  REFERRAL_BONUS: 'referral_bonus',
  GIFT_CODE: 'gift_code',
  SPIN_BET: 'spin_bet',
  SPIN_WIN: 'spin_win',
};

const ALLOWED_TRANSACTION_TYPES = new Set([
  'deposit',
  'withdrawal',
  'task_earning',
  'referral_bonus',
  'level_upgrade',
  'investment',
  'investment_return',
  'gift_code',
  'spin_bet',
  'spin_win',
  'admin_adjustment',
  'penalty',
]);

const normalizeTransactionType = (transactionType) => {
  if (!transactionType) return 'admin_adjustment';

  const mapped = TRANSACTION_TYPE_MAP[transactionType.toUpperCase?.()];
  if (mapped) return mapped;

  const lowered = transactionType.toLowerCase?.();
  return ALLOWED_TRANSACTION_TYPES.has(lowered) ? lowered : 'admin_adjustment';
};

export const supabaseData = {
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return { data: data ? normalizeProfile(data) : null, error: null };
    } catch (error) {
      console.error('Get profile error:', error);
      return { data: null, error };
    }
  },

  // Earnings by period (excludes deposits/withdrawals via DB view)
  async getEarningsByPeriod(userId) {
    try {
      const { data, error } = await supabase
        .from('user_earnings_by_period')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get earnings by period error:', error);
      return { data: null, error };
    }
  },

  async getGiftCodeEarnings(userId) {
    try {
      const { data, error } = await supabase
        .from('user_gift_code_earnings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get gift code earnings error:', error);
      return { data: null, error };
    }
  },

  async getTaskProgressToday(userId) {
    try {
      const { data, error } = await supabase
        .from('user_task_progress_today')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get task progress today error:', error);
      return { data: null, error };
    }
  },

  async dailyCheckIn(userId, deviceInfo) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const payload = {
        user_id: userId,
        activity_date: today,
        last_seen_at: new Date().toISOString(),
        device_info: deviceInfo || null,
      };
      const { error } = await supabase
        .from('user_daily_activity')
        .upsert([payload], { onConflict: 'user_id,activity_date' });
      if (error) throw error;
      
      return { ok: true };
    } catch (error) {
      console.error('Daily check-in error:', error);
      return { ok: false };
    }
  },

  async resetDailyStatsIfNeeded(userId) {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('tasks_reset_date, today_earnings, yesterday_earnings')
        .eq('id', userId)
        .single();
      
      if (!user) return { ok: false };

      const today = new Date().toISOString().slice(0, 10);
      const lastResetDate = user.tasks_reset_date;
      
      // If it's a new day, reset the daily counters
      if (lastResetDate !== today) {
        const updates = {
          tasks_completed_today: 0,
          today_earnings: 0,
          yesterday_earnings: user.today_earnings || 0,
          tasks_reset_date: today,
          updated_at: new Date().toISOString(),
        };
        
        const { error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', userId);
          
        if (error) throw error;
        
        // Log the reset
        await this.logEvent(userId, 'daily_stats_reset', 'info', {
          previous_date: lastResetDate,
          new_date: today,
          previous_earnings: user.today_earnings || 0,
        });
      }
      
      return { ok: true };
    } catch (error) {
      console.error('Reset daily stats error:', error);
      return { ok: false };
    }
  },

  async logEvent(userId, eventType, severity = 'info', details) {
    try {
      const payload = {
        user_id: userId || null,
        event_type: eventType,
        severity,
        details: details || null,
        created_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('activity_logs').insert([payload]);
      if (error) throw error;
      return { ok: true };
    } catch (error) {
      console.error('Log event error:', error);
      return { ok: false };
    }
  },

  async enqueueReferralBonus(referrerId, referredId, amount, level = 1) {
    try {
      const suspicion = await this.checkSuspiciousReferralActivity(referredId);
      const referrerRisk = await this.calculateReferralRisk(referrerId);
      const combinedRisk = Math.min(100, (suspicion?.riskScore ?? 0) + referrerRisk);

      const payload = {
        referrer_id: referrerId,
        referred_id: referredId,
        amount,
        level,
        status: suspicion ? 'pending-review' : 'pending',
        is_recruit: true,
        is_suspicious: Boolean(suspicion) || combinedRisk >= 60,
        risk_score: combinedRisk,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('referral_bonus_queue')
        .insert([payload]);

      if (error) throw error;

      if (payload.is_suspicious) {
        await this.logEvent(referredId, 'suspicious_referral_detected', 'warning', {
          referrer_id: referrerId,
          referred_id: referredId,
          risk_score: combinedRisk,
          reasons: suspicion?.reasons || [],
        });
      }

      return { ok: true };
    } catch (error) {
      console.error('Enqueue referral bonus error:', error);
      return { ok: false };
    }
  },

  async checkSuspiciousReferralActivity(userId) {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('id, last_sign_in_ip, created_at')
        .eq('id', userId)
        .maybeSingle();

      if (!user?.last_sign_in_ip) {
        return null;
      }

      const nowIso = new Date().toISOString();
      const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: recentAccounts } = await supabase
        .from('users')
        .select('id, created_at')
        .eq('last_sign_in_ip', user.last_sign_in_ip)
        .gte('created_at', windowStart);

      const reasons = [];
      let riskScore = 0;

      if ((recentAccounts?.length ?? 0) > 3) {
        reasons.push('Multiple accounts from same IP in 24h');
        riskScore += 40;
      }

      if (recentAccounts && recentAccounts.length > 1) {
        const ordered = [...recentAccounts].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        for (let i = 1; i < ordered.length; i++) {
          const diffMs = new Date(ordered[i].created_at) - new Date(ordered[i - 1].created_at);
          if (diffMs <= 2 * 60 * 1000) {
            reasons.push('Rapid sequential sign-ups detected');
            riskScore += 30;
            break;
          }
        }
      }

      return riskScore >= 40 ? { riskScore, reasons, lastSeen: nowIso } : null;
    } catch (error) {
      console.error('Check suspicious referral activity error:', error);
      return null;
    }
  },

  async calculateReferralRisk(referrerId) {
    try {
      let score = 0;

      const { data: pendingBonuses } = await supabase
        .from('referral_bonus_queue')
        .select('id')
        .eq('referrer_id', referrerId)
        .eq('status', 'pending');

      if (pendingBonuses && pendingBonuses.length > 5) {
        score += 20;
      }

      return Math.min(100, score);
    } catch (error) {
      console.error('Calculate referral risk error:', error);
      return 0;
    }
  },

  async getLevels() {
    const tryFetch = async (table) => {
      return supabase
        .from(table)
        .select('*')
        .order('id', { ascending: true });
    };

    try {
      let response = await tryFetch('levels');

      if (response.error && response.error.code === '42P01') {
        response = await tryFetch('job_levels');
      }

      if (response.error) {
        throw response.error;
      }

      // Ensure tasks_required and is_locked are present
      const data = (response.data || []).map(row => ({
        ...row,
        tasks: row.tasks_required ?? row.tasks ?? 0,
        is_locked: row.is_locked ?? false,
      }));

      return { data, error: null };
    } catch (error) {
      console.error('Get levels error:', error);
      return { data: null, error };
    }
  },

  // Fetch notifications for a page and user level
  async getNotifications(pageName, userLevel) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('page_name', pageName)
        .eq('status', true)
        .order('priority', { ascending: true })
        .limit(10);
      if (error) throw error;
      const filtered = (data || []).filter((row) => {
        const levels = row.apply_to_levels || [];
        return levels.length === 0 || levels.includes?.(userLevel);
      });
      return { data: filtered.slice(0, 3), error: null };
    } catch (error) {
      console.error('Get notifications error:', error);
      return { data: null, error };
    }
  },

  // Fetch investment banks/options
  async getInvestmentBanks() {
    try {
      const { data, error } = await supabase
        .from('investment_banks')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      const normalized = (data || []).map((row) => {
        const rate = Number(row.rate ?? row.daily_rate ?? 0);
        const days = Number(row.days ?? row.duration_days ?? row.term_days ?? 0);
        const minAmount = Number(row.min_amount ?? row.minAmount ?? 0);
        const name = row.name ?? row.bank_name ?? row.title ?? 'Partner Bank';
        const color = row.color || '#2563EB';
        const description = row.description || '';
        return {
          id: row.id,
          name,
          rate,
          days,
          minAmount,
          color,
          description,
          raw: row,
        };
      });
      return { data: normalized, error: null };
    } catch (error) {
      console.error('Get investment banks error:', error);
      return { data: null, error };
    }
  },

  // Record spin attempt
  async recordSpinAttempt(userId, betAmount, prizeValue, isWin) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const payload = {
        user_id: userId,
        prize_value: prizeValue,
        prize_won: isWin ? 'WIN' : 'LOSE',
        spin_date: today,
        created_at: new Date().toISOString(),
        metadata: { bet_amount: betAmount },
      };
      const { data, error } = await supabase
        .from('spin_attempts')
        .insert([payload])
        .select('*')
        .single();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Record spin attempt error:', error);
      return { data: null, error };
    }
  },

  async updateWithdrawalSettings(userId, accountType, accountDetails, password) {
    try {
      const passwordHash = password
        ? await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password)
        : null;

      const updates = {
        withdrawal_account_type: accountType,
        withdrawal_account_details: accountDetails,
        updated_at: new Date().toISOString(),
      };

      if (passwordHash) {
        updates.withdrawal_password_hash = passwordHash;
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data: normalizeProfile(data), error: null };
    } catch (error) {
      console.error('Update withdrawal settings error:', error);
      return { data: null, error };
    }
  },

  // Wallet Operations
  async updateWallet(userId, walletType, amount, description, transactionType) {
    try {
      // Update wallet balance
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('recharge_wallet, income_wallet, main_wallet, total_earnings, level_investment, today_earnings, week_earnings, month_earnings, yesterday_earnings, referral_rebate_total, gift_code_earnings, total_withdrawals, tasks_completed_today, is_active')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      const updates = { updated_at: new Date().toISOString() };
      const now = new Date().toISOString();
      const normalizedType = normalizeTransactionType(transactionType);

      if (normalizedType === 'withdrawal') {
        updates.total_withdrawals = (profile.total_withdrawals ?? 0) + Math.abs(amount);
      }

      if (walletType === 'recharge') {
        updates.recharge_wallet = profile.recharge_wallet + amount;
      } else if (walletType === 'income') {
        updates.income_wallet = profile.income_wallet + amount;
      }

      const { data: updatedProfile, error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      const balanceAfter = walletType === 'income'
        ? updatedProfile.income_wallet
        : updatedProfile.recharge_wallet;

      // Record transaction using supported columns only
      let insertTx = await supabase
        .from('transactions')
        .insert([
          {
            user_id: userId,
            amount,
            net_amount: amount,
            fee: 0,
            status: 'completed',
            description,
            type: normalizedType,
            processed_at: now,
            created_at: now,
            metadata: { wallet_type: walletType, balance_after: balanceAfter },
          }
        ])
        .select('id')
        .single();

      // If type violates check constraint, retry with alternate case, then fallback
      if (insertTx.error && insertTx.error.code === '23514') {
        const altType = normalizedType === normalizedType.toLowerCase()
          ? normalizedType.toUpperCase()
          : normalizedType.toLowerCase();
        insertTx = await supabase
          .from('transactions')
          .insert([
            {
              user_id: userId,
              amount,
              net_amount: amount,
              fee: 0,
              status: 'completed',
              description,
              type: altType,
              processed_at: now,
              created_at: now,
              metadata: { wallet_type: walletType, balance_after: balanceAfter },
            }
          ])
          .select('id')
          .single();

        if (insertTx.error && insertTx.error.code === '23514') {
          insertTx = await supabase
            .from('transactions')
            .insert([
              {
                user_id: userId,
                amount,
                net_amount: amount,
                fee: 0,
                status: 'completed',
                description,
                type: 'admin_adjustment',
                processed_at: now,
                created_at: now,
                metadata: { wallet_type: walletType, balance_after: balanceAfter },
              }
            ])
            .select('id')
            .single();
        }
      }

      if (insertTx.error) {
        console.error('Transaction recording error:', insertTx.error);
      }

      return { data: normalizeProfile(updatedProfile), lastTransactionId: insertTx.data?.id || null, error: null };
    } catch (error) {
      console.error('Update wallet error:', error);
      return { data: null, error };
    }
  },

  // Investment Operations
  async createInvestment(userId, bank, amount, rate, days) {
    try {
      const now = new Date();
      const maturityDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('investments')
        .insert([
          {
            user_id: userId,
            bank_name: bank?.name || 'Partner Bank',
            amount,
            daily_rate: rate,
            duration_days: days,
            current_value: amount,
            status: 'active',
            maturity_date: maturityDate.toISOString().slice(0, 10),
            metadata: bank?.id ? { bank_id: bank.id } : null,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Create investment error:', error);
      return { data: null, error };
    }
  },

  async getInvestments(userId) {
    try {
      const { data, error } = await supabase
        .from('investments_with_status')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get investments error:', error);
      return { data: null, error };
    }
  },

  async withdrawInvestment(userId, investmentId) {
    try {
      const { data: investment, error: investmentError } = await supabase
        .from('investments')
        .select('*')
        .eq('id', investmentId)
        .eq('user_id', userId)
        .single();

      if (investmentError) throw investmentError;

      // Update investment status
      const { error: updateError } = await supabase
        .from('investments')
        .update({ 
          status: 'completed',
          withdrawn_at: new Date().toISOString(),
        })
        .eq('id', investmentId);

      if (updateError) throw updateError;

      const { data: walletResult, error: walletError } = await this.updateWallet(
        userId,
        'income',
        investment.current_value,
        `Investment return from ${investment.bank_name || 'investment'}`,
        'INVESTMENT_RETURN'
      );

      if (walletError) throw walletError;

      return { data: walletResult?.income_wallet ?? investment.current_value, error: null };
    } catch (error) {
      console.error('Withdraw investment error:', error);
      return { data: null, error };
    }
  },

  // Task Operations
  async completeTask(userId, taskId, taskName, reward) {
    try {
      // Monitor task completion for suspicious patterns
      await this.monitorUserActions(userId, 'task_completion', { taskId, taskName, reward });
      
      const completionPayload = {
        user_id: userId,
        app_id: taskId?.toString() || 'task',
        app_name: taskName || taskId?.toString() || 'Task',
        earnings: reward,
      };

      const { error: taskError } = await supabase
        .from('task_completions')
        .insert([completionPayload]);

      if (taskError) throw taskError;

      const { data: walletResult, error: walletError } = await this.updateWallet(
        userId,
        'income',
        reward,
        `Task earning (${completionPayload.app_name})`,
        'TASK_EARNING'
      );

      if (walletError) throw walletError;

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('tasks_completed_today, today_earnings, week_earnings, month_earnings, total_earnings')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      const updatedTotals = {
        tasks_completed_today: (profile.tasks_completed_today ?? 0) + 1,
        today_earnings: (profile.today_earnings ?? 0) + reward,
        week_earnings: (profile.week_earnings ?? 0) + reward,
        month_earnings: (profile.month_earnings ?? 0) + reward,
        total_earnings: (profile.total_earnings ?? 0) + reward,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedProfile, error: updateError } = await supabase
        .from('users')
        .update(updatedTotals)
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      await this.recordDailyStats(userId, {
        tasksCompleted: updatedTotals.tasks_completed_today,
        earnings: updatedTotals.today_earnings,
      });

      // Monitor earnings for unusual patterns
      await this.monitorUserActions(userId, 'earning', { amount: reward, source: 'task_completion' });

      return { data: normalizeProfile(updatedProfile), error: null };
    } catch (error) {
      console.error('Complete task error:', error);
      return { data: null, error };
    }
  },

  async redeemGiftCode(userId, code) {
    try {
      const rawCode = (code || '').trim();
      if (!rawCode) throw new Error('Please enter a valid gift code.');

      // Match by code (case-insensitive)
      let { data: giftRow, error: fetchError } = await supabase
        .from('gift_codes')
        .select('*')
        .ilike('code', rawCode)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!giftRow) {
        // Try additional strategies: exact match on upper/lower, then contains
        let alt = await supabase.from('gift_codes').select('*').eq('code', rawCode.toUpperCase()).maybeSingle();
        if (!alt.data) alt = await supabase.from('gift_codes').select('*').eq('code', rawCode.toLowerCase()).maybeSingle();
        if (!alt.data) alt = await supabase.from('gift_codes').select('*').ilike('code', `%${rawCode}%`).maybeSingle();
        giftRow = alt.data || null;
        if (!giftRow) throw new Error('Gift code not found.');
      }

      // Business rules based on provided schema
      if (giftRow.is_active === false) throw new Error('Gift code is inactive.');
      if (giftRow.expires_at && new Date(giftRow.expires_at) < new Date()) throw new Error('Gift code has expired.');
      const maxUses = Number(giftRow.max_uses ?? 1);
      const currentUses = Number(giftRow.current_uses ?? 0);
      if (currentUses >= maxUses) throw new Error('Gift code usage limit reached.');

      const incomeAmount = Number(giftRow.income_wallet_amount ?? 0);
      const mainAmount = Number(giftRow.main_wallet_amount ?? 0);
      const amount = incomeAmount > 0 ? incomeAmount : mainAmount; // Prefer income wallet credit
      const walletType = incomeAmount > 0 ? 'income' : 'recharge';
      if (!Number.isFinite(amount) || amount <= 0) throw new Error('Gift code amount is invalid.');

      // Increment usage and deactivate if limit reached
      const now = new Date().toISOString();
      const nextUses = currentUses + 1;
      const updates = {
        current_uses: nextUses,
        is_active: nextUses >= maxUses ? false : giftRow.is_active,
        description: giftRow.description,
        metadata: giftRow.metadata,
        updated_at: now,
      };

      const { error: updateError } = await supabase
        .from('gift_codes')
        .update(updates)
        .eq('id', giftRow.id);
      if (updateError) throw updateError;

      const { error: walletErr } = await this.updateWallet(
        userId,
        walletType,
        amount,
        `Gift code ${giftRow.code}`,
        'GIFT_CODE'
      );
      if (walletErr) throw walletErr;

      // Record redemption row (for admin audit and triggers)
      try {
        const redemption = {
          gift_code_id: giftRow.id,
          user_id: userId,
          redeemed_at: now,
          income_wallet_reward: walletType === 'income' ? amount : 0,
          main_wallet_reward: walletType !== 'income' ? amount : 0,
        };
        let ins = await supabase.from('gift_code_redemptions').insert([redemption]).select('id').single();
        if (ins.error && (ins.error.code === '42703' || ins.error.code === 'PGRST204')) {
          // Retry with minimal required columns if some columns are missing
          ins = await supabase.from('gift_code_redemptions').insert([
            { gift_code_id: giftRow.id, user_id: userId, redeemed_at: now }
          ]).select('id').single();
        }
        if (ins.error) {
          console.error('Gift redemption audit insert error:', ins.error);
        }
      } catch (e) {
        console.error('Gift redemption audit unexpected error:', e);
      }

      return { data: { amount, walletType }, error: null };
    } catch (error) {
      console.error('Redeem gift code error:', error);
      return { data: null, error };
    }
  },

  // Referral Operations
  async createWithdrawalRequest(userId, amount, method, accountInfo) {
    try {
      // Monitor the withdrawal request for suspicious patterns
      await this.monitorWithdrawalRequest(userId, amount, { method, accountInfo });
      
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .insert([{
          user_id: userId,
          amount,
          method,
          account_info: accountInfo,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Create withdrawal request error:', error);
      return { data: null, error };
    }
  },

  async addReferral(referrerId, referredUserId) {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .insert([
          {
            referrer_id: referrerId,
            referred_id: referredUserId,
            level: 1,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Add referral error:', error);
      return { data: null, error };
    }
  },

  async getReferrals(userId) {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referred_user:users!referrals_referred_id_fkey(id, name, email, created_at)
        `)
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get referrals error:', error);
      return { data: null, error };
    }
  },

  // Level Operations
  async upgradeLevel(userId, newLevelId, cost) {
    try {
      // Deduct cost from recharge wallet and update level
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('recharge_wallet, current_level')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      if (profile.recharge_wallet < cost) {
        throw new Error('Insufficient funds');
      }

      // Update profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from('users')
        .update({
          current_level: newLevelId,
          level_investment: cost,
          recharge_wallet: profile.recharge_wallet - cost,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Record transaction (log deduction)
      const now = new Date().toISOString();
      let txInsert = await supabase
        .from('transactions')
        .insert([
          {
            user_id: userId,
            amount: -cost,
            net_amount: -cost,
            fee: 0,
            status: 'completed',
            description: `Level upgrade to Level ${newLevelId}`,
            type: normalizeTransactionType('LEVEL_UPGRADE'),
            processed_at: now,
            created_at: now,
            metadata: { wallet_type: 'recharge' },
          }
        ])
        .select('id')
        .single();
      if (txInsert.error && txInsert.error.code === '23514') {
        const norm = normalizeTransactionType('LEVEL_UPGRADE');
        const altType = norm === norm.toLowerCase() ? norm.toUpperCase() : norm.toLowerCase();
        txInsert = await supabase
          .from('transactions')
          .insert([
            {
              user_id: userId,
              amount: -cost,
              net_amount: -cost,
              fee: 0,
              status: 'completed',
              description: `Level upgrade to Level ${newLevelId}`,
              type: altType,
              processed_at: now,
              created_at: now,
              metadata: { wallet_type: 'recharge' },
            }
          ])
          .select('id')
          .single();

        if (txInsert.error && txInsert.error.code === '23514') {
          txInsert = await supabase
            .from('transactions')
            .insert([
              {
                user_id: userId,
                amount: -cost,
                net_amount: -cost,
                fee: 0,
                status: 'completed',
                description: `Level upgrade to Level ${newLevelId}`,
                type: 'admin_adjustment',
                processed_at: now,
                created_at: now,
                metadata: { wallet_type: 'recharge' },
              }
            ])
            .select('id')
            .single();
        }
      }
      if (txInsert.error) {
        console.error('Transaction recording error:', txInsert.error);
      }

      // Referral bonus processing (grant immediately for non-recruits, else enqueue)
      try {
        const { data: userRow } = await supabase
          .from('users')
          .select('referred_by, is_recruit')
          .eq('id', userId)
          .maybeSingle();

        if (userRow && userRow.referred_by) {
          // fetch level cost to compute pct; fallback 4%
          const { data: settings } = await this.getSystemSettings();
          const l1Pct = Number(settings?.referral_level1_percentage ?? 4);
          const bonus = Math.max(0, (l1Pct / 100) * cost);
          if (bonus > 0) {
            if (userRow.is_recruit === false) {
              await this.updateWallet(userRow.referred_by, 'income', bonus, `Referral bonus (level upgrade L1)`, 'REFERRAL_BONUS');
              await this.logEvent(userId, 'referral_bonus_granted', 'info', { referrer_id: userRow.referred_by, amount: bonus, level: 1 });
            } else {
              await this.enqueueReferralBonus(userId ? userRow.referred_by : null, userId, bonus, 1);
              await this.logEvent(userId, 'referral_bonus_enqueued', 'warning', { referrer_id: userRow.referred_by, amount: bonus, level: 1 });
            }
          }
        }
      } catch (e) {
        console.warn('Referral bonus hook failed:', e?.message);
      }

      return { data: normalizeProfile(updatedProfile), error: null };
    } catch (error) {
      console.error('Upgrade level error:', error);
      return { data: null, error };
    }
  },

  // Transaction History
  async getTransactions(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get transactions error:', error);
      return { data: null, error };
    }
  },

  // Real-time subscriptions
  subscribeToProfile(userId, callback) {
    return supabase
      .channel(`profile:${userId}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'users',
          filter: `id=eq.${userId}`
        }, 
        callback
      )
      .subscribe();
  },

  subscribeToTransactions(userId, callback) {
    return supabase
      .channel(`transactions:${userId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe();
  },

  async recordDailyStats(userId, stats = {}) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const payload = {
        user_id: userId,
        stats_date: today,
        tasks_completed: stats.tasksCompleted || 0,
        earnings: stats.earnings || 0,
        last_updated: new Date().toISOString(),
        metadata: stats.metadata || null,
      };
      const { error } = await supabase
        .from('user_daily_stats')
        .upsert([payload], { onConflict: 'user_id,stats_date' });
      if (error) throw error;
      return { ok: true };
    } catch (error) {
      console.error('Record daily stats error:', error);
      return { ok: false };
    }
  },

  async getSystemSettings() {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      const map = {};
      (data || []).forEach((row) => {
        map[row.key] = row.value;
      });
      return { data: map, error: null };
    } catch (error) {
      console.error('Get system settings error:', error);
      return { data: null, error };
    }
  },

  async createWithdrawalRequest(userId, amount, fee, netAmount, transactionId, paymentMethod, paymentDetails, userMeta) {
    try {
      const payload = {
        user_id: userId,
        amount,
        fee,
        net_amount: netAmount,
        status: 'pending',
        created_at: new Date().toISOString(),
        transaction_id: transactionId || null,
        payment_method: paymentMethod || null,
        payment_details: paymentDetails || null,
        user_name: userMeta?.name || null,
        user_phone: userMeta?.phone || null,
        user_email: userMeta?.email || null,
        metadata: {
          current_level: userMeta?.current_level || null,
          level_name: userMeta?.level_name || null,
        },
      };
      let ins = await supabase
        .from('withdrawal_requests')
        .insert([payload])
        .select('id')
        .single();
      if (ins.error && ins.error.code === 'PGRST204') {
        const base = {
          user_id: userId,
          amount,
          fee,
          net_amount: netAmount,
          status: 'pending',
          created_at: new Date().toISOString(),
          transaction_id: transactionId || null,
        };
        ins = await supabase
          .from('withdrawal_requests')
          .insert([base])
          .select('id')
          .single();
      }
      if (ins.error) throw ins.error;
      return { data: ins.data, error: null };
    } catch (error) {
      console.error('Create withdrawal request error:', error);
      return { data: null, error };
    }
  },

  // Additional helpers needed by context
  async getWallet(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('recharge_wallet, income_wallet, main_wallet')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get wallet error:', error);
      return { data: null, error };
    }
  },

  async getTaskCompletion(userId) {
    try {
      const { data, error } = await supabase
        .from('task_completions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get task completion error:', error);
      return { data: null, error };
    }
  },

  async getWithdrawalRequests(userId) {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get withdrawal requests error:', error);
      return { data: null, error };
    }
  },

  // Activity logging wrapper (alias for logEvent)
  async logActivityEvent(userId, eventType, eventData) {
    return this.logEvent(userId, eventType, 'info', eventData);
  },

  // Bot monitoring and suspicious activity detection
  async logBotActivity(userId, eventType, details = {}) {
    try {
      const payload = {
        user_id: userId,
        event_type: `bot_${eventType}`,
        severity: 'warning',
        details: {
          ...details,
          timestamp: new Date().toISOString(),
          ip: details.ip || null,
          user_agent: details.userAgent || null,
        },
        created_at: new Date().toISOString(),
      };
      
      const { error } = await supabase.from('activity_logs').insert([payload]);
      if (error) throw error;
      
      // Auto-flag high-risk activities
      const highRiskEvents = ['multiple_accounts', 'rapid_actions', 'unusual_earnings', 'script_detected'];
      if (highRiskEvents.includes(eventType)) {
        await this.flagSuspiciousUser(userId, eventType, details);
      }
      
      return { ok: true };
    } catch (error) {
      console.error('Log bot activity error:', error);
      return { ok: false };
    }
  },

  async flagSuspiciousUser(userId, reason, details) {
    try {
      const { error } = await supabase
        .from('suspicious_activity')
        .insert([{
          user_id: userId,
          activity_type: reason,
          description: `Automated flag: ${reason}`,
          risk_score: this.calculateActivityRiskScore(reason),
          ip_address: details.ip || null,
          user_agent: details.userAgent || null,
          metadata: details,
          created_at: new Date().toISOString(),
        }]);
      
      if (error) throw error;
      return { ok: true };
    } catch (error) {
      console.error('Flag suspicious user error:', error);
      return { ok: false };
    }
  },

  calculateActivityRiskScore(activityType) {
    const riskMap = {
      'multiple_accounts': 80,
      'rapid_actions': 60,
      'unusual_earnings': 70,
      'script_detected': 90,
      'suspicious_referral': 50,
      'account_breach': 100,
    };
    return riskMap[activityType] || 30;
  },

  // Enhanced monitoring hooks
  async monitorUserActions(userId, actionType, metadata = {}) {
    try {
      // Log the action
      await this.logActivityEvent(userId, `user_action_${actionType}`, metadata);
      
      // Check for suspicious patterns
      const suspicious = await this.analyzeActionPattern(userId, actionType, metadata);
      if (suspicious) {
        await this.logBotActivity(userId, suspicious.type, suspicious.details);
      }
      
      return { ok: true };
    } catch (error) {
      console.error('Monitor user actions error:', error);
      return { ok: false };
    }
  },

  async analyzeActionPattern(userId, actionType, metadata) {
    try {
      // Check for rapid successive actions
      if (actionType === 'task_completion') {
        const { data: recentTasks } = await supabase
          .from('task_completions')
          .select('created_at')
          .eq('user_id', userId)
          .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Last 5 minutes
        
        if (recentTasks && recentTasks.length > 10) {
          return {
            type: 'rapid_actions',
            details: {
              action_count: recentTasks.length,
              time_window: '5 minutes',
              action_type: 'task_completion',
            },
          };
        }
      }
      
      // Check for unusual earnings patterns
      if (actionType === 'earning') {
        const { data: todayEarnings } = await supabase
          .from('transactions')
          .select('amount, created_at')
          .eq('user_id', userId)
          .eq('type', 'task_earning')
          .gte('created_at', new Date().toISOString().slice(0, 10));
        
        if (todayEarnings) {
          const totalEarned = todayEarnings.reduce((sum, tx) => sum + (tx.amount || 0), 0);
          if (totalEarned > 5000) { // Unusually high daily earnings
            return {
              type: 'unusual_earnings',
              details: {
                daily_total: totalEarned,
                transaction_count: todayEarnings.length,
              },
            };
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Analyze action pattern error:', error);
      return null;
    }
  },

  // Withdrawal request monitoring
  async monitorWithdrawalRequest(userId, amount, details) {
    try {
      // Log the withdrawal attempt
      await this.logActivityEvent(userId, 'withdrawal_attempt', { amount, ...details });
      
      // Check for suspicious withdrawal patterns
      const suspicious = await this.analyzeWithdrawalPattern(userId, amount);
      if (suspicious) {
        await this.logBotActivity(userId, suspicious.type, suspicious.details);
      }
      
      return { ok: true };
    } catch (error) {
      console.error('Monitor withdrawal request error:', error);
      return { ok: false };
    }
  },

  async analyzeWithdrawalPattern(userId, amount) {
    try {
      // Check for multiple withdrawal requests in short time
      const { data: recentWithdrawals } = await supabase
        .from('withdrawal_requests')
        .select('amount, created_at')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours
      
      if (recentWithdrawals && recentWithdrawals.length > 3) {
        return {
          type: 'rapid_withdrawals',
          details: {
            request_count: recentWithdrawals.length,
            time_window: '24 hours',
            amounts: recentWithdrawals.map(w => w.amount),
          },
        };
      }
      
      // Check for unusually large withdrawal
      if (amount > 10000) {
        return {
          type: 'large_withdrawal',
          details: {
            amount,
            threshold: 10000,
          },
        };
      }
      
      return null;
    } catch (error) {
      console.error('Analyze withdrawal pattern error:', error);
      return null;
    }
  },

  // Update profile helper
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return { data: normalizeProfile(data), error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { data: null, error };
    }
  },
};

export default supabaseData;


// ====== End File: src\services\supabaseData.js ======

// ====== Begin File: src\utils\mockData.js ======

// Generate mock apps for the task screen
export const generateMockApps = (count) => {
  const categories = [
    'Finance', 'Social', 'Gaming', 'Education', 'Health', 'Productivity',
    'Travel', 'Shopping', 'Entertainment', 'Food & Drink'
  ];
  
  const prefixes = [
    'Super', 'Ultra', 'Mega', 'Pro', 'Elite', 'Smart', 'Quick', 'Easy',
    'Power', 'Swift', 'Fast', 'Royal', 'Prime', 'Best', 'Top', 'Master'
  ];
  
  const names = [
    'Wallet', 'Connect', 'Chat', 'Play', 'Learn', 'Coach', 'Track', 'Shop',
    'Watch', 'Music', 'Video', 'Photo', 'Notes', 'Calc', 'Map', 'Health',
    'Diet', 'Workout', 'News', 'Weather', 'Alarm', 'ToDo', 'Scanner', 'Reader'
  ];
  
  const publishers = [
    'Tech Solutions', 'Digital Labs', 'App Factory', 'Software Inc.', 'Mobile Devs',
    'Smart Studios', 'CreativeTech', 'Innovative Apps', 'Future Software', 'NextGen Tech'
  ];
  
  // App logo colors
  const logoColors = [
    '#007bff', '#6610f2', '#6f42c1', '#e83e8c', '#dc3545',
    '#fd7e14', '#ffc107', '#28a745', '#20c997', '#17a2b8',
    '#6c757d', '#343a40', '#3b5998', '#1da1f2', '#bd081c',
    '#00b489', '#ea4c89', '#ff5700', '#0077b5', '#00aff0',
    '#ff3300', '#7289da', '#ff6600', '#00c300', '#9146ff'
  ];
  
  // App logos as emoji for simplicity
  const logos = [
    '💰', '🔒', '💬', '🎮', '📚', '🏋️', '📊', '🛒',
    '📺', '🎵', '📹', '📸', '📝', '🧮', '🗺️', '❤️',
    '🥗', '💪', '📰', '🌦️', '⏰', '✅', '📱', '📖',
    '🚗', '✈️', '🏠', '💼', '💻', '📞', '🔍', '🎨'
  ];
  
  return Array.from({ length: count }).map((_, index) => {
    const categoryIndex = Math.floor(Math.random() * categories.length);
    const prefixIndex = Math.floor(Math.random() * prefixes.length);
    const nameIndex = Math.floor(Math.random() * names.length);
    const publisherIndex = Math.floor(Math.random() * publishers.length);
    const logoIndex = Math.floor(Math.random() * logos.length);
    const colorIndex = Math.floor(Math.random() * logoColors.length);
    
    const appName = `${prefixes[prefixIndex]}${names[nameIndex]}`;
    const rating = (Math.random() * 2 + 3).toFixed(1); // Rating between 3 and 5
    const size = Math.floor(Math.random() * 500) + 10; // Size between 10MB and 510MB
    const downloads = Math.floor(Math.random() * 1000) + 1; // Downloads between 1K and 1000K
    const downloadsFormatted = downloads > 999 ? `${(downloads / 1000).toFixed(1)}K+` : `${downloads}+`;
    
    return {
      id: `app-${index + 1}`,
      name: appName,
      category: categories[categoryIndex],
      publisher: publishers[publisherIndex],
      size: `${size}MB`,
      rating,
      downloads: downloadsFormatted,
      logo: logos[logoIndex],
      color: logoColors[colorIndex]
    };
  });
};

// Generate UK-like bank names for wealth fund
export const generateBanks = () => {
  return [
    {
      id: 'bank1',
      name: 'Thames Royal Bank',
      rate: 0.2, // 0.2% daily
      days: 7, // 7-day period
      minAmount: 500,
      description: 'Low risk, short term investment',
      color: '#007bff'
    },
    {
      id: 'bank2',
      name: 'Barcliff Trust Bank',
      rate: 0.5, // 0.5% daily
      days: 14, // 14-day period
      minAmount: 1000,
      description: 'Balanced risk and return profile',
      color: '#28a745'
    },
    {
      id: 'bank3',
      name: 'Mersey Crown Bank',
      rate: 0.8, // 0.8% daily
      days: 21, // 21-day period
      minAmount: 2000,
      description: 'Medium risk, medium term investment',
      color: '#ffc107'
    },
    {
      id: 'bank4',
      name: 'Edinburgh Capital Bank',
      rate: 1.5, // 1.5% daily
      days: 30, // 30-day period
      minAmount: 5000,
      description: 'Higher risk with attractive returns',
      color: '#dc3545'
    },
    {
      id: 'bank5',
      name: 'Windsor Elite Bank',
      rate: 2.0, // 2.0% daily
      days: 45, // 45-day period
      minAmount: 10000,
      description: 'Premium investment option',
      color: '#6f42c1'
    },
    {
      id: 'bank6',
      name: 'Liverpool Sovereign Bank',
      rate: 3.0, // 3.0% daily
      days: 60, // 60-day period
      minAmount: 20000,
      description: 'Maximum return investment package',
      color: '#fd7e14'
    }
  ];
};

// Spin wheel segments
export const spinWheelSegments = [
  { value: 0, label: 'Try Again', color: '#6c757d', probability: 0.55 },
  { value: 500, label: 'KES 500', color: '#28a745', probability: 0.15 },
  { value: 0, label: 'No Luck', color: '#dc3545', probability: 0.10 },
  { value: 1000, label: 'KES 1,000', color: '#007bff', probability: 0.08 },
  { value: 0, label: 'Miss', color: '#ffc107', probability: 0.05 },
  { value: 5000, label: 'KES 5,000', color: '#6f42c1', probability: 0.04 },
  { value: 0, label: 'Free Spin', color: '#20c997', probability: 0.02 },
  { value: 50000, label: 'KES 50,000', color: '#e83e8c', probability: 0.006 },
  { value: 300000, label: 'KES 300,000', color: '#fd7e14', probability: 0.004 }
];

// Helper to format currency
export const formatCurrency = (amount) => {
  return `KES ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// Check if withdrawal is allowed in current time window
export const isWithdrawalTimeValid = () => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hour = now.getHours();
  
  // Monday to Friday (1-5), 9am to 10pm (9-22)
  return day >= 1 && day <= 5 && hour >= 9 && hour < 22;
};

// Check if it's a weekday (Monday to Friday)
export const isWeekday = () => {
  const day = new Date().getDay();
  return day >= 1 && day <= 5;
};


// ====== End File: src\utils\mockData.js ======

// ====== Begin File: src\utils\profile.js ======

export const normalizeProfile = (profile) => {
  if (!profile) {
    return null;
  }

  const toNumber = (value, fallback = 0) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return fallback;
    }
    return Number(value);
  };

  return {
    ...profile,
    isActive: profile.is_active ?? true,
    rechargeWallet: toNumber(profile.recharge_wallet),
    incomeWallet: toNumber(profile.income_wallet),
    depositWallet: toNumber(profile.deposit_wallet),
    mainWallet: toNumber(profile.main_wallet),
    wealthFundBalance: toNumber(profile.wealth_fund_balance),
    totalEarned: toNumber(profile.total_earnings),
    levelInvestment: toNumber(profile.level_investment),
    todayEarnings: toNumber(profile.today_earnings),
    weekEarnings: toNumber(profile.week_earnings),
    monthEarnings: toNumber(profile.month_earnings),
    yesterdayEarnings: toNumber(profile.yesterday_earnings),
    referralRebateTotal: toNumber(profile.referral_rebate_total),
    giftCodeEarnings: toNumber(profile.gift_code_earnings),
    totalWithdrawals: toNumber(profile.total_withdrawals),
    tasksCompletedToday: toNumber(profile.tasks_completed_today),
    currentLevelId: toNumber(profile.current_level ?? profile.currentLevelId, 0),
    withdrawalAccountType: profile.withdrawal_account_type || null,
    withdrawalAccountDetails: profile.withdrawal_account_details || null,
    withdrawalAccount: profile.withdrawal_account_details?.display || null,
    onboardingComplete: Boolean(
      profile.onboarding_complete ??
      profile.onboardingComplete ??
      profile.has_seen_onboarding ??
      false
    ),
    hasSeenOnboarding: Boolean(
      profile.has_seen_onboarding ??
      profile.onboarding_complete ??
      profile.hasSeenOnboarding ??
      false
    ),
  };
};


// ====== End File: src\utils\profile.js ======

