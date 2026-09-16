import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../../components/SafeIonicons';
import { useUser } from '../../context/SupabaseUserContext';
import { useAuth } from '../../context/SupabaseAuthContext';
import {
  initiateBrightpayPayment,
  pollBrightpayPayment,
  confirmDeposit,
  generateExternalReference,
  isValidKenyanPhone,
} from '../../services/brightpay';
import supabaseData from '../../services/supabaseData';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import PlatformAlert from '../../utils/platformAlert';
import { useNotification } from '../../context/NotificationContext';
import { APP_SHORT_NAME } from '../../constants/branding';

const DepositScreen = ({ navigation }) => {
  const { profile, refreshProfile } = useUser();
  const { showNotification } = useNotification();
  const { user } = useAuth();

  // Prefill the phone number from saved withdrawal details when available.
  const savedPhone = useMemo(() => {
    const w = profile?.withdrawalAccountDetails;
    return typeof w?.phone === 'string' ? w.phone : '';
  }, [profile?.withdrawalAccountDetails]);

  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastCompleted, setLastCompleted] = useState(null);
  const pollAbortRef = useRef(null);

  // Abort any in-flight payment poll on unmount
  useEffect(() => {
    return () => {
      pollAbortRef.current?.abort?.();
      pollAbortRef.current = null;
    };
  }, []);

  // Live "waiting for your M-Pesa PIN" timer while polling
  useEffect(() => {
    if (!isCheckingPayment) return undefined;
    setElapsedSeconds(0);
    const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isCheckingPayment]);

  // Preset amounts
  const presetAmounts = [500, 1000, 2000, 5000, 10000];

  // Friendly KES formatting for the summary line
  const amountNumber = parseFloat(amount) || 0;
  const formattedAmount = amountNumber > 0
    ? `KES ${amountNumber.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    : '';
  const phoneLooksValid = phoneNumber.length === 0 || isValidKenyanPhone(phoneNumber);

  // Handle preset amount selection
  const handlePresetAmount = (value) => {
    setAmount(value.toString());
  };

  // Handle deposit via BrightPay M-Pesa (frontend-only, poll-based)
  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      PlatformAlert.alert('Invalid Amount', 'Please enter a valid amount to recharge.');
      return;
    }

    if (!isValidKenyanPhone(phoneNumber)) {
      PlatformAlert.alert(
        'Invalid Phone Number',
        'Please enter a valid M-Pesa number, e.g. 07XX XXX XXX or 2547XX XXX XXX.'
      );
      return;
    }

    setIsLoading(true);
    const depositAmount = parseFloat(amount);

    try {
      // STEP 1 — Initiate the STK push
      const init = await initiateBrightpayPayment({
        amount: depositAmount,
        phoneNumber,
        externalReference: generateExternalReference('DEPOSIT'),
      });

      if (!init.success) {
        setIsLoading(false);
        showNotification({
          type: 'error',
          title: 'Deposit failed',
          message: init.error || 'Failed to process your deposit request. Please try again later.',
        });
        PlatformAlert.alert('Payment Failed', init.error || 'Failed to process your deposit request.');
        return;
      }

      setIsCheckingPayment(true);

      PlatformAlert.alert(
        'STK Push Sent',
        `We have sent a payment request to ${phoneNumber}. Enter your M-Pesa PIN on your phone to complete the payment.`,
        [{ text: 'OK' }]
      );

      // STEP 2 — Poll the payment status (3s interval, ~2 min budget)
      const controller = new AbortController();
      pollAbortRef.current = controller;
      const result = await pollBrightpayPayment(init.checkoutId, {
        signal: controller.signal,
        onTick: (tick) => {
          if (!tick.ok) console.warn('BrightPay status poll error:', tick.error);
        },
      });
      pollAbortRef.current = null;

      setIsCheckingPayment(false);
      setIsLoading(false);

      if (controller.signal.aborted) return; // User cancelled or screen unmounted mid-poll

      if (result.outcome === 'COMPLETED') {
        // Server confirms with BrightPay and credits the wallet exactly once.
        // (No client-side balance writes — money moves only via the Edge Function.)
        const confirm = await confirmDeposit({
          userId: user?.id || profile?.id,
          amount: depositAmount,
          checkoutId: init.checkoutId,
          externalReference: init.externalReference,
          dedupeRef: init.dedupeRef,
          mpesaReceipt: result.mpesaReceipt,
        });

        if (!confirm.success || (confirm.outcome !== 'CREDITED' && confirm.outcome !== 'ALREADY_PROCESSED')) {
          console.error('Server-side crediting failed:', confirm.error);
          showNotification({
            type: 'warning',
            title: 'Payment received',
            message: 'Your payment was received but crediting failed. Contact support with your M-Pesa receipt.',
          });
          PlatformAlert.alert(
            'Crediting Failed',
            'Your payment was completed but we could not update your balance. Please contact support with your M-Pesa receipt.'
          );
          return;
        }

        await refreshProfile?.();

        showNotification({
          type: 'success',
          title: 'Payment Confirmed',
          message: `KES ${depositAmount.toLocaleString()} added to your recharge wallet.`,
        });

        // Show an in-app receipt instead of kicking the user out of the screen
        setLastCompleted({
          amount: depositAmount,
          receipt: result.mpesaReceipt || null,
          wallet: confirm.newBalance != null ? confirm.newBalance : null,
        });
        setAmount('');
        setPhoneNumber('');
      } else if (result.outcome === 'FAILED') {
        showNotification({
          type: 'error',
          title: 'Payment failed',
          message: 'The M-Pesa payment was not completed. Please try again.',
        });
        PlatformAlert.alert('Payment Failed', 'The M-Pesa payment was not completed. You can try again any time.');
      } else {
        // TIMEOUT
        showNotification({
          type: 'warning',
          title: 'Payment status unknown',
          message: 'We could not confirm your payment in time. If you were charged, your balance will update shortly.',
        });
        PlatformAlert.alert(
          'Payment Status Unknown',
          'We could not confirm the payment in time. If you entered your PIN and were charged, your balance will update shortly — otherwise nothing was charged.'
        );
      }
    } catch (error) {
      pollAbortRef.current = null;
      setIsCheckingPayment(false);
      setIsLoading(false);
      console.error('Deposit error:', error);
      showNotification({
        type: 'error',
        title: 'Deposit error',
        message: 'An error occurred while processing your deposit request.',
      });
      PlatformAlert.alert('Error', 'An error occurred while processing your deposit request.');
    }
  };

  // User pressed Cancel on the waiting card
  const handleCancelPolling = () => {
    pollAbortRef.current?.abort?.();
    pollAbortRef.current = null;
    setIsCheckingPayment(false);
    setIsLoading(false);
    showNotification({
      type: 'warning',
      title: 'Checking cancelled',
      message: 'If you already completed the payment, your balance will update shortly.',
    });
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

          {/* Success receipt (stays on screen until user dismisses it) */}
          {lastCompleted && (
            <View style={styles.receiptCard}>
              <LinearGradient
                colors={['rgba(0,200,83,0.25)', 'rgba(0,150,136,0.15)']}
                style={styles.receiptCardInner}
              >
                <SafeIonicons name="checkmark-circle" size={40} color={colors.success} />
                <Text style={styles.receiptTitle}>Recharge Successful</Text>
                <Text style={styles.receiptAmount}>
                  KES {lastCompleted.amount.toLocaleString()}
                </Text>
                {lastCompleted.receipt ? (
                  <Text style={styles.receiptLine}>M-Pesa receipt: {lastCompleted.receipt}</Text>
                ) : null}
                {lastCompleted.wallet != null ? (
                  <Text style={styles.receiptLine}>
                    New balance: KES {lastCompleted.wallet.toLocaleString()}
                  </Text>
                ) : null}
                <TouchableOpacity
                  style={styles.receiptDoneButton}
                  onPress={() => setLastCompleted(null)}
                >
                  <Text style={styles.receiptDoneText}>Done</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}

          {/* Waiting-for-PIN card with live elapsed time + cancel */}
          {isCheckingPayment && (
            <View style={styles.waitingCard}>
              <LinearGradient
                colors={['rgba(255,214,0,0.18)', 'rgba(255,150,0,0.10)']}
                style={styles.waitingCardInner}
              >
                <View style={styles.waitingHeaderRow}>
                  <SafeIonicons name="hourglass" size={22} color={colors.warning} />
                  <Text style={styles.waitingTitle}>Waiting for your M-Pesa PIN…</Text>
                </View>
                <Text style={styles.waitingSubtext}>
                  Check {phoneNumber || 'your phone'} and enter your PIN. We are checking every few seconds ({elapsedSeconds}s).
                </Text>
                <View style={styles.waitingProgressTrack}>
                  <View style={[styles.waitingProgressBar, { width: `${Math.min(100, (elapsedSeconds / 120) * 100)}%` }]} />
                </View>
                <TouchableOpacity style={styles.waitingCancelButton} onPress={handleCancelPolling}>
                  <Text style={styles.waitingCancelText}>Cancel checking</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}

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
                {formattedAmount ? (
                  <Text style={styles.amountHint}>Paying {formattedAmount}</Text>
                ) : null}
              </View>

              {/* Phone Number Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>M-Pesa Phone Number</Text>
                <TextInput
                  style={[
                    styles.input,
                    !phoneLooksValid && styles.inputInvalid,
                  ]}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="e.g. 07XXXXXXXX"
                  placeholderTextColor={colors.gray500}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                  autoFocus={false}
                />
                {!phoneLooksValid ? (
                  <Text style={styles.fieldError}>
                    Use a Kenyan number: 07…, 01…, 2547… or 2541…
                  </Text>
                ) : null}
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
      {isLoading && !isCheckingPayment && (
        <View style={styles.loadingOverlay}>
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
            style={styles.loadingContainer}
          >
            <ActivityIndicator size="large" color={colors.blue400} />
            <Text style={styles.loadingText}>Processing Payment</Text>
            <Text style={styles.loadingSubtext}>Please do not close the app…</Text>
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
  // Success receipt
  receiptCard: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  receiptCardInner: {
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,200,83,0.5)',
    ...shadows.md,
  },
  receiptTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: spacing.sm,
  },
  receiptAmount: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.success,
    marginTop: spacing.xs,
  },
  receiptLine: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    marginTop: spacing.xs,
  },
  receiptDoneButton: {
    marginTop: spacing.md,
    backgroundColor: colors.success,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  receiptDoneText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: fontSizes.md,
  },
  // Waiting card
  waitingCard: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  waitingCardInner: {
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,214,0,0.45)',
    ...shadows.md,
  },
  waitingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  waitingTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.sm,
    flex: 1,
  },
  waitingSubtext: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    marginBottom: spacing.sm,
  },
  waitingProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.3)',
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  waitingProgressBar: {
    height: 6,
    backgroundColor: colors.warning,
    borderRadius: 3,
  },
  waitingCancelButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  waitingCancelText: {
    color: colors.blue200,
    fontSize: fontSizes.sm,
    fontWeight: '600',
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
  inputInvalid: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  amountHint: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
    marginTop: spacing.xs,
  },
  fieldError: {
    fontSize: fontSizes.sm,
    color: colors.error,
    marginTop: spacing.xs,
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
