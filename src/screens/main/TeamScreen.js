import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Clipboard,
  Alert,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../../components/SafeIonicons';
import shareText from '../../utils/share';
import { useAuth } from '../../context/SupabaseAuthContext';
import { useUser } from '../../context/SupabaseUserContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { APP_NAME, APP_URL, APP_SHORT_NAME } from '../../constants/branding';
import ReferralTable from '../../components/ReferralTable';

const TeamScreen = React.memo(({ navigation }) => {
  const { user } = useAuth();
  const { profile, referrals } = useUser();
  
  // Generate proper referral link using referral_code from profile
  const referralCode = profile?.referral_code || user?.id;
  const referralLink = referralCode ? `${APP_URL}/register?ref=${referralCode}` : `${APP_URL}/register`;
  
  const shareReferralLink = async () => {
    await shareText(
      { message: `Join ${APP_NAME} and earn daily through tasks and referrals! Sign up with my referral link: ${referralLink}`, title: `Join ${APP_NAME}` },
      'Referral message copied — paste it anywhere to share.'
    );
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
              <SafeIonicons name="copy-outline" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.shareButton} onPress={shareReferralLink}>
            <LinearGradient
              colors={[colors.success, colors.green]}
              style={styles.shareButtonInner}
            >
              <SafeIonicons name="share-outline" size={20} color={colors.white} />
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
