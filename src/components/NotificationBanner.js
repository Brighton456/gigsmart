import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View, Text, Dimensions } from 'react-native';
import SafeIonicons from '../components/SafeIonicons';
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
        <SafeIonicons name={icon} size={22} color={accentColor} style={styles.icon} />
        <View style={styles.content}>
          {notification.title ? (
            <Text style={styles.title}>{notification.title}</Text>
          ) : null}
          {notification.message ? (
            <Text style={styles.message}>{notification.message}</Text>
          ) : null}
        </View>
        <TouchableOpacity onPress={onHide} style={styles.closeButton}>
          <SafeIonicons name="close" size={18} color={colors.white} />
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
