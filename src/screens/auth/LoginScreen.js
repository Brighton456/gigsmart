import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity,
  StatusBar,
  Platform,
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../../components/SafeIonicons';
import { useAuth } from '../../context/SupabaseAuthContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { APP_NAME, TAGLINE } from '../../constants/branding';
import { getAuthErrorInfo } from '../../utils/authErrors';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  
  const { signIn } = useAuth();
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleLogin = async () => {
    setServerError(null);
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await signIn({ email, password });
    } catch (error) {
      const info = getAuthErrorInfo(error, 'Login Failed');
      setServerError({ message: info.message, field: info.field });
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateEmail = (text) => {
    setEmail(text);
    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
    if (serverError) setServerError(null);
  };
  
  const updatePassword = (text) => {
    setPassword(text);
    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
    if (serverError) setServerError(null);
  };
  
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(prevState => !prevState);
  };
  
  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>{APP_NAME}</Text>
            <Text style={styles.tagline}>{TAGLINE}</Text>
          </View>
          
          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
            
            {serverError && (
              <View style={styles.errorBanner}>
                <SafeIonicons name="alert-circle" size={18} color={colors.error} />
                <Text style={styles.errorBannerText}>{serverError.message}</Text>
              </View>
            )}
            
            <View style={[styles.inputContainer, (errors.email || serverError?.field === 'email') && styles.inputContainerError]}>
              <SafeIonicons name="mail-outline" size={20} color={colors.blue400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.gray500}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={updateEmail}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            
            <View style={[styles.inputContainer, (errors.password || serverError?.field === 'password') && styles.inputContainerError]}>
              <SafeIonicons name="lock-closed-outline" size={20} color={colors.blue400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.gray500}
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={updatePassword}
              />
              <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                <SafeIonicons 
                  name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
                  size={20} 
                  color={colors.gray600} 
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            {serverError?.field === 'password' && !errors.password && (
              <Text style={styles.errorText}>{serverError.message}</Text>
            )}
            
            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLinkText}>Sign Up</Text>
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
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: fontSizes.md,
    color: colors.blue200,
    marginTop: spacing.xs,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    ...shadows.lg,
  },
  welcomeText: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.gray600,
    marginBottom: spacing.lg,
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
  eyeIcon: {
    padding: spacing.xs,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.sm,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
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
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  errorBannerText: {
    flex: 1,
    color: colors.error,
    fontSize: fontSizes.sm,
    lineHeight: 18,
  },
  inputContainerError: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: fontSizes.sm,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    color: colors.gray600,
    fontSize: fontSizes.md,
  },
  registerLinkText: {
    color: colors.primary,
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
