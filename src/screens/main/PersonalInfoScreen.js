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
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../../components/SafeIonicons';
import { useAuth } from '../../context/SupabaseAuthContext';
import { useUser } from '../../context/SupabaseUserContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { APP_NAME } from '../../constants/branding';

const PersonalInfoScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { profile, updateWithdrawalAccount, loadUserData } = useUser();

  const displayName = profile?.name?.trim?.()
    || profile?.full_name?.trim?.()
    || user?.user_metadata?.name?.trim?.()
    || user?.email?.split?.('@')?.[0]
    || APP_NAME;
  const displayEmail = profile?.email || user?.email || 'Not provided';
  const rawPhone = profile?.phone || profile?.phone_number || user?.user_metadata?.phone || user?.phone;
  const displayPhone = rawPhone?.toString?.().trim() || 'Not provided';
  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown';
  
  // Form states
  const [accountType, setAccountType] = useState(profile?.withdrawalAccountType || 'mpesa');
  const [withdrawalPassword, setWithdrawalPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSettingWallet, setIsSettingWallet] = useState(false);
  const storedAccountDetails = profile?.withdrawalAccountDetails;
  const storedAccountDisplay = storedAccountDetails?.display;
  const [showPasswordForm, setShowPasswordForm] = useState(!storedAccountDisplay);
  
  // Payment method specific states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [tillNumber, setTillNumber] = useState('');
  const [paybillNumber, setPaybillNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [banks, setBanks] = useState([]);

  const accountTypes = [
    { id: 'mpesa', label: 'M-Pesa', icon: 'phone-portrait', color: '#00A651' },
    { id: 'airtel_money', label: 'Airtel Money', icon: 'phone-portrait', color: '#FF0000' },
    { id: 'till', label: 'Till Number', icon: 'business', color: '#1976D2' },
    { id: 'paybill', label: 'Paybill', icon: 'receipt', color: '#FF9800' },
    { id: 'bank', label: 'Bank Account', icon: 'card', color: '#4CAF50' },
  ];

  // Kenyan banks data
  const kenyanBanks = [
    { id: 'kcb', name: 'Kenya Commercial Bank (KCB)', paybill: '522522' },
    { id: 'equity', name: 'Equity Bank', paybill: '247247' },
    { id: 'coop', name: 'Cooperative Bank', paybill: '400200' },
    { id: 'ncba', name: 'NCBA Bank', paybill: '228228' },
    { id: 'absa', name: 'Absa Bank Kenya', paybill: '303030' },
    { id: 'scb', name: 'Standard Chartered Bank', paybill: '329329' },
    { id: 'dtb', name: 'Diamond Trust Bank (DTB)', paybill: '521325' },
    { id: 'im', name: 'I&M Bank', paybill: '141414' },
    { id: 'stanbic', name: 'Stanbic Bank', paybill: '909090' },
    { id: 'family', name: 'Family Bank', paybill: '222111' },
    { id: 'sidian', name: 'Sidian Bank', paybill: '323232' },
    { id: 'boa', name: 'Bank of Africa', paybill: '888880' },
    { id: 'prime', name: 'Prime Bank', paybill: '525252' },
    { id: 'gab', name: 'Gulf African Bank', paybill: '444222' },
    { id: 'credit', name: 'Credit Bank', paybill: '555666' },
  ];

  useEffect(() => {
    setBanks(kenyanBanks);
  }, []);

  const validateAccountDetails = () => {
    switch (accountType) {
      case 'mpesa':
      case 'airtel_money':
        if (!phoneNumber.trim() || phoneNumber.length < 10) {
          Alert.alert('Error', 'Please enter a valid phone number');
          return false;
        }
        break;
      case 'till':
        if (!tillNumber.trim() || tillNumber.length < 5) {
          Alert.alert('Error', 'Please enter a valid till number');
          return false;
        }
        break;
      case 'paybill':
        if (!paybillNumber.trim() || !accountNumber.trim()) {
          Alert.alert('Error', 'Please enter both paybill number and account number');
          return false;
        }
        break;
      case 'bank':
        if (!selectedBank || !accountNumber.trim()) {
          Alert.alert('Error', 'Please select a bank and enter account number');
          return false;
        }
        break;
      default:
        return false;
    }
    return true;
  };

  const getAccountDetails = () => {
    switch (accountType) {
      case 'mpesa':
        return {
          type: 'mpesa',
          phone_number: phoneNumber,
          display: `M-Pesa: ${phoneNumber}`
        };
      case 'airtel_money':
        return {
          type: 'airtel_money',
          phone_number: phoneNumber,
          display: `Airtel Money: ${phoneNumber}`
        };
      case 'till':
        return {
          type: 'till',
          till_number: tillNumber,
          display: `Till: ${tillNumber}`
        };
      case 'paybill':
        return {
          type: 'paybill',
          paybill_number: paybillNumber,
          account_number: accountNumber,
          display: `Paybill: ${paybillNumber} - Acc: ${accountNumber}`
        };
      case 'bank':
        return {
          type: 'bank',
          bank_name: selectedBank.name,
          bank_code: selectedBank.id,
          paybill_number: selectedBank.paybill,
          account_number: accountNumber,
          display: `${selectedBank.name} - Acc: ${accountNumber}`
        };
      default:
        return null;
    }
  };

  const handleSetWithdrawalWallet = async () => {
    if (!validateAccountDetails()) {
      return;
    }

    if (!withdrawalPassword || withdrawalPassword.length < 6) {
      Alert.alert('Error', 'Withdrawal password must be at least 6 characters');
      return;
    }

    if (withdrawalPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const accountDetails = getAccountDetails();
    if (!accountDetails) {
      Alert.alert('Error', 'Could not determine account details. Please review your inputs.');
      return;
    }

    setIsSettingWallet(true);
    try {
      const success = await updateWithdrawalAccount(accountType, accountDetails, withdrawalPassword);
      if (success) {
        await loadUserData();
        setShowPasswordForm(false);
        setWithdrawalPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', 'Failed to set withdrawal wallet. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to set withdrawal wallet. Please try again.');
    } finally {
      setIsSettingWallet(false);
    }
  };

  const renderAccountTypeFields = () => {
    switch (accountType) {
      case 'mpesa':
        return (
          <View>
            <Text style={styles.inputLabel}>M-Pesa Phone Number</Text>
            <View style={styles.inputContainer}>
              <SafeIonicons name="phone-portrait" size={20} color="#00A651" />
              <TextInput
                style={styles.input}
                placeholder="0712345678"
                placeholderTextColor={colors.gray500}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            <Text style={styles.helperText}>Enter your M-Pesa registered phone number</Text>
          </View>
        );

      case 'airtel_money':
        return (
          <View>
            <Text style={styles.inputLabel}>Airtel Money Phone Number</Text>
            <View style={styles.inputContainer}>
              <SafeIonicons name="phone-portrait" size={20} color="#FF0000" />
              <TextInput
                style={styles.input}
                placeholder="0712345678"
                placeholderTextColor={colors.gray500}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            <Text style={styles.helperText}>Enter your Airtel Money registered phone number</Text>
          </View>
        );

      case 'till':
        return (
          <View>
            <Text style={styles.inputLabel}>Till Number</Text>
            <View style={styles.inputContainer}>
              <SafeIonicons name="business" size={20} color="#1976D2" />
              <TextInput
                style={styles.input}
                placeholder="123456"
                placeholderTextColor={colors.gray500}
                value={tillNumber}
                onChangeText={setTillNumber}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
            <Text style={styles.helperText}>Enter the till number for payments</Text>
          </View>
        );

      case 'paybill':
        return (
          <View>
            <Text style={styles.inputLabel}>Paybill Number</Text>
            <View style={styles.inputContainer}>
              <SafeIonicons name="receipt" size={20} color="#FF9800" />
              <TextInput
                style={styles.input}
                placeholder="123456"
                placeholderTextColor={colors.gray500}
                value={paybillNumber}
                onChangeText={setPaybillNumber}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
            
            <Text style={styles.inputLabel}>Account Number</Text>
            <View style={styles.inputContainer}>
              <SafeIonicons name="card" size={20} color="#FF9800" />
              <TextInput
                style={styles.input}
                placeholder="Account Number"
                placeholderTextColor={colors.gray500}
                value={accountNumber}
                onChangeText={setAccountNumber}
                maxLength={20}
              />
            </View>
            <Text style={styles.helperText}>Enter paybill number and your account number</Text>
          </View>
        );

      case 'bank':
        return (
          <View>
            <Text style={styles.inputLabel}>Select Bank</Text>
            <TouchableOpacity
              style={styles.bankSelector}
              onPress={() => setShowBankModal(true)}
            >
              <SafeIonicons name="card" size={20} color="#4CAF50" />
              <Text style={[styles.bankSelectorText, !selectedBank && styles.placeholderText]}>
                {selectedBank ? selectedBank.name : 'Select your bank'}
              </Text>
              <SafeIonicons name="chevron-down" size={20} color={colors.gray500} />
            </TouchableOpacity>
            
            {selectedBank && (
              <View style={styles.bankInfo}>
                <Text style={styles.bankInfoText}>
                  Paybill: {selectedBank.paybill}
                </Text>
              </View>
            )}
            
            <Text style={styles.inputLabel}>Account Number</Text>
            <View style={styles.inputContainer}>
              <SafeIonicons name="card" size={20} color="#4CAF50" />
              <TextInput
                style={styles.input}
                placeholder="Enter your account number"
                placeholderTextColor={colors.gray500}
                value={accountNumber}
                onChangeText={setAccountNumber}
                maxLength={20}
              />
            </View>
            <Text style={styles.helperText}>
              {selectedBank ? `Enter your ${selectedBank.name} account number` : 'Select a bank first'}
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <SafeIonicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{APP_NAME} Personal Information</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* User Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Details</Text>
          
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <SafeIonicons name="person" size={20} color={colors.blue500} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{displayName}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <SafeIonicons name="mail" size={20} color={colors.blue500} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{displayEmail}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <SafeIonicons name="call" size={20} color={colors.blue500} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{displayPhone}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <SafeIonicons name="calendar" size={20} color={colors.blue500} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>{memberSince}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Withdrawal Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Withdrawal Details</Text>
          
          <View style={styles.card}>
            {storedAccountDisplay && !showPasswordForm ? (
              <View>
                <View style={styles.successBanner}>
                  <SafeIonicons name="checkmark-circle" size={24} color={colors.success} />
                  <Text style={styles.successText}>Withdrawal wallet is set and secured</Text>
                </View>
                
                <View style={[styles.infoRow, styles.editContainer]}>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Withdrawal Account</Text>
                    <Text style={styles.infoValue}>
                      Set ✓
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => setShowPasswordForm(true)}
                  >
                    <SafeIonicons name="create" size={16} color={colors.blue500} />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.warningText}>
                  ⚠️ This withdrawal account can only be changed by contacting customer support for security reasons.
                </Text>
              </View>
            ) : (
              <View>
                <View style={styles.warningBanner}>
                  <SafeIonicons name="warning" size={24} color={colors.warning} />
                  <Text style={styles.warningBannerText}>
                    You must set up your withdrawal wallet before making any withdrawals
                  </Text>
                </View>
                
                <Text style={styles.formTitle}>Set Withdrawal Account</Text>
                
                {/* Account Type Selection */}
                <Text style={styles.inputLabel}>Payment Method</Text>
                <View style={styles.accountTypeContainer}>
                  {accountTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.accountTypeButton,
                        accountType === type.id && styles.accountTypeButtonActive
                      ]}
                      onPress={() => setAccountType(type.id)}
                    >
                      <View style={[styles.typeIconContainer, { backgroundColor: type.color + '20' }]}>
                        <SafeIonicons 
                          name={type.icon} 
                          size={20} 
                          color={accountType === type.id ? colors.white : type.color} 
                        />
                      </View>
                      <Text style={[
                        styles.accountTypeText,
                        accountType === type.id && styles.accountTypeTextActive
                      ]}>
                        {type.label}
                      </Text>
                      {accountType === type.id && (
                        <SafeIonicons name="checkmark-circle" size={20} color={colors.white} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                
                {/* Dynamic Account Details Fields */}
                {renderAccountTypeFields()}
                
                {/* Withdrawal Password */}
                <Text style={styles.inputLabel}>Withdrawal Password</Text>
                <View style={styles.inputContainer}>
                  <SafeIonicons name="lock-closed" size={20} color={colors.blue500} />
                  <TextInput
                    style={styles.input}
                    placeholder="Create withdrawal password"
                    placeholderTextColor={colors.gray500}
                    value={withdrawalPassword}
                    onChangeText={setWithdrawalPassword}
                    secureTextEntry
                  />
                </View>
                
                {/* Confirm Password */}
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <SafeIonicons name="lock-closed" size={20} color={colors.blue500} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm withdrawal password"
                    placeholderTextColor={colors.gray500}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>
                
                <TouchableOpacity
                  style={[styles.setWalletButton, isSettingWallet && styles.setWalletButtonDisabled]}
                  onPress={handleSetWithdrawalWallet}
                  disabled={isSettingWallet}
                >
                  <Text style={styles.setWalletButtonText}>
                    {isSettingWallet ? 'Setting Wallet...' : 'Set Withdrawal Wallet'}
                  </Text>
                </TouchableOpacity>
                
                <Text style={styles.securityNote}>
                  🔒 Your withdrawal password will be required for all withdrawal requests. 
                  Keep it secure and don't share it with anyone.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bank Selection Modal */}
      <Modal
        visible={showBankModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBankModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Bank</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowBankModal(false)}
              >
                <SafeIonicons name="close" size={24} color={colors.gray600} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={banks}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.bankItem,
                    selectedBank?.id === item.id && styles.selectedBankItem
                  ]}
                  onPress={() => {
                    setSelectedBank(item);
                    setShowBankModal(false);
                  }}
                >
                  <View style={styles.bankItemContent}>
                    <Text style={styles.bankName}>{item.name}</Text>
                    <Text style={styles.bankPaybill}>Paybill: {item.paybill}</Text>
                  </View>
                  {selectedBank?.id === item.id && (
                    <SafeIonicons name="checkmark-circle" size={24} color={colors.success} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  infoContent: {
    marginLeft: spacing.md,
    flex: 1,
  },
  infoLabel: {
    fontSize: fontSizes.sm,
    color: colors.gray600,
    marginBottom: spacing.xs / 2,
  },
  infoValue: {
    fontSize: fontSizes.md,
    color: colors.textDark,
    fontWeight: '500',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  successText: {
    marginLeft: spacing.sm,
    fontSize: fontSizes.md,
    color: colors.success,
    fontWeight: '600',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  warningBannerText: {
    marginLeft: spacing.sm,
    fontSize: fontSizes.sm,
    color: colors.warning,
    fontWeight: '500',
    flex: 1,
  },
  warningText: {
    fontSize: fontSizes.sm,
    color: colors.warning,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  formTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  accountTypeContainer: {
    marginBottom: spacing.md,
  },
  accountTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray300,
    marginBottom: spacing.sm,
  },
  accountTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  accountTypeText: {
    marginLeft: spacing.sm,
    fontSize: fontSizes.md,
    color: colors.textDark,
  },
  accountTypeTextActive: {
    color: colors.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    height: 50,
    marginLeft: spacing.sm,
    fontSize: fontSizes.md,
    color: colors.textDark,
  },
  setWalletButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.sm,
  },
  setWalletButtonDisabled: {
    opacity: 0.6,
  },
  setWalletButtonText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  securityNote: {
    fontSize: fontSizes.sm,
    color: colors.gray600,
    marginTop: spacing.md,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Enhanced payment method styles
  typeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  helperText: {
    fontSize: fontSizes.xs,
    color: colors.gray500,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  bankSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    height: 50,
    marginBottom: spacing.sm,
  },
  bankSelectorText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSizes.md,
    color: colors.textDark,
  },
  placeholderText: {
    color: colors.gray500,
  },
  bankInfo: {
    backgroundColor: colors.blue50,
    padding: spacing.sm,
    borderRadius: 6,
    marginBottom: spacing.md,
  },
  bankInfoText: {
    fontSize: fontSizes.sm,
    color: colors.blue700,
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  modalTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  selectedBankItem: {
    backgroundColor: colors.blue50,
  },
  bankItemContent: {
    flex: 1,
  },
  bankName: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: spacing.xs / 2,
  },
  editContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.blue50,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: fontSizes.sm,
    color: colors.blue500,
    marginLeft: spacing.xs / 2,
    fontWeight: '500',
  },
});

export default PersonalInfoScreen;
