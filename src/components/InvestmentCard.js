import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../components/SafeIonicons';
import { colors, spacing, fontSizes, shadows } from '../constants/theme';

const InvestmentCard = ({ investment, onWithdraw }) => {
  const status = String(investment?.status ?? 'ACTIVE').toUpperCase();
  const isCompleted = status === 'COMPLETED';

  const principal = Number(investment?.principal ?? investment?.amount ?? 0);
  const currentValue = Number(investment?.currentValue ?? investment?.current_value ?? principal);
  const rate = Number(investment?.rate ?? investment?.daily_rate ?? 0);
  const totalDays = Number(investment?.days ?? investment?.duration_days ?? 0) || 0;

  const profit = currentValue - principal;
  const profitPercentage = principal > 0 ? ((profit / principal) * 100).toFixed(2) : '0.00';
  
  // Calculate remaining days
  const startDateRaw = investment?.start_date ?? investment?.created_at ?? null;
  const endDateRaw = investment?.endDate ?? investment?.end_date ?? investment?.maturity_date ?? null;
  const endDateCalc = endDateRaw
    ? new Date(endDateRaw).getTime()
    : startDateRaw && totalDays > 0
      ? new Date(new Date(startDateRaw).getTime() + totalDays * 24 * 60 * 60 * 1000).getTime()
      : new Date().getTime();
  const currentDate = new Date().getTime();
  const remainingMilliseconds = Math.max(0, endDateCalc - currentDate);
  const remainingDays = Math.ceil(remainingMilliseconds / (1000 * 60 * 60 * 24));
  
  // Calculate progress percentage
  const elapsedDays = Math.max(0, totalDays - remainingDays);
  const progressPercentage = totalDays > 0 ? Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100)) : 0;
  
  return (
    <LinearGradient
      colors={[
        isCompleted ? 'rgba(40,167,69,0.2)' : 'rgba(255,255,255,0.15)',
        isCompleted ? 'rgba(40,167,69,0.1)' : 'rgba(255,255,255,0.05)'
      ]}
      style={[
        styles.container,
        isCompleted && styles.completedContainer
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.bankName}>{investment.bankName}</Text>
        <View style={[
          styles.statusBadge,
          isCompleted ? styles.completedBadge : styles.activeBadge
        ]}>
          <Text style={[
            styles.statusText,
            isCompleted ? styles.completedText : styles.activeText
          ]}>
            {isCompleted ? 'COMPLETED' : 'ACTIVE'}
          </Text>
        </View>
      </View>
      
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Principal</Text>
          <Text style={styles.detailValue}>
            KES {principal.toLocaleString()}
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Current Value</Text>
          <Text style={styles.detailValue}>
            KES {currentValue.toLocaleString()}
          </Text>
        </View>
      </View>
      
      <View style={styles.profitContainer}>
        <Text style={styles.profitLabel}>Profit:</Text>
        <Text style={styles.profitValue}>
          KES {Number(profit).toLocaleString()} ({profitPercentage}%)
        </Text>
      </View>
      
      {!isCompleted ? (
        <View style={styles.progressContainer}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>
              {remainingDays} day{remainingDays !== 1 ? 's' : ''} remaining
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.floor(progressPercentage)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.withdrawButton}
          onPress={() => onWithdraw(investment.id)}
        >
          <LinearGradient
            colors={[colors.success, colors.teal]}
            style={styles.withdrawButtonGradient}
          >
            <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
            <SafeIonicons name="cash-outline" size={18} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      )}
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isCompleted ? (
            'Investment matured and ready for withdrawal'
          ) : (
            `Daily Interest: ${rate}% | Term: ${totalDays} days`
          )}
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  completedContainer: {
    borderColor: colors.success,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bankName: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 4,
  },
  activeBadge: {
    backgroundColor: 'rgba(25, 118, 210, 0.3)',
  },
  completedBadge: {
    backgroundColor: 'rgba(40, 167, 69, 0.3)',
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
  },
  activeText: {
    color: colors.blue300,
  },
  completedText: {
    color: colors.success,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: fontSizes.xs,
    color: colors.blue200,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  profitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  profitLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  profitValue: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.green,
  },
  progressContainer: {
    marginBottom: spacing.sm,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: fontSizes.xs,
    color: colors.blue200,
  },
  progressPercentage: {
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
    color: colors.white,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.blue500,
    borderRadius: 3,
  },
  withdrawButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  withdrawButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  withdrawButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.white,
    marginRight: spacing.xs,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: spacing.sm,
  },
  footerText: {
    fontSize: fontSizes.xs,
    color: colors.blue300,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default InvestmentCard;
