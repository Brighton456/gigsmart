import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  FlatList,
  StatusBar,
  Clipboard,
  Alert,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../../components/SafeIonicons';
import { useAuth } from '../../context/SupabaseAuthContext';
import { useUser } from '../../context/SupabaseUserContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { APP_NAME, APP_URL, APP_SHORT_NAME } from '../../constants/branding';
import ReferralTable from '../../components/ReferralTable';

const TeamScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { profile } = useUser();
  const [activeLevel, setActiveLevel] = useState('all');
  
  // In a real app, this would be a proper referral link
  const referralLink = `${APP_URL}/register?ref=${user?.id || 'user123'}`;
  
  // Mock referral structure with different levels
  const mockReferrals = {
    level1: Array.from({ length: Math.floor(Math.random() * 5) + 2 }, (_, i) => ({
      id: `level1-${i + 1}`,
      name: `User ${i + 1}`,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      isActive: Math.random() > 0.3,
      level: 'L1'
    })),
    level2: Array.from({ length: Math.floor(Math.random() * 8) + 4 }, (_, i) => ({
      id: `level2-${i + 1}`,
      name: `User ${i + 10}`,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      isActive: Math.random() > 0.3,
      level: 'L2'
    })),
    level3: Array.from({ length: Math.floor(Math.random() * 12) + 6 }, (_, i) => ({
      id: `level3-${i + 1}`,
      name: `User ${i + 20}`,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      isActive: Math.random() > 0.3,
      level: 'L3'
    }))
  };
  
  // Total referral count
  const totalReferrals = 
    mockReferrals.level1.length + 
    mockReferrals.level2.length + 
    mockReferrals.level3.length;
  
  // Active referrals
  const activeReferrals =
    mockReferrals.level1.filter(ref => ref.isActive).length +
    mockReferrals.level2.filter(ref => ref.isActive).length +
    mockReferrals.level3.filter(ref => ref.isActive).length;
  
  // Copy referral link to clipboard
  const copyReferralLink = () => {
    Clipboard.setString(referralLink);
    Alert.alert('Success', 'Referral link copied to clipboard!');
  };
  
  // Share referral link
  const shareReferralLink = async () => {
    try {
      await Share.share({
        message: `Join ${APP_NAME} and earn daily through tasks and referrals! Sign up with my referral link: ${referralLink}`,
        title: `Join ${APP_NAME}`
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share referral link.');
    }
  };
  
  // Render a referral item
  const renderReferralItem = ({ item }) => (
    <View style={styles.referralItem}>
      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
        style={styles.referralItemInner}
      >
        <View style={styles.referralInfo}>
          <View style={styles.referralNameContainer}>
            <Text style={styles.referralName}>{item.name}</Text>
            <View style={[
              styles.statusBadge,
              item.isActive ? styles.activeBadge : styles.inactiveBadge
            ]}>
              <Text style={[
                styles.statusText,
                item.isActive ? styles.activeText : styles.inactiveText
              ]}>
                {item.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          <Text style={styles.referralDate}>Joined: {item.date}</Text>
        </View>
        
        <View style={styles.levelBadgeContainer}>
          <View style={[styles.levelBadge, styles[`level${item.level}Badge`]]}>
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
  
  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Team</Text>
      </View>
      
      {/* Referral Table Component */}
      <ReferralTable />
    </LinearGradient>
  );
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalReferrals}</Text>
                <Text style={styles.statLabel}>Total Referrals</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{activeReferrals}</Text>
                <Text style={styles.statLabel}>Active Members</Text>
              </View>
            </View>
            
            <View style={styles.levelBreakdownContainer}>
              <Text style={styles.levelBreakdownTitle}>Level Breakdown:</Text>
              
              <View style={styles.levelBreakdownRow}>
                <View style={styles.levelIndicator}>
                  <View style={[styles.levelDot, { backgroundColor: colors.green }]} />
                  <Text style={styles.levelLabel}>Level 1: {mockReferrals.level1.length}</Text>
                </View>
                
                <View style={styles.levelIndicator}>
                  <View style={[styles.levelDot, { backgroundColor: colors.blue500 }]} />
                  <Text style={styles.levelLabel}>Level 2: {mockReferrals.level2.length}</Text>
                </View>
                
                <View style={styles.levelIndicator}>
                  <View style={[styles.levelDot, { backgroundColor: colors.purple }]} />
                  <Text style={styles.levelLabel}>Level 3: {mockReferrals.level3.length}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
        
        {/* Referral Link Card */}
        <View style={styles.referralLinkContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.referralLinkCard}
          >
            <View style={styles.referralLinkHeader}>
              <SafeIonicons name="link" size={24} color={colors.blue300} />
              <Text style={styles.referralLinkTitle}>Your Referral Link</Text>
            </View>
            
            <View style={styles.referralLinkBox}>
              <Text style={styles.referralLinkText} numberOfLines={1}>
                {referralLink}
              </Text>
            </View>
            
            <View style={styles.referralActionButtons}>
              <TouchableOpacity
                style={[styles.referralAction, styles.copyButton]}
                onPress={copyReferralLink}
              >
                <SafeIonicons name="copy-outline" size={18} color={colors.white} />
                <Text style={styles.referralActionText}>Copy Link</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.referralAction, styles.shareButton]}
                onPress={shareReferralLink}
              >
                <SafeIonicons name="share-social-outline" size={18} color={colors.white} />
                <Text style={styles.referralActionText}>Share Link</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
        
        {/* Commissions Card */}
        <View style={styles.commissionsContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.commissionsCard}
          >
            <Text style={styles.commissionsTitle}>Commission Structure</Text>
            
            <View style={styles.commissionItem}>
              <View style={[styles.commissionBadge, { backgroundColor: colors.green }]}>
                <Text style={styles.commissionBadgeText}>L1</Text>
              </View>
              
              <View style={styles.commissionDetails}>
                <Text style={styles.commissionLevel}>Level 1 (Direct)</Text>
                <Text style={styles.commissionDescription}>Your direct referrals</Text>
              </View>
              
              <Text style={styles.commissionAmount}>KES 300</Text>
            </View>
            
            <View style={styles.commissionItem}>
              <View style={[styles.commissionBadge, { backgroundColor: colors.blue500 }]}>
                <Text style={styles.commissionBadgeText}>L2</Text>
              </View>
              
              <View style={styles.commissionDetails}>
                <Text style={styles.commissionLevel}>Level 2 (Indirect)</Text>
                <Text style={styles.commissionDescription}>Your referrals' referrals</Text>
              </View>
              
              <Text style={styles.commissionAmount}>KES 100</Text>
            </View>
            
            <View style={styles.commissionItem}>
              <View style={[styles.commissionBadge, { backgroundColor: colors.purple }]}>
                <Text style={styles.commissionBadgeText}>L3</Text>
              </View>
              
              <View style={styles.commissionDetails}>
                <Text style={styles.commissionLevel}>Level 3 (Network)</Text>
                <Text style={styles.commissionDescription}>Extended network</Text>
              </View>
              
              <Text style={styles.commissionAmount}>KES 50</Text>
            </View>
          </LinearGradient>
        </View>
        
        {/* Referral List Section */}
        <View style={styles.referralsContainer}>
          <Text style={styles.sectionTitle}>Your Referrals</Text>
          
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeLevel === 'all' && styles.activeTab]}
              onPress={() => setActiveLevel('all')}
            >
              <Text style={[styles.tabText, activeLevel === 'all' && styles.activeTabText]}>All Levels</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeLevel === 'level1' && styles.activeTab]}
              onPress={() => setActiveLevel('level1')}
            >
              <Text style={[styles.tabText, activeLevel === 'level1' && styles.activeTabText]}>Level 1</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeLevel === 'level2' && styles.activeTab]}
              onPress={() => setActiveLevel('level2')}
            >
              <Text style={[styles.tabText, activeLevel === 'level2' && styles.activeTabText]}>Level 2</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeLevel === 'level3' && styles.activeTab]}
              onPress={() => setActiveLevel('level3')}
            >
              <Text style={[styles.tabText, activeLevel === 'level3' && styles.activeTabText]}>Level 3</Text>
            </TouchableOpacity>
          </View>
          
          {/* Level 1 Referrals */}
          {mockReferrals.level1.length > 0 && (
            <View style={styles.levelSection}>
              <View style={styles.levelHeader}>
                <View style={[styles.levelIndicator, { marginBottom: 0 }]}>
                  <View style={[styles.levelDot, { backgroundColor: colors.green }]} />
                  <Text style={styles.levelSectionTitle}>Level 1 (Direct)</Text>
                </View>
                
                <Text style={styles.levelCount}>{mockReferrals.level1.length}</Text>
              </View>
              
              <FlatList
                data={mockReferrals.level1}
                renderItem={renderReferralItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            </View>
          )}
          
          {/* Level 2 Referrals */}
          {mockReferrals.level2.length > 0 && (
            <View style={styles.levelSection}>
              <View style={styles.levelHeader}>
                <View style={[styles.levelIndicator, { marginBottom: 0 }]}>
                  <View style={[styles.levelDot, { backgroundColor: colors.blue500 }]} />
                  <Text style={styles.levelSectionTitle}>Level 2 (Indirect)</Text>
                </View>
                
                <Text style={styles.levelCount}>{mockReferrals.level2.length}</Text>
              </View>
              
              <FlatList
                data={mockReferrals.level2}
                renderItem={renderReferralItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            </View>
          )}
          
          {/* Level 3 Referrals */}
          {mockReferrals.level3.length > 0 && (
            <View style={styles.levelSection}>
              <View style={styles.levelHeader}>
                <View style={[styles.levelIndicator, { marginBottom: 0 }]}>
                  <View style={[styles.levelDot, { backgroundColor: colors.purple }]} />
                  <Text style={styles.levelSectionTitle}>Level 3 (Network)</Text>
                </View>
                
                <Text style={styles.levelCount}>{mockReferrals.level3.length}</Text>
              </View>
              
              <FlatList
                data={mockReferrals.level3}
                renderItem={renderReferralItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  // Stats Card styles
  statsCardContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statsCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  statsTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
  },
  statDivider: {
    height: 40,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  levelBreakdownContainer: {
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingTop: spacing.md,
  },
  levelBreakdownTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  levelBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  levelDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.xs,
  },
  levelLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  // Referral Link Card styles
  referralLinkContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  referralLinkCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  referralLinkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  referralLinkTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.sm,
  },
  referralLinkBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  referralLinkText: {
    fontSize: fontSizes.sm,
    color: colors.white,
  },
  referralActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  referralAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: spacing.sm,
    flex: 1,
  },
  copyButton: {
    backgroundColor: colors.blue700,
    marginRight: spacing.sm,
  },
  shareButton: {
    backgroundColor: colors.green,
    marginLeft: spacing.sm,
  },
  referralActionText: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.xs,
  },
  // Commissions Card styles
  commissionsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  commissionsCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  commissionsTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  commissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  commissionBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  commissionBadgeText: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.white,
  },
  commissionDetails: {
    flex: 1,
  },
  commissionLevel: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.white,
  },
  commissionDescription: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  commissionAmount: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.green,
  },
  // Referrals List styles
  referralsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl * 2, // Extra space for bottom nav
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabText: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  activeTabText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  levelSection: {
    marginBottom: spacing.lg,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  levelSectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  levelCount: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
  },
  referralItem: {
    marginBottom: spacing.sm,
  },
  referralItemInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.sm,
  },
  referralInfo: {
    flex: 1,
  },
  referralNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  referralName: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.white,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeBadge: {
    backgroundColor: 'rgba(40, 167, 69, 0.3)',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(220, 53, 69, 0.3)',
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
  },
  activeText: {
    color: colors.success,
  },
  inactiveText: {
    color: colors.error,
  },
  referralDate: {
    fontSize: fontSizes.xs,
    color: colors.blue300,
  },
  levelBadgeContainer: {
    marginLeft: spacing.sm,
  },
  levelBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelL1Badge: {
    backgroundColor: colors.green,
  },
  levelL2Badge: {
    backgroundColor: colors.blue500,
  },
  levelL3Badge: {
    backgroundColor: colors.purple,
  },
  levelText: {
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
    color: colors.white,
  },
});

export default TeamScreen;
