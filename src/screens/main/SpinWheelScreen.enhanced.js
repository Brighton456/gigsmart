import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
  StatusBar,
  Dimensions,
  ScrollView,
  FlatList,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../../components/SafeIonicons';
import { useUser } from '../../context/SupabaseUserContext';
import { useApp } from '../../context/AppContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

// Enhanced wheel segments with better prizes
const segments = [
  { value: 0, label: 'Try Again', color: '#6c757d', probability: 0.30 },
  { value: 100, label: '100', color: '#28a745', probability: 0.20 },
  { value: 0, label: 'Better Luck', color: '#dc3545', probability: 0.15 },
  { value: 500, label: '500', color: '#007bff', probability: 0.12 },
  { value: 0, label: 'No Win', color: '#fd7e14', probability: 0.10 },
  { value: 1000, label: '1,000', color: '#6f42c1', probability: 0.08 },
  { value: 0, label: 'Free Spin', color: '#20c997', probability: 0.03 },
  { value: 5000, label: '5,000', color: '#e83e8c', probability: 0.015 },
  { value: 50000, label: '50,000', color: '#ffc107', probability: 0.004 },
  { value: 300000, label: '300,000', color: '#ff6b35', probability: 0.001 },
];

// Bet amount options
const betOptions = [100, 500, 1000, 2500, 5000];

// Mock recent winners for marketing
const recentWinners = [
  { name: 'John M.', amount: 5000, time: '2 mins ago' },
  { name: 'Sarah K.', amount: 1000, time: '5 mins ago' },
  { name: 'Mike D.', amount: 500, time: '8 mins ago' },
  { name: 'Lisa P.', amount: 50000, time: '12 mins ago' },
  { name: 'David R.', amount: 1000, time: '15 mins ago' },
  { name: 'Emma S.', amount: 300000, time: '1 hour ago' },
];

const SpinWheelScreen = ({ navigation }) => {
  const { profile, addToIncomeWallet } = useUser();
  const { addSpinResult } = useApp();
  
  const [selectedBet, setSelectedBet] = useState(betOptions[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [spinHistory, setSpinHistory] = useState([]);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [showWinners, setShowWinners] = useState(true);
  
  const spinValue = useRef(new Animated.Value(0)).current;
  const wheelSize = width * 0.75;
  const angleBySegment = 360 / segments.length;
  
  // Animated values for marketing effects
  const flashAnim = useRef(new Animated.Value(1)).current;
  const winnersScrollX = useRef(new Animated.Value(0)).current;
  
  // Convert rounds played to determine if next spin is free
  const isFreeRound = roundsPlayed > 0 && roundsPlayed % 3 === 2;
  
  useEffect(() => {
    // Flash animation for excitement
    Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Auto-scroll winners
    Animated.loop(
      Animated.timing(winnersScrollX, {
        toValue: -width * 2,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  
  // Spin the wheel
  const spinWheel = () => {
    if ((profile.incomeWallet || 0) < selectedBet && !isFreeRound) {
      Alert.alert(
        'Insufficient Balance',
        'You don\'t have enough balance for this bet.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (isSpinning) return;
    
    // Deduct bet amount from wallet if not a free round
    if (!isFreeRound) {
      addToIncomeWallet(
        -selectedBet,
        `Spin to Win bet: KES ${selectedBet}`,
        'SPIN_BET'
      );
    }
    
    setIsSpinning(true);
    setSpinResult(null);
    
    // Calculate number of spins (random between 5-10 full rotations)
    const spinCount = 5 + Math.random() * 5;
    
    // Always land on 0 value segment (as requested)
    const zeroSegments = segments.map((seg, index) => ({ ...seg, index })).filter(seg => seg.value === 0);
    const landingSegment = zeroSegments[Math.floor(Math.random() * zeroSegments.length)];
    
    // Calculate final rotation value
    const offset = Math.random() * 0.8 - 0.4;
    const finalRotation = spinCount * 360 + (360 - (landingSegment.index * angleBySegment) - (angleBySegment / 2)) + (offset * angleBySegment);
    
    // Start animation
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: finalRotation,
      duration: 4000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start(({ finished }) => {
      if (finished) {
        setIsSpinning(false);
        setSpinResult(landingSegment);
        setRoundsPlayed(prev => prev + 1);
        
        // Add to spin history
        const newSpin = {
          id: Date.now(),
          bet: isFreeRound ? 0 : selectedBet,
          result: landingSegment.value,
          timestamp: new Date(),
          isFree: isFreeRound
        };
        setSpinHistory(prev => [newSpin, ...prev.slice(0, 9)]);
        
        // Show result
        setTimeout(() => {
          if (landingSegment.value > 0) {
            Alert.alert(
              '🎉 Congratulations!',
              `You won KES ${landingSegment.value.toLocaleString()}!`,
              [{ text: 'Awesome!' }]
            );
            addToIncomeWallet(landingSegment.value, `Spin to Win prize: KES ${landingSegment.value}`, 'SPIN_WIN');
          } else if (landingSegment.label === 'Free Spin') {
            Alert.alert(
              '🎁 Free Spin!',
              'You earned a free spin! Your next spin is on the house.',
              [{ text: 'Great!' }]
            );
          } else {
            Alert.alert(
              '😔 Better Luck Next Time',
              `${landingSegment.label}! Try again for another chance to win big!`,
              [{ text: 'Try Again' }]
            );
          }
        }, 500);
      }
    });
  };
  
  // Render wheel segment
  const renderWheelSegment = (segment, index) => {
    const rotation = (index * angleBySegment) - 90;
    const radius = wheelSize / 2 - 20;
    
    return (
      <View
        key={index}
        style={[
          styles.segment,
          {
            transform: [{ rotate: `${rotation}deg` }],
            backgroundColor: segment.color,
          }
        ]}
      >
        <View style={styles.segmentContent}>
          <Text style={styles.segmentText}>
            {segment.value > 0 ? `KES ${segment.label}` : segment.label}
          </Text>
        </View>
      </View>
    );
  };
  
  // Render recent winner item
  const renderWinnerItem = ({ item, index }) => (
    <View style={styles.winnerItem}>
      <View style={styles.winnerIcon}>
        <SafeIonicons name="trophy" size={16} color={colors.yellow} />
      </View>
      <Text style={styles.winnerText}>
        <Text style={styles.winnerName}>{item.name}</Text> won{' '}
        <Text style={styles.winnerAmount}>KES {item.amount.toLocaleString()}</Text>{' '}
        <Text style={styles.winnerTime}>{item.time}</Text>
      </Text>
    </View>
  );
  
  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <SafeIonicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        
        <Animated.Text style={[styles.headerTitle, { transform: [{ scale: flashAnim }] }]}>
          🎰 Spin to Win
        </Animated.Text>
        
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Recent Winners Ticker */}
        <View style={styles.winnersContainer}>
          <Text style={styles.winnersTitle}>🏆 Recent Winners</Text>
          <View style={styles.winnersScroll}>
            <Animated.View
              style={[
                styles.winnersContent,
                { transform: [{ translateX: winnersScrollX }] }
              ]}
            >
              {[...recentWinners, ...recentWinners].map((winner, index) => (
                <View key={index} style={styles.winnerTickerItem}>
                  <SafeIonicons name="star" size={12} color={colors.yellow} />
                  <Text style={styles.winnerTickerText}>
                    {winner.name} won KES {winner.amount.toLocaleString()}
                  </Text>
                </View>
              ))}
            </Animated.View>
          </View>
        </View>
        
        {/* Main Wheel Container */}
        <View style={styles.wheelContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
            style={styles.wheelCard}
          >
            {/* Wheel */}
            <View style={styles.wheelWrapper}>
              <Animated.View
                style={[
                  styles.wheel,
                  {
                    width: wheelSize,
                    height: wheelSize,
                    transform: [{ rotate: spinValue.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg']
                    }) }]
                  }
                ]}
              >
                {segments.map((segment, index) => renderWheelSegment(segment, index))}
                
                {/* Center circle */}
                <View style={styles.centerCircle}>
                  <LinearGradient
                    colors={[colors.yellow, colors.orange]}
                    style={styles.centerGradient}
                  >
                    <Text style={styles.centerText}>SPIN</Text>
                  </LinearGradient>
                </View>
              </Animated.View>
              
              {/* Pointer */}
              <View style={styles.pointer}>
                <View style={styles.pointerTriangle} />
              </View>
            </View>
            
            {/* Result Display */}
            {spinResult && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultText}>
                  {spinResult.value > 0 
                    ? `🎉 You Won KES ${spinResult.value.toLocaleString()}!`
                    : `${spinResult.label}`
                  }
                </Text>
              </View>
            )}
          </LinearGradient>
        </View>
        
        {/* Bet Selection */}
        <View style={styles.betContainer}>
          <Text style={styles.sectionTitle}>Select Your Bet</Text>
          <View style={styles.betOptions}>
            {betOptions.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.betOption,
                  selectedBet === amount && styles.selectedBetOption
                ]}
                onPress={() => setSelectedBet(amount)}
                disabled={isSpinning}
              >
                <Text style={[
                  styles.betOptionText,
                  selectedBet === amount && styles.selectedBetOptionText
                ]}>
                  KES {amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {isFreeRound && (
            <View style={styles.freeSpinBadge}>
              <SafeIonicons name="gift" size={20} color={colors.white} />
              <Text style={styles.freeSpinText}>Next Spin is FREE!</Text>
            </View>
          )}
        </View>
        
        {/* Spin Button */}
        <TouchableOpacity
          style={[styles.spinButton, isSpinning && styles.spinningButton]}
          onPress={spinWheel}
          disabled={isSpinning}
        >
          <LinearGradient
            colors={isSpinning ? [colors.gray600, colors.gray700] : [colors.red, colors.pink]}
            style={styles.spinButtonGradient}
          >
            <Text style={styles.spinButtonText}>
              {isSpinning ? 'SPINNING...' : isFreeRound ? 'SPIN FREE!' : `SPIN FOR KES ${selectedBet}`}
            </Text>
            <SafeIonicons 
              name={isSpinning ? "hourglass" : "play-circle"} 
              size={24} 
              color={colors.white} 
            />
          </LinearGradient>
        </TouchableOpacity>
        
        {/* Spin History */}
        {spinHistory.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.sectionTitle}>Recent Spins</Text>
            {spinHistory.slice(0, 5).map((spin) => (
              <View key={spin.id} style={styles.historyItem}>
                <Text style={styles.historyBet}>
                  {spin.isFree ? 'FREE' : `KES ${spin.bet}`}
                </Text>
                <Text style={styles.historyResult}>
                  {spin.result > 0 ? `+KES ${spin.result.toLocaleString()}` : 'No Win'}
                </Text>
                <Text style={styles.historyTime}>
                  {spin.timestamp.toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Game Rules */}
        <View style={styles.rulesContainer}>
          <Text style={styles.sectionTitle}>How to Play</Text>
          <View style={styles.ruleItem}>
            <SafeIonicons name="checkmark-circle" size={20} color={colors.green} />
            <Text style={styles.ruleText}>Choose your bet amount (KES 100 - 5,000)</Text>
          </View>
          <View style={styles.ruleItem}>
            <SafeIonicons name="checkmark-circle" size={20} color={colors.green} />
            <Text style={styles.ruleText}>Spin the wheel and wait for it to stop</Text>
          </View>
          <View style={styles.ruleItem}>
            <SafeIonicons name="checkmark-circle" size={20} color={colors.green} />
            <Text style={styles.ruleText}>Win up to KES 300,000 instantly!</Text>
          </View>
          <View style={styles.ruleItem}>
            <SafeIonicons name="checkmark-circle" size={20} color={colors.green} />
            <Text style={styles.ruleText}>Play 2 rounds and get 1 FREE spin</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  winnersContainer: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  winnersTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  winnersScroll: {
    height: 30,
    overflow: 'hidden',
  },
  winnersContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  winnerTickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 15,
  },
  winnerTickerText: {
    color: colors.white,
    fontSize: fontSizes.sm,
    marginLeft: spacing.xs,
  },
  wheelContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  wheelCard: {
    borderRadius: 20,
    padding: spacing.lg,
    alignItems: 'center',
  },
  wheelWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheel: {
    borderRadius: 1000,
    position: 'relative',
    elevation: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  segment: {
    position: 'absolute',
    width: '50%',
    height: '50%',
    top: '50%',
    left: '50%',
    transformOrigin: '0 0',
    borderWidth: 2,
    borderColor: colors.white,
  },
  segmentContent: {
    position: 'absolute',
    top: '10%',
    left: '20%',
    transform: [{ rotate: '90deg' }],
  },
  segmentText: {
    color: colors.white,
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  centerCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 80,
    height: 80,
    marginTop: -40,
    marginLeft: -40,
    borderRadius: 40,
    elevation: 15,
  },
  centerGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  pointer: {
    position: 'absolute',
    top: -10,
    zIndex: 10,
  },
  pointerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.red,
  },
  resultContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
  },
  resultText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  betContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  betOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  betOption: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.sm,
    minWidth: '30%',
    alignItems: 'center',
  },
  selectedBetOption: {
    backgroundColor: colors.yellow,
  },
  betOptionText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  selectedBetOptionText: {
    color: colors.black,
  },
  freeSpinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.green,
    padding: spacing.sm,
    borderRadius: 20,
    marginTop: spacing.md,
  },
  freeSpinText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  spinButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: 15,
    elevation: 5,
  },
  spinButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: 15,
  },
  spinButtonText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    marginRight: spacing.sm,
  },
  historyContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: spacing.sm,
    borderRadius: 10,
    marginBottom: spacing.xs,
  },
  historyBet: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
  },
  historyResult: {
    color: colors.yellow,
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
  },
  historyTime: {
    color: colors.gray300,
    fontSize: fontSizes.xs,
  },
  rulesContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ruleText: {
    color: colors.white,
    fontSize: fontSizes.md,
    marginLeft: spacing.sm,
    flex: 1,
  },
});

export default SpinWheelScreen;
