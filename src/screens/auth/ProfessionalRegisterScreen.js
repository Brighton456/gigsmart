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
  StatusBar,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../../components/SafeIonicons';
import { useAuth } from '../../context/SupabaseAuthContext';
import { useNotification } from '../../context/NotificationContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { APP_NAME, APP_SHORT_NAME, TAGLINE } from '../../constants/branding';

const { width } = Dimensions.get('window');

const ProfessionalRegisterScreen = ({ navigation, route }) => {
  const referralCode = route.params?.referralCode || '';
  
  // Step 1: Basic Information
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Step 2: Personal Details
  const [country, setCountry] = useState('Kenya');
  const [city, setCity] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  
  // Step 3: Professional Information
  const [industry, setIndustry] = useState('');
  const [occupation, setOccupation] = useState('');
  const [experience, setExperience] = useState('');
  const [referrer, setReferrer] = useState(referralCode);
  
  // UI State
  const [currentStep, setCurrentStep] = useState(1);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { signUp } = useAuth();
  const { showNotification } = useNotification();

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-\s()]+$/.test(phone) || phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!country.trim()) {
      newErrors.country = 'Country is required';
    }
    
    if (!city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!nationalId.trim()) {
      newErrors.nationalId = 'National ID/Passport is required';
    }
    
    if (!dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    
    if (!gender.trim()) {
      newErrors.gender = 'Gender is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    
    if (!industry.trim()) {
      newErrors.industry = 'Industry/Profession is required';
    }
    
    if (!occupation.trim()) {
      newErrors.occupation = 'Current occupation is required';
    }
    
    if (!experience.trim()) {
      newErrors.experience = 'Work experience is required';
    }
    
    if (!acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
    }
    
    if (isValid) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
        setErrors({});
      } else {
        handleRegister();
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      await signUp({
        name,
        email,
        phone,
        password,
        country,
        city,
        nationalId,
        dateOfBirth,
        gender,
        industry,
        occupation,
        experience,
        referrer,
        acceptMarketing
      });
      
      showNotification({
        type: 'success',
        title: 'Registration Successful!',
        message: `Welcome to ${APP_NAME}! Your account has been created successfully.`,
      });
      
      navigation.navigate('Login');
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Registration Failed',
        message: error.message || 'An error occurred during registration. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(currentStep / 3) * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>Step {currentStep} of 3</Text>
    </View>
  );

  const renderInputField = (value, setValue, placeholder, error, options = {}) => (
    <View style={styles.inputContainer}>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        {options.icon && (
          <SafeIonicons name={options.icon} size={20} color={colors.blue300} style={styles.inputIcon} />
        )}
        <TextInput
          style={[styles.input, options.icon && styles.inputWithIcon]}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor={colors.blue200}
          secureTextEntry={options.secure}
          keyboardType={options.keyboardType || 'default'}
          autoCapitalize={options.autoCapitalize || 'words'}
          autoCorrect={false}
        />
        {options.toggleVisibility && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={options.toggleVisibility}
          >
            <SafeIonicons
              name={options.isVisible ? 'eye-off' : 'eye'}
              size={20}
              color={colors.blue300}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>Let's start with your basic details</Text>
      
      {renderInputField(name, setName, 'Full Name *', errors.name, { icon: 'person-outline' })}
      {renderInputField(email, setEmail, 'Email Address *', errors.email, { 
        icon: 'mail-outline', 
        keyboardType: 'email-address',
        autoCapitalize: 'none'
      })}
      {renderInputField(phone, setPhone, 'Phone Number *', errors.phone, { 
        icon: 'call-outline', 
        keyboardType: 'phone-pad' 
      })}
      {renderInputField(password, setPassword, 'Password *', errors.password, { 
        icon: 'lock-closed-outline',
        secure: !isPasswordVisible,
        toggleVisibility: () => setIsPasswordVisible(!isPasswordVisible),
        isVisible: isPasswordVisible,
        autoCapitalize: 'none'
      })}
      {renderInputField(confirmPassword, setConfirmPassword, 'Confirm Password *', errors.confirmPassword, { 
        icon: 'lock-closed-outline',
        secure: !isConfirmPasswordVisible,
        toggleVisibility: () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible),
        isVisible: isConfirmPasswordVisible,
        autoCapitalize: 'none'
      })}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Details</Text>
      <Text style={styles.stepSubtitle}>Help us know you better</Text>
      
      {renderInputField(country, setCountry, 'Country *', errors.country, { icon: 'flag-outline' })}
      {renderInputField(city, setCity, 'City *', errors.city, { icon: 'location-outline' })}
      {renderInputField(nationalId, setNationalId, 'National ID / Passport *', errors.nationalId, { 
        icon: 'card-outline' 
      })}
      {renderInputField(dateOfBirth, setDateOfBirth, 'Date of Birth (DD/MM/YYYY) *', errors.dateOfBirth, { 
        icon: 'calendar-outline',
        keyboardType: 'numeric'
      })}
      
      <View style={styles.inputContainer}>
        <Text style={styles.fieldLabel}>Gender *</Text>
        <View style={styles.genderContainer}>
          {['Male', 'Female', 'Other'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.genderOption, gender === option && styles.genderSelected]}
              onPress={() => setGender(option)}
            >
              <Text style={[styles.genderText, gender === option && styles.genderTextSelected]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Professional Information</Text>
      <Text style={styles.stepSubtitle}>Tell us about your work</Text>
      
      {renderInputField(industry, setIndustry, 'Industry/Sector *', errors.industry, { 
        icon: 'business-outline' 
      })}
      {renderInputField(occupation, setOccupation, 'Current Occupation *', errors.occupation, { 
        icon: 'briefcase-outline' 
      })}
      {renderInputField(experience, setExperience, 'Years of Experience *', errors.experience, { 
        icon: 'time-outline',
        keyboardType: 'numeric'
      })}
      {renderInputField(referrer, setReferrer, 'Referral Code (Optional)', null, { 
        icon: 'people-outline' 
      })}
      
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setAcceptTerms(!acceptTerms)}
        >
          <SafeIonicons
            name={acceptTerms ? 'checkbox' : 'square-outline'}
            size={24}
            color={acceptTerms ? colors.success : colors.blue300}
          />
          <Text style={styles.checkboxText}>
            I agree to the <Text style={styles.linkText}>Terms & Conditions</Text> and <Text style={styles.linkText}>Privacy Policy</Text> *
          </Text>
        </TouchableOpacity>
        {errors.acceptTerms && <Text style={styles.errorText}>{errors.acceptTerms}</Text>}
      </View>
      
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setAcceptMarketing(!acceptMarketing)}
        >
          <SafeIonicons
            name={acceptMarketing ? 'checkbox' : 'square-outline'}
            size={24}
            color={acceptMarketing ? colors.success : colors.blue300}
          />
          <Text style={styles.checkboxText}>
            I want to receive updates and promotional offers from {APP_NAME}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => currentStep > 1 ? handlePrevStep() : navigation.goBack()}
            >
              <SafeIonicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Join {APP_NAME}</Text>
              <Text style={styles.headerSubtitle}>{TAGLINE}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          {renderProgressBar()}

          {/* Form Content */}
          <View style={styles.formContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.formCard}
            >
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </LinearGradient>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNextStep}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[colors.success, colors.green]}
                style={styles.nextButtonInner}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Text style={styles.nextButtonText}>
                      {currentStep === 3 ? 'Create Account' : 'Continue'}
                    </Text>
                    <SafeIonicons name="arrow-forward" size={20} color={colors.white} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs / 2,
  },
  headerSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    opacity: 0.9,
  },
  progressContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 2,
  },
  progressText: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  formCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  stepContainer: {
    marginBottom: spacing.md,
  },
  stepTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontSize: fontSizes.md,
    color: colors.blue200,
    marginBottom: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  inputError: {
    borderColor: colors.error,
  },
  inputIcon: {
    marginLeft: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.md,
    color: colors.white,
  },
  inputWithIcon: {
    paddingLeft: spacing.xs,
  },
  eyeButton: {
    padding: spacing.md,
  },
  errorText: {
    fontSize: fontSizes.sm,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  fieldLabel: {
    fontSize: fontSizes.md,
    color: colors.white,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  genderSelected: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  genderText: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    fontWeight: '500',
  },
  genderTextSelected: {
    color: colors.white,
    fontWeight: 'bold',
  },
  checkboxContainer: {
    marginBottom: spacing.md,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.blue200,
    marginLeft: spacing.sm,
    lineHeight: 20,
  },
  linkText: {
    color: colors.accent1,
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.md,
  },
  nextButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  nextButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginRight: spacing.sm,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  loginText: {
    fontSize: fontSizes.md,
    color: colors.blue200,
  },
  loginLink: {
    fontSize: fontSizes.md,
    color: colors.accent1,
    fontWeight: 'bold',
  },
});

export default ProfessionalRegisterScreen;
