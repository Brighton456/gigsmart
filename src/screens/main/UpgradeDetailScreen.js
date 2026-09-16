import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback
,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../../components/SafeIonicons';
import { useUser } from '../../context/SupabaseUserContext';
import {
  initiateBrightpayPayment,
  pollBrightpayPayment,
  confirmUpgrade,
  generateExternalReference,
  isValidKenyanPhone,
} from '../../services/brightpay';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import PlatformAlert from '../../utils/platformAlert';
import { useNotification } from '../../context/NotificationContext';
import { APP_NAME } from '../../constants/branding';

const UpgradeDetailScreen = ({ navigation, route }) => {
  const { level } = route.params;
  const { profile, currentLevel, levels, upgradeLevel, refreshProfile } = useUser();
  const { showNotification } = useNotification();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('details'); // 'details', 'payment', 'processing', 'complete'
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastReceipt, setLastReceipt] = useState(null);
  const pollingIntervalRef = useRef(null);
  const pollingTimeoutRef = useRef(null);
  const hasCompletedRef = useRef(false);
  const pollingAbortRef = useRef(null);

  // Prefill the phone number from saved withdrawal details when available.
  const savedPhone = useMemo(() => {
    const w = profile?.withdrawalAccountDetails;
    return typeof w?.phone === 'string' ? w.phone : '';
  }, [profile?.withdrawalAccountDetails]);

  useEffect(() => {
    if (!phoneNumber && savedPhone) setPhoneNumber(savedPhone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedPhone]);

  // Live elapsed timer while waiting for the M-Pesa PIN
  useEffect(() => {
    if (!isCheckingPayment) return undefined;
    setElapsedSeconds(0);
    const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isCheckingPayment]);

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
      pollingAbortRef.current?.abort?.();
      pollingAbortRef.current = null;
    };
  }, []);
  
  // Calculate required amount
  const depositBalance = profile?.recharge_wallet || 0;
  const incomeBalance = profile?.incomeWallet ?? 0;
  const currentInvestment = profile?.expense ?? 0;
  const totalAvailable = depositBalance + incomeBalance;
  const requiredAmount = Math.max(level.cost - totalAvailable, 0);
  
  // Can upgrade with current balance
  const canUpgradeWithBalance = totalAvailable >= level.cost;
  
  // Handle upgrade with current balance
  const handleUpgradeWithBalance = () => {
    if (!canUpgradeWithBalance) {
      PlatformAlert.alert(
        'Insufficient Balance',
        'Your current wallet balance is insufficient for this upgrade.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsLoading(true);
    
    // Simulate a delay for the upgrade process
    setTimeout(async () => {
      const success = await upgradeLevel(level.id, level.cost);
      
      setIsLoading(false);
      
      if (success) {
        showNotification({
          type: 'success',
          title: 'Upgrade successful',
          message: `You are now on the ${level.name} level. Enjoy higher earnings with ${APP_NAME}!`,
        });
        setStep('complete');
      } else {
        showNotification({
          type: 'error',
          title: 'Upgrade failed',
          message: 'There was an error processing your upgrade. Please try again.',
        });
        PlatformAlert.alert(
          'Upgrade Failed',
          'There was an error processing your upgrade. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }, 2000);
  };
  
  const pollPaymentStatus = async (checkoutRef, { externalReference, dedupeRef } = {}) => {
    setIsCheckingPayment(true);

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }

    const finalize = async (success) => {
      setIsCheckingPayment(false);
      setIsLoading(false);
      if (!success) {
        setStep('payment');
      }
    };

    // BrightPay polling: 3s interval, ~2 min budget (abortable on unmount)
    const controller = new AbortController();
    pollingAbortRef.current = controller;
    const result = await pollBrightpayPayment(checkoutRef, {
      signal: controller.signal,
      onTick: (tick) => {
        if (!tick.ok) console.warn('BrightPay status poll error:', tick.error);
      },
    });
    pollingAbortRef.current = null;

    if (result.outcome === 'COMPLETED') {
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true;
        setLastReceipt(result.mpesaReceipt || null);
        await finalize(true);

        // Server re-verifies with BrightPay and applies the upgrade exactly once.
        const confirm = await confirmUpgrade({
          userId: profile?.id,
          levelId: level.id,
          checkoutId: checkoutRef,
          externalReference,
          dedupeRef,
          mpesaReceipt: result.mpesaReceipt,
        });

        try {
          await refreshProfile?.();
        } catch (refreshError) {
          console.warn('Failed to refresh profile after upgrade payment:', refreshError);
        }

        const upgradeSuccess = confirm.success
          && (confirm.outcome === 'APPLIED' || confirm.outcome === 'ALREADY_PROCESSED');

        if (upgradeSuccess) {
          showNotification({
            type: 'success',
            title: 'Upgrade successful',
            message: `Your account is now on the ${level.name} level. Explore the new perks immediately!`,
          });
          setStep('complete');
        } else {
          showNotification({
            type: 'error',
            title: 'Upgrade failed',
            message: 'There was an error processing your upgrade after payment.',
          });
          PlatformAlert.alert(
            'Upgrade Failed',
            'There was an error processing your upgrade after payment.',
            [{ text: 'OK' }]
          );
        }
      }
      return;
    }

    await finalize(false);

    if (result.outcome === 'FAILED') {
      showNotification({
        type: 'error',
        title: 'Payment failed',
        message: 'The M-Pesa payment was not completed. Please try again.',
      });
      PlatformAlert.alert('Payment Failed', 'The M-Pesa payment was not completed — no money was taken. You can try again.', [{ text: 'OK' }]);
    } else {
      showNotification({
        type: 'warning',
        title: 'Payment status unknown',
        message: 'We could not confirm your payment in time. If you were charged, your upgrade will complete shortly.',
      });
      PlatformAlert.alert(
        'Payment Status Unknown',
        'We could not confirm the payment in time. If you entered your PIN and were charged, your upgrade will complete shortly — otherwise nothing was charged.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle initiating BrightPay M-Pesa payment for the upgrade
  const handleInitiatePayment = async () => {
    if (!isValidKenyanPhone(phoneNumber)) {
      PlatformAlert.alert('Invalid Phone Number', 'Please enter a valid M-Pesa number, e.g. 07XX XXX XXX or 2547XX XXX XXX.');
      return;
    }

    setIsLoading(true);
    
    try {
      const reference = generateExternalReference(`UPGRADE-${level.name}`);

      const result = await initiateBrightpayPayment({
        amount: requiredAmount,
        phoneNumber,
        externalReference: reference,
        purpose: 'upgrade',
        levelId: level.id,
      });
      
      if (result.success) {
        setStep('processing');

        PlatformAlert.alert(
          'STK Push Sent',
          `We have sent a payment request to ${phoneNumber}. Enter your M-Pesa PIN on your phone to complete the payment.`,
          [{ text: 'OK' }]
        );

        await pollPaymentStatus(result.checkoutId, {
          externalReference: result.externalReference,
          dedupeRef: result.dedupeRef,
          });
      } else {
        setIsLoading(false);
        showNotification({
          type: 'error',
          title: 'Payment failed',
          message: result.error || 'Failed to initiate the upgrade payment. Please try again later.',
        });
        PlatformAlert.alert(
          'Payment Failed',
          result.error || 'Failed to initiate the STK push. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      setIsLoading(false);
      showNotification({
        type: 'error',
        title: 'Upgrade error',
        message: 'An unexpected error occurred while processing your payment request.',
      });
      PlatformAlert.alert(
        'Error',
        'An error occurred while processing your payment request.',
        [{ text: 'OK' }]
      );
    }
  };
  
  const renderDetailsStep = () => {
    return (
      <View style={styles.contentContainer}>
        <View style={styles.upgradeInfoCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.upgradeInfoCardInner}
          >
            <View style={styles.headerRow}>
              <View style={[styles.levelBadge, { backgroundColor: level.color }]}>
                <SafeIonicons name={level.mappedIcon || level.icon} size={24} color={colors.white} />
              </View>
              <Text style={styles.upgradeTitle}>Upgrade to {level.name}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Level Price:</Text>
              <Text style={styles.infoValue}>KES {level.cost.toLocaleString()}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current Level Investment:</Text>
              <Text style={styles.infoValue}>KES {(profile?.expense || 0).toLocaleString()}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Recharge Wallet:</Text>
              <Text style={styles.infoValue}>KES {depositBalance.toLocaleString()}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Income Wallet:</Text>
              <Text style={styles.infoValue}>KES {incomeBalance.toLocaleString()}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current Investment:</Text>
              <Text style={styles.infoValue}>KES {currentInvestment.toLocaleString()}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Available:</Text>
              <Text style={styles.infoValue}>KES {totalAvailable.toLocaleString()}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>
                {requiredAmount > 0 ? 'Amount to Add:' : 'Ready to Upgrade:'}
              </Text>
              <Text style={styles.amountValue}>
                {requiredAmount > 0 
                  ? `KES ${requiredAmount.toLocaleString()}`
                  : 'Balance Sufficient'}
              </Text>
            </View>
            
            {requiredAmount > 0 ? (
              <TouchableOpacity
                style={styles.proceedButton}
                onPress={() => setStep('payment')}
              >
                <LinearGradient
                  colors={[colors.blue600, colors.blue800]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Proceed to Payment</Text>
                  <SafeIonicons name="arrow-forward" size={18} color={colors.white} />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.proceedButton}
                onPress={handleUpgradeWithBalance}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={[colors.green, colors.teal]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Upgrade Now</Text>
                      <SafeIonicons name="arrow-forward" size={18} color={colors.white} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>
        
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Level Benefits</Text>
          
          <View style={styles.benefitsCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              style={styles.benefitsCardInner}
            >
              <View style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <SafeIonicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
                <Text style={styles.benefitText}>
                  {level.tasks} daily tasks (vs. {currentLevel?.tasks ?? 0} current)
                </Text>
              </View>
              
              <View style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <SafeIonicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
                <Text style={styles.benefitText}>
                  KES {level.dailyEarnings.toLocaleString()} potential daily earnings
                </Text>
              </View>
              
              <View style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <SafeIonicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
                <Text style={styles.benefitText}>
                  KES {level.annualEarnings.toLocaleString()} potential annual earnings
                </Text>
              </View>
              
              <View style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <SafeIonicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
                <Text style={styles.benefitText}>
                  {level.multiplier}x earnings multiplier
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>
      </View>
    );
  };
  
  const renderPaymentStep = () => {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.contentContainer}>
          <View style={styles.paymentCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              style={styles.paymentCardInner}
            >
              <View style={styles.paymentHeader}>
                <SafeIonicons name="cash-outline" size={40} color={colors.green} />
                <Text style={styles.paymentTitle}>M-Pesa Payment</Text>
              </View>
              
              <View style={styles.amountBox}>
                <Text style={styles.amountBoxLabel}>Amount to Pay</Text>
                <Text style={styles.amountBoxValue}>KES {requiredAmount.toLocaleString()}</Text>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Enter M-Pesa Phone Number</Text>
                <TextInput
                  style={[
                    styles.phoneInput,
                    phoneNumber.length > 0 && !isValidKenyanPhone(phoneNumber) && styles.phoneInputInvalid,
                  ]}
                  placeholder="e.g. 07XXXXXXXX"
                  placeholderTextColor={colors.gray500}
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
                {phoneNumber.length > 0 && !isValidKenyanPhone(phoneNumber) ? (
                  <Text style={styles.fieldError}>
                    Use a Kenyan number: 07…, 01…, 2547… or 2541…
                  </Text>
                ) : null}
              </View>
              
              <View style={styles.paymentInfo}>
                <SafeIonicons name="information-circle" size={18} color={colors.blue300} />
                <Text style={styles.paymentInfoText}>
                  You will receive an STK push notification on your phone to complete the payment.
                </Text>
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.backButton]}
                  onPress={() => setStep('details')}
                  disabled={isLoading}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.payButton]}
                  onPress={handleInitiatePayment}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={[colors.green, colors.teal]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <Text style={styles.buttonText}>Pay Now</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };
  
  const renderProcessingStep = () => {
    return (
      <View style={styles.centeredContainer}>
        <LinearGradient
          colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
          style={styles.processingCard}
        >
          <ActivityIndicator size="large" color={colors.blue400} />
          <Text style={styles.processingTitle}>Waiting for your M-Pesa PIN…</Text>
          <Text style={styles.processingText}>
            We sent a payment request to {phoneNumber || 'your phone'}. Enter your PIN to approve it — we are checking every few seconds.
          </Text>
          <Text style={styles.processingElapsed}>{elapsedSeconds}s elapsed</Text>
          <View style={styles.processingProgressTrack}>
            <View
              style={[
                styles.processingProgressBar,
                { width: `${Math.min(100, (elapsedSeconds / 120) * 100)}%` },
              ]}
            />
          </View>
        </LinearGradient>
      </View>
    );
  };
  
  const renderCompleteStep = () => {
    return (
      <View style={styles.centeredContainer}>
        <LinearGradient
          colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
          style={styles.completeCard}
        >
          <View style={styles.successIcon}>
            <SafeIonicons name="checkmark-circle" size={80} color={colors.success} />
          </View>
          
          <Text style={styles.completeTitle}>Upgrade Successful!</Text>
          
          <Text style={styles.completeText}>
            Your account has been upgraded to the {level.name} level. 
            You can now enjoy all the benefits of your new level!
          </Text>
          
          {lastReceipt ? (
            <Text style={styles.receiptNote}>M-Pesa receipt: {lastReceipt}</Text>
          ) : null}
          
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => navigation.navigate('UpgradeMain')}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Done</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };
  
  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header with back button */}
      {step !== 'complete' && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButtonContainer}
            onPress={() => {
              if (step === 'details' || step === 'complete') {
                navigation.goBack();
              } else {
                setStep('details');
              }
            }}
            disabled={isLoading || step === 'processing'}
          >
            <SafeIonicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Level Upgrade</Text>
          <View style={{ width: 24 }} />
        </View>
      )}
      
      {/* Content based on current step */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={step !== 'processing' && step !== 'complete'}
      >
        {step === 'details' && renderDetailsStep()}
        {step === 'payment' && renderPaymentStep()}
        {step === 'processing' && renderProcessingStep()}
        {step === 'complete' && renderCompleteStep()}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl * 2,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  upgradeInfoCard: {
    marginBottom: spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.md,
  },
  upgradeInfoCardInner: {
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  levelBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  upgradeTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: fontSizes.md,
    color: colors.blue200,
  },
  infoValue: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  amountLabel: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.blue200,
  },
  amountValue: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.green,
  },
  proceedButton: {
    overflow: 'hidden',
    borderRadius: 10,
    ...shadows.md,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  buttonText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginRight: spacing.sm,
  },
  benefitsContainer: {
    marginBottom: spacing.lg,
  },
  benefitsTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  benefitsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.md,
  },
  benefitsCardInner: {
    padding: spacing.lg,
  },
  phoneInputInvalid: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  fieldError: {
    fontSize: fontSizes.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
  processingElapsed: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
    marginTop: spacing.sm,
  },
  processingProgressTrack: {
    width: '70%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.3)',
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  processingProgressBar: {
    height: 6,
    backgroundColor: colors.warning,
    borderRadius: 3,
  },
  receiptNote: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    marginTop: spacing.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  benefitIcon: {
    marginRight: spacing.sm,
  },
  benefitText: {
    fontSize: fontSizes.md,
    color: colors.white,
    flex: 1,
  },
  paymentCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.md,
  },
  paymentCardInner: {
    padding: spacing.lg,
  },
  paymentHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  paymentTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: spacing.sm,
  },
  amountBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  amountBoxLabel: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    marginBottom: spacing.xs,
  },
  amountBoxValue: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSizes.md,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  phoneInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: spacing.md,
    fontSize: fontSizes.lg,
    color: colors.white,
    ...shadows.sm,
  },
  paymentInfo: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  paymentInfoText: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
    marginLeft: spacing.sm,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  backButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
  },
  payButton: {
    flex: 2,
    ...shadows.md,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  processingCard: {
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  processingTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  processingText: {
    fontSize: fontSizes.md,
    color: colors.blue200,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  completeCard: {
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  successIcon: {
    marginBottom: spacing.lg,
  },
  completeTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  completeText: {
    fontSize: fontSizes.md,
    color: colors.blue200,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  doneButton: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    ...shadows.md,
  },
});

export default UpgradeDetailScreen;
