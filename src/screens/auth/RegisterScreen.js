import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../../components/SafeIonicons';
import { useAuth } from '../../context/SupabaseAuthContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { APP_SHORT_NAME } from '../../constants/branding';
import { getAuthErrorInfo } from '../../utils/authErrors';

const generateSecurityCode = () => Math.floor(1000 + Math.random() * 9000).toString();

const RegisterScreen = ({ navigation, route }) => {
  const referralCode = route.params?.referralCode || '';

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityInput, setSecurityInput] = useState('');
  const [securityCode, setSecurityCode] = useState(generateSecurityCode);
  const [referrer, setReferrer] = useState(referralCode);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [registeredEmail, setRegisteredEmail] = useState(null); // set when email confirmation is required

  const { signUp } = useAuth();

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?\d[\d\s-]{8,}$/.test(phone.trim())) {
      newErrors.phone = 'Enter a valid phone number';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!securityInput.trim()) {
      newErrors.securityInput = 'Enter the security code';
    } else if (securityInput.trim() !== securityCode) {
      newErrors.securityInput = 'Security code does not match';
    }

    if (!acceptTerms) {
      newErrors.acceptTerms = 'Please agree to the terms to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    setServerError(null);
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUp({
        email,
        phone,
        password,
        referralCode: referrer,
        securityCode,
      });

      // Supabase returns no session when email confirmation is required.
      if (result && result.session === null) {
        setRegisteredEmail(email.trim());
      }
    } catch (error) {
      const info = getAuthErrorInfo(error, 'Registration Failed');
      setServerError({ message: info.message, field: info.field });
    } finally {
      setIsLoading(false);
    }
  };

  const clearFieldError = (field) => {
    setErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev));
    if (serverError) setServerError(null);
  };

  const updateEmail = (text) => { setEmail(text); clearFieldError('email'); };
  const updatePhone = (text) => { setPhone(text); clearFieldError('phone'); };
  const updatePassword = (text) => { setPassword(text); clearFieldError('password'); };
  const updateConfirmPassword = (text) => { setConfirmPassword(text); clearFieldError('confirmPassword'); };

  const refreshSecurityCode = () => {
    setSecurityCode(generateSecurityCode());
    setSecurityInput('');
  };

  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <StatusBar barStyle="light-content" />

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <SafeIonicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>{APP_SHORT_NAME}</Text>
            </View>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Unlock daily earnings, tasks, and mentorship in minutes.</Text>
          </View>

          <View style={styles.formCard}>
            {registeredEmail ? (
              <>
                <View style={styles.successBanner}>
                  <SafeIonicons name="checkmark-circle" size={22} color="#16a34a" />
                  <Text style={styles.successBannerText}>
                    Account created! We sent a verification link to {registeredEmail}. Please open it to activate your account, then sign in.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.9}
                >
                  <SafeIonicons name="log-in" size={18} color={colors.white} style={styles.buttonIcon} />
                  <Text style={styles.primaryButtonText}>Go to Login</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
            {serverError && (
              <View style={styles.errorBanner}>
                <SafeIonicons name="alert-circle" size={18} color={colors.error} />
                <Text style={styles.errorBannerText}>{serverError.message}</Text>
              </View>
            )}

            <View style={[styles.inputGroup, (errors.email || serverError?.field === 'email') && styles.inputGroupError]}>
              <SafeIonicons name="mail-outline" size={20} color={colors.blue500} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                placeholderTextColor={colors.gray500}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={updateEmail}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <View style={[styles.inputGroup, (errors.phone || serverError?.field === 'phone') && styles.inputGroupError]}>
              <TextInput
                style={styles.input}
                placeholder="+254 712 345 678"
                placeholderTextColor={colors.gray500}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={updatePhone}
              />
            </View>
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            {serverError?.field === 'phone' && !errors.phone && (
              <Text style={styles.errorText}>{serverError.message}</Text>
            )}

            <View style={[styles.inputGroup, (errors.password || serverError?.field === 'password') && styles.inputGroupError]}>
              <TextInput
                style={styles.input}
                placeholder="Create your password"
                placeholderTextColor={colors.gray500}
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={updatePassword}
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(prev => !prev)} style={styles.eyeButton}>
                <SafeIonicons
                  name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.gray600}
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <View style={styles.inputGroup}>
              <SafeIonicons name="lock-closed-outline" size={20} color={colors.blue500} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor={colors.gray500}
                secureTextEntry={!isConfirmPasswordVisible}
                value={confirmPassword}
                onChangeText={updateConfirmPassword}
              />
              <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(prev => !prev)} style={styles.eyeButton}>
                <SafeIonicons
                  name={isConfirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.gray600}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            {serverError?.field === 'password' && !errors.password && !errors.confirmPassword && (
              <Text style={styles.errorText}>{serverError.message}</Text>
            )}

            <View style={styles.inputGroup}>
              <SafeIonicons name="shield-checkmark-outline" size={20} color={colors.blue500} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Security code"
                placeholderTextColor={colors.gray500}
                keyboardType="numeric"
                value={securityInput}
                onChangeText={setSecurityInput}
                maxLength={6}
              />
              <View style={styles.codeBox}>
                <Text style={styles.codeText}>{securityCode}</Text>
                <TouchableOpacity onPress={refreshSecurityCode} style={styles.refreshButton}>
                  <SafeIonicons name="refresh" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            {errors.securityInput && <Text style={styles.errorText}>{errors.securityInput}</Text>}

            <View style={styles.inputGroup}>
              <SafeIonicons name="person-add-outline" size={20} color={colors.blue500} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter referral code (optional)"
                placeholderTextColor={colors.gray500}
                value={referrer}
                onChangeText={setReferrer}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.checkboxRow}>
              <TouchableOpacity onPress={() => setAcceptTerms(prev => !prev)} style={styles.checkboxButton}>
                <SafeIonicons
                  name={acceptTerms ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={acceptTerms ? colors.primary : colors.gray500}
                />
              </TouchableOpacity>
              <Text style={styles.checkboxText}>
                I agree to the Gig-Smart Terms of Service and Privacy Policy.
              </Text>
            </View>
            {errors.acceptTerms && <Text style={styles.errorText}>{errors.acceptTerms}</Text>}

            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
              onPress={handleRegister}
              activeOpacity={0.9}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <SafeIonicons name="person-add" size={18} color={colors.white} style={styles.buttonIcon} />
                  <Text style={styles.primaryButtonText}>Register</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.85}
            >
              <SafeIonicons name="log-in" size={16} color={colors.white} style={styles.buttonIcon} />
              <Text style={styles.secondaryButtonText}>Already have an account? Login here</Text>
            </TouchableOpacity>
              </>
            )}
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
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 140,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  logoText: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.blue200,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: spacing.xl,
    ...shadows.lg,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    height: 56,
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.textDark,
  },
  eyeButton: {
    padding: spacing.xs,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  codeText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.primary,
  },
  refreshButton: {
    padding: spacing.xs,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.35)',
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  errorBannerText: {
    flex: 1,
    color: colors.error,
    fontSize: fontSizes.sm,
    lineHeight: 18,
  },
  inputGroupError: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.4)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  successBannerText: {
    flex: 1,
    color: '#15803d',
    fontSize: fontSizes.sm,
    lineHeight: 18,
    fontWeight: '500',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  checkboxButton: {
    marginTop: 2,
  },
  checkboxText: {
    flex: 1,
    color: colors.gray600,
    fontSize: fontSizes.sm,
    lineHeight: 18,
  },
  primaryButton: {
    marginTop: spacing.xl,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    ...shadows.md,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: spacing.xs,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  secondaryButton: {
    marginTop: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  secondaryButtonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
});

export default RegisterScreen;
