import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../../components/SafeIonicons';
import { useUser } from '../../context/SupabaseUserContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';

const TeamReportsScreen = ({ navigation }) => {
  const { profile, referrals } = useUser();
  
  // Mock team data - in real app, this would come from API
  const teamData = {
    totalTeam: referrals?.length || 0,
    levelA: referrals?.filter(r => r.level === 1)?.length || 0,
    levelB: referrals?.filter(r => r.level === 2)?.length || 0,
    levelC: referrals?.filter(r => r.level === 3)?.length || 0,
    totalMembers: referrals?.length || 0,
    activeReferrals: referrals?.filter(r => r.isActive)?.length || 0,
    directRecharge: profile?.directRecharge || 0,
    secondaryRecharge: profile?.secondaryRecharge || 0,
    tertiaryRecharge: profile?.tertiaryRecharge || 0,
    teamRecharge: profile?.teamRecharge || 0,
    directWithdrawals: profile?.directWithdrawals || 0,
    secondaryWithdrawals: profile?.secondaryWithdrawals || 0,
    tertiaryWithdrawals: profile?.tertiaryWithdrawals || 0,
    teamWithdrawals: profile?.teamWithdrawals || 0,
  };

  const StatCard = ({ title, value, icon, color, isAmount = false }) => (
    <View style={styles.statCard}>
      <LinearGradient colors={[color, color + '80']} style={styles.statCardGradient}>
        <SafeIonicons name={icon} size={24} color={colors.white} />
        <Text style={styles.statValue}>
          {isAmount ? `KES ${value.toLocaleString()}` : value.toLocaleString()}
        </Text>
        <Text style={styles.statTitle}>{title}</Text>
      </LinearGradient>
    </View>
  );

  const teamMembers = referrals || [];

  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <SafeIonicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team Reports</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Team Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Overview</Text>
          
          <View style={styles.statsGrid}>
            <StatCard title="Total Team" value={teamData.totalTeam} icon="people" color={colors.blue500} />
            <StatCard title="Level A" value={teamData.levelA} icon="person" color={colors.green} />
            <StatCard title="Level B" value={teamData.levelB} icon="person" color={colors.orange} />
            <StatCard title="Level C" value={teamData.levelC} icon="person" color={colors.purple} />
            <StatCard title="Total Members" value={teamData.totalMembers} icon="people-circle" color={colors.indigo} />
            <StatCard title="Active Referrals" value={teamData.activeReferrals} icon="checkmark-circle" color={colors.success} />
          </View>
        </View>

        {/* Recharge Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recharge Statistics</Text>
          
          <View style={styles.statsGrid}>
            <StatCard title="Direct Recharge" value={teamData.directRecharge} icon="arrow-down-circle" color={colors.blue600} isAmount />
            <StatCard title="Secondary Recharge" value={teamData.secondaryRecharge} icon="arrow-down-circle" color={colors.teal} isAmount />
            <StatCard title="Tertiary Recharge" value={teamData.tertiaryRecharge} icon="arrow-down-circle" color={colors.cyan} isAmount />
            <StatCard title="Team Recharge" value={teamData.teamRecharge} icon="arrow-down-circle" color={colors.blue800} isAmount />
          </View>
        </View>

        {/* Withdrawal Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Withdrawal Statistics</Text>
          
          <View style={styles.statsGrid}>
            <StatCard title="Direct Withdrawals" value={teamData.directWithdrawals} icon="arrow-up-circle" color={colors.red} isAmount />
            <StatCard title="Secondary Withdrawals" value={teamData.secondaryWithdrawals} icon="arrow-up-circle" color={colors.pink} isAmount />
            <StatCard title="Tertiary Withdrawals" value={teamData.tertiaryWithdrawals} icon="arrow-up-circle" color={colors.amber} isAmount />
            <StatCard title="Team Withdrawals" value={teamData.teamWithdrawals} icon="arrow-up-circle" color={colors.deepOrange} isAmount />
          </View>
        </View>

        {/* Team Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Performance</Text>
          
          <View style={styles.performanceCard}>
            <Text style={styles.performanceTitle}>View your team's performance below.</Text>
            
            {teamMembers.length > 0 ? (
              <View style={styles.teamList}>
                {teamMembers.slice(0, 10).map((member, index) => (
                  <View key={member.id || index} style={styles.teamMemberItem}>
                    <View style={styles.memberInfo}>
                      <View style={styles.memberAvatar}>
                        <Text style={styles.memberInitial}>
                          {member.referred_user?.name?.charAt(0) || 'U'}
                        </Text>
                      </View>
                      <View style={styles.memberDetails}>
                        <Text style={styles.memberName}>
                          {member.referred_user?.name || 'Team Member'}
                        </Text>
                        <Text style={styles.memberLevel}>Level {member.level || 1}</Text>
                      </View>
                    </View>
                    <View style={styles.memberStats}>
                      <Text style={styles.memberEarnings}>KES {(member.totalEarnings || 0).toLocaleString()}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <SafeIonicons name="people-outline" size={64} color={colors.gray400} />
                <Text style={styles.emptyStateTitle}>No team members found.</Text>
              </View>
            )}
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
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: fontSizes.lg, fontWeight: 'bold', color: colors.white, marginBottom: spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', marginBottom: spacing.md, borderRadius: 12, overflow: 'hidden', ...shadows.sm },
  statCardGradient: { padding: spacing.md, alignItems: 'center' },
  statValue: { fontSize: fontSizes.lg, fontWeight: 'bold', color: colors.white, marginVertical: spacing.xs },
  statTitle: { fontSize: fontSizes.sm, color: colors.white, opacity: 0.9, textAlign: 'center' },
  performanceCard: { backgroundColor: colors.white, borderRadius: 16, padding: spacing.lg, ...shadows.md },
  performanceTitle: { fontSize: fontSizes.md, fontWeight: '600', color: colors.textDark, marginBottom: spacing.md },
  teamList: { marginTop: spacing.md },
  teamMemberItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  memberInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  memberInitial: { fontSize: fontSizes.md, fontWeight: 'bold', color: colors.white },
  memberDetails: { marginLeft: spacing.md, flex: 1 },
  memberName: { fontSize: fontSizes.md, fontWeight: '600', color: colors.textDark },
  memberLevel: { fontSize: fontSizes.sm, color: colors.gray600 },
  memberStats: { alignItems: 'flex-end' },
  memberEarnings: { fontSize: fontSizes.md, fontWeight: 'bold', color: colors.success },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyStateTitle: { fontSize: fontSizes.lg, fontWeight: 'bold', color: colors.gray600, marginTop: spacing.md },
});

export default TeamReportsScreen;
