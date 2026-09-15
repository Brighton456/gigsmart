import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../../components/SafeIonicons';
import { useApp } from '../../context/AppContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';

const HelpBookScreen = ({ navigation }) => {
  const { mergedSettings } = useApp();
  
  const HelpSection = ({ icon, title, children }) => (
    <View style={styles.helpSection}>
      <View style={styles.sectionHeader}>
        <SafeIonicons name={icon} size={24} color={colors.primary} />
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
          <SafeIonicons name="arrow-back" size={24} color={colors.white} />
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
            Level 1: {mergedSettings?.referral_level1_percentage || 4}% of your invitee's recharge.{'\n\n'}
            Level 2: {mergedSettings?.referral_level2_percentage || 2}% of your team member's recharge.{'\n\n'}
            Level 3: {mergedSettings?.referral_level3_percentage || 0.25}% of your team member's recharge.{'\n\n'}
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
              <SafeIonicons name="chatbubbles" size={20} color={colors.white} />
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
