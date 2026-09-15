import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../../components/SafeIonicons';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { useUser } from '../../context/SupabaseUserContext';

const RedeemGiftsScreen = ({ navigation }) => {
  const { redeemGiftCode, loadUserData, giftCodeEarnings } = useUser();
  const [giftCode, setGiftCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Load gift code earnings on mount per requirement 5
  useEffect(() => {
    loadUserData();
  }, []);

  const handleRedeemGift = async () => {
    if (!giftCode.trim()) {
      Alert.alert('Error', 'Please enter a gift code');
      return;
    }
    setIsRedeeming(true);
    try {
      const amountCredited = await redeemGiftCode(giftCode);
      if (amountCredited > 0) {
        setGiftCode('');
        Alert.alert('Success!', `Gift code redeemed successfully! You received KES ${amountCredited}.`);
        await loadUserData();
      } else {
        Alert.alert('Error', 'Invalid gift code or redemption failed. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Redemption failed.');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <SafeIonicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Redeem Gifts</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.redeemCard}>
          <View style={styles.giftIcon}>
            <SafeIonicons name="gift" size={48} color={colors.primary} />
          </View>
          
          <Text style={styles.cardTitle}>Redeem Gift Code</Text>
          <Text style={styles.cardSubtitle}>
            Enter your gift code to redeem rewards.
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter gift code"
              placeholderTextColor={colors.gray500}
              value={giftCode}
              onChangeText={setGiftCode}
              autoCapitalize="characters"
            />
          </View>
          
          <TouchableOpacity
            style={[styles.redeemButton, isRedeeming && styles.redeemButtonDisabled]}
            onPress={handleRedeemGift}
            disabled={isRedeeming}
          >
            <Text style={styles.redeemButtonText}>
              {isRedeeming ? 'Redeeming...' : 'Redeem Now'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Redemption History */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Redemption History</Text>
          
          {giftCodeEarnings && giftCodeEarnings.length > 0 ? (
            <View style={styles.historyList}>
              {giftCodeEarnings.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    <SafeIonicons name="checkmark-circle" size={24} color={colors.success} />
                  </View>
                  <View style={styles.historyDetails}>
                    <Text style={styles.historyCode}>Code: {item.gift_code || 'Gift Code'}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(item.created_at || item.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.historyAmount}>+KES {item.gift_code_earnings || item.amount}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyHistory}>
              <SafeIonicons name="document-outline" size={48} color={colors.gray400} />
              <Text style={styles.emptyHistoryText}>No redemption history found.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: fontSizes.xl, fontWeight: 'bold', color: colors.white },
  placeholder: { width: 40 },
  content: { flex: 1, paddingHorizontal: spacing.lg },
  redeemCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.lg,
  },
  giftIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardTitle: { fontSize: fontSizes.xl, fontWeight: 'bold', color: colors.textDark, marginBottom: spacing.sm },
  cardSubtitle: { fontSize: fontSizes.md, color: colors.gray600, textAlign: 'center', marginBottom: spacing.xl },
  inputContainer: {
    width: '100%',
    backgroundColor: colors.gray100,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  input: { height: 50, fontSize: fontSizes.md, color: colors.textDark },
  redeemButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  redeemButtonDisabled: { opacity: 0.6 },
  redeemButtonText: { fontSize: fontSizes.md, fontWeight: 'bold', color: colors.white },
  historySection: { marginBottom: spacing.xl },
  historyTitle: { fontSize: fontSizes.lg, fontWeight: 'bold', color: colors.white, marginBottom: spacing.md },
  historyList: { backgroundColor: colors.white, borderRadius: 16, padding: spacing.lg, ...shadows.md },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  historyIcon: { marginRight: spacing.md },
  historyDetails: { flex: 1 },
  historyCode: { fontSize: fontSizes.md, fontWeight: '600', color: colors.textDark },
  historyDate: { fontSize: fontSizes.sm, color: colors.gray600, marginTop: spacing.xs / 2 },
  historyAmount: { fontSize: fontSizes.md, fontWeight: 'bold', color: colors.success },
  emptyHistory: { backgroundColor: colors.white, borderRadius: 16, padding: spacing.xl, alignItems: 'center', ...shadows.md },
  emptyHistoryText: { fontSize: fontSizes.md, color: colors.gray600, marginTop: spacing.md },
});

export default RedeemGiftsScreen;
