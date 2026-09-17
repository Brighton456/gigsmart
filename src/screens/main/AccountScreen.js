import React, { useMemo, useState } from 'react';
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
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../../components/SafeIonicons';
import { useAuth } from '../../context/SupabaseAuthContext';
import { useUser } from '../../context/SupabaseUserContext';
import { useApp } from '../../context/AppContext';
import supabaseData from '../../services/supabaseData';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { APP_NAME } from '../../constants/branding';
import InteractiveOnboardingTour from '../../components/InteractiveOnboardingTour';

const AccountScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const { 
    profile, 
    currentLevel, 
    levels, 
    earningsByPeriod,
    giftCodeEarnings,
    setWithdrawalAccount,
    refreshEarningsByPeriod
  } = useUser();
  const { settings } = useApp();
  const isAdminUser = profile?.admin_role === 'admin' || profile?.admin_role === 'super_admin';
  
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletAccountType, setWalletAccountType] = useState('');
  const [walletAccountDetails, setWalletAccountDetails] = useState('');
  const [walletPassword, setWalletPassword] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshEarningsByPeriod();
    setRefreshing(false);
  };

  const displayName = profile?.name?.trim?.()
    || profile?.full_name?.trim?.()
    || user?.user_metadata?.name?.trim?.()
    || user?.email?.split?.('@')?.[0]
    || APP_NAME;
  const displayEmail = profile?.email || user?.email || 'Not provided';
  const rawPhone = profile?.phone || profile?.phone_number || user?.user_metadata?.phone || user?.phone;
  const displayPhone = rawPhone?.toString?.().trim() || 'Not provided';

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
    if (!profile?.withdrawalAccountType || !profile?.withdrawalAccountDetails) {
      setShowWalletModal(true);
    } else {
      navigation.navigate('Withdrawal');
    }
  };
  
  // Handle wallet setup redirect
  const handleSetNow = () => {
    setShowWalletModal(false);
    navigation.navigate('PersonalInfo');
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
      target: '#balanceCard',
      content: 'Welcome to GigSmart! Let us show you around the app and help you get started with earning.',
      title: 'Welcome to GigSmart!',
    },
    {
      target: '#earningsOverview',
      content: 'This is your live stats dashboard showing today\'s earnings and total earned. Keep track of your progress here!',
      title: 'Live Stats Dashboard',
    },
    {
      target: '#walletBalances',
      content: 'You have two wallets - Income Wallet for withdrawals and Recharge Wallet for upgrades.',
      title: 'Your Wallets',
    },
    {
      target: '#featuresGrid',
      content: 'Quick access to all features. Tasks, investments, and more!',
      title: 'Quick Access Menu',
    },
    {
      target: '#featureInvestments',
      content: 'Explore investment opportunities in our Wealth Fund to grow your earnings.',
      title: 'Investment Opportunities',
    },
    {
      target: '#rechargeButton',
      content: 'You\'re all set! Start completing tasks and watch your earnings grow. You can always revisit this tour from settings.',
      title: 'Ready to Earn!',
    },
  ];

  // WhatsApp group link
  const whatsappGroupLink = settings?.whatsapp_group_link || 'https://chat.whatsapp.com/DB0Bcayi5YYLROLxEbnjVt';
  const supportMessage = settings?.whatsapp_support_message || `Hello ${APP_NAME} Support, I need assistance with my account.`;

  const openWhatsAppGroup = React.useCallback(() => {
    if (!whatsappGroupLink) {
      Alert.alert('Unavailable', 'WhatsApp group link is not configured.');
      return;
    }

    const url = Platform.OS === 'web' ? whatsappGroupLink : `whatsapp://send?text=${encodeURIComponent(supportMessage)}&phone=`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open WhatsApp. Please try again or contact support.');
    });
  }, [supportMessage, whatsappGroupLink]);

  const contactSupport = React.useCallback(() => {
    // Canonical admin key (Platform Config → WhatsApp & Support).
    const supportPhone = settings?.whatsapp_support_number || settings?.support_phone;
    const message = encodeURIComponent(supportMessage);

    if (Platform.OS === 'web') {
      const digits = String(supportPhone || '').replace(/[^0-9]/g, '');
      const webUrl = digits ? `https://wa.me/${digits}?text=${message}` : null;
      if (webUrl) {
        Linking.openURL(webUrl).catch(() => {
          Alert.alert('Error', 'Could not open WhatsApp. Please try again or contact support directly.');
        });
      } else {
        Alert.alert('Error', 'Support phone number not configured.');
      }
    } else {
      const digits = String(supportPhone || '').replace(/[^0-9]/g, '');
      const whatsappUrl = `whatsapp://send?phone=${digits}&text=${message}`;
      Linking.openURL(whatsappUrl).catch(() => {
        Alert.alert('Error', 'Unable to open WhatsApp. Please try again or contact support.');
      });
    }
  }, [settings?.whatsapp_support_number, settings?.support_phone, supportMessage]);
  
  // Generate a random profile image
  const profileImageFallback = `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`;
  const profileImage = profile?.avatar_url || profile?.profile_image_url || profileImageFallback;
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.primary}
        style={styles.backgroundGradient}
        pointerEvents="none"
      />

      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <ScrollView 
        showsVerticalScrollIndicator={true}
        style={{ 
          flex: 1,
          ...(Platform.OS === 'web' && {
            height: '100vh' // Ensure full height on web
          })
        }}
        contentContainerStyle={{ 
          paddingBottom: Platform.OS === 'web' ? 120 : 100,
          paddingHorizontal: 0
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{APP_NAME} Account</Text>
        </View>
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
                  <SafeIonicons name="arrow-forward" size={16} color={colors.white} />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </View>
        
        {/* Balance Card */}
        <View style={styles.balanceCardContainer} nativeID="balanceCard">
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.balanceCard}
          >
            <Text style={styles.balanceTitle}>Your Balances</Text>
            
            <View style={styles.balancesRow} nativeID="walletBalances">
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
                nativeID="rechargeButton"
              >
                <SafeIonicons name="add-circle" size={20} color={colors.white} />
                <Text style={styles.actionButtonText}>Recharge</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.withdrawButton]}
                onPress={handleWithdrawalPress}
              >
                <SafeIonicons name="arrow-down-circle" size={20} color={colors.white} />
                <Text style={styles.actionButtonText}>Withdraw</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.historyButton]}
                onPress={() => navigation.navigate('History')}
              >
                <SafeIonicons name="time" size={20} color={colors.white} />
                <Text style={styles.actionButtonText}>History</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
        
        {/* Earnings Overview Cards */}
        <View style={styles.earningsContainer} nativeID="earningsOverview">
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
          
          <View style={styles.featuresGrid} nativeID="featuresGrid">
            <TouchableOpacity 
              style={styles.featureItem}
              onPress={() => navigation.navigate('SpinWheel')}
            >
              <LinearGradient
                colors={[colors.amber, colors.orange]}
                style={styles.featureIcon}
              >
                <SafeIonicons name="refresh-circle" size={24} color={colors.white} />
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
                <SafeIonicons name="logo-whatsapp" size={24} color={colors.white} />
              </LinearGradient>
              <Text style={styles.featureText}>WhatsApp Group</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.featureItem}
              onPress={() => navigation.navigate('Home', { screen: 'WealthFund' })}
              nativeID="featureInvestments"
            >
              <LinearGradient
                colors={[colors.blue600, colors.blue800]}
                style={styles.featureIcon}
              >
                <SafeIonicons name="bar-chart" size={24} color={colors.white} />
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
                <SafeIonicons name="people" size={24} color={colors.white} />
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
                <SafeIonicons name="person-circle" size={24} color={colors.white} />
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
                <SafeIonicons name="document-text" size={24} color={colors.white} />
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
                <SafeIonicons name="analytics" size={24} color={colors.white} />
              </LinearGradient>
              <Text style={styles.featureText}>Team Reports</Text>
            </TouchableOpacity>
            
            {isAdminUser ? (
            <TouchableOpacity 
              style={styles.featureItem}
              onPress={() => navigation.navigate('AdminPanel')}
            >
              <LinearGradient
                colors={[colors.gray900, colors.black]}
                style={styles.featureIcon}
              >
                <SafeIonicons name="shield-checkmark" size={24} color={colors.warning} />
              </LinearGradient>
              <Text style={styles.featureText}>Admin Panel</Text>
            </TouchableOpacity>
            ) : null}
            
            <TouchableOpacity 
              style={styles.featureItem}
              onPress={() => navigation.navigate('Home', { screen: 'RedeemGifts' })}
            >
              <LinearGradient
                colors={[colors.pink, colors.red]}
                style={styles.featureIcon}
              >
                <SafeIonicons name="gift" size={24} color={colors.white} />
              </LinearGradient>
              <Text style={styles.featureText}>Redeem Gifts</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.featureItem}
              onPress={() => navigation.navigate('Home', { screen: 'HelpBook' })}
              className="settings-help"
            >
              <LinearGradient
                colors={[colors.orange, colors.amber]}
                style={styles.featureIcon}
              >
                <SafeIonicons name="help-circle" size={24} color={colors.white} />
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
                <SafeIonicons name="school-outline" size={24} color={colors.white} />
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
              <SafeIonicons name="log-out" size={18} color={colors.red} />
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
        disableOverlayClose={false}
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
            zIndex: 999, // Lowered from 1000 to reduce interference
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
            <Text style={styles.modalTitle}>Withdrawal Account Required</Text>
            <Text style={styles.modalDescription}>
              You need to set your withdrawal account details before you can withdraw funds.
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowWalletModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSetNow}
              >
                <Text style={styles.confirmButtonText}>Set Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gradientBlue1,
    ...(Platform.OS === 'web' && {
      height: '100vh',
      overflow: 'hidden' // Prevent double scrolling
    })
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
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
    marginBottom: spacing.xl,
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
