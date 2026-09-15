import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../../components/SafeIonicons';
import { useUser } from '../../context/SupabaseUserContext';
import { useAuth } from '../../context/SupabaseAuthContext';
import { initiateSTKPush, checkPaymentStatus } from '../../services/api';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { useNotification } from '../../context/NotificationContext';
import { APP_SHORT_NAME } from '../../constants/branding';

const DepositScreen = ({ navigation }) => {
  const { profile, refreshProfile } = useUser();
  const { showNotification } = useNotification();
  const { user } = useAuth();
  
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const pollingIntervalRef = useRef(null);
  const pollingTimeoutRef = useRef(null);
  
  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
    };
  }, []);
  
  // Preset amounts
  const presetAmounts = [500, 1000, 2000, 5000, 10000];
  
  // Handle preset amount selection
  const handlePresetAmount = (value) => {
    setAmount(value.toString());
  };
  
  // Poll payment status
  const pollPaymentStatus = async (externalRef, depositAmount) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }

    setIsCheckingPayment(true);

    const maxAttempts = 24; // Maximum 24 attempts (~4 minutes with 10-second intervals)
    let attempts = 0;
    
    const checkStatus = async () => {
      attempts++;
      try {
        const result = await checkPaymentStatus(externalRef);
        
        if (result.success) {
          // Handle different response structures from server
          let paymentStatusRaw = null;
          let isVerified = false;
          let latestPayload = null;

          if (result.data?.payment_status) {
            // Status from payment_status object
            paymentStatusRaw = result.data.payment_status.status;
            isVerified = result.data.payment_status.verified !== undefined ? result.data.payment_status.verified : result.data.verified;
          } else if (result.data?.status) {
            // Status from database or direct response
            paymentStatusRaw = result.data.status;
            isVerified = result.data.verified !== undefined ? result.data.verified : false;
          }
          
          const paymentStatus = paymentStatusRaw ? paymentStatusRaw.toLowerCase() : null;

          if ((paymentStatus === 'success' || paymentStatusRaw?.toLowerCase?.() === 'success') && isVerified) {
            // Payment successful - clear interval and show success
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            if (pollingTimeoutRef.current) {
              clearTimeout(pollingTimeoutRef.current);
              pollingTimeoutRef.current = null;
            }
            
            setIsCheckingPayment(false);
            setIsLoading(false);

            // Refresh latest balances
            try {
              await refreshProfile?.();
            } catch (refreshError) {
              console.warn('Failed to refresh profile after payment:', refreshError);
            }

            showNotification({
              type: 'success',
              title: 'Payment Confirmed',
              message: 'Your payment has been verified and your account will be updated shortly.',
            });
            
            Alert.alert(
              'Payment Confirmed',
              'Your payment has been verified. Your account will be updated automatically.',
              [
                { 
                  text: 'OK', 
                  onPress: () => navigation.goBack() 
                }
              ]
            );
            
            // Reset form
            setAmount('');
            setPhoneNumber('');

          } else if (['failed', 'failure', 'cancelled', 'canceled', 'cancelled_by_user', 'timeout', 'timed_out'].includes(paymentStatus)) {
            // Payment failed - clear interval
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            if (pollingTimeoutRef.current) {
              clearTimeout(pollingTimeoutRef.current);
              pollingTimeoutRef.current = null;
            }
            
            setIsCheckingPayment(false);
            setIsLoading(false);
            
            showNotification({
              type: 'error',
              title: 'Payment failed',
              message: 'The payment was not completed. Please try again.',
            });
            
            Alert.alert(
              paymentStatus === 'cancelled' || paymentStatus === 'cancelled_by_user'
                ? 'Payment Cancelled'
                : 'Payment Failed',
              paymentStatus === 'cancelled' || paymentStatus === 'cancelled_by_user'
                ? 'You cancelled the payment on your phone. Please initiate a new request if you wish to try again.'
                : 'The payment was not completed. Please try again.',
              [{ text: 'OK' }]
            );

          } else if (attempts >= maxAttempts) {
            // Max attempts reached - stop polling
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            if (pollingTimeoutRef.current) {
              clearTimeout(pollingTimeoutRef.current);
              pollingTimeoutRef.current = null;
            }
            
            setIsCheckingPayment(false);
            setIsLoading(false);
            
            showNotification({
              type: 'warning',
              title: 'Payment status unknown',
              message: 'We could not confirm your payment status. Please check your balance later.',
            });
            
            Alert.alert(
              'Payment Status Unknown',
              'We could not confirm your payment status. Please check your balance later or contact support.',
              [{ text: 'OK' }]
            );

          } else {
            // Continue polling for any other status (e.g., 'queued', 'pending', or 'success' but not verified)
            console.log(`⏳ Payment status is '${paymentStatus}', verification is '${isVerified}'. Continuing to poll...`);
          }
        } else {
          // Error checking status
          console.error('Error checking payment status:', result.error);
        }
      } catch (error) {
        console.error('Payment status check error:', error);
      }
    };
    
    // Start polling
    pollingIntervalRef.current = setInterval(checkStatus, 10000); // Check every 10 seconds
    pollingTimeoutRef.current = setTimeout(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      setIsCheckingPayment(false);
      setIsLoading(false);
      showNotification({
        type: 'warning',
        title: 'Payment status unknown',
        message: 'We could not confirm your payment status. Please check your balance later.',
      });
    }, maxAttempts * 10000 + 5000); // Safety timeout slightly beyond max attempts
    
    // Wait 3 seconds before the first check to allow the STK push to be initiated
    setTimeout(checkStatus, 3000);
  };
  
  // Handle deposit
  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to recharge.');
      return;
    }
    
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid M-Pesa phone number.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format phone number (remove any spaces and ensure it starts with correct format)
      let formattedPhone = phoneNumber.replace(/\s+/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254' + formattedPhone;
      }
      
      const depositAmount = parseFloat(amount);
      
      // Initiate STK push
      const reference = `${APP_SHORT_NAME}-Deposit-${Date.now()}`;

      const result = await initiateSTKPush(
        formattedPhone,
        depositAmount,
        reference,
        user?.id || null
      );
      
      if (result.success) {
        // Get the external reference from the response
        const externalRef = result.data?.external_reference || reference;
        
        if (!externalRef) {
          setIsLoading(false);
          Alert.alert(
            'Payment Error',
            'Failed to initiate payment properly. Please try again.',
            [{ text: 'OK' }]
          );
          return;
        }
        
        // Begin polling immediately before showing confirmation
        pollPaymentStatus(externalRef, depositAmount);

        // Show user that STK push was sent
        Alert.alert(
          'STK Push Sent',
          'Please check your phone and enter your M-Pesa PIN to complete the payment.',
          [{ text: 'OK' }]
        );
      } else {
        setIsLoading(false);
        showNotification({
          type: 'error',
          title: 'Deposit failed',
          message: 'Failed to process your deposit request. Please try again later.',
        });
        Alert.alert(
          'Payment Failed',
          'Failed to process your deposit request. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      setIsLoading(false);
      showNotification({
        type: 'error',
        title: 'Deposit error',
        message: 'An error occurred while processing your deposit request.',
      });
      Alert.alert(
        'Error',
        'An error occurred while processing your deposit request.',
        [{ text: 'OK' }]
      );
    }
  };
  
  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.contentWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              disabled={isLoading}
            >
              <SafeIonicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Recharge Funds</Text>

            <View style={{ width: 24 }} />
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
          {/* Current Balance */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Recharge Wallet Balance</Text>
            <Text style={styles.balanceValue}>
              KES {profile?.rechargeWallet?.toLocaleString() || '0'}
            </Text>
          </View>
          
          {/* Deposit Form Card */}
          <View style={styles.formContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              style={styles.formCard}
            >
              <Text style={styles.formTitle}>M-Pesa Recharge</Text>
              
              {/* Preset Amounts */}
              <View style={styles.presetAmountsContainer}>
                <Text style={styles.presetLabel}>Quick Select</Text>
                
                <View style={styles.presetGrid}>
                  {presetAmounts.map((presetAmount) => (
                    <TouchableOpacity
                      key={presetAmount}
                      style={[
                        styles.presetButton,
                        amount === presetAmount.toString() && styles.selectedPreset
                      ]}
                      onPress={() => handlePresetAmount(presetAmount)}
                      disabled={isLoading}
                    >
                      <Text 
                        style={[
                          styles.presetButtonText,
                          amount === presetAmount.toString() && styles.selectedPresetText
                        ]}
                      >
                        KES {presetAmount.toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Custom Amount Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Enter Amount</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="KES 1,000"
                  placeholderTextColor={colors.gray500}
                  keyboardType="numeric"
                  editable={!isLoading}
                  autoFocus={false}
                />
              </View>
              
              {/* Phone Number Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>M-Pesa Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="e.g. 07XXXXXXXX"
                  placeholderTextColor={colors.gray500}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                  autoFocus={false}
                />
              </View>
              
              {/* Payment Information */}
              <View style={styles.infoBox}>
                <SafeIonicons name="information-circle" size={20} color={colors.blue300} />
                <Text style={styles.infoText}>
                  You will receive an STK push on your phone to complete the payment.
                </Text>
              </View>
              
              {/* Deposit Button */}
              <TouchableOpacity
                style={[
                  styles.depositButton,
                  (!amount || parseFloat(amount) <= 0 || !phoneNumber || isLoading) && 
                  styles.disabledButton
                ]}
                onPress={handleDeposit}
                disabled={!amount || parseFloat(amount) <= 0 || !phoneNumber || isLoading}
              >
                <LinearGradient
                  colors={[colors.green, colors.teal]}
                  style={styles.depositButtonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <>
                      <Text style={styles.depositButtonText}>Recharge Now</Text>
                      <SafeIonicons name="arrow-forward" size={18} color={colors.white} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
          
          {/* How it Works */}
          <View style={styles.howItWorksContainer}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            
            <View style={styles.stepsContainer}>
              <View style={styles.step}>
                <View style={styles.stepIconContainer}>
                  <Text style={styles.stepNumber}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Enter Amount</Text>
                  <Text style={styles.stepDescription}>
                    Select a preset amount or enter a custom deposit amount.
                  </Text>
                </View>
              </View>
              
              <View style={styles.step}>
                <View style={styles.stepIconContainer}>
                  <Text style={styles.stepNumber}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Provide Phone Number</Text>
                  <Text style={styles.stepDescription}>
                    Enter your M-Pesa registered phone number.
                  </Text>
                </View>
              </View>
              
              <View style={styles.step}>
                <View style={styles.stepIconContainer}>
                  <Text style={styles.stepNumber}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Confirm Payment</Text>
                  <Text style={styles.stepDescription}>
                    Confirm the STK push notification on your phone.
                  </Text>
                </View>
              </View>
              
              <View style={styles.step}>
                <View style={styles.stepIconContainer}>
                  <Text style={styles.stepNumber}>4</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Receive Funds</Text>
                  <Text style={styles.stepDescription}>
                    The amount will be added to your recharge wallet immediately.
                  </Text>
                </View>
              </View>
            </View>
          </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      {(isLoading || isCheckingPayment) && (
        <View style={styles.loadingOverlay}>
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
            style={styles.loadingContainer}
          >
            <ActivityIndicator size="large" color={colors.blue400} />
            <Text style={styles.loadingText}>
              {isCheckingPayment ? 'Checking Payment Status' : 'Processing Payment'}
            </Text>
            <Text style={styles.loadingSubtext}>
              {isCheckingPayment 
                ? 'Please wait while we confirm your payment...'
                : 'Please do not close the app...'
              }
            </Text>
          </LinearGradient>
        </View>
      )}
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
  contentWrapper: {
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
  // Balance Container styles
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
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  presetAmountsContainer: {
    marginBottom: spacing.md,
  },
  presetLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    marginBottom: spacing.sm,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  presetButton: {
    width: '48%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  selectedPreset: {
    backgroundColor: 'rgba(40,167,69,0.3)',
    borderColor: colors.green,
    borderWidth: 1,
  },
  presetButtonText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    fontWeight: '500',
  },
  selectedPresetText: {
    fontWeight: 'bold',
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
    fontSize: fontSizes.md,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoText: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
    marginLeft: spacing.sm,
    flex: 1,
  },
  depositButton: {
    borderRadius: 10,
    overflow: 'hidden',
    ...shadows.md,
  },
  depositButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  depositButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginRight: spacing.sm,
  },
  disabledButton: {
    opacity: 0.5,
  },
  // How It Works styles
  howItWorksContainer: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  stepsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.sm,
  },
  step: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  stepIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.blue600,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumber: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
  },
  // Loading Overlay styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    width: '80%',
    padding: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: spacing.md,
  },
  loadingSubtext: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
    marginTop: spacing.xs,
  },
});

export default DepositScreen;
