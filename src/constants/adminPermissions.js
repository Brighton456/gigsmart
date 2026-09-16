// Admin privilege catalog — 140 granular permissions across 19 groups.
//
// Keys use dot-notation ("users.view"). Super admins hold the wildcard "*"
// and pass every check. Regular admins hold an explicit array of keys stored
// on users.admin_permissions (JSONB).

export const ADMIN_PRIVILEGES = [
  {
    group: 'Dashboard & Analytics',
    items: [
      { key: 'dashboard.view', label: 'View admin dashboard' },
      { key: 'dashboard.stats', label: 'View platform statistics' },
      { key: 'dashboard.daily', label: 'View daily statistics' },
      { key: 'dashboard.growth', label: 'View user growth reports' },
      { key: 'dashboard.financial', label: 'View financial overview' },
      { key: 'dashboard.revenue', label: 'View revenue reports' },
      { key: 'dashboard.referrals', label: 'View referral analytics' },
      { key: 'dashboard.export', label: 'Export reports' },
    ],
  },
  {
    group: 'User Management',
    items: [
      { key: 'users.view', label: 'View users' },
      { key: 'users.details', label: 'View user details' },
      { key: 'users.wallets', label: 'View user wallets' },
      { key: 'users.transactions', label: 'View user transactions' },
      { key: 'users.investments', label: 'View user investments' },
      { key: 'users.tasks', label: 'View user task history' },
      { key: 'users.spins', label: 'View user spin history' },
      { key: 'users.referrals', label: 'View user referral tree' },
      { key: 'users.devices', label: 'View user devices & IPs' },
      { key: 'users.search', label: 'Search users' },
      { key: 'users.filter', label: 'Filter & segment users' },
      { key: 'users.activate', label: 'Activate users' },
      { key: 'users.deactivate', label: 'Deactivate users' },
      { key: 'users.verify', label: 'Verify user details' },
      { key: 'users.delete', label: 'Delete users' },
      { key: 'users.reset', label: 'Reset user credentials' },
    ],
  },
  {
    group: 'Wallet & Balance Operations',
    items: [
      { key: 'wallets.view', label: 'View wallet balances' },
      { key: 'wallets.credit_recharge', label: 'Credit recharge wallet' },
      { key: 'wallets.debit_recharge', label: 'Debit recharge wallet' },
      { key: 'wallets.credit_income', label: 'Credit income wallet' },
      { key: 'wallets.debit_income', label: 'Debit income wallet' },
      { key: 'wallets.credit_main', label: 'Credit main wallet' },
      { key: 'wallets.debit_main', label: 'Debit main wallet' },
      { key: 'wallets.credit_wealth', label: 'Credit wealth fund' },
      { key: 'wallets.debit_wealth', label: 'Debit wealth fund' },
      { key: 'wallets.bulk_adjust', label: 'Bulk wallet adjustments' },
    ],
  },
  {
    group: 'Withdrawals',
    items: [
      { key: 'withdrawals.view', label: 'View withdrawal requests' },
      { key: 'withdrawals.details', label: 'View withdrawal details' },
      { key: 'withdrawals.approve', label: 'Approve withdrawals' },
      { key: 'withdrawals.reject', label: 'Reject withdrawals' },
      { key: 'withdrawals.complete', label: 'Mark withdrawals completed' },
      { key: 'withdrawals.fail', label: 'Mark withdrawals failed' },
      { key: 'withdrawals.limits', label: 'Override withdrawal limits' },
      { key: 'withdrawals.export', label: 'Export withdrawals' },
    ],
  },
  {
    group: 'Transactions',
    items: [
      { key: 'transactions.view', label: 'View all transactions' },
      { key: 'transactions.details', label: 'View transaction details' },
      { key: 'transactions.reverse', label: 'Reverse transactions' },
      { key: 'transactions.flag', label: 'Flag suspicious transactions' },
      { key: 'transactions.notes', label: 'Add admin notes to transactions' },
      { key: 'transactions.export', label: 'Export transactions' },
      { key: 'transactions.audit', label: 'View transaction audit trail' },
    ],
  },
  {
    group: 'Investments & Wealth Fund',
    items: [
      { key: 'investments.view', label: 'View investments' },
      { key: 'investments.details', label: 'View investment details' },
      { key: 'investments.complete', label: 'Complete investments' },
      { key: 'investments.cancel', label: 'Cancel investments' },
      { key: 'investments.adjust', label: 'Adjust investment values' },
      { key: 'investments.pause', label: 'Pause investment maturity' },
      { key: 'investments.mature', label: 'Force-mature investments' },
      { key: 'investments.export', label: 'Export investments' },
    ],
  },
  {
    group: 'Levels & Upgrades',
    items: [
      { key: 'levels.view', label: 'View job levels' },
      { key: 'levels.create', label: 'Create job levels' },
      { key: 'levels.edit', label: 'Edit job levels' },
      { key: 'levels.delete', label: 'Delete job levels' },
      { key: 'levels.reorder', label: 'Reorder job levels' },
      { key: 'levels.costs', label: 'Edit level costs' },
      { key: 'levels.earnings', label: 'Edit level earnings' },
      { key: 'levels.grant', label: 'Grant level upgrades' },
    ],
  },
  {
    group: 'Tasks',
    items: [
      { key: 'tasks.view', label: 'View tasks' },
      { key: 'tasks.create', label: 'Create tasks' },
      { key: 'tasks.edit', label: 'Edit tasks' },
      { key: 'tasks.delete', label: 'Delete tasks' },
      { key: 'tasks.activate', label: 'Activate / deactivate tasks' },
      { key: 'tasks.credit', label: 'Credit manual task earnings' },
      { key: 'tasks.reset', label: 'Reset user task progress' },
    ],
  },
  {
    group: 'Spin Wheel',
    items: [
      { key: 'spin.view', label: 'View spin attempts' },
      { key: 'spin.settings', label: 'View spin settings' },
      { key: 'spin.edit_settings', label: 'Edit spin settings' },
      { key: 'spin.odds', label: 'Adjust spin odds' },
      { key: 'spin.free_spins', label: 'Grant free spins' },
      { key: 'spin.reset', label: 'Reset spin limits' },
    ],
  },
  {
    group: 'Referrals',
    items: [
      { key: 'referrals.view', label: 'View referrals' },
      { key: 'referrals.tree', label: 'View referral trees' },
      { key: 'referrals.rates', label: 'Adjust referral rates' },
      { key: 'referrals.pay', label: 'Pay referral bonuses' },
      { key: 'referrals.reverse', label: 'Reverse referral bonuses' },
      { key: 'referrals.export', label: 'Export referral data' },
    ],
  },
  {
    group: 'Gift Codes',
    items: [
      { key: 'gifts.view', label: 'View gift codes' },
      { key: 'gifts.create', label: 'Create gift codes' },
      { key: 'gifts.edit', label: 'Edit gift codes' },
      { key: 'gifts.deactivate', label: 'Deactivate gift codes' },
      { key: 'gifts.delete', label: 'Delete gift codes' },
      { key: 'gifts.redemptions', label: 'View gift redemptions' },
      { key: 'gifts.revoke', label: 'Revoke gift redemptions' },
    ],
  },
  {
    group: 'System Settings',
    items: [
      { key: 'settings.view', label: 'View system settings' },
      { key: 'settings.withdrawal', label: 'Edit withdrawal settings' },
      { key: 'settings.referral', label: 'Edit referral settings' },
      { key: 'settings.payment', label: 'Edit payment settings' },
      { key: 'settings.app', label: 'Edit app settings' },
      { key: 'settings.fees', label: 'Edit fee settings' },
      { key: 'settings.reset', label: 'Reset settings to defaults' },
      { key: 'settings.maintenance', label: 'Toggle maintenance mode' },
    ],
  },
  {
    group: 'Notifications',
    items: [
      { key: 'notifications.view', label: 'View notifications' },
      { key: 'notifications.create', label: 'Create notifications' },
      { key: 'notifications.edit', label: 'Edit notifications' },
      { key: 'notifications.delete', label: 'Delete notifications' },
      { key: 'notifications.broadcast', label: 'Broadcast to all users' },
      { key: 'notifications.schedule', label: 'Schedule notifications' },
      { key: 'notifications.toggle', label: 'Enable / disable notifications' },
    ],
  },
  {
    group: 'Payments',
    items: [
      { key: 'payments.view', label: 'View payments' },
      { key: 'payments.callbacks', label: 'View payment callbacks' },
      { key: 'payments.retry', label: 'Retry failed payments' },
      { key: 'payments.providers', label: 'Configure payment providers' },
      { key: 'payments.refund', label: 'Issue refunds' },
      { key: 'payments.reconciliation', label: 'View payment reconciliation' },
    ],
  },
  {
    group: 'Roles & Permissions',
    items: [
      { key: 'roles.view', label: 'View admins' },
      { key: 'roles.grant', label: 'Grant admin role' },
      { key: 'roles.revoke', label: 'Revoke admin role' },
      { key: 'roles.assign_permissions', label: 'Assign permissions' },
      { key: 'roles.matrix', label: 'View permission matrix' },
      { key: 'roles.ownership', label: 'Transfer ownership' },
    ],
  },
  {
    group: 'Audit & Security',
    items: [
      { key: 'audit.view', label: 'View audit logs' },
      { key: 'audit.admin_activity', label: 'View admin activity' },
      { key: 'audit.logins', label: 'View login history' },
      { key: 'audit.export', label: 'Export audit logs' },
      { key: 'audit.ips', label: 'View IP addresses' },
      { key: 'audit.alerts', label: 'View security alerts' },
      { key: 'audit.resolve', label: 'Resolve security alerts' },
      { key: 'audit.ip_restrictions', label: 'Manage IP restrictions' },
    ],
  },
  {
    group: 'Content',
    items: [
      { key: 'content.help', label: 'Edit help content' },
      { key: 'content.tour', label: 'Edit app tour' },
      { key: 'content.faqs', label: 'Manage FAQs' },
      { key: 'content.announcements', label: 'Edit announcements' },
      { key: 'content.media', label: 'Manage media assets' },
    ],
  },
  {
    group: 'Support',
    items: [
      { key: 'support.view', label: 'View support tickets' },
      { key: 'support.respond', label: 'Respond to tickets' },
      { key: 'support.close', label: 'Close tickets' },
      { key: 'support.escalate', label: 'Escalate tickets' },
      { key: 'support.messages', label: 'View contact messages' },
    ],
  },
  {
    group: 'Data & Operations',
    items: [
      { key: 'data.export_users', label: 'Export users CSV' },
      { key: 'data.import_users', label: 'Import users' },
      { key: 'data.backups', label: 'Run database backups' },
      { key: 'data.health', label: 'View system health' },
    ],
  },
  {
    group: 'Announcements & Posters',
    items: [
      { key: 'announcements.view', label: 'View announcements' },
      { key: 'announcements.create', label: 'Create announcements' },
      { key: 'announcements.edit', label: 'Edit announcements' },
      { key: 'announcements.delete', label: 'Delete announcements' },
      { key: 'announcements.publish', label: 'Publish / unpublish announcements' },
      { key: 'announcements.schedule', label: 'Schedule announcements' },
      { key: 'announcements.target_levels', label: 'Target announcements to levels' },
      { key: 'announcements.target_pages', label: 'Target announcements to pages' },
      { key: 'announcements.media', label: 'Attach images & links' },
      { key: 'announcements.pins', label: 'Pin announcements to top' },
      { key: 'announcements.analytics', label: 'View announcement performance' },
      { key: 'announcements.reorder', label: 'Reorder announcement posters' },
    ],
  },
  {
    group: 'Reports & Exports',
    items: [
      { key: 'reports.view', label: 'Open report center' },
      { key: 'reports.revenue', label: 'Revenue & expense reports' },
      { key: 'reports.users', label: 'User reports' },
      { key: 'reports.transactions', label: 'Transaction reports' },
      { key: 'reports.withdrawals', label: 'Withdrawal reports' },
      { key: 'reports.investments', label: 'Investment reports' },
      { key: 'reports.referrals', label: 'Referral reports' },
      { key: 'reports.pwa', label: 'PWA install & session reports' },
      { key: 'reports.custom', label: 'Build custom reports' },
      { key: 'reports.png', label: 'Export reports as PNG' },
      { key: 'reports.pdf', label: 'Export reports as PDF' },
      { key: 'reports.csv', label: 'Export reports as CSV' },
      { key: 'reports.schedule', label: 'Schedule recurring reports' },
      { key: 'reports.share', label: 'Share reports via link' },
    ],
  },
  {
    group: 'Platform Configuration',
    items: [
      { key: 'config.defaults', label: 'Edit platform defaults' },
      { key: 'config.currency', label: 'Configure currency' },
      { key: 'config.branding', label: 'Edit branding & app name' },
      { key: 'config.interest', label: 'Edit interest / rate defaults' },
      { key: 'config.spin_cost', label: 'Edit spin cost & rewards' },
      { key: 'config.checkin', label: 'Edit check-in rewards' },
      { key: 'config.gift_defaults', label: 'Edit gift defaults' },
      { key: 'config.session', label: 'Configure session & security policy' },
      { key: 'config.maintenance', label: 'Toggle maintenance mode' },
      { key: 'config.kyc', label: 'Configure KYC requirements' },
      { key: 'config.limits', label: 'Configure transaction limits' },
      { key: 'config.links_whatsapp_group', label: 'Edit WhatsApp group link' },
      { key: 'config.links_whatsapp_support', label: 'Edit WhatsApp customer care number' },
      { key: 'config.links_tos', label: 'Edit terms of service link' },
      { key: 'config.links_privacy', label: 'Edit privacy policy link' },
      { key: 'config.links_social', label: 'Edit social media links' },
      { key: 'config.feature_flags', label: 'Toggle feature flags' },
    ],
  },
  {
    group: 'PWA & Devices',
    items: [
      { key: 'pwa.stats', label: 'View PWA statistics' },
      { key: 'pwa.installs', label: 'View install analytics' },
      { key: 'pwa.sessions', label: 'View browser sessions' },
      { key: 'pwa.prompt_settings', label: 'Edit install prompt behaviour' },
      { key: 'pwa.force_prompt', label: 'Force install prompt for users' },
      { key: 'pwa.events', label: 'View raw PWA events' },
      { key: 'pwa.devices', label: 'View device breakdown' },
      { key: 'pwa.push', label: 'Send push notifications' },
      { key: 'pwa.offline', label: 'Manage offline content' },
      { key: 'pwa.cache', label: 'Purge service worker caches' },
      { key: 'pwa.version', label: 'Publish app shell version notes' },
      { key: 'pwa.analytics', label: 'View PWA conversion funnel' },
    ],
  },
  {
    group: 'Advanced Wallet Ops',
    items: [
      { key: 'wallets.freeze', label: 'Freeze user wallets' },
      { key: 'wallets.unfreeze', label: 'Unfreeze user wallets' },
      { key: 'wallets.transfer', label: 'Transfer between user wallets' },
      { key: 'wallets.reset', label: 'Reset wallet to zero' },
      { key: 'wallets.history', label: 'View full wallet history' },
      { key: 'wallets.reconcile', label: 'Reconcile wallets vs ledger' },
    ],
  },
  {
    group: 'Advanced User Ops',
    items: [
      { key: 'users.notes', label: 'Add admin notes to users' },
      { key: 'users.tag', label: 'Tag / label users' },
      { key: 'users.kyc_approve', label: 'Approve user verification' },
      { key: 'users.kyc_reject', label: 'Reject user verification' },
      { key: 'users.force_logout', label: 'Force logout sessions' },
      { key: 'users.password_reset_link', label: 'Send password reset link' },
      { key: 'users.resend_welcome', label: 'Resend welcome message' },
      { key: 'users.merge', label: 'Merge duplicate accounts' },
      { key: 'users.anonymize', label: 'Anonymize user data (GDPR)' },
      { key: 'users.export_one', label: 'Export single user data' },
    ],
  },
  {
    group: 'Advanced Transaction Ops',
    items: [
      { key: 'transactions.approve_manual', label: 'Approve manual transactions' },
      { key: 'transactions.reject', label: 'Reject transactions' },
      { key: 'transactions.edit_amount', label: 'Edit transaction amounts' },
      { key: 'transactions.edit_description', label: 'Edit transaction descriptions' },
      { key: 'transactions.delete', label: 'Delete transactions' },
      { key: 'transactions.export_filtered', label: 'Export filtered transactions' },
      { key: 'transactions.group_by_user', label: 'Group view by user' },
      { key: 'transactions.group_by_type', label: 'Group view by type' },
      { key: 'transactions.reconcile', label: 'Reconcile payment records' },
      { key: 'transactions.mark_reviewed', label: 'Mark transactions reviewed' },
      { key: 'transactions.assign', label: 'Assign transactions to admins' },
      { key: 'transactions.duplicate_check', label: 'Run duplicate detection' },
      { key: 'transactions.bulk_reverse', label: 'Bulk reverse transactions' },
      { key: 'transactions.bulk_export', label: 'Bulk export transactions' },
    ],
  },
  {
    group: 'Advanced Withdrawal Ops',
    items: [
      { key: 'withdrawals.bulk_approve', label: 'Bulk approve withdrawals' },
      { key: 'withdrawals.set_priority', label: 'Set withdrawal priority' },
      { key: 'withdrawals.schedule_payout', label: 'Schedule payouts' },
      { key: 'withdrawals.download_proof', label: 'Download payment proof' },
    ],
  },
  {
    group: 'Advanced Level Ops',
    items: [
      { key: 'levels.duplicate', label: 'Duplicate levels' },
      { key: 'levels.preview', label: 'Preview level as user' },
      { key: 'levels.reset_progress', label: 'Reset user level progress' },
    ],
  },
  {
    group: 'Advanced Gift Ops',
    items: [
      { key: 'gifts.bulk_create', label: 'Bulk generate gift codes' },
      { key: 'gifts.export', label: 'Export gift codes' },
    ],
  },
  {
    group: 'Advanced Analytics',
    items: [
      { key: 'dashboard.realtime', label: 'View realtime activity feed' },
      { key: 'dashboard.cohorts', label: 'View cohort analysis' },
      { key: 'dashboard.retention', label: 'View retention metrics' },
      { key: 'dashboard.arpu', label: 'View ARPU / LTV metrics' },
    ],
  },
];

export const ALL_PRIVILEGE_KEYS = ADMIN_PRIVILEGES.flatMap((g) => g.items.map((i) => i.key));

export const PRIVILEGE_COUNT = ALL_PRIVILEGE_KEYS.length;

export const PRIVILEGE_LABELS = ALL_PRIVILEGE_KEYS.reduce((acc, key) => {
  acc[key] = key;
  return acc;
}, {});

ADMIN_PRIVILEGES.forEach((g) => g.items.forEach((i) => { PRIVILEGE_LABELS[i.key] = i.label; }));

// Quick presets when granting admin roles.
export const ROLE_PRESETS = {
  super_admin: { label: 'Super Admin', permissions: ['*'] },
  finance: {
    label: 'Finance Admin',
    permissions: [
      'dashboard.view', 'dashboard.stats', 'dashboard.financial',
      'users.view', 'users.details', 'users.wallets', 'users.transactions', 'users.search',
      'wallets.view', 'wallets.credit_recharge', 'wallets.credit_income', 'wallets.debit_income',
      'withdrawals.view', 'withdrawals.details', 'withdrawals.approve', 'withdrawals.reject',
      'withdrawals.complete', 'withdrawals.fail',
      'transactions.view', 'transactions.details', 'transactions.notes',
      'payments.view', 'payments.callbacks',
      'audit.view',
    ],
  },
  support: {
    label: 'Support Admin',
    permissions: [
      'dashboard.view',
      'users.view', 'users.details', 'users.search', 'users.transactions', 'users.activate',
      'transactions.view', 'transactions.details',
      'gifts.view', 'gifts.create', 'gifts.deactivate',
      'notifications.view', 'notifications.create',
      'support.view', 'support.respond', 'support.close', 'support.escalate', 'support.messages',
      'audit.view',
    ],
  },
  readonly: {
    label: 'Read Only',
    permissions: [
      'dashboard.view', 'dashboard.stats',
      'users.view', 'users.details', 'users.wallets', 'users.transactions', 'users.search',
      'withdrawals.view', 'transactions.view', 'investments.view',
      'levels.view', 'settings.view', 'audit.view',
    ],
  },
};

export const hasPrivilege = (permissions, key) => {
  if (!Array.isArray(permissions)) return false;
  return permissions.includes('*') || permissions.includes(key);
};

export const isAdminRole = (role) => role === 'admin' || role === 'super_admin';
