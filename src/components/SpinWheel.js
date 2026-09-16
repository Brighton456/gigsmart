import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from './SafeIonicons';
import Svg, { Path, G, Circle, Text as SvgText, TSpan, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { colors, spacing, fontSizes, shadows } from '../constants/theme';
import supabaseData from '../services/supabaseData';
import { useUser } from '../context/SupabaseUserContext';

const { width, height } = Dimensions.get('window');
// Clamp wheel size by width and height so it fits smaller screens without cropping
const WHEEL_SIZE = Math.min(width * 0.6, height * 0.35, 240);
const CENTER_SIZE = 60;

const lightenColor = (hex, intensity = 0.25) => {
  if (typeof hex !== 'string') return '#ffffff';
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return hex;
  const num = parseInt(normalized, 16);
  const clamp = (value) => Math.min(255, Math.max(0, value));
  const r = num >> 16;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const adjust = (channel) => clamp(Math.round(channel + (255 - channel) * intensity));
  const nextR = adjust(r);
  const nextG = adjust(g);
  const nextB = adjust(b);
  return `#${((1 << 24) + (nextR << 16) + (nextG << 8) + nextB).toString(16).slice(1)}`;
};

const SpinWheel = ({ visible, onClose }) => {
  const { profile, addToIncomeWallet, loadUserData } = useUser();
  const showNotification = useCallback((payload) => {
    console.log('🔔 Spin notification:', payload);
  }, []);
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(20);
  const [freeSpins, setFreeSpins] = useState(0);
  const [totalSpins, setTotalSpins] = useState(0);
  const [mockWinnings, setMockWinnings] = useState([]);

  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotationRef = useRef(0);

  const banners = useMemo(() => ([
    { id: 'promo1', title: 'Win up to KES 1,000,000', text: 'Bigger multipliers are live today!' },
    { id: 'promo2', title: 'Mega Friday', text: 'x20 jackpot chances increased by 15%.' },
    { id: 'promo3', title: 'Refer & Spin', text: 'Invite friends and earn free spins.' },
  ]), []);
  const quotes = useMemo(() => ([
    'Luck is what happens when preparation meets opportunity.',
    'Every spin is a new chance. Play smart.',
    'Set a budget. Enjoy the thrill. Celebrate the wins.',
  ]), []);

  // Spin amounts available (expanded)
  const spinAmounts = [20, 50, 100, 200, 500, 1000, 2000, 5000];

  // Wheel segments with multipliers (dynamic rewards based on selectedAmount)
  const wheelSegments = useMemo(() => ([
    { multiplier: 0,   color: '#EF4444', label: 'Try Again' },
    { multiplier: 0.5, color: '#F59E0B', label: 'x0.5' },
    { multiplier: 1,   color: '#10B981', label: 'x1' },
    { multiplier: 0,   color: '#3B82F6', label: 'Next Time' },
    { multiplier: 2,   color: '#8B5CF6', label: 'x2' },
    { multiplier: 0,   color: '#F97316', label: 'Almost' },
    { multiplier: 5,   color: '#06B6D4', label: 'x5' },
    { multiplier: 0,   color: '#EC4899', label: 'Keep Trying' },
    { multiplier: 10,  color: '#22C55E', label: 'x10' },
    { multiplier: 0,   color: '#6366F1', label: 'Miss' },
    { multiplier: 0,   color: '#F43F5E', label: 'Almost' },
    { multiplier: 20,  color: '#EAB308', label: 'x20' },
  ]), [selectedAmount]);

  useEffect(() => {
    if (visible) {
      // Start glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();

      // Generate mock recent winnings
      generateMockWinnings();
    }
  }, [visible]);

  const generateMockWinnings = () => {
    const mockNames = ['John D.', 'Mary K.', 'Peter M.', 'Sarah L.', 'David W.', 'Grace N.'];
    const mockAmounts = [20, 50, 100, 200];
    
    const winnings = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      name: mockNames[Math.floor(Math.random() * mockNames.length)],
      amount: mockAmounts[Math.floor(Math.random() * mockAmounts.length)],
      time: `${Math.floor(Math.random() * 60)} min ago`,
    }));
    
    setMockWinnings(winnings);
  };

  const canSpin = () => {
    if (freeSpins > 0) return true;
    return (profile?.income_wallet ?? 0) >= selectedAmount;
  };

  const handleSpin = async () => {
    if (!canSpin()) {
      showNotification({
        type: 'error',
        title: 'Insufficient Balance',
        message: 'You need more funds in your income wallet to spin',
      });
      return;
    }

    setIsSpinning(true);

    // Deduct spin cost (unless free spin)
    if (freeSpins === 0) {
      await addToIncomeWallet(
        -selectedAmount,
        `Spin wheel bet: KES ${selectedAmount}`,
        'SPIN_BET'
      );
    } else {
      setFreeSpins(prev => prev - 1);
    }

    // Animate wheel spin
    const baseSpin = 1440; // 4 full rotations
    const extraSpin = Math.random() * 720; // Up to 2 additional rotations
    const targetRotation = rotationRef.current + baseSpin + extraSpin;

    let spinSettled = false;
    let spinFailsafeTimer = null;

    const settleSpin = () => {
      if (spinSettled) return;
      spinSettled = true;
      if (spinFailsafeTimer) {
        clearTimeout(spinFailsafeTimer);
        spinFailsafeTimer = null;
      }
      resolveSpin();
    };

    // Failsafe: settle the spin if the animation callback never fires.
    // Browsers throttle requestAnimationFrame for hidden tabs, which can
    // stall the JS-driven wheel animation forever (seen on web preview).
    spinFailsafeTimer = setTimeout(settleSpin, 4500);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(spinValue, {
        toValue: targetRotation,
        duration: 3500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(settleSpin);
  };

  const resolveSpin = async () => {
    rotationRef.current = ((rotationRef.current % 360) + 360) % 360;
    spinValue.setValue(rotationRef.current);

    const nextTotal = totalSpins + 1;
    setTotalSpins(nextTotal);

    const earnedFreeSpin = nextTotal % 2 === 0;
    if (earnedFreeSpin) {
      setFreeSpins(prev => prev + 1);
      showNotification({
        type: 'success',
        title: 'Free Spin Earned!',
        message: 'Complete two spins to unlock a free round. Enjoy your bonus spin!',
      });
    }

    const resultPrize = 0; // ALWAYS ZERO per requirement 10
    if (resultPrize > 0) {
      const success = await addToIncomeWallet(
        resultPrize,
        `Spin wheel reward: KES ${resultPrize}`,
        'SPIN_WIN'
      );

      if (success) {
        showNotification({
          type: 'success',
          title: 'Congratulations!',
          message: `You won KES ${resultPrize.toLocaleString()}!`,
        });
      }
    } else {
      showNotification({
        type: 'info',
        title: 'Try Again!',
        message: 'Keep spinning for fun! No cash rewards available.',
      });
    }

    // Record the spin attempt in Supabase
    try {
      await supabaseData.recordSpinAttempt(
        profile?.id,
        selectedAmount,
        resultPrize,
        resultPrize > 0
      );
    } catch (e) {
      // Non-blocking
      console.log('Failed to record spin attempt', e);
    }

    // Refresh user data to update balances and history
    await loadUserData();

    setIsSpinning(false);
    spinValue.setValue(0);
  };
  // SVG-based circular wheel segment rendering
  const renderWheelSVG = () => {
    const R = WHEEL_SIZE / 2;
    const center = R;
    const numSegments = wheelSegments.length;
    const anglePer = (2 * Math.PI) / numSegments;
    const defs = [];
    const segments = [];
    for (let i = 0; i < numSegments; ++i) {
      const startAngle = i * anglePer - Math.PI / 2;
      const endAngle = (i + 1) * anglePer - Math.PI / 2;
      const x1 = center + R * Math.cos(startAngle);
      const y1 = center + R * Math.sin(startAngle);
      const x2 = center + R * Math.cos(endAngle);
      const y2 = center + R * Math.sin(endAngle);
      const largeArc = anglePer > Math.PI ? 1 : 0;
      const d = `M${center},${center} L${x1},${y1} A${R},${R} 0 ${largeArc} 1 ${x2},${y2} Z`;
      const textAngle = startAngle + anglePer / 2;
      const tx = center + (R * 0.52) * Math.cos(textAngle);
      const ty = center + (R * 0.52) * Math.sin(textAngle);
      const gradientId = `wheel-segment-gradient-${i}`;
      const highlightColor = lightenColor(wheelSegments[i].color, 0.35);

      defs.push(
        <SvgGradient key={gradientId} id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={highlightColor} stopOpacity="1" />
          <Stop offset="100%" stopColor={wheelSegments[i].color} stopOpacity="1" />
        </SvgGradient>
      );

      const prizeVal = 0; // ALWAYS ZERO per requirement 10
      const secondaryText = 'For Fun';

      segments.push(
        <G key={`seg-${i}`}>
          <Path d={d} fill={`url(#${gradientId})`} stroke="#fff" strokeWidth={2} />
          <SvgText
            x={tx}
            y={ty}
            fill="#fff"
            fontSize={11}
            textAnchor="middle"
            fontWeight="bold"
            opacity={0.95}
          >
            <TSpan x={tx} dy={0}>{wheelSegments[i].label}</TSpan>
            <TSpan x={tx} dy={14} fontSize={9} fontWeight="600" opacity={0.9}>
              {secondaryText}
            </TSpan>
          </SvgText>
        </G>
      );
    }
    return (
      <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Defs>{defs}</Defs>
        <Circle cx={center} cy={center} r={center} fill={colors.blue900} stroke="rgba(255,255,255,0.35)" strokeWidth={4} />
        {segments}
        <Circle cx={center} cy={center} r={R * 0.18} fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" strokeWidth={2} />
      </Svg>
    );
  };

  const renderMockWinnings = () => (
    <View style={styles.recentWinnings}>
      <Text style={styles.recentWinningsTitle}>🎉 Recent Winners</Text>
      {mockWinnings.map((winner) => (
        <View key={winner.id} style={styles.winnerItem}>
          <Text style={styles.winnerName}>{winner.name}</Text>
          <Text style={styles.winnerAmount}>KES {winner.amount.toLocaleString()}</Text>
          <Text style={styles.winnerTime}>{winner.time}</Text>
        </View>
      ))}
    </View>
  );

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#1E40AF', '#3B82F6', '#60A5FA']}
          style={styles.header}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <SafeIonicons name="close" size={24} color={colors.white} />
          </TouchableOpacity>
          
          <Text style={styles.title}>🎰 Lucky Spin Wheel</Text>
          <Text style={styles.subtitle}>Spin for fun! No cash rewards.</Text>
          
          {freeSpins > 0 && (
            <View style={styles.freeSpinBadge}>
              <Text style={styles.freeSpinText}>🎁 {freeSpins} Free Spins!</Text>
            </View>
          )}
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banners */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bannersContainer}>
          {banners.map(b => (
            <LinearGradient key={b.id} colors={['#0F172A', '#1E293B']} style={styles.bannerCard}>
              <Text style={styles.bannerTitle}>{b.title}</Text>
              <Text style={styles.bannerText}>{b.text}</Text>
            </LinearGradient>
          ))}
        </ScrollView>

        {/* Recent Winners high up */}
        {renderMockWinnings()}

        {/* Spin Amount Selection */}
        <View style={styles.amountSelection}>
          <Text style={styles.sectionTitle}>Select Spin Amount:</Text>
          <View style={styles.amountGrid}>
            {spinAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.amountButton,
                  selectedAmount === amount && styles.selectedAmount,
                ]}
                onPress={() => setSelectedAmount(amount)}
                disabled={freeSpins > 0}
              >
                <Text style={[
                  styles.amountText,
                  selectedAmount === amount && styles.selectedAmountText,
                ]}>
                  KES {amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Spin Wheel */}
        <View style={styles.wheelContainer}>
          <Animated.View
            style={[
              styles.wheel,
              {
                transform: [
                  { rotate: spinValue.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  })},
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            {renderWheelSVG()}
            
            {/* Center circle */}
            <View style={styles.centerCircle}>
              <SafeIonicons name="star" size={24} color={colors.warning} />
            </View>
          </Animated.View>
          
          {/* Pointer */}
          <View style={styles.pointer}>
            <SafeIonicons name="caret-down" size={30} color={colors.error} />
          </View>
          
          {/* Glow effect */}
          <Animated.View
            style={[
              styles.glowRing,
              {
                opacity: glowAnim,
                transform: [{ scale: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1],
                })}],
              },
            ]}
          />
        </View>

        {/* Spin Button */}
        <TouchableOpacity
          style={[styles.spinButton, !canSpin() && styles.disabledButton]}
          onPress={handleSpin}
          disabled={isSpinning || !canSpin()}
        >
          <LinearGradient
            colors={canSpin() ? [colors.success, colors.green] : [colors.gray400, colors.gray500]}
            style={styles.spinButtonInner}
          >
            {isSpinning ? (
              <Text style={styles.spinButtonText}>Spinning...</Text>
            ) : freeSpins > 0 ? (
              <Text style={styles.spinButtonText}>🎁 FREE SPIN!</Text>
            ) : (
              <Text style={styles.spinButtonText}>
                SPIN - KES {selectedAmount}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Balance Display */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceText}>
            Income Balance: KES {(profile?.income_wallet ?? 0).toLocaleString()}
          </Text>
        </View>

        {/* Terms & conditions */}
        <View style={styles.termsContainer}>
          {quotes.slice(0, 1).map((q, idx) => (
            <Text key={`q-${idx}`} style={styles.quoteText}>“{q}”</Text>
          ))}
          <Text style={styles.termsText}>Play responsibly. Odds vary per segment. Free spins unlock after milestones. Winnings are credited instantly to your income wallet.</Text>
        </View>

        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    width: width * 0.95,
    maxHeight: '90%',
    backgroundColor: '#EBF2FF',
    borderRadius: 20,
    overflow: 'visible',
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.blue100,
    marginTop: spacing.xs,
  },
  freeSpinBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginTop: spacing.sm,
  },
  freeSpinText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: fontSizes.sm,
  },
  amountSelection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amountButton: {
    width: '30%',
    paddingVertical: spacing.sm,
    backgroundColor: '#DCEAFE',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAmount: {
    backgroundColor: colors.blue500,
    borderColor: colors.blue600,
  },
  amountText: {
    fontSize: fontSizes.sm,
    color: colors.blue600,
    fontWeight: '600',
  },
  selectedAmountText: {
    color: colors.white,
  },
  wheelContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
    position: 'relative',
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    position: 'relative',
    ...shadows.lg,
  },
  wheelSegment: {
    position: 'absolute',
    width: WHEEL_SIZE / 2,
    height: WHEEL_SIZE / 2,
    top: WHEEL_SIZE / 4,
    left: WHEEL_SIZE / 4,
    transformOrigin: `${WHEEL_SIZE / 4}px ${WHEEL_SIZE / 4}px`,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingBottom: spacing.lg,
  },
  segmentText: {
    color: colors.white,
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  centerCircle: {
    position: 'absolute',
    top: (WHEEL_SIZE - CENTER_SIZE) / 2,
    left: (WHEEL_SIZE - CENTER_SIZE) / 2,
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  pointer: {
    position: 'absolute',
    top: -15,
    zIndex: 10,
  },
  glowRing: {
    position: 'absolute',
    width: WHEEL_SIZE + 20,
    height: WHEEL_SIZE + 20,
    borderRadius: (WHEEL_SIZE + 20) / 2,
    borderWidth: 3,
    borderColor: colors.warning,
    top: -10,
    left: -10,
  },
  spinButton: {
    marginHorizontal: spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.md,
  },
  disabledButton: {
    opacity: 0.6,
  },
  spinButtonInner: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  spinButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
  },
  balanceContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  balanceText: {
    fontSize: fontSizes.md,
    color: colors.blue700,
  },
  recentWinnings: {
    backgroundColor: 'rgba(59,130,246,0.16)',
    padding: spacing.lg,
    borderRadius: 16,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  bannersContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  bannerCard: {
    width: 220,
    marginRight: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
  },
  bannerTitle: {
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerText: {
    color: '#E2E8F0',
    fontSize: fontSizes.sm,
  },
  termsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  quoteText: {
    color: colors.textPrimary,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  termsText: {
    color: colors.textSecondary,
    fontSize: fontSizes.xs,
  },
  recentWinningsTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  winnerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.blue100,
  },
  winnerName: {
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  winnerAmount: {
    fontSize: fontSizes.sm,
    color: colors.success,
    fontWeight: 'bold',
  },
  winnerTime: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
});

export default SpinWheel;
