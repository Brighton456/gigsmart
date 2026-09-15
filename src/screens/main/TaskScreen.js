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
import SafeIonicons from '../../components/SafeIonicons';
import { useApp } from '../../context/AppContext';
import { useUser } from '../../context/SupabaseUserContext';
import { useNotifications } from '../../context/NotificationContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { isWeekday } from '../../utils/mockData';
import AppStoreCard from '../../components/AppStoreCard';
import NotificationBanner from '../../components/NotificationBanner';

const { width } = Dimensions.get('window');

const TaskScreen = React.memo(() => {
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
        
        {visibleTaskApps.length === 0 ? (
          <View style={styles.emptyStoreContainer}>
            <LinearGradient
              colors={['rgba(40,167,69,0.2)', 'rgba(40,167,69,0.1)']}
              style={styles.emptyStoreCard}
            >
              <SafeIonicons name="checkmark-circle" size={60} color={colors.success} />
              <Text style={styles.emptyStoreTitle}>No Tasks Available</Text>
              <Text style={styles.emptyStoreText}>
                {taskStatus.message}
              </Text>
              <Text style={styles.emptyStoreSubtext}>
                New apps will be available tomorrow at midnight.
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
                  <SafeIonicons name="funnel-outline" size={14} color={colors.blue300} />
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
