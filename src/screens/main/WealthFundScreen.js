import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../../components/SafeIonicons';
import { useUser } from '../../context/SupabaseUserContext';
import supabaseData from '../../services/supabaseData';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { generateBanks } from '../../utils/mockData';
import BankCard from '../../components/BankCard';
import InvestmentCard from '../../components/InvestmentCard';
import { useNotification } from '../../context/NotificationContext';
import { APP_NAME } from '../../constants/branding';

const WealthFundScreen = ({ navigation }) => {
  const { profile, createInvestment, investments, withdrawInvestment, loadUserData } = useUser();
  const { showNotification } = useNotification();
  
  const [selectedBank, setSelectedBank] = useState(null);
  const [featuredBanks, setFeaturedBanks] = useState([]);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [showActive, setShowActive] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);
  const availableBalance = profile?.income_wallet || profile?.incomeWallet || 0;
  
  // Fetch banks from Supabase
  const [banks, setBanks] = useState([]);
  useEffect(() => {
    async function fetchBanks() {
      const { data } = await supabaseData.getInvestmentBanks();
      if (Array.isArray(data) && data.length > 0) {
        setBanks(data);
      } else {
        // Fallback to mock banks if none are configured in Supabase
        setBanks(generateBanks());
      }
    }
    fetchBanks();
  }, []);

  useEffect(() => {
    // Highlight first bank by default and rotate feature set for motion
    if (!selectedBank && banks.length > 0) {
      setSelectedBank(banks[0]);
    }

    const rotationInterval = setInterval(() => {
      setFeaturedBanks(prev => {
        if (prev.length === 0) {
          return banks.slice(0, 3);
        }
        const nextIndex = (banks.findIndex(b => b.id === prev[0].id) + 1) % banks.length;
        const windowBanks = [];
        for (let i = 0; i < 3; i++) {
          windowBanks.push(banks[(nextIndex + i) % banks.length]);
        }
        return windowBanks;
      });
    }, 10000);

    // Initialize feature set immediately
    setFeaturedBanks(banks.slice(0, 3));

    return () => clearInterval(rotationInterval);
  }, [banks, selectedBank]);
  
  // Filter investments by active/completed status
  const activeInvestments = (Array.isArray(investments) ? investments : []).filter(inv => (inv.status || '').toUpperCase() === 'ACTIVE');
  const completedInvestments = (Array.isArray(investments) ? investments : []).filter(inv => (inv.status || '').toUpperCase() === 'COMPLETED');
  
  // Calculate total invested amount
  const totalInvested = (Array.isArray(investments) ? investments : []).reduce(
    (sum, inv) => sum + (inv.status === 'ACTIVE' ? (inv.principal || inv.amount || 0) : 0), 
    0
  );
  
  // Calculate total profits using backend calculation per requirement 2
  const totalProfits = (Array.isArray(investments) ? investments : []).reduce(
    (sum, inv) => {
      // Use backend profit calculation to ensure consistency
      const profit = inv.currentValue > inv.principal ? (inv.currentValue - inv.principal) : 0;
      return sum + (inv.status === 'ACTIVE' ? profit : 0);
    },
    0
  );
  
  // Update investment values periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      // updateInvestments(); // Commented out - function not defined
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Handle bank selection
  const handleSelectBank = (bank) => {
    setSelectedBank(bank);
    setInvestmentAmount('');
  };
  
  // Handle investment creation
  const handleInvest = () => {
    if (!selectedBank) {
      Alert.alert('Error', 'Please select a bank to invest in.');
      return;
    }
    
    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to invest.');
      return;
    }
    
    if (amount < selectedBank.minAmount) {
      Alert.alert(
        'Minimum Investment',
        `The minimum investment for ${selectedBank.name} is KES ${selectedBank.minAmount.toLocaleString()}.`
      );
      return;
    }
    
    if (amount > availableBalance) {
      Alert.alert(
        'Insufficient Funds',
        'You don\'t have enough balance in your income wallet for this investment.'
      );
      return;
    }
    
    const success = createInvestment(
      selectedBank, 
      amount, 
      selectedBank.rate, 
      selectedBank.days
    );
    
    if (success) {
      showNotification({
        type: 'success',
        title: 'Investment successful',
        message: `KES ${amount.toLocaleString()} invested in ${selectedBank.name}.`,
      });
      Alert.alert(
        'Investment Successful',
        `You have successfully invested KES ${amount.toLocaleString()} in ${selectedBank.name}.`
      );
      setInvestmentAmount('');
    } else {
      showNotification({
        type: 'error',
        title: 'Investment failed',
        message: 'Failed to create investment. Please try again.',
      });
      Alert.alert('Error', 'Failed to create investment. Please try again.');
    }
  };
  
  // Handle withdrawing investment
  const handleWithdraw = (investmentId) => {
    const amount = withdrawInvestment(investmentId);
    
    if (amount > 0) {
      showNotification({
        type: 'success',
        title: 'Withdrawal successful',
        message: `KES ${amount.toLocaleString()} returned to your income wallet.`,
      });
      Alert.alert(
        'Withdrawal Successful',
        `KES ${amount.toLocaleString()} has been added back to your income wallet.`
      );
    } else {
      showNotification({
        type: 'error',
        title: 'Withdrawal failed',
        message: 'Failed to withdraw investment. Please try again.',
      });
      Alert.alert('Error', 'Failed to withdraw investment. Please try again.');
    }
  };
  
  if (!profile) {
    return (
      <LinearGradient colors={gradients.primary} style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={[styles.keyboardAvoidingView, styles.loadingContainer]}>
          <Text style={styles.loadingText}>Loading wealth data...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <SafeIonicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.walletSubtitle}>Upgrade funds only</Text>
            <Text style={styles.walletNote}>Use income wallet for investments</Text>
            
            <View style={{ width: 24 }} />
          </View>
          
          {/* Investment Summary */}
          <View style={styles.summaryContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              style={styles.summaryCard}
            >
              <Text style={styles.summaryTitle}>Investment Summary</Text>
              
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    KES {totalInvested.toLocaleString()}
                  </Text>
                  <Text style={styles.statLabel}>Total Invested</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.green }]}>
                    KES {totalProfits.toLocaleString()}
                  </Text>
                  <Text style={styles.statLabel}>Current Profits</Text>
                </View>
              </View>
              
              <View style={styles.walletInfo}>
                <Text style={styles.walletLabel}>Available in Income Wallet:</Text>
                <Text style={styles.walletValue}>
                  KES {availableBalance.toLocaleString()}
                </Text>
              </View>
            </LinearGradient>
          </View>
          
          {/* Investment Form */}
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Create New Investment</Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.banksScrollContainer}
            >
              {banks.map(bank => (
                <Animated.View
                  key={bank.id}
                  style={styles.bankCardContainer}
                >
                  <BankCard
                    bank={bank}
                    onSelect={handleSelectBank}
                    isSelected={selectedBank?.id === bank.id}
                  />
                </Animated.View>
              ))}
            </ScrollView>
            
            <View style={styles.featuredBanksContainer}>
              <Text style={styles.featuredBanksTitle}>Market Pulse</Text>
              <View style={styles.featuredBanksRow}>
                {featuredBanks.map(bank => (
                  <LinearGradient
                    key={`feature-${bank.id}`}
                    colors={[`${bank.color}33`, `${bank.color}11`]}
                    style={styles.featuredBankBadge}
                  >
                    <SafeIonicons name="analytics" size={16} color={colors.white} />
                    <Text style={styles.featuredBankName}>{bank.name}</Text>
                    <Text style={styles.featuredBankRate}>{bank.rate}% daily</Text>
                  </LinearGradient>
                ))}
              </View>
            </View>
            
            {selectedBank && (
              <View style={styles.investmentForm}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                  style={styles.formCard}
                >
                  <Text style={styles.formTitle}>
                    Invest in {selectedBank.name}
                  </Text>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Investment Amount (KES)</Text>
                    <TextInput
                      style={styles.input}
                      value={investmentAmount}
                      onChangeText={setInvestmentAmount}
                      placeholder={`Min ${selectedBank.minAmount.toLocaleString()}`}
                      placeholderTextColor={colors.gray500}
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <View style={styles.projectionContainer}>
                    <Text style={styles.projectionTitle}>Profit Projection</Text>
                    
                    <View style={styles.projectionRow}>
                      <Text style={styles.projectionLabel}>Daily Interest:</Text>
                      <Text style={styles.projectionValue}>
                        {selectedBank.rate}%
                      </Text>
                    </View>
                    
                    <View style={styles.projectionRow}>
                      <Text style={styles.projectionLabel}>Period:</Text>
                      <Text style={styles.projectionValue}>
                        {selectedBank.days} days
                      </Text>
                    </View>
                    
                    {investmentAmount && !isNaN(parseFloat(investmentAmount)) && parseFloat(investmentAmount) > 0 && (
                      <>
                        <View style={styles.projectionRow}>
                          <Text style={styles.projectionLabel}>Principal:</Text>
                          <Text style={styles.projectionValue}>
                            KES {parseFloat(investmentAmount).toLocaleString()}
                          </Text>
                        </View>
                        
                        <View style={styles.projectionRow}>
                          <Text style={styles.projectionLabel}>Estimated Return:</Text>
                          <Text style={[styles.projectionValue, { color: colors.green }]}>
                            KES {(
                              parseFloat(investmentAmount) * 
                              Math.pow(1 + (selectedBank.rate / 100), selectedBank.days)
                            ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                  
                  <TouchableOpacity
                    style={[
                      styles.investButton,
                      (!investmentAmount || isNaN(parseFloat(investmentAmount)) || parseFloat(investmentAmount) <= 0) && 
                      styles.disabledButton
                    ]}
                    onPress={handleInvest}
                    disabled={!investmentAmount || isNaN(parseFloat(investmentAmount)) || parseFloat(investmentAmount) <= 0}
                  >
                    <LinearGradient
                      colors={[colors.green, colors.teal]}
                      style={styles.investButtonGradient}
                    >
                      <Text style={styles.investButtonText}>Invest Now</Text>
                      <SafeIonicons name="arrow-forward" size={18} color={colors.white} />
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}
          </View>
          
          {/* Current Investments */}
          {(activeInvestments.length > 0 || completedInvestments.length > 0) && (
            <View style={styles.investmentsContainer}>
              <View style={styles.investmentsHeader}>
                <Text style={styles.sectionTitle}>Your Investments</Text>
                
                <View style={styles.filterContainer}>
                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      showActive && styles.filterButtonActive
                    ]}
                    onPress={() => setShowActive(!showActive)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      showActive && styles.filterButtonTextActive
                    ]}>
                      Active
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      showCompleted && styles.filterButtonActive
                    ]}
                    onPress={() => setShowCompleted(!showCompleted)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      showCompleted && styles.filterButtonTextActive
                    ]}>
                      Completed
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Active Investments */}
              {showActive && activeInvestments.length > 0 && (
                <>
                  <Text style={styles.investmentTypeLabel}>Active Investments</Text>
                  {activeInvestments.map(investment => (
                    <InvestmentCard
                      key={investment.id}
                      investment={investment}
                      onWithdraw={async (id) => { await withdrawInvestment(id); await loadUserData(); }}
                    />
                  ))}
                </>
              )}
              
              {/* Completed Investments */}
              {showCompleted && completedInvestments.length > 0 && (
                <>
                  <Text style={styles.investmentTypeLabel}>Completed Investments</Text>
                  {completedInvestments.map(investment => (
                    <InvestmentCard
                      key={investment.id}
                      investment={investment}
                      onWithdraw={async (id) => { await withdrawInvestment(id); await loadUserData(); }}
                    />
                  ))}
                </>
              )}
              
              {/* No investments message */}
              {((showActive && activeInvestments.length === 0) && 
                (showCompleted && completedInvestments.length === 0)) ||
                (!showActive && !showCompleted) && (
                <View style={styles.noInvestmentsContainer}>
                  <SafeIonicons name="information-circle" size={48} color={colors.blue400} />
                  <Text style={styles.noInvestmentsText}>
                    No investments found. Start investing to grow your wealth!
                  </Text>
                </View>
              )}
            </View>
          )}
          
          {/* Information Card */}
          <View style={styles.infoContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              style={styles.infoCard}
            >
              <View style={styles.infoHeader}>
                <SafeIonicons name="information-circle" size={24} color={colors.blue300} />
                <Text style={styles.infoTitle}>How It Works</Text>
              </View>
              
              <Text style={styles.infoText}>
                Invest your funds and earn daily compound interest over the investment period.
                Upon maturity, your principal plus earned interest will be available for withdrawal
                to your main wallet.
              </Text>
              
              <View style={styles.tipContainer}>
                <Text style={styles.tipText}>
                  💡 Tip: Higher interest rates typically come with longer investment periods.
                  Choose what works best for your financial goals.
                </Text>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSizes.md,
    color: colors.white,
  },
  scrollContent: {
    paddingBottom: spacing.xl * 2,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  // Summary Card styles
  summaryContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  summaryTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  summaryStats: {
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
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    color: colors.blue200,
  },
  statDivider: {
    height: 40,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  walletInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: spacing.sm,
    borderRadius: 8,
  },
  walletLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  walletValue: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  // Form Container styles
  formContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  banksScrollContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  bankCardContainer: {
    width: 260,
    marginRight: spacing.md,
  },
  featuredBanksContainer: {
    marginTop: spacing.lg,
  },
  featuredBanksTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.blue100,
    marginBottom: spacing.sm,
  },
  featuredBanksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featuredBankBadge: {
    flexDirection: 'column',
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    width: '31%',
    alignItems: 'flex-start',
    ...shadows.sm,
  },
  featuredBankName: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: spacing.xs,
  },
  featuredBankRate: {
    fontSize: fontSizes.xs,
    color: colors.blue200,
    marginTop: spacing.xs / 2,
  },
  investmentForm: {
    marginTop: spacing.sm,
  },
  formCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  formTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: spacing.md,
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  projectionContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  projectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  projectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  projectionLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  projectionValue: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.white,
  },
  investButton: {
    borderRadius: 10,
    overflow: 'hidden',
    ...shadows.md,
  },
  disabledButton: {
    opacity: 0.5,
  },
  investButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  investButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginRight: spacing.sm,
  },
  // Investments Container styles
  investmentsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  investmentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: 2,
  },
  filterButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterButtonText: {
    fontSize: fontSizes.xs,
    color: colors.blue200,
  },
  filterButtonTextActive: {
    color: colors.white,
    fontWeight: 'bold',
  },
  investmentTypeLabel: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.blue300,
    marginBottom: spacing.sm,
  },
  noInvestmentsContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    padding: spacing.xl,
    marginTop: spacing.sm,
  },
  noInvestmentsText: {
    fontSize: fontSizes.md,
    color: colors.white,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  // Info Card styles
  infoContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl * 2, // Extra space for bottom nav
  },
  infoCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.xs,
  },
  infoText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  tipContainer: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderRadius: 8,
    padding: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.amber,
  },
  tipText: {
    fontSize: fontSizes.sm,
    color: colors.amber,
  },
});

export default WealthFundScreen;
