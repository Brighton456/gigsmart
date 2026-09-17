import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import SafeIonicons from '../../components/SafeIonicons';
import { useApp } from '../../context/AppContext';
import { useUser } from '../../context/SupabaseUserContext';
import { useNotifications } from '../../context/NotificationContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { isWeekday } from '../../utils/mockData';
import AppStoreCard from '../../components/AppStoreCard';
import NotificationBanner from '../../components/NotificationBanner';

const { width } = Dimensions.get('window');

const TaskScreen = React.memo(({ navigation }) => {
  const { taskApps = [], installingApps = [], completedApps = [], installApp, updateInstallProgress } = useApp();
  const { profile, currentLevel, completeTask, levels: userLevels = [] } = useUser();
  const { getActiveNotifications, dismissNotification } = useNotifications();
  
  const activeNotifications = getActiveNotifications();
  const currentNotification = activeNotifications[0];

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
  const levelConfig = userLevels.find(l => l?.id === currentLevelId) || currentLevel || { tasks: 0, earningsPerTask: 0 };
  const maxTasks = levelConfig.tasks || 0;
  const taskLimitReached = tasksCompleted >= maxTasks;
  const maxConcurrentInstalls = 1; // Changed to 1 to prevent over-counting
  const [currentlyInstalling, setCurrentlyInstalling] = useState(null);
  // Ref guard against rapid double-taps landing before state updates flush
  const installInFlightRef = useRef(false);
  
  // Check if tasks are available (weekdays only)
  const isTaskDay = isWeekday();
  const isRecruit = currentLevelId === 0 || maxTasks === 0;
  const remainingTasks = Math.max(maxTasks - tasksCompleted, 0);
  const canPerformTasks = !isRecruit && isTaskDay;
  const canStartNewTask = canPerformTasks && !taskLimitReached && remainingTasks > 0;
  // First upgrade option above the user's current level (for upsell messaging)
  const nextLevel = useMemo(
    () => [...userLevels].sort((a, b) => (a.id || 0) - (b.id || 0)).find(l => (l?.id || 0) > currentLevelId && !l?.isLocked),
    [userLevels, currentLevelId]
  );
  const taskStatus = useMemo(() => {
    if (isRecruit) {
      return {
        type: 'info',
        message: 'Welcome! You are on the free recruit plan. Recharge to activate a level and unlock daily paid tasks.',
      };
    }
    if (!isTaskDay) {
      return { type: 'warning', message: 'Tasks run Monday to Friday. Come back tomorrow at midnight for a fresh set!' };
    }
    if (taskLimitReached) {
      return { type: 'success', message: "You've completed all your tasks for today — see you tomorrow! 💪" };
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
    const availableTasks = Array.isArray(taskApps) ? taskApps : [];
    // Show all apps, but limit installation by user's level
    return availableTasks;
  }, [taskApps]);
  
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
    
    // Safety net: if the currently-installing app is no longer tracked (e.g. the
    // completion failed but AppContext still removed it from installingApps),
    // release the lock so the user can retry instead of being stuck forever.
    if (currentlyInstalling && !installingApps.find(app => app.id === currentlyInstalling)) {
      setCurrentlyInstalling(null);
      installInFlightRef.current = false;
    }
  }, [installingApps, currentlyInstalling]);
  
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
      try {
        if (finished) {
          const appName = taskApps.find(app => app.id === appId)?.name || 'App';
          const reward = levelConfig.earningsPerTask || 0;
          
          // Immediately complete task and update Supabase
          const success = await completeTask(appId, appName, reward);
          
          if (success) {
            updateInstallProgress(appId, 100);
            
            // Show notification at the top
            Alert.alert(
              'Task Completed!',
              `Successfully installed ${appName} and earned KES ${reward}`,
              [{ text: 'OK' }]
            );
          }
        }
      } finally {
        // Always release the install lock, even on failure/interruption, so the
        // user is never permanently blocked from starting new installs.
        setCurrentlyInstalling(null);
        installInFlightRef.current = false;
      }
    });
    
    // Update progress value during animation
    const listener = progressAnimations[appId].addListener(({ value }) => {
      setInstallProgress(prev => ({ ...prev, [appId]: value }));
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
      Alert.alert(
        'Activate Your Level',
        'Recharge your account and activate a level to start earning from daily tasks. Tap OK to view upgrade options.'
      );
      return;
    }

    if (taskLimitReached || remainingTasks <= 0) {
      Alert.alert(
        'Daily Limit Reached',
        `You've completed your daily limit of ${maxTasks} tasks for the ${levelName} level.`
      );
      return;
    }
    
    // Check if we're about to exceed the limit
    if (remainingTasks <= 1) {
      Alert.alert(
        'Last Task',
        `This is your last task for today. After completing it, you won't be able to install more tasks until tomorrow.`
      );
    }
    
    if (currentlyInstalling || installInFlightRef.current) {
      Alert.alert(
        'Installation in Progress',
        'Please wait for the current app installation to complete before starting another one.'
      );
      return;
    }
    
    // Start installation process
    installInFlightRef.current = true;
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
      <NotificationBanner 
        notification={currentNotification} 
        onHide={() => dismissNotification(currentNotification?.id)} 
      />
      
      {/* ONE page-level scroller owns vertical scrolling. The previous layout
          (100vh container + nested vertical FlatList) trapped the page at the
          bottom on web because the inner list swallowed wheel events. */}
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageScrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        scrollEventThrottle={16}
      >
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
              <SafeIonicons name={taskStatusIcon} size={18} color={taskStatusColor} />
              <Text style={[styles.taskStatusText, { color: taskStatusColor }]}>
                {taskStatus.message}
              </Text>
            </View>
          )}
          
          <View style={styles.refreshRow}>
            <SafeIonicons name="refresh" size={14} color={colors.blue200} />
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
          
          {/* Horizontal installs row — max 1 concurrent, so a plain row is fine
              (no nested virtualized list to fight the page scroller). */}
          <View style={[styles.installationsList, styles.installationsRow]}>
            {installingApps.map((item) => (
              <View key={item.id} style={styles.installationsRowItem}>
                {renderInstallationItem({ item })}
              </View>
            ))}
          </View>
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
              <SafeIonicons 
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
        
        {isRecruit ? (
          // ── NEW RECRUIT ONBOARDING ──────────────────────────────
          // Fresh recruits see a clear step-by-step guide instead of a
          // confusing "no tasks" message. Tells them exactly what to do.
          <View style={styles.emptyStoreContainer}>
            <LinearGradient
              colors={['rgba(59,130,246,0.25)', 'rgba(59,130,246,0.08)']}
              style={styles.emptyStoreCard}
            >
              <SafeIonicons name="rocket" size={52} color={colors.primary} />
              <Text style={styles.recruitTitle}>Start Earning in 3 Simple Steps</Text>
              <Text style={styles.recruitSubtitle}>
                You're all set up — just activate a level to unlock your daily paid tasks.
              </Text>

              <View style={styles.stepCard}>
                <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>1</Text></View>
                <View style={styles.stepBody}>
                  <Text style={styles.stepTitle}>Recharge your account</Text>
                  <Text style={styles.stepDesc}>Add funds from the Recharge page — from as low as KES {nextLevel ? nextLevel.cost?.toLocaleString?.() || nextLevel.cost : '500'}.</Text>
                </View>
              </View>
              <View style={styles.stepCard}>
                <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>2</Text></View>
                <View style={styles.stepBody}>
                  <Text style={styles.stepTitle}>Activate a level</Text>
                  <Text style={styles.stepDesc}>Choose your level on the Upgrade page to unlock {nextLevel ? nextLevel.tasks : 'daily'} tasks per day.</Text>
                </View>
              </View>
              <View style={styles.stepCard}>
                <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>3</Text></View>
                <View style={styles.stepBody}>
                  <Text style={styles.stepTitle}>Install & earn daily</Text>
                  <Text style={styles.stepDesc}>Install the day's apps and earn KES {nextLevel ? (nextLevel.dailyEarnings || nextLevel.earningsPerTask || 0).toLocaleString?.() || nextLevel.dailyEarnings || nextLevel.earningsPerTask : '—'} per day, straight to your income wallet.</Text>
                </View>
              </View>

              {nextLevel && (
                <TouchableOpacity
                  style={styles.recruitCta}
                  onPress={() => navigation?.navigate?.('Upgrade', { screen: 'UpgradeMain' })}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.secondary || colors.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.recruitCtaGradient}
                  >
                    <SafeIonicons name="trending-up" size={18} color={colors.white} />
                    <Text style={styles.recruitCtaText}>
                      Activate {nextLevel.name} — KES {(nextLevel.cost || 0).toLocaleString()}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              <Text style={styles.recruitHint}>
                Higher levels = more daily tasks = more earnings. The more you put in, the more you take out. 🚀
              </Text>
            </LinearGradient>
          </View>
        ) : !isTaskDay || taskLimitReached ? (
          // ── DONE FOR TODAY / WRONG DAY — SWEET UPSELL ────────────
          <View style={styles.emptyStoreContainer}>
            <LinearGradient
              colors={['rgba(40,167,69,0.2)', 'rgba(40,167,69,0.1)']}
              style={styles.emptyStoreCard}
            >
              <SafeIonicons name={taskLimitReached ? 'checkmark-circle' : 'sunny'} size={60} color={colors.success} />
              <Text style={styles.emptyStoreTitle}>
                {taskLimitReached ? "All Done for Today!" : 'New Tasks Tomorrow'}
              </Text>
              <Text style={styles.emptyStoreText}>
                {taskLimitReached
                  ? "Great work! You've completed every task on your level today."
                  : 'Tasks run Monday to Friday. Fresh tasks drop at midnight.'}
              </Text>

              {nextLevel && (
                <LinearGradient
                  colors={['rgba(255,215,0,0.22)', 'rgba(255,215,0,0.08)']}
                  style={styles.upsellCard}
                >
                  <SafeIonicons name="gift" size={22} color={colors.amber} />
                  <View style={styles.upsellBody}>
                    <Text style={styles.upsellTitle}>Want more tomorrow?</Text>
                    <Text style={styles.upsellText}>
                      Upgrade to <Text style={{ fontWeight: 'bold' }}>{nextLevel.name}</Text> and earn up to{' '}
                      <Text style={{ fontWeight: 'bold' }}>KES {(nextLevel.dailyEarnings || 0).toLocaleString()}</Text>{' '}
                      daily with <Text style={{ fontWeight: 'bold' }}>{nextLevel.tasks} tasks</Text>.
                    </Text>
                  </View>
                </LinearGradient>
              )}

              <View style={styles.nextRefreshContainer}>
                <SafeIonicons name="time-outline" size={16} color={colors.blue300} />
                <Text style={styles.nextRefreshText}>
                  Next refresh: {new Date(Date.now() + 86400000).toLocaleDateString()}
                </Text>
              </View>
            </LinearGradient>
          </View>
        ) : visibleTaskApps.length === 0 ? (
          // Rare fallback: it's a task day, tasks remain, but the catalog is empty.
          <View style={styles.emptyStoreContainer}>
            <LinearGradient
              colors={['rgba(40,167,69,0.2)', 'rgba(40,167,69,0.1)']}
              style={styles.emptyStoreCard}
            >
              <SafeIonicons name="sparkles" size={60} color={colors.success} />
              <Text style={styles.emptyStoreTitle}>Tasks Loading</Text>
              <Text style={styles.emptyStoreText}>
                Hang tight — today's apps are on the way. Pull to refresh in a moment.
              </Text>
              <View style={styles.nextRefreshContainer}>
                <SafeIonicons name="time-outline" size={16} color={colors.blue300} />
                <Text style={styles.nextRefreshText}>
                  Next refresh: {new Date(Date.now() + 86400000).toLocaleDateString()}
                </Text>
              </View>
            </LinearGradient>
          </View>
        ) : (
          // NOTE: NOT a FlatList — a nested vertical list inside the page
          // ScrollView hijacks wheel events on web-PWA and freezes the page
          // at the bottom. The catalog is small; map it out instead.
          <View style={styles.appsList}>
            <View style={styles.storeListHeader}>
              <Text style={styles.featuredText}>Featured Apps</Text>
              <View style={styles.sortContainer}>
                <SafeIonicons name="funnel-outline" size={14} color={colors.blue300} />
                <Text style={styles.sortText}>Sort by: Newest</Text>
              </View>
            </View>
            {visibleTaskApps.map((item) => (
              <View key={item.id}>{renderAppItem({ item })}</View>
            ))}
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
  },
  pageScroll: {
    flex: 1,
  },
  pageScrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // clearance for the fixed bottom tab bar
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
    paddingHorizontal: spacing.lg,
  },
  installationsRow: {
    flexDirection: 'row',
  },
  installationsRowItem: {
    width: 250,
    marginRight: spacing.md,
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
  // Recruit onboarding card
  recruitTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  recruitSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignSelf: 'stretch',
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  stepBadgeText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: fontSizes.sm,
  },
  stepBody: {
    flex: 1,
  },
  stepTitle: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: fontSizes.md,
    marginBottom: 2,
  },
  stepDesc: {
    color: colors.blue200,
    fontSize: fontSizes.sm,
    lineHeight: 18,
  },
  recruitCta: {
    alignSelf: 'stretch',
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.md,
  },
  recruitCtaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  recruitCtaText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: fontSizes.md,
    marginLeft: spacing.xs,
  },
  recruitHint: {
    fontSize: fontSizes.xs,
    color: colors.blue300,
    textAlign: 'center',
    lineHeight: 17,
  },
  // Upgrade upsell card (shown when tasks are done / weekend)
  upsellCard: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.35)',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  upsellBody: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  upsellTitle: {
    color: colors.amber,
    fontWeight: 'bold',
    fontSize: fontSizes.md,
    marginBottom: 2,
  },
  upsellText: {
    color: colors.white,
    fontSize: fontSizes.sm,
    lineHeight: 18,
  },
  // Removed old app item styles as they're now in AppStoreCard component
  // Empty container styles moved to emptyStoreContainer above
});

export default TaskScreen;
