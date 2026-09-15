import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Share,
  Alert,
  StatusBar,
  Clipboard,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../../components/SafeIonicons';
import { useAuth } from '../../context/SupabaseAuthContext';
import { useUser } from '../../context/SupabaseUserContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { APP_NAME, APP_URL, APP_SHORT_NAME } from '../../constants/branding';
import LazyAsset from '../../components/LazyAsset';

const ReferralScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { profile } = useUser();
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  
  // Use referral_code from profile per requirement 3
  const referralCode = profile?.referral_code || user?.id || 'user123';
  const referralLink = `${APP_URL}/register?ref=${referralCode}`;
  
  // Referral message templates
  const messageTemplates = [
    `Hey! Join me on ${APP_NAME} and earn money daily through simple tasks and referrals. Use my referral link: ${referralLink}`,
    `Looking for an easy way to earn money? I'm using ${APP_NAME} and it's amazing! Sign up with my link: ${referralLink}`,
    `Want to make some extra cash? ${APP_SHORT_NAME} lets you earn through daily tasks and referrals. Join with my link: ${referralLink}`,
  ];
  
  // Copy referral link to clipboard
  const copyReferralLink = () => {
    Clipboard.setString(referralLink);
    Alert.alert('Success', 'Referral link copied to clipboard!');
  };
  
  // Share referral link
  const shareReferralLink = async () => {
    try {
      await Share.share({
        message: messageTemplates[selectedTemplate],
        title: `Join ${APP_NAME}`
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share referral link.');
    }
  };
  
  // Commission structure
  const commissionStructure = [
    { level: 'Level 1 (Direct)', amount: 300, description: 'For every direct referral that activates their account' },
    { level: 'Level 2 (Indirect)', amount: 100, description: 'When your direct referrals bring in new users' },
    { level: 'Level 3 (Network)', amount: 50, description: 'From the extended network of your referrals' },
  ];
  
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
        
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
            style={styles.heroCard}
          >
            <LazyAsset style={styles.heroImage}>
              <Image
                source={{ uri: 'https://img.icons8.com/fluency/96/000000/gift.png' }}
                style={styles.heroImage}
              />
            </LazyAsset>
            
            <Text style={styles.heroTitle}>Invite Friends & Earn Together</Text>
            
            <Text style={styles.heroSubtitle}>
              Earn commissions up to 3 levels deep when your referrals join and activate their accounts
            </Text>
          </LinearGradient>
        </View>
        
        {/* Referral Link Section */}
        <View style={styles.referralLinkSection}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.linkCard}
          >
            <Text style={styles.sectionTitle}>Your Referral Link</Text>
            
            <View style={styles.linkContainer}>
              <Text style={styles.link} numberOfLines={1}>
                {referralLink}
              </Text>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={copyReferralLink}
              >
                <LinearGradient
                  colors={[colors.blue600, colors.blue800]}
                  style={styles.buttonGradient}
                >
                  <SafeIonicons name="copy-outline" size={18} color={colors.white} />
                  <Text style={styles.buttonText}>Copy Link</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.shareButton}
                onPress={shareReferralLink}
              >
                <LinearGradient
                  colors={[colors.purple, colors.deepPurple]}
                  style={styles.buttonGradient}
                >
                  <SafeIonicons name="share-social-outline" size={18} color={colors.white} />
                  <Text style={styles.buttonText}>Share Link</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
        
        {/* Share Message Templates */}
        <View style={styles.templateSection}>
          <Text style={styles.sectionTitle}>Share Message Templates</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.templatesContainer}
          >
            {messageTemplates.map((template, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.templateCard,
                  selectedTemplate === index && styles.selectedTemplateCard
                ]}
                onPress={() => setSelectedTemplate(index)}
              >
                <Text style={styles.templateText} numberOfLines={4}>
                  {template}
                </Text>
                
                {selectedTemplate === index && (
                  <View style={styles.selectedIndicator}>
                    <SafeIonicons name="checkmark-circle" size={24} color={colors.success} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Commission Structure */}
        <View style={styles.commissionSection}>
          <Text style={styles.sectionTitle}>Commission Structure</Text>
          
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.commissionCard}
          >
            {commissionStructure.map((item, index) => (
              <View 
                key={index} 
                style={[
                  styles.commissionItem,
                  index < commissionStructure.length - 1 && styles.commissionItemBorder
                ]}
              >
                <View style={styles.commissionHeader}>
                  <View style={[
                    styles.levelIndicator,
                    { backgroundColor: index === 0 ? colors.green : index === 1 ? colors.blue500 : colors.purple }
                  ]}>
                    <Text style={styles.levelText}>L{index + 1}</Text>
                  </View>
                  
                  <Text style={styles.commissionLevel}>{item.level}</Text>
                  
                  <Text style={styles.commissionAmount}>KES {item.amount}</Text>
                </View>
                
                <Text style={styles.commissionDescription}>{item.description}</Text>
              </View>
            ))}
          </LinearGradient>
        </View>
        
        {/* Referral Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Referral Tips</Text>
          
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.tipsCard}
          >
            <View style={styles.tipItem}>
              <View style={styles.tipIconContainer}>
                <SafeIonicons name="people-outline" size={20} color={colors.white} />
              </View>
              <Text style={styles.tipText}>
                Share with friends who are interested in making extra income
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <View style={styles.tipIconContainer}>
                <SafeIonicons name="chatbubble-ellipses-outline" size={20} color={colors.white} />
              </View>
              <Text style={styles.tipText}>
                Explain the benefits of using the app, such as daily tasks and investment opportunities
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <View style={styles.tipIconContainer}>
                <SafeIonicons name="help-circle-outline" size={20} color={colors.white} />
              </View>
              <Text style={styles.tipText}>
                Offer to help them get started and answer any questions they may have
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <View style={styles.tipIconContainer}>
                <SafeIonicons name="share-social-outline" size={20} color={colors.white} />
              </View>
              <Text style={styles.tipText}>
                Share your success stories on social media to attract more referrals
              </Text>
            </View>
          </LinearGradient>
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
  // Hero Section styles
  heroSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroCard: {
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  heroImage: {
    width: 80,
    height: 80,
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: fontSizes.md,
    color: colors.blue200,
    textAlign: 'center',
  },
  // Referral Link Section styles
  referralLinkSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  linkCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  linkContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  link: {
    fontSize: fontSizes.md,
    color: colors.white,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  copyButton: {
    flex: 1,
    marginRight: spacing.sm,
    borderRadius: 8,
    overflow: 'hidden',
  },
  shareButton: {
    flex: 1,
    marginLeft: spacing.sm,
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  buttonText: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.xs,
  },
  // Template Section styles
  templateSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  templatesContainer: {
    paddingBottom: spacing.sm,
  },
  templateCard: {
    width: 250,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: spacing.md,
    marginRight: spacing.md,
    ...shadows.sm,
  },
  selectedTemplateCard: {
    backgroundColor: 'rgba(25,118,210,0.3)',
    borderWidth: 1,
    borderColor: colors.blue400,
  },
  templateText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    lineHeight: 20,
  },
  selectedIndicator: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  // Commission Structure styles
  commissionSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  commissionCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  commissionItem: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
  },
  commissionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  commissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  levelIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  levelText: {
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
    color: colors.white,
  },
  commissionLevel: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
    flex: 1,
  },
  commissionAmount: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.green,
  },
  commissionDescription: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    marginLeft: 38, // To align with level text
  },
  // Tips Section styles
  tipsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl * 2, // Extra space for bottom nav
  },
  tipsCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.md,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  tipIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  tipText: {
    fontSize: fontSizes.sm,
    color: colors.white,
    flex: 1,
  },
});

export default ReferralScreen;
