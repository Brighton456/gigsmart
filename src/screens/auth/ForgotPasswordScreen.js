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
  Alert,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../../components/SafeIonicons';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };
  
  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      // In a real app, this would call an API endpoint
      // For now, simulate a successful API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubmitted(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <SafeIonicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Forgot Password?</Text>
            <Text style={styles.subheaderText}>We'll help you reset it</Text>
          </View>
          
          <View style={styles.formContainer}>
            {!isSubmitted ? (
              <>
                <Text style={styles.instructionText}>
                  Enter the email address associated with your account, and we'll send you a link to reset your password.
                </Text>
                
                <View style={styles.inputContainer}>
                  <SafeIonicons name="mail-outline" size={20} color={colors.blue400} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={colors.gray500}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (error) setError('');
                    }}
                  />
                </View>
                
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.resetButtonText}>Send Reset Link</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.successContainer}>
                <SafeIonicons name="checkmark-circle" size={60} color={colors.success} style={styles.successIcon} />
                <Text style={styles.successTitle}>Email Sent!</Text>
                <Text style={styles.successText}>
                  We've sent a password reset link to {email}. Please check your inbox and follow the instructions.
                </Text>
                <TouchableOpacity
                  style={styles.backToLoginButton}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.backToLoginText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Remember your password? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLinkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
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
    padding: spacing.lg,
  },
  backButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: spacing.lg,
  },
  headerText: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subheaderText: {
    fontSize: fontSizes.md,
    color: colors.blue200,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    ...shadows.lg,
  },
  instructionText: {
    fontSize: fontSizes.md,
    color: colors.gray700,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 10,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    color: colors.textDark,
    fontSize: fontSizes.md,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.sm,
    marginBottom: spacing.md,
    marginLeft: spacing.sm,
  },
  resetButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  resetButtonText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: colors.gray600,
    fontSize: fontSizes.md,
  },
  loginLinkText: {
    color: colors.primary,
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  successContainer: {
    alignItems: 'center',
    padding: spacing.md,
  },
  successIcon: {
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: spacing.sm,
  },
  successText: {
    fontSize: fontSizes.md,
    color: colors.gray700,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  backToLoginButton: {
    backgroundColor: colors.success,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  backToLoginText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;
