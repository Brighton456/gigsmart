import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../components/SafeIonicons';
import { colors, spacing, fontSizes, shadows } from '../constants/theme';
import { useUser } from '../context/SupabaseUserContext';
import { useApp } from '../context/AppContext';
import { APP_NAME } from '../constants/branding';

const referralEarningsData = [
  { jobLevel: 'Recruit', level1: 10, level2: 0, level3: 0 },
  { jobLevel: 'Intern', level1: 32, level2: 16, level3: 2 },
  { jobLevel: 'Job 1', level1: 80, level2: 40, level3: 5 },
  { jobLevel: 'Job 2', level1: 240, level2: 120, level3: 15 },
  { jobLevel: 'Job 3', level1: 1000, level2: 500, level3: 62.5 },
  { jobLevel: 'Job 4', level1: 2560, level2: 1280, level3: 160 },
  { jobLevel: 'Job 5', level1: 5120, level2: 2560, level3: 320 },
  { jobLevel: 'Job 6', level1: 20480, level2: 10240, level3: 1280 },
];

const ReferralTable = () => {
  const { profile, referrals, loadUserData, levels } = useUser();
  const { mergedSettings } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const calculatePotentialEarnings = (referralCount) => {
    // Estimate potential earnings from referrals
    const avgInvestment = 5000; // Average investment per referral
    const avgUpgrade = 1000; // Average upgrade cost
    const investmentBonus = avgInvestment * 0.006; // 0.6%
    const upgradeBonus = avgUpgrade * 0.006; // 0.6%
    const signupBonus = 10;
    
    return (signupBonus + investmentBonus + upgradeBonus) * referralCount;
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Referral Stats Cards */}
      <View style={styles.statsGrid}>
        <LinearGradient
          colors={[colors.success, colors.green]}
          style={styles.statCard}
        >
          <SafeIonicons name="people" size={24} color={colors.white} />
          <Text style={styles.statNumber}>{referrals?.length || 0}</Text>
          <Text style={styles.statLabel}>Total Referrals</Text>
        </LinearGradient>

        <LinearGradient
          colors={[colors.warning, colors.orange]}
          style={styles.statCard}
        >
          <SafeIonicons name="cash" size={24} color={colors.white} />
          <Text style={styles.statNumber}>
            KES {calculatePotentialEarnings(referrals?.length || 0).toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Potential Earnings</Text>
        </LinearGradient>
      </View>

      {/* Referral Earnings Description */}
      <View style={styles.bonusStructure}>
        <Text style={styles.sectionTitle}>💰 Referral Earnings</Text>
        <Text style={styles.referralDescription}>
          Earn additional income by inviting others to join GIGS. Referral earnings are calculated as {mergedSettings?.referral_level1_percentage || 4}% (Level 1), {mergedSettings?.referral_level2_percentage || 2}% (Level 2), and {mergedSettings?.referral_level3_percentage || 0.25}% (Level 3) of your invitees' deposits.
        </Text>
        
        <View style={styles.bonusCard}>
          <LinearGradient
            colors={['rgba(16,185,129,0.1)', 'rgba(16,185,129,0.05)']}
            style={styles.bonusItem}
          >
            <View style={styles.bonusIcon}>
              <SafeIonicons name="person-add" size={20} color={colors.success} />
            </View>
            <View style={styles.bonusDetails}>
              <Text style={styles.bonusTitle}>Signup Bonus</Text>
              <Text style={styles.bonusDescription}>
                Earn KES 10 when someone joins with your link
              </Text>
            </View>
            <Text style={styles.bonusAmount}>KES 10</Text>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(59,130,246,0.1)', 'rgba(59,130,246,0.05)']}
            style={styles.bonusItem}
          >
            <View style={styles.bonusIcon}>
              <SafeIonicons name="trending-up" size={20} color={colors.blue500} />
            </View>
            <View style={styles.bonusDetails}>
              <Text style={styles.bonusTitle}>Investment Bonus</Text>
              <Text style={styles.bonusDescription}>
                Earn 0.6% of every investment your referrals make
              </Text>
            </View>
            <Text style={styles.bonusAmount}>0.6%</Text>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(139,92,246,0.1)', 'rgba(139,92,246,0.05)']}
            style={styles.bonusItem}
          >
            <View style={styles.bonusIcon}>
              <SafeIonicons name="arrow-up-circle" size={20} color={colors.purple500} />
            </View>
            <View style={styles.bonusDetails}>
              <Text style={styles.bonusTitle}>Upgrade Bonus</Text>
              <Text style={styles.bonusDescription}>
                Earn 0.6% when your referrals upgrade their level
              </Text>
            </View>
            <Text style={styles.bonusAmount}>0.6%</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Example Earnings */}
      <View style={styles.exampleEarnings}>
        <Text style={styles.sectionTitle}>📊 Example Earnings</Text>
        <View style={styles.exampleCard}>
          <Text style={styles.exampleTitle}>If your referral:</Text>
          
          <View style={styles.exampleItem}>
            <Text style={styles.exampleAction}>• Invests KES 10,000</Text>
            <Text style={styles.exampleEarning}>You earn: KES 60</Text>
          </View>
          
          <View style={styles.exampleItem}>
            <Text style={styles.exampleAction}>• Upgrades to J3 (KES 1,500)</Text>
            <Text style={styles.exampleEarning}>You earn: KES 9</Text>
          </View>
          
          <View style={styles.exampleItem}>
            <Text style={styles.exampleAction}>• Invests KES 50,000</Text>
            <Text style={styles.exampleEarning}>You earn: KES 300</Text>
          </View>
          
          <View style={styles.totalExample}>
            <Text style={styles.totalText}>Total from one active referral: KES 379+</Text>
          </View>
        </View>
      </View>

      <View style={styles.comparisonSection}>
        <Text style={styles.sectionTitle}>📊 Referral Earnings Table</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <Text style={[styles.tableCell, styles.headerCell, styles.levelColumn]}>Job Level</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Level 1 Earnings ({mergedSettings?.referral_level1_percentage || 4}%)</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Level 2 Earnings ({mergedSettings?.referral_level2_percentage || 2}%)</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Level 3 Earnings ({mergedSettings?.referral_level3_percentage || 0.25}%)</Text>
          </View>

          {referralEarningsData.map((data, index) => (
            <View
              key={data.jobLevel}
              style={[
                styles.tableRow,
                index % 2 === 1 && styles.tableRowAlt,
              ]}
            >
              <View style={[styles.tableCell, styles.levelColumn]}>
                <Text style={styles.levelTitle}>{data.jobLevel}</Text>
              </View>
              <Text style={styles.tableCell}>{data.level1} KSh</Text>
              <Text style={styles.tableCell}>{data.level2} KSh</Text>
              <Text style={styles.tableCell}>{data.level3} KSh</Text>
            </View>
          ))}
        </View>

        <Text style={styles.tableNote}>This table displays earnings from referring new users to the GIGs platform, calculated as a percentage of their deposits across three referral levels.</Text>
      </View>
    </View>
  );

  const renderReferralsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>👥 Your Referrals</Text>
      
      {referrals && referrals.length > 0 ? (
        <ScrollView style={styles.referralsList}>
          {referrals.map((referral, index) => (
            <View key={referral.id} style={styles.referralItem}>
              <View style={styles.referralInfo}>
                <View style={styles.referralAvatar}>
                  <Text style={styles.referralInitial}>
                    {referral.referred_user?.name?.charAt(0) || 'U'}
                  </Text>
                </View>
                <View style={styles.referralDetails}>
                  <Text style={styles.referralName}>
                    {referral.referred_user?.name || 'User'}
                  </Text>
                  <Text style={styles.referralDate}>
                    Joined {new Date(referral.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.referralEarnings}>
                <Text style={styles.earningsAmount}>
                  KES {referral.lifetime_earnings?.toLocaleString() || '0'}
                </Text>
                <Text style={styles.earningsLabel}>Total Earned</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <SafeIonicons name="people-outline" size={64} color={colors.blue300} />
          <Text style={styles.emptyTitle}>No Referrals Yet</Text>
          <Text style={styles.emptyDescription}>
            Share your referral link to start earning bonuses from your network
          </Text>
        </View>
      )}
    </View>
  );

  const renderLevelsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>🎯 Level Benefits</Text>
      <Text style={styles.levelDescription}>
        Higher levels unlock better earning opportunities for your referrals
      </Text>
      
      <ScrollView style={styles.levelsList}>
        {levels.map((level) => (
          <View key={level.id} style={styles.levelItem}>
            <LinearGradient
              colors={[level.color + '20', level.color + '10']}
              style={styles.levelCard}
            >
              <View style={styles.levelHeader}>
                <View style={[styles.levelIcon, { backgroundColor: level.color }]}>
                  <SafeIonicons name={level.mappedIcon || level.icon} size={20} color={colors.white} />
                </View>
                <View style={styles.levelInfo}>
                  <Text style={styles.levelName}>{level.name}</Text>
                  <Text style={styles.levelCost}>
                    {level.cost === 0 ? 'Free' : `KES ${level.cost.toLocaleString()}`}
                  </Text>
                </View>
                {profile?.current_level === level.id && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentText}>Current</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.levelBenefits}>
                <Text style={styles.benefitItem}>
                  • {level.tasks} tasks required
                </Text>
                <Text style={styles.benefitItem}>
                  • {level.daily_rate}% daily rate
                </Text>
                <Text style={styles.benefitItem}>
                  • Enhanced referral opportunities
                </Text>
              </View>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'referrals' && styles.activeTab]}
          onPress={() => setActiveTab('referrals')}
        >
          <Text style={[styles.tabText, activeTab === 'referrals' && styles.activeTabText]}>
            Referrals
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'levels' && styles.activeTab]}
          onPress={() => setActiveTab('levels')}
        >
          <Text style={[styles.tabText, activeTab === 'levels' && styles.activeTabText]}>
            Levels
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'referrals' && renderReferralsTab()}
        {activeTab === 'levels' && renderLevelsTab()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F1FF',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: spacing.md,
    ...shadows.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.blue600,
  },
  tabText: {
    fontSize: fontSizes.md,
    color: colors.blue700,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.blue700,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.blue900,
    marginBottom: spacing.md,
  },
  referralDescription: {
    fontSize: fontSizes.md,
    color: colors.blue700,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    ...shadows.sm,
  },
  statNumber: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: spacing.xs,
  },
  bonusStructure: {
    marginBottom: spacing.lg,
  },
  bonusCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.12)',
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.sm,
  },
  bonusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  bonusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blue500,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  bonusDetails: {
    flex: 1,
  },
  bonusTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.blue900,
  },
  bonusDescription: {
    fontSize: fontSizes.sm,
    color: colors.blue600,
    marginTop: spacing.xs,
  },
  bonusAmount: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.success,
  },
  exampleEarnings: {
    marginBottom: spacing.lg,
  },
  exampleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.sm,
  },
  comparisonSection: {
    marginBottom: spacing.lg,
  },
  tableWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  table: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.12)',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: 'rgba(59,130,246,0.08)',
  },
  tableHeaderRow: {
    backgroundColor: 'rgba(59,130,246,0.18)',
  },
  tableRowAlt: {
    backgroundColor: 'rgba(59,130,246,0.08)',
  },
  tableCell: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.sm,
    color: colors.blue900,
  },
  levelColumn: {
    flex: 1.2,
    fontWeight: 'bold',
  },
  headerCell: {
    fontWeight: 'bold',
    color: colors.blue700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableCellLast: {
    borderRightWidth: 0,
  },
  levelTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.blue900,
    marginBottom: spacing.xs / 2,
  },
  cellSubtext: {
    fontSize: fontSizes.xs,
    color: colors.blue600,
  },
  tableNote: {
    marginTop: spacing.sm,
    fontSize: fontSizes.sm,
    color: colors.blue700,
  },
  exampleTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  exampleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.blue50,
  },
  exampleAction: {
    fontSize: fontSizes.sm,
    color: colors.blue900,
  },
  exampleEarning: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.success,
  },
  totalExample: {
    backgroundColor: colors.success + '20',
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  totalText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.success,
    textAlign: 'center',
  },
  referralsList: {
    maxHeight: 400,
  },
  referralItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.12)',
    ...shadows.sm,
  },
  referralInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  referralAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blue500,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  referralInitial: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  referralDetails: {
    flex: 1,
  },
  referralName: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.blue900,
  },
  referralDate: {
    fontSize: fontSizes.sm,
    color: colors.blue600,
  },
  referralEarnings: {
    alignItems: 'flex-end',
  },
  earningsAmount: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.success,
  },
  earningsLabel: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.blue900,
    marginTop: spacing.md,
  },
  emptyDescription: {
    fontSize: fontSizes.md,
    color: colors.blue600,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  levelDescription: {
    fontSize: fontSizes.md,
    color: colors.blue600,
    marginBottom: spacing.lg,
  },
  levelsList: {
    maxHeight: 400,
  },
  levelItem: {
    marginBottom: spacing.md,
  },
  levelCard: {
    borderRadius: 12,
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.12)',
    ...shadows.sm,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  levelIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  levelInfo: {
    flex: 1,
  },
  levelName: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.blue900,
  },
  levelCost: {
    fontSize: fontSizes.sm,
    color: colors.blue600,
  },
  currentBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  currentText: {
    fontSize: fontSizes.xs,
    color: colors.white,
    fontWeight: 'bold',
  },
  levelBenefits: {
    paddingLeft: spacing.lg,
  },
  benefitItem: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});

export default ReferralTable;
