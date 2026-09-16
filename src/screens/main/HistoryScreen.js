import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Platform,
  ScrollView,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../../components/SafeIonicons';
import { useUser } from '../../context/SupabaseUserContext';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';

const PAGE_SIZE = 30;

const HistoryScreen = ({ navigation }) => {
  const { profile, transactions, loadUserData } = useUser();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'deposits', 'withdrawals', 'earnings', 'investments'
  const [refreshing, setRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(30);

  // Dedupe by id — realtime updates can prepend a row that already exists,
  // and duplicate keys make FlatList render unreliably (entries "vanish").
  const seen = new Set();
  const allTransactions = (Array.isArray(transactions) ? transactions : [])
    .filter((t) => {
      if (!t || t.id == null || seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });

  // Pull-to-refresh refetches the FULL history (unbounded) so nothing is lost
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (typeof loadUserData === 'function') await loadUserData();
    } catch (e) {
      console.warn('History refresh failed:', e?.message);
    } finally {
      setRefreshing(false);
    }
  }, [loadUserData]);
  
  // Filter transactions based on active tab
  const getFilteredTransactions = () => {
    switch (activeTab) {
      case 'deposits':
        return allTransactions.filter(tx => tx.type === 'DEPOSIT');
      case 'withdrawals':
        // Don't show withdrawal requests in transactions - only actual withdrawal transactions after approval
        return allTransactions.filter(tx => tx.type === 'WITHDRAWAL' && tx.status === 'completed');
      case 'earnings':
        return allTransactions.filter(tx => 
          tx.type === 'TASK_EARNING' || 
          tx.type === 'REFERRAL_BONUS' || 
          tx.type === 'REFERRAL_COMMISSION' ||
          tx.type === 'SPIN_WIN' ||
          tx.type === 'GIFT_CODE'
        );
      case 'investments':
        return allTransactions.filter(tx => tx.type === 'INVESTMENT' || tx.type === 'INVESTMENT_RETURN');
      default:
        return allTransactions.filter(tx => tx.type !== 'WITHDRAWAL_REQUEST');
    }
  };
  
  const filteredTransactions = getFilteredTransactions();
  const visibleTransactions = filteredTransactions.slice(0, visibleCount);
  
  // Tab item component
  const TabItem = ({ name, label, icon }) => {
    const isActive = activeTab === name;
    
    return (
      <TouchableOpacity
        style={[styles.tab, isActive && styles.activeTab]}
        onPress={() => setActiveTab(name)}
      >
        <SafeIonicons 
          name={icon} 
          size={16} 
          color={isActive ? colors.white : colors.blue300} 
        />
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Get icon and color based on transaction type
  const getTransactionIconAndColor = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return { icon: 'arrow-down', color: colors.green };
      case 'WITHDRAWAL':
        return { icon: 'arrow-up', color: colors.red };
      case 'TASK_EARNING':
        return { icon: 'checkbox', color: colors.blue600 };
      case 'REFERRAL_COMMISSION':
        return { icon: 'people', color: colors.purple };
      case 'INVESTMENT':
        return { icon: 'trending-up', color: colors.teal };
      case 'INVESTMENT_RETURN':
        return { icon: 'cash', color: colors.amber };
      case 'LEVEL_PURCHASE':
        return { icon: 'star', color: colors.orange };
      case 'SPIN_BET':
        return { icon: 'refresh-circle', color: colors.pink };
      case 'TRANSFER':
        return { icon: 'swap-horizontal', color: colors.indigo };
      default:
        return { icon: 'ellipsis-horizontal', color: colors.gray600 };
    }
  };
  
  // Render transaction item
  const renderTransactionItem = ({ item }) => {
    const { icon, color } = getTransactionIconAndColor(item.type);
    const isPositive = item.netAmount ?? item.amount > 0;
    const displayAmount = (item.netAmount ?? item.amount ?? 0).toLocaleString();
    const description = item.description || 'No description';
    const timestamp = item.timestamp || new Date().toISOString();
    
    return (
      <View style={styles.transactionItem}>
        <View style={[styles.transactionIconContainer, { backgroundColor: color }]}>
          <SafeIonicons name={icon} size={20} color={colors.white} />
        </View>
        
        <View style={styles.transactionInfo}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionType}>{item.type.replace(/_/g, ' ')}</Text>
            <Text 
              style={[
                styles.transactionAmount,
                isPositive ? styles.positiveAmount : styles.negativeAmount
              ]}
            >
              {isPositive ? '+' : ''}{displayAmount} KES
            </Text>
          </View>
          
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionDescription}>{description}</Text>
            <Text style={styles.transactionDate}>{formatDate(timestamp)}</Text>
          </View>
        </View>
      </View>
    );
  };
  
  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <SafeIonicons name="document-text-outline" size={60} color={colors.blue300} />
      <Text style={styles.emptyStateTitle}>No Transactions Found</Text>
      <Text style={styles.emptyStateText}>
        Transactions matching your current filter will appear here.
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
        
        <Text style={styles.headerTitle}>Transaction History</Text>
        
        <View style={{ width: 24 }} />
      </View>
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollableTabs>
          <TabItem name="all" label="All" icon="list-outline" />
          <TabItem name="deposits" label="Deposits" icon="arrow-down-outline" />
          <TabItem name="withdrawals" label="Withdrawals" icon="arrow-up-outline" />
          <TabItem name="earnings" label="Earnings" icon="cash-outline" />
          <TabItem name="investments" label="Investments" icon="trending-up-outline" />
        </ScrollableTabs>
      </View>
      
      {/* Transaction List — full history, paginated rendering with infinite scroll */}
      <FlatList
        data={visibleTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item, idx) => `${item.id ?? idx}`}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<EmptyState />}
        onEndReached={() => setVisibleCount((c) => c + 30)}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.white}
            titleColor={colors.white}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
};

// Scrollable tabs component
const ScrollableTabs = ({ children }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.scrollableTabs}
  >
    {React.Children.toArray(children).map(child => child)}
  </ScrollView>
);

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
  // Tabs styles
  tabsContainer: {
    marginBottom: spacing.md,
  },
  scrollableTabs: {
    paddingHorizontal: spacing.lg,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabText: {
    fontSize: fontSizes.sm,
    color: colors.blue300,
    marginLeft: 4,
  },
  activeTabText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  // List styles
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl * 2, // Extra space for bottom nav
  },
  transactionItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionType: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.white,
  },
  transactionAmount: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  positiveAmount: {
    color: colors.green,
  },
  negativeAmount: {
    color: colors.red,
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionDescription: {
    fontSize: fontSizes.sm,
    color: colors.blue200,
    flex: 1,
    marginRight: spacing.sm,
  },
  transactionDate: {
    fontSize: fontSizes.xs,
    color: colors.blue300,
  },
  // Empty state styles
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: fontSizes.md,
    color: colors.blue300,
    textAlign: 'center',
  },
});

export default HistoryScreen;
