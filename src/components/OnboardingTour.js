import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../components/SafeIonicons';
import { colors, spacing, fontSizes } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const OnboardingTour = ({ visible, onComplete, steps }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onComplete();
      setCurrentStep(0);
    });
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!visible || !steps.length) return null;

  const currentStepData = steps[currentStep];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleComplete}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.8)" barStyle="light-content" />
      
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View style={styles.spotlight} />
        
        <View style={styles.contentContainer}>
          <LinearGradient
            colors={['rgba(30,30,30,0.95)', 'rgba(20,20,20,0.98)']}
            style={styles.contentCard}
          >
            <View style={styles.header}>
              <View style={styles.stepIndicator}>
                <Text style={styles.stepText}>
                  {currentStep + 1} of {steps.length}
                </Text>
              </View>
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.iconCircle}
              >
                  <SafeIonicons 
                    name={currentStepData.icon} 
                    size={40} 
                    color={colors.white} 
                  />
              </LinearGradient>
            </View>

            <Text style={styles.title}>{currentStepData.title}</Text>
            <Text style={styles.description}>{currentStepData.description}</Text>

            {currentStepData.targetPosition && (
              <View style={styles.targetIndicator}>
                <SafeIonicons name="arrow-up" size={20} color={colors.primary} />
                <Text style={styles.targetText}>Look at the highlighted area</Text>
              </View>
            )}

            <View style={styles.actions}>
              {currentStep > 0 && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.previousButton]}
                  onPress={handlePrevious}
                >
                  <SafeIonicons name="chevron-back" size={20} color={colors.white} />
                  <Text style={styles.actionButtonText}>Previous</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionButton, styles.nextButton]}
                onPress={handleNext}
              >
                <Text style={styles.actionButtonText}>
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                </Text>
                <SafeIonicons 
                  name={currentStep === steps.length - 1 ? 'checkmark' : 'chevron-forward'} 
                  size={20} 
                  color={colors.white} 
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotlight: {
    position: 'absolute',
    width: width * 0.8,
    height: height * 0.3,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'rgba(30,136,229,0.1)',
  },
  contentContainer: {
    width: width * 0.9,
    maxWidth: 400,
  },
  contentCard: {
    borderRadius: 20,
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  stepIndicator: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  stepText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    fontWeight: 'bold',
  },
  skipButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  skipText: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
    fontWeight: 'bold',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: fontSizes.md,
    color: colors.gray300,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  targetIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30,136,229,0.1)',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  targetText: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
    marginLeft: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    gap: spacing.xs,
  },
  previousButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  nextButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.white,
  },
});

export default OnboardingTour;
