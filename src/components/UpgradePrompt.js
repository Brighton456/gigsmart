import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View, Text, Dimensions } from 'react-native';
import SafeIonicons from './SafeIonicons';
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
          <SafeIonicons name="close" size={18} color={colors.white} />
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
            <SafeIonicons name="trending-up" size={28} color={colors.white} />
          </Animated.View>

          <Text style={styles.title}>Ready to Upgrade?</Text>
          <Text style={styles.subtitle}>
            Unlock {nextLevel.name} level perks and earn more with {APP_NAME}!
          </Text>

          <View style={styles.benefits}>
            <View style={styles.benefitItem}>
              <SafeIonicons name="checkmark-circle" size={16} color={colors.white} />
              <Text style={styles.benefitText}>Higher daily earnings</Text>
            </View>
            <View style={styles.benefitItem}>
              <SafeIonicons name="checkmark-circle" size={16} color={colors.white} />
              <Text style={styles.benefitText}>Exclusive investment options</Text>
            </View>
            <View style={styles.benefitItem}>
              <SafeIonicons name="checkmark-circle" size={16} color={colors.white} />
              <Text style={styles.benefitText}>Priority support access</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <LinearGradient
              colors={[colors.white, 'rgba(255,255,255,0.9)']}
              style={styles.upgradeButtonInner}
            >
              <Text style={styles.upgradeButtonText}>Upgrade to {nextLevel.name}</Text>
              <SafeIonicons name="arrow-forward" size={16} color={colors.warning} />
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
