import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../../components/SafeIonicons';
import { useUser } from '../../context/SupabaseUserContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';

const UpgradeScreen = React.memo(({ navigation }) => {
  const { profile, currentLevel, levels } = useUser();

  if (!profile) {
    return (
      <LinearGradient colors={gradients.primary} style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Loading upgrades...</Text>
        </View>
      </LinearGradient>
    );
  }

  const currentBalance = profile?.recharge_wallet || 0;
  const currentLevelId = profile?.current_level ?? 0;
  const currentLevelData = currentLevel;
  
  // Filter out levels lower than or equal to current level
  const availableLevels = levels.filter(level => level.id > currentLevelId && !level.isLocked);
  
  const renderLevelHeader = () => {
    return (
      <View style={styles.tableHeader}>
        <View style={[styles.headerCellContainer, { flex: 1.5 }]}>
          <Text style={styles.headerCell}>Level</Text>
        </View>
        <View style={[styles.headerCellContainer, { flex: 1 }]}>
          <Text style={styles.headerCell}>Cost</Text>
        </View>
        <View style={[styles.headerCellContainer, { flex: 1 }]}>
          <Text style={styles.headerCell}>Tasks</Text>
        </View>
        <View style={[styles.headerCellContainer, { flex: 1 }]}>
          <Text style={styles.headerCell}>Earnings/Day</Text>
        </View>
      </View>
    );
  };
  
  const renderLevelRow = (level, isCurrentLevel) => {
    return (
      <View 
        style={[
          styles.tableRow, 
          isCurrentLevel && styles.currentLevelRow,
          level.isLocked && { opacity: 0.5 }
        ]}
      >
        <View style={[styles.tableCellContainer, { flex: 1.5 }]}> 
          <Text style={styles.levelCell}>
            {level.name}
            {level.isLocked && (
              <SafeIonicons name="lock-closed" size={14} color={colors.gray400} style={{ marginLeft: 4 }} />
            )}
            {isCurrentLevel && (
              <Text style={styles.currentLabel}> (Current)</Text>
            )}
          </Text>
        </View>
        <View style={[styles.tableCellContainer, { flex: 1 }]}> 
          <Text style={styles.tableCell}>
            KES {level.cost.toLocaleString()}
          </Text>
        </View>
        <View style={[styles.tableCellContainer, { flex: 1 }]}> 
          <Text style={styles.tableCell}>
            {level.tasks}
          </Text>
        </View>
        <View style={[styles.tableCellContainer, { flex: 1 }]}> 
          <Text style={styles.tableCell}>
            KES {level.dailyEarnings.toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };
  
  const renderLevelCard = ({ item }) => {
    return (
      <LinearGradient
        colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
        style={styles.levelCard}
      >
        <View style={[styles.levelBadge, { backgroundColor: item.color }]}> 
          <SafeIonicons name={item.mappedIcon || item.icon} size={24} color={colors.white} />
        </View>
        
        <Text style={styles.levelName}>{item.name} {item.isLocked && <SafeIonicons name="lock-closed" size={16} color={colors.gray400} />}</Text>
        
        <View style={styles.levelFeature}>
          <SafeIonicons name="checkbox-outline" size={18} color={colors.success} />
          <Text style={styles.levelFeatureText}>
            {item.tasks} tasks per day
          </Text>
        </View>
        
        <View style={styles.levelFeature}>
          <SafeIonicons name="cash-outline" size={18} color={colors.success} />
          <Text style={styles.levelFeatureText}>
            KES {item.earningsPerTask} per task
          </Text>
        </View>
        
        <View style={styles.levelFeature}>
          <SafeIonicons name="calendar-outline" size={18} color={colors.success} />
          <Text style={styles.levelFeatureText}>
            Up to KES {(item.dailyEarnings || 0).toLocaleString()} daily
          </Text>
        </View>
        
        <View style={styles.levelFeature}>
          <SafeIonicons name="trending-up-outline" size={18} color={colors.success} />
          <Text style={styles.levelFeatureText}>
            KES {(item.annualEarnings || 0).toLocaleString()} annual potential
          </Text>
        </View>
        
        <View style={styles.levelFeature}>
          <SafeIonicons name="star-outline" size={18} color={colors.success} />
          <Text style={styles.levelFeatureText}>
            {(item.multiplier || 1)}x earnings multiplier
          </Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Upgrade Price:</Text>
          <Text style={styles.price}>KES {(item.cost || 0).toLocaleString()}</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.upgradeButton, item.isLocked && { opacity: 0.5 }]}
          disabled={item.isLocked}
          onPress={() => navigation.navigate('UpgradeDetail', { level: item })}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.upgradeButtonGradient}
          >
            <Text style={styles.upgradeButtonText}>{item.isLocked ? 'Locked' : `Upgrade to ${item.name}`}</Text>
            {!item.isLocked && <SafeIonicons name="arrow-forward" size={18} color={colors.white} />}
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    );
  };
  
  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Level Upgrades</Text>
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
        scrollEventThrottle={16}
      >
        {/* Current level info */}
        <View style={styles.currentLevelContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.currentLevelCard}
          >
            <View style={styles.currentLevelHeader}>
              <View>
                <Text style={styles.currentLevelLabel}>Current Level</Text>
                <Text style={styles.currentLevelName}>{currentLevelData.name}</Text>
              </View>
              
              <View style={[styles.levelBadge, { backgroundColor: currentLevelData.color }]}>
                <SafeIonicons name={currentLevelData.mappedIcon || currentLevelData.icon} size={24} color={colors.white} />
              </View>
            </View>
            
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{currentLevelData.tasks}</Text>
                <Text style={styles.statLabel}>Daily Tasks</Text>
              </View>
              
              <View style={styles.stat}>
                <Text style={styles.statValue}>KES {currentLevelData.earningsPerTask}</Text>
                <Text style={styles.statLabel}>Per Task</Text>
              </View>
              
              <View style={styles.stat}>
                <Text style={styles.statValue}>KES {currentLevelData.dailyEarnings}</Text>
                <Text style={styles.statLabel}>Daily Earning</Text>
              </View>
            </View>
            
            <View style={styles.expenseContainer}>
              <Text style={styles.expenseLabel}>Investment in this level:</Text>
              <Text style={styles.expense}>KES {(profile.level_investment || 0).toLocaleString()}</Text>
            </View>
          </LinearGradient>
        </View>
        
        {/* Level comparison table */}
        <View style={styles.tableContainer}>
          <Text style={styles.sectionTitle}>Level Comparison</Text>
          
          <View style={styles.table}>
            {renderLevelHeader()}
            {levels.map(level => (
              <View key={level.id}>
                {renderLevelRow(level, level.id === currentLevelId)}
              </View>
            ))}
          </View>
        </View>
        {/* Level Descriptions */}
        <View style={styles.descriptionsContainer}>
          <Text style={styles.sectionTitle}>Level Descriptions</Text>
          <View style={styles.descriptionsCard}>
            {levels.map((level) => (
              <View key={level.id} style={{ marginBottom: 16 }}>
                <Text style={[styles.levelName, { color: colors.primary, fontSize: 18 }]}>{level.name}</Text>
                <Text style={styles.descriptionItem}>
                  Entry Cost: <Text style={{ fontWeight: 'bold' }}>KES {level.cost.toLocaleString()}</Text>{'\n'}
                  Daily Tasks: <Text style={{ fontWeight: 'bold' }}>{level.tasks}</Text>{'\n'}
                  Daily Earnings: <Text style={{ fontWeight: 'bold' }}>KES {level.dailyEarnings.toLocaleString()}</Text>{'\n'}
                  {level.description || 'Enjoy the benefits and perks of this level.'}
                </Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Available upgrades */}
        <View style={styles.upgradesContainer}>
          <Text style={styles.sectionTitle}>Available Upgrades</Text>
          
          {availableLevels.length > 0 ? (
            // NOTE: deliberately NOT a FlatList. A nested virtualized list
            // inside a ScrollView hijacks wheel/scroll events on web-PWA and
            // leaves the page stuck at the bottom (can't scroll back up).
            // The upgrade list is short, so a simple map is both safe and fast.
            <View style={styles.upgradesList}>
              {availableLevels.map((item) => renderLevelCard({ item }))}
            </View>
          ) : (
            <View style={styles.maxLevelContainer}>
              <LinearGradient
                colors={['rgba(255,215,0,0.3)', 'rgba(255,215,0,0.1)']}
                style={styles.maxLevelCard}
              >
                <SafeIonicons name="trophy" size={48} color={colors.amber} />
                <Text style={styles.maxLevelTitle}>Maximum Level Reached!</Text>
                <Text style={styles.maxLevelText}>
                  Congratulations! You've reached the highest level available.
                </Text>
              </LinearGradient>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // extra space for the bottom tab bar
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
  currentLevelContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  currentLevelCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  currentLevelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  currentLevelLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
    marginBottom: spacing.xs / 2,
  },
  currentLevelName: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  levelBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    color: colors.blue300,
  },
  expenseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingTop: spacing.md,
  },
  expenseLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  expense: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.green,
  },
  tableContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  descriptionsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  descriptionsCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  descriptionItem: {
    fontSize: fontSizes.md,
    color: colors.gray700,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  table: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    ...shadows.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  headerCellContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
  },
  headerCell: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.blue200,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tableCellContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
  },
  currentLevelRow: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  levelCell: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.white,
  },
  currentLabel: {
    fontSize: fontSizes.xs,
    color: colors.success,
    fontStyle: 'italic',
  },
  tableCell: {
    fontSize: fontSizes.sm,
    color: colors.white,
    textAlign: 'center',
  },
  upgradesContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl * 2, // Extra space for bottom nav
  },
  upgradesList: {
    paddingBottom: spacing.md,
  },
  levelCard: {
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  levelName: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  levelFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  levelFeatureText: {
    fontSize: fontSizes.md,
    color: colors.white,
    marginLeft: spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  priceLabel: {
    fontSize: fontSizes.md,
    color: colors.blue200,
  },
  price: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  upgradeButton: {
    overflow: 'hidden',
    borderRadius: 10,
    ...shadows.md,
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  upgradeButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginRight: spacing.sm,
  },
  maxLevelContainer: {
    marginBottom: spacing.xl,
  },
  maxLevelCard: {
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  maxLevelTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.amber,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  maxLevelText: {
    fontSize: fontSizes.md,
    color: colors.white,
    textAlign: 'center',
  },
});

export default UpgradeScreen;
