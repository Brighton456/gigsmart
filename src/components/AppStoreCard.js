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
import SafeIonicons from '../components/SafeIonicons';
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
                <SafeIonicons
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
            <SafeIonicons name="download-outline" size={14} color={colors.blue300} />
            <Text style={styles.detailText}>{app.size}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <SafeIonicons name="shield-checkmark-outline" size={14} color={colors.green} />
            <Text style={styles.detailText}>Verified</Text>
          </View>
          
          <View style={styles.detailItem}>
            <SafeIonicons name="time-outline" size={14} color={colors.blue300} />
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
              <SafeIonicons name="download" size={16} color={colors.white} />
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
            <SafeIonicons name="star" size={12} color={colors.amber} />
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
