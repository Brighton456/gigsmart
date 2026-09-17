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
  Alert,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../../components/SafeIonicons';
import { useAuth } from '../../context/SupabaseAuthContext';
import { useUser } from '../../context/SupabaseUserContext';
import { useApp } from '../../context/AppContext';
import { useNotifications } from '../../context/NotificationContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import UpgradePrompt from '../../components/UpgradePrompt';
import SpinWheel from '../../components/SpinWheel';
import InteractiveOnboardingTour from '../../components/InteractiveOnboardingTour';
import { APP_NAME } from '../../constants/branding';
import supabaseData from '../../services/supabaseData';
import NotificationBanner from '../../components/NotificationBanner';

const HomeScreen = React.memo(({ navigation }) => {
  const { user } = useAuth();
  const {
    profile,
    currentLevel,
    levels,
    taskProgressToday,
    hasCheckedInToday,
    performDailyCheckIn,
    logActivity,
    earningsByPeriod,
    refreshEarningsByPeriod
  } = useUser();
  const { settings } = useApp();
  const { getActiveNotifications, dismissNotification } = useNotifications();
  const [currentTime] = useState(new Date());
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [news, setNews] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshEarningsByPeriod();
    setRefreshing(false);
  };



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
            const iconName = bank.icon && SafeIonicons.glyphMap?.[bank.icon]
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
  const dailyEarnings = earningsByPeriod?.today || profile?.today_earnings || 0;
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

  const activeNotifications = getActiveNotifications();
  const currentNotification = activeNotifications[0]; // Show first notification

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <NotificationBanner 
        notification={currentNotification} 
        onHide={() => dismissNotification(currentNotification?.id)} 
      />
      <LinearGradient
        colors={gradients.primary}
        style={styles.container}
      >
        <ScrollView
          style={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
                <SafeIonicons name="shield-checkmark-outline" size={14} color={colors.white} />
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
                <SafeIonicons name="pulse" size={16} color={colors.green} />
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
                  <SafeIonicons name="checkbox-outline" size={22} color={colors.white} />
                </View>
                <Text style={styles.walletTitle}>Income Wallet</Text>
              </View>
              <Text style={styles.walletBalance}>KES {incomeWalletBalance.toLocaleString()}</Text>
              <Text style={styles.walletDesc}>Available to withdraw</Text>
              <View style={styles.walletFooterRow}>
                <View style={styles.metaPill}>
                  <SafeIonicons name="calendar-outline" size={14} color={colors.white} />
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
                  <SafeIonicons name="wallet-outline" size={22} color={colors.white} />
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
                  <SafeIonicons name="add" size={16} color={colors.white} />
                  <Text style={styles.metaPillText}>Add Funds</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

        </View>

        {/* Daily Check-in Section */}
          <View style={styles.checkInSection}>
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              style={styles.checkInCard}
            >
              <View style={styles.checkInHeader}>
                <SafeIonicons name="calendar-outline" size={24} color={colors.success} />
                <Text style={styles.checkInTitle}>Daily Check-in</Text>
              </View>
              
              <Text style={styles.checkInSubtitle}>
                {hasCheckedInToday 
                  ? '✅ You have checked in today!' 
                  : 'Check in daily to maintain your activity streak'
                }
              </Text>
              
              {!hasCheckedInToday && (
                <TouchableOpacity
                  style={styles.checkInButton}
                  onPress={performDailyCheckIn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.checkInButtonText}>Check In Now</Text>
                </TouchableOpacity>
              )}
            </LinearGradient>
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
                      <SafeIonicons name={item.icon} size={24} color={colors.white} />
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
                      <SafeIonicons name="megaphone-outline" size={16} color={colors.blue300} />
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
              <SafeIonicons name="chevron-forward" size={16} color={colors.blue300} />
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
                    <SafeIonicons name="business-outline" size={24} color={colors.white} />
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
          <SafeIonicons name="logo-whatsapp" size={24} color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>
      </LinearGradient>
    </View>
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
    // Web: lift above the fixed bottom tab bar and stack over it
    // (zIndex 20 > the tab bar's 10) so the button is always visible.
    bottom: Platform.OS === 'web' ? 80 : 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    zIndex: 20,
    elevation: 6,
    ...shadows.lg,
  },
  customerCareInner: {
    flex: 1,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Daily Check-in Styles
  checkInSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  checkInCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  checkInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checkInTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.sm,
  },
  checkInSubtitle: {
    fontSize: fontSizes.md,
    color: colors.blue100,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  checkInButton: {
    backgroundColor: colors.success,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  checkInButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: fontSizes.md,
  },
});

export default HomeScreen;
