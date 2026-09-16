import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../../components/SafeIonicons';
import { useUser } from '../../context/SupabaseUserContext';
import { useApp } from '../../context/AppContext';
import { withdrawalAmounts } from '../../constants/levels';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { isWithdrawalTimeValid } from '../../utils/mockData';
import { useNotification } from '../../context/NotificationContext';
import { APP_NAME } from '../../constants/branding';

const WithdrawalScreen = ({ navigation }) => {
  const { profile, withdraw, withdrawalRequests } = useUser();
  const { showNotification } = useNotification();
  const { settings } = useApp();
  
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWithdrawalTime, setIsWithdrawalTime] = useState(isWithdrawalTimeValid());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWalletModal, setShowWalletModal] = useState(false);
  
  // Get withdrawal fee percentage from settings
  const withdrawalFeePercentage = (settings?.withdrawal_fee_percentage || 10) / 100;
  
  // Check if user has withdrawal account set up
  const hasWithdrawalAccount = profile?.withdrawalAccountType && profile?.withdrawalAccountDetails;
  
  // Check withdrawal time window
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setIsWithdrawalTime(isWithdrawalTimeValid());
    }, 60000); // Check every minute
    
    return () => clearInterval(timer);
  }, []);
  
  // Handle amount selection with wallet check
  const handleSelectAmount = (amount) => {
    if (!hasWithdrawalAccount) {
      setShowWalletModal(true);
      return;
    }
    setSelectedAmount(amount);
  };
  
  // Handle withdrawal with wallet check
  const handleWithdrawal = async () => {
    if (!hasWithdrawalAccount) {
      setShowWalletModal(true);
      return;
    }
    
    if (!selectedAmount) {
      Alert.alert('Error', 'Please select an amount to withdraw');
      return;
    }
    
    // ... rest of the existing withdrawal logic
  };
  
  // Calculate withdrawal fee
  const calculateFee = (amount) => {
    return amount * withdrawalFeePercentage;
  };
  
  // Calculate amount to receive
  const calculateAmountToReceive = (amount) => {
    const fee = calculateFee(amount);
    return amount - fee;
  };
  
  // Handle withdrawal
  const balance = profile?.incomeWallet ?? profile?.income_wallet ?? 0;

  const handleWithdraw = () => {
    // Double-press guard: never allow a second submission while one is in flight
    if (isLoading) return;

    if (!selectedAmount) {
      Alert.alert('Error', 'Please select a withdrawal amount.');
      return;
    }

    // Only one pending request at a time (also enforced atomically in the DB)
    if ((withdrawalRequests || []).some((r) => r.status === 'pending')) {
      Alert.alert(
        'Withdrawal In Progress',
        'You already have a withdrawal being processed. Please wait for it to complete before requesting another.'
      );
      return;
    }
    // Check if wallet is set
    if (!profile?.withdrawalAccountType || !profile?.withdrawalAccountDetails) {
      Alert.alert(
        'Wallet Not Set',
        'In order to withdraw, you need to set your withdrawal wallet first.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Set Now',
            onPress: () => navigation.navigate('PersonalInfo'),
          },
        ]
      );
      return;
    }
    
    if (!isWithdrawalTime) {
      Alert.alert(
        'Outside Withdrawal Hours',
        'Withdrawals are only available Monday to Friday, 9:00 AM to 10:00 PM.'
      );
      return;
    }
    
    if (selectedAmount > balance) {
      Alert.alert(
        'Insufficient Funds',
        'You don\'t have enough balance in your wallet for this withdrawal.'
      );
      return;
    }
    
    const fee = calculateFee(selectedAmount);
    const amountToReceive = calculateAmountToReceive(selectedAmount);
    
    if (Platform.OS === 'web') {
      (async () => {
        setIsLoading(true);
        try {
          const success = await withdraw(selectedAmount, fee);
          if (success) {
            showNotification({
              type: 'success',
              title: 'Withdrawal Request Submitted',
              message: `KES ${amountToReceive.toLocaleString()} withdrawal request submitted for approval.`,
            });
            setSelectedAmount(null);
            navigation.goBack();
          } else {
            showNotification({
              type: 'error',
              title: 'Withdrawal Failed',
              message: 'There was an error processing your withdrawal request.',
            });
          }
        } finally {
          setIsLoading(false);
        }
      })();
      return;
    }

    Alert.alert(
      'Confirm Withdrawal',
      `You will receive KES ${amountToReceive.toLocaleString()} (Fee: KES ${fee.toLocaleString()})`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            setIsLoading(true);
            try {
              const success = await withdraw(selectedAmount, fee);
              if (success) {
                showNotification({
                  type: 'success',
                  title: 'Withdrawal Request Submitted',
                  message: `KES ${amountToReceive.toLocaleString()} withdrawal request submitted for approval.`,
                });
                setSelectedAmount(null);
                navigation.goBack();
              } else {
                showNotification({
                  type: 'error',
                  title: 'Withdrawal Failed',
                  message: 'There was an error processing your withdrawal request.',
                });
              }
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };
  
  // Format day and time for display
  const formatDayAndTime = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[date.getDay()];
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // Hour 0 should be 12
    
    return `${day}, ${hours}:${minutes} ${ampm}`;
  };
  
  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <SafeIonicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Withdraw Funds</Text>
        
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current Balance */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Income Wallet Balance</Text>
          <Text style={styles.balanceValue}>
            KES {balance.toLocaleString()}
          </Text>
        </View>
        
        {/* Withdrawal Time Status */}
        <View style={styles.timeStatusContainer}>
          <LinearGradient
            colors={[
              isWithdrawalTime ? 'rgba(40,167,69,0.2)' : 'rgba(220,53,69,0.2)',
              isWithdrawalTime ? 'rgba(40,167,69,0.1)' : 'rgba(220,53,69,0.1)'
            ]}
            style={styles.timeStatusCard}
          >
            <View style={styles.timeStatusHeader}>
              <SafeIonicons 
                name={isWithdrawalTime ? "time" : "time-outline"} 
                size={24} 
                color={isWithdrawalTime ? colors.success : colors.error}
              />
              <Text style={[
                styles.timeStatusTitle,
                { color: isWithdrawalTime ? colors.success : colors.error }
              ]}>
                {isWithdrawalTime ? 'Withdrawals Open' : 'Withdrawals Closed'}
              </Text>
            </View>
            
            <Text style={styles.timeStatusInfo}>
              Current Time: {formatDayAndTime(currentTime)}
            </Text>
            
            <Text style={styles.timeStatusNote}>
              Withdrawals are only available Monday to Friday, 9:00 AM to 10:00 PM.
            </Text>
          </LinearGradient>
        </View>
        
        {/* Withdrawal Requests Status */}
        {withdrawalRequests && withdrawalRequests.length > 0 && (
          <View style={styles.requestsContainer}>
            <Text style={styles.requestsTitle}>Recent Withdrawal Requests</Text>
            {withdrawalRequests.slice(0, 3).map((request) => (
              <View key={request.id} style={styles.requestItem}>
                <View style={styles.requestInfo}>
                  <Text style={styles.requestAmount}>
                    KES {request.amount.toLocaleString()}
                  </Text>
                  <Text style={styles.requestDate}>
                    {new Date(request.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { 
                    backgroundColor: 
                      request.status === 'approved' ? colors.success :
                      request.status === 'rejected' ? colors.error :
                      request.status === 'processing' ? colors.warning :
                      request.status === 'pending' ? colors.blue500 :
                      colors.gray500
                  }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { 
                      color: 
                        request.status === 'approved' ? colors.white :
                        request.status === 'rejected' ? colors.white :
                        request.status === 'processing' ? colors.white :
                        request.status === 'pending' ? colors.white :
                        colors.white
                    }
                  ]}>
                    {request.status === 'approved' ? 'Approved' :
                     request.status === 'rejected' ? 'Rejected' :
                     request.status === 'processing' ? 'Processing' :
                     request.status === 'pending' ? 'Pending' :
                     request.status?.charAt(0).toUpperCase() + request.status?.slice(1) || 'Unknown'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
        
        {/* Withdrawal Form */}
        <View style={styles.formContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.formCard}
          >
            <Text style={styles.formTitle}>Select Withdrawal Amount</Text>
            <Text style={styles.formSubtitle}>
              Choose from one of the fixed withdrawal amounts below
            </Text>
            
            <View style={styles.amountsContainer}>
              {withdrawalAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.amountButton,
                    selectedAmount === amount && styles.selectedAmountButton,
                    amount > balance && styles.disabledAmountButton
                  ]}
                  onPress={() => handleSelectAmount(amount)}
                  disabled={amount > balance || isLoading}
                >
                  <Text style={[
                    styles.amountButtonText,
                    selectedAmount === amount && styles.selectedAmountText,
                    amount > balance && styles.disabledAmountText
                  ]}>
                    KES {amount.toLocaleString()}
                  </Text>
                  
                  {selectedAmount === amount && (
                    <View style={styles.checkmarkContainer}>
                      <SafeIonicons name="checkmark-circle" size={20} color={colors.success} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            {selectedAmount && (
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Withdrawal Summary</Text>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Amount:</Text>
                  <Text style={styles.summaryValue}>
                    KES {selectedAmount.toLocaleString()}
                  </Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Fee ({(withdrawalFeePercentage * 100).toFixed(0)}%):</Text>
                  <Text style={styles.summaryValue}>
                    KES {calculateFee(selectedAmount).toLocaleString()}
                  </Text>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>You Receive:</Text>
                  <Text style={styles.totalValue}>
                    KES {calculateAmountToReceive(selectedAmount).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}
            
            <TouchableOpacity
              style={[
                styles.withdrawButton,
                (!selectedAmount || selectedAmount > balance || !isWithdrawalTime || isLoading) && 
                styles.disabledButton
              ]}
              onPress={handleWithdraw}
              disabled={!selectedAmount || selectedAmount > balance || !isWithdrawalTime || isLoading}
            >
              <LinearGradient
                colors={[colors.blue600, colors.blue800]}
                style={styles.withdrawButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.withdrawButtonText}>Withdraw Now</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
        
        {/* Information */}
        <View style={styles.infoContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.infoCard}
          >
            <View style={styles.infoHeader}>
              <SafeIonicons name="information-circle" size={24} color={colors.blue300} />
              <Text style={styles.infoTitle}>Important Information</Text>
            </View>
            
            <View style={styles.infoItem}>
              <SafeIonicons name="time-outline" size={20} color={colors.white} style={styles.infoIcon} />
              <Text style={styles.infoText}>
                Withdrawals are processed Monday to Friday, 9:00 AM to 10:00 PM.
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <SafeIonicons name="cash-outline" size={20} color={colors.white} style={styles.infoIcon} />
              <Text style={styles.infoText}>
                All withdrawals incur a {(withdrawalFeePercentage * 100).toFixed(0)}% processing fee.
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <SafeIonicons name="wallet-outline" size={20} color={colors.white} style={styles.infoIcon} />
              <Text style={styles.infoText}>
                Funds will be sent to your registered withdrawal account (M-Pesa, Bank, etc.).
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <SafeIonicons name="checkmark-circle-outline" size={20} color={colors.white} style={styles.infoIcon} />
              <Text style={styles.infoText}>
                All withdrawals require admin approval before processing.
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <SafeIonicons name="stopwatch-outline" size={20} color={colors.white} style={styles.infoIcon} />
              <Text style={styles.infoText}>
                Approved withdrawals are processed within 24-48 hours.
              </Text>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
      
      {/* Wallet Setup Modal */}
      <Modal
        visible={showWalletModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWalletModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <SafeIonicons name="wallet-outline" size={32} color={colors.orange} />
              <Text style={styles.modalTitle}>Withdrawal Account Required</Text>
            </View>
            
            <Text style={styles.modalMessage}>
              In order to withdraw funds, you need to set up your withdrawal account first. This ensures your funds are sent to the correct account.
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowWalletModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.setNowButton]}
                onPress={() => {
                  setShowWalletModal(false);
                  navigation.navigate('PersonalInfo');
                }}
              >
                <Text style={styles.setNowButtonText}>Set Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl * 2, // Extra space for bottom nav
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
  // Balance styles
  balanceContainer: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  balanceLabel: {
    fontSize: fontSizes.md,
    color: colors.blue200,
    marginBottom: spacing.xs,
  },
  balanceValue: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
  },
  // Time Status styles
  timeStatusContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  timeStatusCard: {
    borderRadius: 16,
    padding: spacing.md,
    ...shadows.md,
  },
  timeStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  timeStatusTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  timeStatusInfo: {
    fontSize: fontSizes.md,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  timeStatusNote: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
    fontStyle: 'italic',
  },
  // Form styles
  formContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
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
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  amountsContainer: {
    marginBottom: spacing.md,
  },
  amountButton: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  selectedAmountButton: {
    backgroundColor: 'rgba(25, 118, 210, 0.3)',
    borderColor: colors.blue400,
  },
  disabledAmountButton: {
    opacity: 0.5,
  },
  amountButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  selectedAmountText: {
    color: colors.white,
  },
  disabledAmountText: {
    color: colors.gray500,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  summaryContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  summaryValue: {
    fontSize: fontSizes.sm,
    color: colors.white,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: spacing.sm,
  },
  totalLabel: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.blue200,
  },
  totalValue: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  withdrawButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.md,
  },
  withdrawButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  withdrawButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
  },
  disabledButton: {
    opacity: 0.5,
  },
  // Info styles
  infoContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  infoIcon: {
    marginRight: spacing.sm,
  },
  infoText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    flex: 1,
  },
  // Withdrawal requests styles
  requestsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  requestsTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  requestInfo: {
    flex: 1,
  },
  requestAmount: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 2,
  },
  requestDate: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
    color: colors.white,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
    ...shadows.lg,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  modalMessage: {
    fontSize: fontSizes.md,
    color: colors.gray300,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButtonText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  setNowButton: {
    backgroundColor: colors.success,
  },
  setNowButtonText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
  },
});

export default WithdrawalScreen;
