import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, fontSizes, spacing, responsiveFontSizes, responsiveSpacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { useResponsive } from '../hooks/useResponsive';

const AppLoading = ({ message = 'Loading...' }) => {
  console.log('🌀 AppLoading rendered with message:', message);
  console.log('🌀 AppLoading component mounting');
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
