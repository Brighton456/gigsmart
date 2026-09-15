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

const BankCard = ({ bank, onSelect, isSelected }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onSelect(bank)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[
          isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)',
          isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'
        ]}
        style={[
          styles.innerContainer,
          isSelected && styles.selectedContainer
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: bank.color }]}>
          <SafeIonicons name="business-outline" size={24} color={colors.white} />
        </View>
        
        <Text style={styles.bankName}>{bank.name}</Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Daily Rate:</Text>
            <Text style={styles.detailValue}>{bank.rate}%</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Period:</Text>
            <Text style={styles.detailValue}>{bank.days} days</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Min. Investment:</Text>
            <Text style={styles.detailValue}>KES {bank.minAmount.toLocaleString()}</Text>
          </View>
        </View>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{bank.description}</Text>
        </View>
        
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <SafeIonicons name="checkmark-circle" size={24} color={colors.success} />
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  innerContainer: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  selectedContainer: {
    borderWidth: 2,
    borderColor: colors.success,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bankName: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  detailsContainer: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  detailLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  detailValue: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.white,
  },
  descriptionContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: spacing.sm,
    borderRadius: 8,
  },
  description: {
    fontSize: fontSizes.sm,
    fontStyle: 'italic',
    color: colors.blue300,
  },
  selectedIndicator: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
});

export default BankCard;
