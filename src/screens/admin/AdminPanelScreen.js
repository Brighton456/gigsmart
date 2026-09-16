import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
  Platform,
  RefreshControl,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../../components/SafeIonicons';
import { useUser } from '../../context/SupabaseUserContext';
import { useAuth } from '../../context/SupabaseAuthContext';
import PlatformAlert from '../../utils/platformAlert';
import adminService from '../../services/adminService';
import {
  ADMIN_PRIVILEGES,
  ROLE_PRESETS,
  PRIVILEGE_COUNT,
  hasPrivilege,
} from '../../constants/adminPermissions';
import { colors, gradients, spacing, fontSizes, shadows } from '../../constants/theme';
import { RevenueDashboard, AnnouncementsSection, PlatformConfigSection, PwaInsightsSection, ReportCenter, ADMIN_COLORS } from './AdminSections';

const fmtKES = (n) => `KES ${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString() : '—');

// ---------- Shared bits ---------------------------------------------------

const Badge = ({ text, tone = 'blue' }) => {
  const tones = {
    blue: { bg: 'rgba(35,118,230,0.25)', fg: colors.blue300 },
    green: { bg: 'rgba(0,200,83,0.2)', fg: colors.success },
    red: { bg: 'rgba(213,0,0,0.2)', fg: colors.error },
    amber: { bg: 'rgba(255,214,0,0.18)', fg: colors.warning },
    gray: { bg: 'rgba(255,255,255,0.12)', fg: colors.blue200 },
  };
  const t = tones[tone] || tones.blue;
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.badgeText, { color: t.fg }]}>{text}</Text>
    </View>
  );
};

const SectionCard = ({ title, icon, children, right }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionCardHeader}>
      <View style={styles.sectionCardTitleRow}>
        {icon ? <SafeIonicons name={icon} size={18} color={colors.blue300} /> : null}
        <Text style={styles.sectionCardTitle}>{title}</Text>
      </View>
      {right}
    </View>
    {children}
  </View>
);

const ActionButton = ({ label, onPress, tone = 'primary', disabled, small }) => {
  const tones = {
    primary: { bg: colors.primary, fg: colors.white },
    success: { bg: colors.success, fg: colors.white },
    danger: { bg: colors.error, fg: colors.white },
    ghost: { bg: 'rgba(255,255,255,0.12)', fg: colors.blue100 },
  };
  const t = tones[tone] || tones.primary;
  return (
    <TouchableOpacity
      style={[styles.actionBtn, { backgroundColor: t.bg }, small && styles.actionBtnSmall, disabled && { opacity: 0.4 }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.actionBtnText, { color: t.fg }, small && styles.actionBtnTextSmall]}>{label}</Text>
    </TouchableOpacity>
  );
};

const Field = ({ label, value, onChangeText, placeholder, keyboardType, multiline }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.gray500}
      keyboardType={keyboardType || 'default'}
      multiline={multiline}
    />
  </View>
);

const EmptyState = ({ icon = 'folder-open-outline', text }) => (
  <View style={styles.emptyState}>
    <SafeIonicons name={icon} size={36} color={colors.blue600} />
    <Text style={styles.emptyText}>{text}</Text>
  </View>
);

// ---------- Main screen ---------------------------------------------------

// Grouped menu — dropdown groups in the header expand into the pages inside.
const MENU = [
  {
    group: 'Overview', icon: 'grid', items: [
      { key: 'dashboard', label: 'Dashboard', icon: 'grid', priv: 'dashboard.view' },
      { key: 'revenue', label: 'Revenue & Money', icon: 'trending-up', priv: 'dashboard.financial' },
      { key: 'reports', label: 'Report Center', icon: 'download', priv: 'reports.view' },
    ],
  },
  {
    group: 'People', icon: 'people', items: [
      { key: 'users', label: 'Users', icon: 'person', priv: 'users.view' },
      { key: 'roles', label: 'Admins & Roles', icon: 'ribbon', priv: 'roles.view' },
    ],
  },
  {
    group: 'Money Ops', icon: 'cash', items: [
      { key: 'withdrawals', label: 'Withdrawals', icon: 'cash', priv: 'withdrawals.view' },
      { key: 'transactions', label: 'Transactions', icon: 'swap-horizontal', priv: 'transactions.view' },
    ],
  },
  {
    group: 'Content', icon: 'megaphone', items: [
      { key: 'announcements', label: 'Announcements', icon: 'megaphone', priv: 'notifications.view' },
      { key: 'levels', label: 'Levels & Packages', icon: 'layers', priv: 'levels.view' },
      { key: 'gifts', label: 'Gift Codes', icon: 'gift', priv: 'gifts.view' },
    ],
  },
  {
    group: 'Platform', icon: 'settings', items: [
      { key: 'config', label: 'Platform Config', icon: 'construct', priv: 'settings.view' },
      { key: 'pwa', label: 'PWA & Installs', icon: 'phone-portrait', priv: 'pwa.stats' },
      { key: 'settings', label: 'Raw Settings', icon: 'settings', priv: 'settings.view' },
    ],
  },
  {
    group: 'Security', icon: 'shield-checkmark', items: [
      { key: 'audit', label: 'Audit Log', icon: 'shield-checkmark', priv: 'audit.view' },
    ],
  },
];

const FLAT_TABS = MENU.flatMap((g) => g.items);

const AdminPanelScreen = ({ navigation }) => {
  const { profile, refreshProfile } = useUser();
  const { user } = useAuth();

  const isSuper = profile?.admin_role === 'super_admin';
  const isAdmin = isSuper || profile?.admin_role === 'admin';

  const can = useCallback(
    (key) => isSuper || (profile?.admin_role === 'admin' && hasPrivilege(profile?.admin_permissions, key)),
    [isSuper, profile?.admin_role, profile?.admin_permissions]
  );

  const visibleTabs = useMemo(
    () => FLAT_TABS.filter((t) => !t.priv || can(t.priv)),
    [can]
  );

  const [tab, setTab] = useState(visibleTabs[0]?.key || 'dashboard');
  const [openMenu, setOpenMenu] = useState(null); // dropdown group currently expanded
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Data
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [wdStatus, setWdStatus] = useState('pending');
  const [transactions, setTransactions] = useState([]);
  const [settings, setSettings] = useState([]);
  const [levels, setLevels] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [admins, setAdmins] = useState([]);

  // Modals
  const [walletModal, setWalletModal] = useState(null); // { user }
  const [walletForm, setWalletForm] = useState({ wallet: 'recharge', amount: '', reason: '' });
  const [settingEdit, setSettingEdit] = useState(null); // { key, value }
  const [settingValue, setSettingValue] = useState('');
  const [levelEdit, setLevelEdit] = useState(null);
  const [giftForm, setGiftForm] = useState({ code: '', type: 'income_wallet', income: '', main: '', maxUses: '1' });
  const [grantForm, setGrantForm] = useState({ email: '', preset: 'finance' });

  useEffect(() => {
    adminService.currentProfile = profile;
  }, [profile]);

  const loadTab = useCallback(async (which, isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      if (which === 'dashboard') {
        const { data } = await adminService.getDashboardStats();
        setStats(data);
      } else if (which === 'users') {
        const { data } = await adminService.listUsers({ search: userSearch });
        setUsers(data || []);
      } else if (which === 'withdrawals') {
        const { data } = await adminService.listWithdrawals({ status: wdStatus });
        setWithdrawals(data || []);
      } else if (which === 'transactions') {
        const { data } = await adminService.listTransactions({ limit: 60 });
        setTransactions(data || []);
      } else if (which === 'settings') {
        const { data } = await adminService.getSettings();
        setSettings(data || []);
      } else if (which === 'levels') {
        const { data } = await adminService.getLevels();
        setLevels(data || []);
      } else if (which === 'gifts') {
        const { data } = await adminService.getGiftCodes();
        setGifts(data || []);
      } else if (which === 'audit') {
        const { data } = await adminService.getAuditLogs({ limit: 100 });
        setAuditLogs(data || []);
      } else if (which === 'roles') {
        const { data } = await adminService.listUsers({ limit: 200 });
        setAdmins((data || []).filter((u) => u.admin_role && u.admin_role !== 'user'));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userSearch, wdStatus]);

  useEffect(() => {
    if (isAdmin) loadTab(tab);
  }, [tab, isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isAdmin) {
    return (
      <LinearGradient colors={gradients.primary} style={styles.container}>
        <View style={styles.centerWrap}>
          <SafeIonicons name="lock-closed" size={48} color={colors.blue400} />
          <Text style={styles.noAccessTitle}>Access Denied</Text>
          <Text style={styles.noAccessText}>
            This area is restricted to administrators. If you believe you should have access, contact a super admin.
          </Text>
          <ActionButton label="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </LinearGradient>
    );
  }

  // ---- User detail ----------------------------------------------------------
  const openUser = async (u) => {
    setSelectedUser(u);
    setUserDetails(null);
    const res = await adminService.getUserDetails(u.id);
    setUserDetails(res);
  };

  const submitWalletAdjust = async () => {
    const amount = parseFloat(walletForm.amount);
    if (!Number.isFinite(amount) || amount === 0) {
      PlatformAlert.alert('Invalid Amount', 'Enter a non-zero amount. Use a negative value to debit.');
      return;
    }
    if (!walletForm.reason.trim()) {
      PlatformAlert.alert('Reason Required', 'Describe why this adjustment is being made (recorded in the audit log).');
      return;
    }
    const { error } = await adminService.adjustWallet(
      walletModal.id, walletForm.wallet, amount, walletForm.reason.trim(), profile
    );
    if (error) {
      PlatformAlert.alert('Adjustment Failed', error.message || 'Could not update the wallet.');
    } else {
      PlatformAlert.alert('Wallet Updated', `${fmtKES(Math.abs(amount))} ${amount >= 0 ? 'credited to' : 'debited from'} the ${walletForm.wallet} wallet.`);
      setWalletModal(null);
      setWalletForm({ wallet: 'recharge', amount: '', reason: '' });
      loadTab('users');
    }
  };

  const toggleUserActive = async (u) => {
    const { error } = await adminService.setUserActive(u.id, !u.is_active, profile);
    if (error) PlatformAlert.alert('Failed', error.message);
    else {
      loadTab('users');
      if (selectedUser?.id === u.id) openUser({ ...u, is_active: !u.is_active });
    }
  };

  const setRole = async (u, role, presetPerms) => {
    const { error } = await adminService.setAdminRole(u.id, role, presetPerms, profile);
    if (error) PlatformAlert.alert('Failed', error.message);
    else {
      PlatformAlert.alert('Role Updated', `${u.email} is now ${role === 'user' ? 'a regular user' : role.replace('_', ' ')}.`);
      loadTab('roles');
    }
  };

  const grantAdmin = async () => {
    const email = grantForm.email.trim().toLowerCase();
    if (!email) {
      PlatformAlert.alert('Email Required', 'Enter the email of the user to promote.');
      return;
    }
    const { data: found, error: findErr } = await adminService.findUserByEmail(email);
    if (findErr || !found) {
      PlatformAlert.alert('Not Found', `No user found with email ${email}.`);
      return;
    }
    const preset = ROLE_PRESETS[grantForm.preset];
    const { error } = await adminService.setAdminRole(found.id, 'admin', preset.permissions, profile);
    if (error) PlatformAlert.alert('Failed', error.message);
    else {
      PlatformAlert.alert('Admin Granted', `${email} is now a ${preset.label}.`);
      setGrantForm({ email: '', preset: 'finance' });
      loadTab('roles');
    }
  };

  // ---- Withdrawal actions ------------------------------------------------------
  const actOnWithdrawal = async (wd, decision) => {
    PlatformAlert.alert(
      'Confirm',
      `${decision === 'approved' ? 'Approve' : decision === 'rejected' ? 'Reject' : 'Mark ' + decision} withdrawal of ${fmtKES(wd.amount)} for ${wd.user_email || wd.user_phone || 'user'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const { error } = await adminService.processWithdrawal(wd.id, decision, profile);
            if (error) PlatformAlert.alert('Failed', error.message);
            else loadTab('withdrawals');
          },
        },
      ]
    );
  };

  // ---- Settings / levels / gifts ----------------------------------------------
  const saveSetting = async () => {
    const { error } = await adminService.updateSetting(settingEdit.key, settingValue, profile);
    if (error) PlatformAlert.alert('Failed', error.message);
    else {
      setSettingEdit(null);
      loadTab('settings');
    }
  };

  const saveLevel = async () => {
    const updates = {};
    if (levelEdit.cost !== '') updates.cost = parseFloat(levelEdit.cost);
    if (levelEdit.tasks !== '') updates.tasks = parseInt(levelEdit.tasks, 10);
    if (levelEdit.earnings !== '') updates.earnings_per_task = parseFloat(levelEdit.earnings);
    const { error } = await adminService.updateLevel(levelEdit.id, updates, profile);
    if (error) PlatformAlert.alert('Failed', error.message || 'Could not update the level.');
    else {
      setLevelEdit(null);
      loadTab('levels');
    }
  };

  const createGift = async () => {
    const { code, type, income, main, maxUses } = giftForm;
    if (!code.trim()) {
      PlatformAlert.alert('Code Required', 'Enter a gift code.');
      return;
    }
    const { error } = await adminService.createGiftCode(
      code.trim(), type, parseFloat(income) || 0, parseFloat(main) || 0, parseInt(maxUses, 10) || 1, profile
    );
    if (error) PlatformAlert.alert('Failed', error.message || 'Could not create the gift code.');
    else {
      PlatformAlert.alert('Gift Code Created', `${code.trim().toUpperCase()} is now live.`);
      setGiftForm({ code: '', type: 'income_wallet', income: '', main: '', maxUses: '1' });
      loadTab('gifts');
    }
  };

  // ---- Renderers ---------------------------------------------------------------

  const renderDashboard = () => (
    <View>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <SafeIonicons name="people" size={22} color={colors.blue300} />
          <Text style={styles.statValue}>{stats?.total_users ?? '—'}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <SafeIonicons name="swap-horizontal" size={22} color={colors.blue300} />
          <Text style={styles.statValue}>{stats?.total_transactions ?? '—'}</Text>
          <Text style={styles.statLabel}>Transactions</Text>
        </View>
        <View style={styles.statCard}>
          <SafeIonicons name="hourglass" size={22} color={colors.warning} />
          <Text style={styles.statValue}>{stats?.pending_withdrawals ?? '—'}</Text>
          <Text style={styles.statLabel}>Pending Withdrawals</Text>
        </View>
        <View style={styles.statCard}>
          <SafeIonicons name="shield-checkmark" size={22} color={colors.success} />
          <Text style={styles.statValue}>{PRIVILEGE_COUNT}</Text>
          <Text style={styles.statLabel}>Privileges Defined</Text>
        </View>
      </View>

      <SectionCard title="Your Access" icon="ribbon">
        <View style={styles.accessRow}>
          <Badge text={isSuper ? 'SUPER ADMIN' : 'ADMIN'} tone={isSuper ? 'green' : 'blue'} />
          <Text style={styles.accessText}>
            {isSuper
              ? 'Full unrestricted access to every admin capability.'
              : `${(profile?.admin_permissions || []).length} of ${PRIVILEGE_COUNT} privileges granted.`}
          </Text>
        </View>
      </SectionCard>
    </View>
  );

  const renderUsers = () => (
    <View>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={userSearch}
          onChangeText={setUserSearch}
          placeholder="Search email, phone, name, code…"
          placeholderTextColor={colors.gray500}
          onSubmitEditing={() => loadTab('users')}
        />
        <ActionButton label="Search" small onPress={() => loadTab('users')} />
      </View>

      {users.length === 0 ? (
        <EmptyState text="No users found" />
      ) : (
        users.map((u) => (
          <TouchableOpacity key={u.id} style={styles.rowCard} onPress={() => openUser(u)}>
            <View style={styles.rowMain}>
              <Text style={styles.rowTitle}>{u.name || u.email}</Text>
              <Text style={styles.rowSub}>{u.email} · {u.phone}</Text>
              <View style={styles.badgeRow}>
                <Badge text={`Level ${u.current_level ?? 0}`} tone="gray" />
                {u.admin_role !== 'user' ? <Badge text={u.admin_role === 'super_admin' ? 'SUPER ADMIN' : 'ADMIN'} tone="green" /> : null}
                {!u.is_active ? <Badge text="INACTIVE" tone="red" /> : null}
              </View>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowAmount}>{fmtKES(u.income_wallet)}</Text>
              <Text style={styles.rowSubText}>income</Text>
              <SafeIonicons name="chevron-forward" size={16} color={colors.blue400} />
            </View>
          </TouchableOpacity>
        ))
      )}

      {/* User detail modal */}
      <Modal visible={!!selectedUser} animationType="slide" transparent={false}>
        <LinearGradient colors={gradients.primary} style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedUser(null)} style={styles.backButton}>
              <SafeIonicons name="arrow-back" size={22} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>User Details</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }}>
            {!userDetails ? (
              <ActivityIndicator color={colors.blue300} />
            ) : (
              <>
                <SectionCard title="Profile" icon="person">
                  <KV k="Name" v={userDetails.data?.name} />
                  <KV k="Email" v={userDetails.data?.email} />
                  <KV k="Phone" v={userDetails.data?.phone} />
                  <KV k="Level" v={userDetails.data?.current_level} />
                  <KV k="Referral code" v={userDetails.data?.referral_code} />
                  <KV k="Joined" v={fmtDate(userDetails.data?.created_at)} />
                  <KV k="Last login" v={fmtDateTime(userDetails.data?.last_login)} />
                  <KV k="Status" v={userDetails.data?.is_active ? 'Active' : 'Inactive'} />
                </SectionCard>

                <SectionCard title="Wallets" icon="wallet">
                  <KV k="Income" v={fmtKES(userDetails.data?.income_wallet)} />
                  <KV k="Recharge" v={fmtKES(userDetails.data?.recharge_wallet)} />
                  <KV k="Main" v={fmtKES(userDetails.data?.main_wallet)} />
                  <KV k="Wealth fund" v={fmtKES(userDetails.data?.wealth_fund_balance)} />
                  {can('wallets.credit_recharge') ? (
                    <ActionButton label="Adjust Wallets" tone="primary" onPress={() => setWalletModal(userDetails.data)} />
                  ) : null}
                </SectionCard>

                {can('users.activate') || can('users.deactivate') ? (
                  <SectionCard title="Account Actions" icon="construct">
                    <ActionButton
                      label={userDetails.data?.is_active ? 'Deactivate User' : 'Activate User'}
                      tone={userDetails.data?.is_active ? 'danger' : 'success'}
                      onPress={() => toggleUserDetailsActive(userDetails.data)}
                    />
                  </SectionCard>
                ) : null}

                {isSuper ? (
                  <SectionCard title="Admin Role" icon="ribbon">
                    <Text style={styles.hintText}>Grant or change this user's admin role.</Text>
                    <View style={styles.buttonRowWrap}>
                      <ActionButton small label="Make Admin (Finance)" onPress={() => setRole(userDetails.data, 'admin', ROLE_PRESETS.finance.permissions)} />
                      <ActionButton small label="Make Super Admin" tone="success" onPress={() => setRole(userDetails.data, 'super_admin', ['*'])} />
                      <ActionButton small label="Revoke Admin" tone="danger" onPress={() => setRole(userDetails.data, 'user', [])} />
                    </View>
                  </SectionCard>
                ) : null}

                <SectionCard title="Recent Transactions" icon="swap-horizontal">
                  {(userDetails.transactions || []).length === 0 ? (
                    <EmptyState text="No transactions" />
                  ) : (
                    userDetails.transactions.map((t) => (
                      <View key={t.id} style={styles.logRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.rowTitle}>{t.type}</Text>
                          <Text style={styles.rowSub}>{fmtDateTime(t.created_at)}</Text>
                        </View>
                        <Text style={[styles.rowAmount, { color: t.amount >= 0 ? colors.success : colors.error }]}>
                          {fmtKES(t.amount)}
                        </Text>
                      </View>
                    ))
                  )}
                </SectionCard>
              </>
            )}
          </ScrollView>
        </LinearGradient>
      </Modal>

      {/* Wallet adjust modal */}
      <Modal visible={!!walletModal} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalCardTitle}>Adjust Wallet — {walletModal?.email}</Text>
            <Text style={styles.hintText}>Negative amounts debit. Every change is logged to the audit trail.</Text>
            <View style={styles.buttonRowWrap}>
              {['recharge', 'income', 'main', 'wealth'].map((w) => (
                <ActionButton
                  key={w}
                  small
                  tone={walletForm.wallet === w ? 'primary' : 'ghost'}
                  label={w.toUpperCase()}
                  onPress={() => setWalletForm((f) => ({ ...f, wallet: w }))}
                />
              ))}
            </View>
            <Field
              label="Amount (KES)"
              value={walletForm.amount}
              onChangeText={(v) => setWalletForm((f) => ({ ...f, amount: v }))}
              keyboardType="numbers-and-punctuation"
              placeholder="e.g. 500 or -200"
            />
            <Field
              label="Reason"
              value={walletForm.reason}
              onChangeText={(v) => setWalletForm((f) => ({ ...f, reason: v }))}
              placeholder="Why is this adjustment happening?"
              multiline
            />
            <View style={styles.buttonRowWrap}>
              <ActionButton label="Cancel" tone="ghost" onPress={() => setWalletModal(null)} />
              <ActionButton label="Apply" tone="success" onPress={submitWalletAdjust} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  const toggleUserDetailsActive = (u) => {
    toggleUserActive(u);
  };

  const renderWithdrawals = () => (
    <View>
      <View style={styles.buttonRowWrap}>
        {['pending', 'approved', 'rejected', 'completed', 'failed'].map((s) => (
          <ActionButton
            key={s}
            small
            tone={wdStatus === s ? 'primary' : 'ghost'}
            label={s.toUpperCase()}
            onPress={() => setWdStatus(s)}
          />
        ))}
      </View>
      {withdrawals.length === 0 ? (
        <EmptyState icon="cash-outline" text={`No ${wdStatus} withdrawals`} />
      ) : (
        withdrawals.map((wd) => (
          <View key={wd.id} style={styles.rowCard}>
            <View style={styles.rowMain}>
              <Text style={styles.rowTitle}>{fmtKES(wd.amount)} → {fmtKES(wd.net_amount)} net</Text>
              <Text style={styles.rowSub}>{wd.user_email || wd.user_phone || wd.user_id}</Text>
              <Text style={styles.rowSub}>{wd.payment_method || wd.withdrawal_account_type} · {fmtDateTime(wd.created_at)}</Text>
            </View>
            {wd.status === 'pending' ? (
              <View style={styles.buttonRowWrap}>
                {can('withdrawals.approve') ? <ActionButton small label="Approve" tone="success" onPress={() => actOnWithdrawal(wd, 'approved')} /> : null}
                {can('withdrawals.reject') ? <ActionButton small label="Reject" tone="danger" onPress={() => actOnWithdrawal(wd, 'rejected')} /> : null}
              </View>
            ) : wd.status === 'approved' && can('withdrawals.complete') ? (
              <View style={styles.buttonRowWrap}>
                <ActionButton small label="Mark Completed" tone="success" onPress={() => actOnWithdrawal(wd, 'completed')} />
                <ActionButton small label="Mark Failed" tone="danger" onPress={() => actOnWithdrawal(wd, 'failed')} />
              </View>
            ) : (
              <Badge text={wd.status.toUpperCase()} tone={wd.status === 'completed' ? 'green' : wd.status === 'failed' || wd.status === 'rejected' ? 'red' : 'amber'} />
            )}
          </View>
        ))
      )}
    </View>
  );

  const renderTransactions = () => (
    transactions.length === 0 ? (
      <EmptyState icon="swap-horizontal-outline" text="No transactions" />
    ) : (
      transactions.map((t) => (
        <View key={t.id} style={styles.rowCard}>
          <View style={styles.rowMain}>
            <Text style={styles.rowTitle}>{t.type}</Text>
            <Text style={styles.rowSub}>{t.description || '—'}</Text>
            <Text style={styles.rowSub}>{fmtDateTime(t.created_at)}</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={[styles.rowAmount, { color: t.amount >= 0 ? colors.success : colors.error }]}>{fmtKES(t.amount)}</Text>
            <Badge text={t.status} tone={t.status === 'completed' ? 'green' : t.status === 'failed' ? 'red' : 'amber'} />
          </View>
        </View>
      ))
    )
  );

  const renderSettings = () => (
    settings.length === 0 ? (
      <EmptyState icon="settings-outline" text="No settings" />
    ) : (
      settings.map((s) => (
        <TouchableOpacity
          key={s.key}
          style={styles.rowCard}
          onPress={() => { setSettingEdit(s); setSettingValue(s.value); }}
        >
          <View style={styles.rowMain}>
            <Text style={styles.rowTitle}>{s.key}</Text>
            <Text style={styles.rowSub}>{s.description || ''}</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.rowAmount}>{s.value}</Text>
            <SafeIonicons name="create" size={16} color={colors.blue300} />
          </View>
        </TouchableOpacity>
      ))
    )
  );

  const renderLevels = () => (
    levels.map((l) => (
      <TouchableOpacity
        key={l.id}
        style={styles.rowCard}
        onPress={() => setLevelEdit({
          id: l.id, name: l.name,
          cost: String(l.cost ?? ''), tasks: String(l.tasks ?? ''), earnings: String(l.earnings_per_task ?? ''),
        })}
      >
        <View style={styles.rowMain}>
          <Text style={styles.rowTitle}>{l.name}</Text>
          <Text style={styles.rowSub}>Cost {fmtKES(l.cost)} · {l.tasks} tasks · {fmtKES(l.earnings_per_task)}/task</Text>
        </View>
        <SafeIonicons name="create" size={16} color={colors.blue300} />
      </TouchableOpacity>
    ))
  );

  const renderGifts = () => (
    <View>
      <SectionCard title="Create Gift Code" icon="gift">
        <Field label="Code" value={giftForm.code} onChangeText={(v) => setGiftForm((f) => ({ ...f, code: v }))} placeholder="e.g. WELCOME10" />
        <View style={styles.buttonRowWrap}>
          {['income_wallet', 'main_wallet', 'both_wallets'].map((t) => (
            <ActionButton key={t} small tone={giftForm.type === t ? 'primary' : 'ghost'} label={t.replace('_wallet', '').replace('_wallets', ' both').toUpperCase()} onPress={() => setGiftForm((f) => ({ ...f, type: t }))} />
          ))}
        </View>
        <View style={styles.twoCol}>
          <Field label="Income amount" value={giftForm.income} onChangeText={(v) => setGiftForm((f) => ({ ...f, income: v }))} keyboardType="numeric" />
          <Field label="Main amount" value={giftForm.main} onChangeText={(v) => setGiftForm((f) => ({ ...f, main: v }))} keyboardType="numeric" />
        </View>
        <Field label="Max uses" value={giftForm.maxUses} onChangeText={(v) => setGiftForm((f) => ({ ...f, maxUses: v }))} keyboardType="numeric" />
        {can('gifts.create') ? <ActionButton label="Create Gift Code" tone="success" onPress={createGift} /> : null}
      </SectionCard>

      {gifts.map((g) => (
        <View key={g.id} style={styles.rowCard}>
          <View style={styles.rowMain}>
            <Text style={styles.rowTitle}>{g.code}</Text>
            <Text style={styles.rowSub}>
              {fmtKES(g.income_wallet_amount)} income · {fmtKES(g.main_wallet_amount)} main · uses {g.current_uses}/{g.max_uses}
            </Text>
          </View>
          {can('gifts.deactivate') ? (
            <ActionButton
              small
              label={g.is_active ? 'Disable' : 'Enable'}
              tone={g.is_active ? 'danger' : 'success'}
              onPress={async () => {
                const { error } = await adminService.setGiftActive(g.id, !g.is_active, profile);
                if (error) PlatformAlert.alert('Failed', error.message);
                else loadTab('gifts');
              }}
            />
          ) : (
            <Badge text={g.is_active ? 'ACTIVE' : 'OFF'} tone={g.is_active ? 'green' : 'gray'} />
          )}
        </View>
      ))}
    </View>
  );

  const renderAudit = () => (
    auditLogs.length === 0 ? (
      <EmptyState icon="shield-checkmark-outline" text="No audit entries yet — actions will appear here" />
    ) : (
      auditLogs.map((l) => (
        <View key={l.id} style={styles.rowCard}>
          <View style={styles.rowMain}>
            <Text style={styles.rowTitle}>{l.action}</Text>
            <Text style={styles.rowSub}>{l.admin_email || 'system'}{l.target_id ? ` → ${String(l.target_id).slice(0, 8)}…` : ''}</Text>
            <Text style={styles.rowSub}>{fmtDateTime(l.created_at)}{l.details?.reason ? ` · ${l.details.reason}` : ''}</Text>
          </View>
        </View>
      ))
    )
  );

  const renderRoles = () => (
    <View>
      {isSuper ? (
        <SectionCard title="Grant Admin" icon="ribbon">
          <Field label="User email" value={grantForm.email} onChangeText={(v) => setGrantForm((f) => ({ ...f, email: v }))} placeholder="user@example.com" />
          <Text style={styles.fieldLabel}>Permission preset</Text>
          <View style={styles.buttonRowWrap}>
            {Object.entries(ROLE_PRESETS).filter(([k]) => k !== 'super_admin').map(([k, p]) => (
              <ActionButton key={k} small tone={grantForm.preset === k ? 'primary' : 'ghost'} label={p.label} onPress={() => setGrantForm((f) => ({ ...f, preset: k }))} />
            ))}
          </View>
          <ActionButton label="Grant Admin Role" tone="success" onPress={grantAdmin} />
        </SectionCard>
      ) : null}

      <SectionCard title={`Admins (${admins.length})`} icon="people">
        {admins.map((a) => (
          <View key={a.id} style={styles.logRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{a.name || a.email}</Text>
              <Text style={styles.rowSub}>{a.email}</Text>
            </View>
            <Badge text={a.admin_role === 'super_admin' ? 'SUPER ADMIN' : 'ADMIN'} tone={a.admin_role === 'super_admin' ? 'green' : 'blue'} />
          </View>
        ))}
      </SectionCard>

      <SectionCard title={`Permission Matrix (${PRIVILEGE_COUNT} privileges)`} icon="grid">
        {ADMIN_PRIVILEGES.map((g) => (
          <View key={g.group} style={{ marginBottom: spacing.md }}>
            <Text style={styles.groupTitle}>{g.group}</Text>
            {g.items.map((it) => {
              const allowed = can(it.key);
              return (
                <View key={it.key} style={styles.permRow}>
                  <SafeIonicons name={allowed ? 'checkmark-circle' : 'close-circle'} size={16} color={allowed ? colors.success : colors.gray500} />
                  <Text style={[styles.permLabel, !allowed && { color: colors.gray500 }]}>{it.label}</Text>
                  <Text style={styles.permKey}>{it.key}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </SectionCard>
    </View>
  );

  const renderTabContent = () => {
    switch (tab) {
      case 'dashboard': return renderDashboard();
      case 'revenue': return <RevenueDashboard refreshKey={refreshKey} />;
      case 'reports': return <ReportCenter can={can} />;
      case 'users': return renderUsers();
      case 'withdrawals': return renderWithdrawals();
      case 'transactions': return renderTransactions();
      case 'announcements': return <AnnouncementsSection can={can} refreshKey={refreshKey} />;
      case 'settings': return renderSettings();
      case 'config': return <PlatformConfigSection can={can} refreshKey={refreshKey} />;
      case 'levels': return renderLevels();
      case 'gifts': return renderGifts();
      case 'audit': return renderAudit();
      case 'roles': return renderRoles();
      case 'pwa': return <PwaInsightsSection refreshKey={refreshKey} />;
      default: return null;
    }
  };

  const activeMenuItem = FLAT_TABS.find((t) => t.key === tab);
  const visibleMenu = MENU.map((g) => ({ ...g, items: g.items.filter((t) => visibleTabs.some((v) => v.key === t.key)) })).filter((g) => g.items.length > 0);

  return (
    <LinearGradient colors={ADMIN_COLORS.bg} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <SafeIonicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{activeMenuItem ? activeMenuItem.label : 'Admin Panel'}</Text>
        <Badge text={isSuper ? 'SUPER' : 'ADMIN'} tone={isSuper ? 'green' : 'blue'} />
      </View>

      {/* Grouped menu — open group expands as an inline row of page chips */}
      <View style={styles.menuBar}>
        <View style={styles.menuGroupRow}>
          {visibleMenu.map((g) => {
            const isOpen = openMenu === g.group;
            const hasActive = g.items.some((t) => t.key === tab);
            return (
              <TouchableOpacity
                key={g.group}
                style={[styles.menuGroupBtn, (isOpen || hasActive) && styles.menuGroupBtnActive]}
                onPress={() => setOpenMenu(isOpen ? null : g.group)}
              >
                <SafeIonicons name={g.icon} size={14} color={isOpen || hasActive ? colors.white : ADMIN_COLORS.sub} />
                <Text style={[styles.menuGroupLabel, (isOpen || hasActive) && styles.menuGroupLabelActive]}>{g.group}</Text>
                <SafeIonicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={12} color={ADMIN_COLORS.sub} />
              </TouchableOpacity>
            );
          })}
        </View>
        {openMenu ? (
          <View style={styles.menuItemsRow}>
            {(visibleMenu.find((g) => g.group === openMenu)?.items || []).map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[styles.menuItemChip, tab === t.key && styles.menuItemChipActive]}
                onPress={() => { setTab(t.key); setOpenMenu(null); }}
              >
                <SafeIonicons name={t.icon} size={13} color={tab === t.key ? colors.white : ADMIN_COLORS.accent} />
                <Text style={[styles.menuItemChipLabel, tab === t.key && styles.menuItemChipLabelActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadTab(tab, true)} tintColor={colors.white} />}
      >
        {loading ? (
          <ActivityIndicator color={colors.blue300} style={{ marginTop: 40 }} />
        ) : (
          renderTabContent()
        )}
      </ScrollView>

      {/* Settings edit modal */}
      <Modal visible={!!settingEdit} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalCardTitle}>Edit Setting — {settingEdit?.key}</Text>
            <Field label="Value" value={settingValue} onChangeText={setSettingValue} multiline />
            <View style={styles.buttonRowWrap}>
              <ActionButton label="Cancel" tone="ghost" onPress={() => setSettingEdit(null)} />
              <ActionButton label="Save" tone="success" onPress={saveSetting} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Level edit modal */}
      <Modal visible={!!levelEdit} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalCardTitle}>Edit Level — {levelEdit?.name}</Text>
            <Field label="Cost (KES)" value={levelEdit?.cost || ''} onChangeText={(v) => setLevelEdit((l) => ({ ...l, cost: v }))} keyboardType="numeric" />
            <Field label="Daily tasks" value={levelEdit?.tasks || ''} onChangeText={(v) => setLevelEdit((l) => ({ ...l, tasks: v }))} keyboardType="numeric" />
            <Field label="Earnings per task (KES)" value={levelEdit?.earnings || ''} onChangeText={(v) => setLevelEdit((l) => ({ ...l, earnings: v }))} keyboardType="numeric" />
            <View style={styles.buttonRowWrap}>
              <ActionButton label="Cancel" tone="ghost" onPress={() => setLevelEdit(null)} />
              <ActionButton label="Save" tone="success" onPress={saveLevel} />
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const KV = ({ k, v }) => (
  <View style={styles.kvRow}>
    <Text style={styles.kvKey}>{k}</Text>
    <Text style={styles.kvValue}>{String(v ?? '—')}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  noAccessTitle: { fontSize: fontSizes.xl, fontWeight: 'bold', color: colors.white, marginTop: spacing.md },
  noAccessText: { fontSize: fontSizes.sm, color: colors.blue200, textAlign: 'center', marginVertical: spacing.md },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: fontSizes.xl, fontWeight: 'bold', color: colors.white, flex: 1 },
  menuBar: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  menuGroupRow: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 6 },
  menuItemsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, rowGap: 6 },
  menuItemChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8, marginRight: 6,
    borderRadius: 999, backgroundColor: 'rgba(224, 64, 251, 0.10)',
    borderWidth: 1, borderColor: 'rgba(156, 39, 176, 0.45)',
  },
  menuItemChipActive: { backgroundColor: ADMIN_COLORS.accent2, borderColor: ADMIN_COLORS.accent2 },
  menuItemChipLabel: { color: ADMIN_COLORS.text, fontSize: 12, fontWeight: '600', marginLeft: 6 },
  menuItemChipLabelActive: { color: colors.white, fontWeight: '800' },
  menuGroupBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 7, marginRight: 6,
    borderRadius: 10, backgroundColor: 'rgba(124, 77, 255, 0.18)',
    borderWidth: 1, borderColor: 'rgba(156, 39, 176, 0.4)',
  },
  menuGroupBtnActive: { backgroundColor: 'rgba(124, 77, 255, 0.45)' },
  menuGroupLabel: { color: ADMIN_COLORS.sub, fontSize: 12, fontWeight: '700', marginLeft: 5, marginRight: 3 },
  menuGroupLabelActive: { color: colors.white },
  menuDropdown: {
    position: 'absolute', top: 40, left: 0, zIndex: 50, minWidth: 190,
    backgroundColor: '#2b1847', borderRadius: 12, borderWidth: 1,
    borderColor: 'rgba(156, 39, 176, 0.5)', paddingVertical: 6,
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 12, elevation: 12,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 14 },
  menuItemActive: { backgroundColor: 'rgba(124, 77, 255, 0.35)' },
  menuItemLabel: { color: ADMIN_COLORS.text, fontSize: 13, marginLeft: 9 },
  menuItemLabelActive: { color: colors.white, fontWeight: '700' },
  content: { padding: spacing.lg, paddingBottom: 120 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: spacing.lg },
  statCard: {
    width: '48%', backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14, padding: spacing.md, marginBottom: spacing.md,
    alignItems: 'flex-start', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  statValue: { fontSize: fontSizes.xxl, fontWeight: 'bold', color: colors.white, marginTop: spacing.xs },
  statLabel: { fontSize: fontSizes.xs, color: colors.blue200, marginTop: 2 },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14,
    padding: spacing.md, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  sectionCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionCardTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionCardTitle: { fontSize: fontSizes.md, fontWeight: 'bold', color: colors.white, marginLeft: spacing.xs },
  rowCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  rowMain: { flex: 1 },
  rowRight: { alignItems: 'flex-end' },
  rowTitle: { fontSize: fontSizes.md, fontWeight: '600', color: colors.white },
  rowSub: { fontSize: fontSizes.xs, color: colors.blue200, marginTop: 2 },
  rowSubText: { fontSize: fontSizes.xs, color: colors.blue300 },
  rowAmount: { fontSize: fontSizes.md, fontWeight: 'bold', color: colors.white },
  badgeRow: { flexDirection: 'row', marginTop: spacing.xs },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginRight: spacing.xs, marginTop: spacing.xs, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  buttonRowWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm },
  actionBtn: { borderRadius: 8, paddingVertical: 9, paddingHorizontal: spacing.md, marginRight: spacing.sm, marginTop: spacing.xs },
  actionBtnSmall: { paddingVertical: 6, paddingHorizontal: 10 },
  actionBtnText: { fontSize: fontSizes.sm, fontWeight: '600' },
  actionBtnTextSmall: { fontSize: fontSizes.xs },
  searchRow: { flexDirection: 'row', marginBottom: spacing.md },
  searchInput: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10,
    padding: spacing.md, color: colors.white, fontSize: fontSizes.md, marginRight: spacing.sm,
  },
  field: { marginTop: spacing.sm },
  fieldLabel: { fontSize: fontSizes.xs, color: colors.blue200, marginBottom: 4 },
  fieldInput: {
    backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 8,
    padding: spacing.md, color: colors.white, fontSize: fontSizes.md,
  },
  fieldInputMultiline: { minHeight: 60, textAlignVertical: 'top' },
  twoCol: { flexDirection: 'row' },
  twoColField: { flex: 1, marginRight: spacing.sm },
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  kvKey: { color: colors.blue200, fontSize: fontSizes.sm },
  kvValue: { color: colors.white, fontSize: fontSizes.sm, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  modalHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: spacing.sm, paddingHorizontal: spacing.lg,
    flexDirection: 'row', alignItems: 'center',
  },
  modalTitle: { fontSize: fontSizes.lg, fontWeight: 'bold', color: colors.white, flex: 1, textAlign: 'center' },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: '#12233f', borderRadius: 16, padding: spacing.lg,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  modalCardTitle: { fontSize: fontSizes.md, fontWeight: 'bold', color: colors.white, marginBottom: spacing.sm },
  hintText: { fontSize: fontSizes.xs, color: colors.blue300, marginBottom: spacing.xs },
  logRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  groupTitle: { fontSize: fontSizes.sm, fontWeight: 'bold', color: colors.blue200, marginBottom: 4 },
  permRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  permLabel: { color: colors.white, fontSize: fontSizes.xs, flex: 1, marginLeft: 6 },
  permKey: { color: colors.gray500, fontSize: 9 },
  emptyState: { alignItems: 'center', padding: spacing.xl },
  emptyText: { color: colors.blue200, marginTop: spacing.sm, fontSize: fontSizes.sm, textAlign: 'center' },
  accessRow: { flexDirection: 'row', alignItems: 'center' },
  accessText: { color: colors.blue200, fontSize: fontSizes.sm, flex: 1, marginLeft: spacing.sm },
});

export default AdminPanelScreen;
