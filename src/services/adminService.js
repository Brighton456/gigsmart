// Admin service layer — every mutating call writes to admin_audit_logs.
// All reads/writes go through Supabase RLS: policies grant access via
// is_admin()/has_privilege(), so a revoked admin loses data access instantly.

import { supabase } from './supabaseClient';
import { hasPrivilege } from '../constants/adminPermissions';

const audit = async (action, { targetType, targetId, details } = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('admin_audit_logs').insert({
      admin_id: user?.id || null,
      admin_email: user?.email || null,
      action,
      target_type: targetType || null,
      target_id: targetId ? String(targetId) : null,
      details: details || null,
    });
  } catch (e) {
    console.warn('Audit log failed:', e?.message);
  }
};

const can = (profile, key) =>
  profile?.admin_role === 'super_admin' ||
  (profile?.admin_role === 'admin' && hasPrivilege(profile?.admin_permissions, key));

const wrap = async (privilege, fn) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: 'Not signed in' } };
  return fn(user);
};

const adminService = {
  // ---- Role / permission helpers -------------------------------------------
  async isCurrentUserAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data, error } = await supabase
      .from('users')
      .select('admin_role, admin_permissions')
      .eq('id', user.id)
      .single();
    if (error || !data) return false;
    return data.admin_role === 'admin' || data.admin_role === 'super_admin';
  },

  can,

  has(key) {
    // Sync check against the context profile; used for UI gating.
    return this.can(this.currentProfile, key);
  },

  currentProfile: null,

  // ---- Audit ----------------------------------------------------------------
  audit,

  async getAuditLogs({ limit = 100, adminId } = {}) {
    let q = supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (adminId) q = q.eq('admin_id', adminId);
    const { data, error } = await q;
    return { data, error };
  },

  // ---- Dashboard -------------------------------------------------------------
  async getDashboardStats() {
    const { data, error } = await supabase.rpc('admin_dashboard_stats');
    if (error) {
      // Fallback: aggregate client-side if the RPC is missing
      const [{ count: userCount }, { count: txCount }, { count: wdCount }] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('transactions').select('*', { count: 'exact', head: true }),
        supabase.from('withdrawal_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);
      return {
        data: {
          total_users: userCount ?? 0,
          total_transactions: txCount ?? 0,
          pending_withdrawals: wdCount ?? 0,
        },
        error: null,
      };
    }
    return { data, error: null };
  },

  // ---- Users -----------------------------------------------------------------
  async listUsers({ search = '', limit = 50, offset = 0, inactiveOnly = false } = {}) {
    let q = supabase
      .from('users')
      .select('id, created_at, email, phone, name, is_active, current_level, income_wallet, recharge_wallet, main_wallet, wealth_fund_balance, total_earnings, admin_role, referral_code, last_login')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (search) {
      const s = search.replace(/[%,()]/g, '');
      q = q.or(`email.ilike.%${s}%,phone.ilike.%${s}%,name.ilike.%${s}%,referral_code.ilike.%${s}%`);
    }
    if (inactiveOnly) q = q.eq('is_active', false);
    return q;
  },

  async getUserDetails(userId) {
    const [{ data: user, error: uErr }, { data: transactions }, { data: investments }, { data: withdrawals }, { data: tasks }, { data: spins }] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(30),
      supabase.from('investments').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      supabase.from('withdrawal_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      supabase.from('task_completions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      supabase.from('spin_attempts').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
    ]);
    return { data: user, error: uErr, transactions, investments, withdrawals, tasks, spins };
  },

  async setUserActive(userId, isActive, profile) {
    return wrap('users.activate', async (user) => {
      if (!can(profile, isActive ? 'users.activate' : 'users.deactivate')) {
        return { data: null, error: { message: `Missing privilege` } };
      }
      const { data, error } = await supabase
        .from('users')
        .update({ is_active: isActive })
        .eq('id', userId)
        .select('id, is_active')
        .single();
      if (!error) {
        await audit(isActive ? 'user.activated' : 'user.deactivated', {
          targetType: 'user', targetId: userId, details: { by: user.email },
        });
      }
      return { data, error };
    });
  },

  async findUserByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, admin_role')
      .eq('email', String(email).toLowerCase())
      .maybeSingle();
    return { data, error };
  },

  async setAdminRole(userId, role, permissions, profile) {
    return wrap('roles.change', async (user) => {
      // Only super admins (or explicit roles.grant holders) may change roles.
      if (profile?.admin_role !== 'super_admin' && !can(profile, 'roles.grant')) {
        return { data: null, error: { message: 'Missing privilege: roles.grant' } };
      }
      if (profile?.admin_role !== 'super_admin' && role === 'super_admin') {
        return { data: null, error: { message: 'Only super admins can grant the super admin role' } };
      }
      const { data, error } = await supabase
        .from('users')
        .update({
          admin_role: role,
          admin_permissions: role === 'user' ? [] : permissions || [],
          admin_granted_at: role === 'user' ? null : new Date().toISOString(),
          admin_granted_by: role === 'user' ? null : user.email,
        })
        .eq('id', userId)
        .select('id, email, admin_role, admin_permissions')
        .single();
      if (!error) {
        await audit(`role.${role === 'user' ? 'revoked' : 'granted'}`, {
          targetType: 'user', targetId: userId,
          details: { role, permissions: role === 'user' ? [] : permissions, by: user.email },
        });
      }
      return { data, error };
    });
  },

  async adjustWallet(userId, wallet, amount, reason, profile) {
    return wrap('wallets.adjust', async (user) => {
      const priv = amount >= 0 ? `wallets.credit_${wallet}` : `wallets.debit_${wallet}`;
      if (!can(profile, priv)) return { data: null, error: { message: `Missing privilege: ${priv}` } };

      const col = wallet === 'income' ? 'income_wallet'
        : wallet === 'recharge' ? 'recharge_wallet'
        : wallet === 'main' ? 'main_wallet'
        : 'wealth_fund_balance';

      // Read current value, then write the delta atomically via update
      const { data: current, error: readErr } = await supabase
        .from('users')
        .select(col)
        .eq('id', userId)
        .single();
      if (readErr) return { data: null, error: readErr };
      const next = (current[col] ?? 0) + amount;
      if (next < 0) return { data: null, error: { message: 'Adjustment would make the wallet negative' } };

      const { data, error } = await supabase
        .from('users')
        .update({ [col]: next })
        .eq('id', userId)
        .select(`id,${col}`)
        .single();
      if (!error) {
        await audit(`wallet.adjust_${wallet}`, {
          targetType: 'user', targetId: userId,
          details: { amount, reason, new_balance: next, by: user.email },
        });
        // Also record a transaction row for the ledger
        await supabase.from('transactions').insert({
          user_id: userId,
          type: 'admin_adjustment',
          amount: Math.abs(amount),
          net_amount: Math.abs(amount),
          status: 'completed',
          description: `Admin ${amount >= 0 ? 'credit' : 'debit'} (${wallet} wallet): ${reason}`,
          metadata: { wallet, amount, admin: user.email },
        });
      }
      return { data, error };
    });
  },

  // ---- Withdrawals -------------------------------------------------------------
  async listWithdrawals({ status = 'pending', limit = 50 } = {}) {
    return supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit);
  },

  async processWithdrawal(requestId, decision, profile, { notes, adminEmail } = {}) {
    return wrap('withdrawals.process', async (user) => {
      const priv = decision === 'approved' ? 'withdrawals.approve'
        : decision === 'rejected' ? 'withdrawals.reject'
        : decision === 'completed' ? 'withdrawals.complete'
        : 'withdrawals.fail';
      if (!can(profile, priv)) return { data: null, error: { message: `Missing privilege: ${priv}` } };

      const { data, error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: decision,
          processed_at: new Date().toISOString(),
          processed_by: adminEmail || user.email,
          admin_notes: notes || null,
        })
        .eq('id', requestId)
        .select('*')
        .single();
      if (!error) {
        await audit(`withdrawal.${decision}`, {
          targetType: 'withdrawal', targetId: requestId,
          details: { notes, by: user.email },
        });
      }
      return { data, error };
    });
  },

  // ---- Settings ------------------------------------------------------------------
  async getSettings() {
    return supabase.from('system_settings').select('*').order('key');
  },

  async updateSetting(key, value, profile) {
    return wrap('settings.update', async (user) => {
      if (!can(profile, 'settings.withdrawal') && !can(profile, 'settings.app')
        && !can(profile, 'settings.fees') && !can(profile, 'settings.referral')) {
        return { data: null, error: { message: 'Missing settings privilege' } };
      }
      const { data, error } = await supabase
        .from('system_settings')
        .update({ value: String(value), updated_at: new Date().toISOString(), updated_by: user.email })
        .eq('key', key)
        .select('*')
        .single();
      if (!error) {
        await audit('settings.updated', {
          targetType: 'setting', targetId: key, details: { value: String(value), by: user.email },
        });
      }
      return { data, error };
    });
  },

  // ---- Levels -----------------------------------------------------------------------
  async getLevels() {
    return supabase.from('levels').select('*').order('id');
  },

  async updateLevel(levelId, updates, profile) {
    return wrap('levels.edit', async (user) => {
      if (!can(profile, 'levels.edit')) return { data: null, error: { message: 'Missing privilege: levels.edit' } };
      const { data, error } = await supabase
        .from('levels')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', levelId)
        .select('*')
        .single();
      if (!error) {
        await audit('level.updated', {
          targetType: 'level', targetId: levelId, details: { updates, by: user.email },
        });
      }
      return { data, error };
    });
  },

  // ---- Gift codes ---------------------------------------------------------------------
  async getGiftCodes() {
    return supabase.from('gift_codes').select('*').order('created_at', { ascending: false }).limit(100);
  },

  async createGiftCode(code, rewardType, incomeAmount, mainAmount, maxUses, profile) {
    return wrap('gifts.create', async (user) => {
      if (!can(profile, 'gifts.create')) return { data: null, error: { message: 'Missing privilege: gifts.create' } };
      const { data, error } = await supabase
        .from('gift_codes')
        .insert({
          code: code.toUpperCase(),
          reward_type: rewardType,
          income_wallet_amount: incomeAmount,
          main_wallet_amount: mainAmount,
          max_uses: maxUses,
          created_by: user.email,
        })
        .select('*')
        .single();
      if (!error) {
        await audit('gift.created', {
          targetType: 'gift_code', targetId: code, details: { rewardType, incomeAmount, mainAmount, maxUses },
        });
      }
      return { data, error };
    });
  },

  async setGiftActive(giftId, isActive, profile) {
    return wrap('gifts.toggle', async (user) => {
      if (!can(profile, 'gifts.deactivate')) return { data: null, error: { message: 'Missing privilege: gifts.deactivate' } };
      const { data, error } = await supabase
        .from('gift_codes')
        .update({ is_active: isActive })
        .eq('id', giftId)
        .select('*')
        .single();
      if (!error) {
        await audit('gift.toggled', {
          targetType: 'gift_code', targetId: giftId, details: { is_active: isActive, by: user.email },
        });
      }
      return { data, error };
    });
  },

  // ---- Transactions ----------------------------------------------------------------------
  async listTransactions({ limit = 50, offset = 0, userId, type } = {}) {
    let q = supabase
      .from('transactions')
      .select('id, created_at, user_id, type, amount, fee, net_amount, status, description, metadata')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (userId) q = q.eq('user_id', userId);
    if (type) q = q.eq('type', type);
    return q;
  },

  // ---- Notifications -------------------------------------------------------------------------
  async listNotifications() {
    return supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50);
  },

  async setNotificationActive(id, isActive, profile) {
    return wrap('notifications.toggle', async (user) => {
      if (!can(profile, 'notifications.toggle')) return { data: null, error: { message: 'Missing privilege: notifications.toggle' } };
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_active: isActive })
        .eq('id', id)
        .select('*')
        .single();
      if (!error) {
        await audit('notification.toggled', {
          targetType: 'notification', targetId: id, details: { is_active: isActive, by: user.email },
        });
      }
      return { data, error };
    });
  },

  // ===================== REVENUE / DASHBOARD =====================
  // Platform revenue = deposits & upgrades (income); withdrawals (expense).
  async getRevenueSummary() {
    return wrap('dashboard.view', async (user) => {
      const since30 = new Date(Date.now() - 30 * 864e5).toISOString();
      const [allTx, wk, wl, users] = await Promise.all([
        supabase.from('transactions').select('type,amount,created_at').order('created_at', { ascending: false }).limit(5000),
        supabase.from('transactions').select('type,amount,created_at').gte('created_at', since30).limit(10000),
        supabase.from('withdrawal_requests').select('amount,status,created_at').order('created_at', { ascending: false }).limit(5000),
        supabase.from('users').select('id,is_active'),
      ]);
      if (allTx.error || wl.error) return { data: null, error: allTx.error || wl.error };
      const tx = allTx.data || [];
      const withdrawals = wl.data || [];
      const sum = (rows, pred) => rows.reduce((a, r) => (pred(r) ? a + Math.abs(Number(r.amount) || 0) : a), 0);
      const isIncome = (t) => ['deposit', 'upgrade', 'admin_credit'].includes(t);
      const isExpense = (t) => ['withdrawal', 'admin_debit'].includes(t);
      const completedWd = withdrawals.filter((w) => String(w.status).toUpperCase() === 'COMPLETED');
      const grossIncome = sum(tx, (r) => isIncome(r.type));
      const grossExpense = sum(tx, (r) => isExpense(r.type)) + completedWd.reduce((a, w) => a + Number(w.amount || 0), 0);
      const bucket = (rows, slice, isIncome) => {
        const m = {};
        for (const r of rows) {
          const k = String(r.created_at).slice(0, slice);
          m[k] = m[k] || { income: 0, expense: 0 };
          if (isIncome(r.type)) m[k].income += Math.abs(Number(r.amount) || 0);
          if (isExpense(r.type)) m[k].expense += Math.abs(Number(r.amount) || 0);
        }
        return Object.entries(m).map(([k, v]) => ({ period: k, ...v })).sort((a, b) => a.period.localeCompare(b.period));
      };
      const users_ = users.data || [];
      return {
        data: {
          gross_income: grossIncome,
          gross_expense: grossExpense,
          net: grossIncome - grossExpense,
          income_30d: sum(wk.data || [], (r) => isIncome(r.type)),
          expense_30d: sum(wk.data || [], (r) => isExpense(r.type)),
          deposits_total: sum(tx, (r) => r.type === 'deposit'),
          upgrades_total: sum(tx, (r) => r.type === 'upgrade'),
          withdrawals_pending: withdrawals.filter((w) => String(w.status).toUpperCase() === 'PENDING').reduce((a, w) => a + Number(w.amount || 0), 0),
          withdrawals_completed: completedWd.reduce((a, w) => a + Number(w.amount || 0), 0),
          pending_withdrawal_count: withdrawals.filter((w) => String(w.status).toUpperCase() === 'PENDING').length,
          total_users: users_.length,
          active_users: users_.filter((u) => u.is_active !== false).length,
          monthly: bucket(tx, 7),
          daily_30: bucket(wk.data || [], 10),
        },
        error: null,
      };
    });
  },

  // ===================== TRANSACTIONS MANAGEMENT =====================
  async listTransactions({ search = '', type = '', limit = 60 } = {}) {
    return wrap('transactions.view', async (user) => {
      let q = supabase.from('transactions').select('id,user_id,type,amount,description,created_at').order('created_at', { ascending: false }).limit(limit);
      if (type) q = q.eq('type', type);
      const { data, error } = await q;
      if (error) return { data: null, error };
      let rows = data || [];
      if (search) rows = rows.filter((t) => String(t.description || '').toLowerCase().includes(search.toLowerCase()));
      return { data: rows, error: null };
    });
  },

  async updateTransaction(id, patch, details) {
    const priv = patch && patch.amount != null ? 'transactions.edit_amount' : 'transactions.edit_description';
    return wrap(priv, async (user) => {
      const { data, error } = await supabase.from('transactions').update(patch).eq('id', id).select().single();
      if (!error) await audit('transaction.updated', { targetType: 'transaction', targetId: id, details: { ...details, patch, by: user.email } });
      return { data, error };
    });
  },

  async deleteTransaction(id, reason) {
    return wrap('transactions.delete', async (user) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (!error) await audit('transaction.deleted', { targetType: 'transaction', targetId: id, details: { reason, by: user.email } });
      return { data: null, error };
    });
  },

  // ===================== ANNOUNCEMENTS (in-app posters) =====================
  async listAnnouncements() {
    return wrap('notifications.view', async () => {
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(100);
      return { data, error };
    });
  },

  async createAnnouncement(payload, details) {
    return wrap('notifications.create', async (user) => {
      const { data, error } = await supabase.from('notifications').insert(payload).select().single();
      if (!error) await audit('announcement.created', { targetType: 'notification', targetId: data?.id, details: { ...details, heading: payload.heading, by: user.email } });
      return { data, error };
    });
  },

  async updateAnnouncement(id, patch, details) {
    return wrap('notifications.edit', async (user) => {
      const { data, error } = await supabase.from('notifications').update(patch).eq('id', id).select().single();
      if (!error) await audit('announcement.updated', { targetType: 'notification', targetId: id, details: { ...details, patch, by: user.email } });
      return { data, error };
    });
  },

  async deleteAnnouncement(id, reason) {
    return wrap('notifications.delete', async (user) => {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (!error) await audit('announcement.deleted', { targetType: 'notification', targetId: id, details: { reason, by: user.email } });
      return { data: null, error };
    });
  },

  // ===================== LEVELS / PACKAGES =====================
  async listLevels() {
    return wrap('levels.view', async () => {
      const { data, error } = await supabase.from('levels').select('*').order('number', { ascending: true });
      return { data, error };
    });
  },

  async updateLevel(id, patch, details) {
    return wrap('levels.edit', async (user) => {
      const { data, error } = await supabase.from('levels').update(patch).eq('id', id).select().single();
      if (!error) await audit('level.updated', { targetType: 'level', targetId: id, details: { ...details, patch, by: user.email } });
      return { data, error };
    });
  },

  async createLevel(payload, details) {
    return wrap('levels.create', async (user) => {
      const { data, error } = await supabase.from('levels').insert(payload).select().single();
      if (!error) await audit('level.created', { targetType: 'level', targetId: data?.id, details: { ...details, by: user.email } });
      return { data, error };
    });
  },

  // ===================== PLATFORM CONFIG =====================
  async getConfig(keys) {
    return wrap('settings.view', async () => {
      const { data, error } = await supabase.from('system_settings').select('key,value').in('key', keys);
      if (error) return { data: null, error };
      return { data: Object.fromEntries((data || []).map((row) => [row.key, row.value])), error: null };
    });
  },

  async setConfig(key, value, details) {
    return wrap('settings.app', async (user) => {
      const { data, error } = await supabase.from('system_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' }).select().single();
      if (!error) await audit('settings.updated', { targetType: 'setting', targetId: key, details: { ...details, key, value, by: user.email } });
      return { data, error };
    });
  },

  // ===================== PWA STATS =====================
  async getPwaStats() {
    return wrap('pwa.stats', async () => {
      const { data, error } = await supabase.from('pwa_events').select('event,platform,user_agent,session_id,created_at').order('created_at', { ascending: false }).limit(5000);
      if (error) return { data: null, error };
      const rows = data || [];
      const count = (t) => rows.filter((e) => e.event === t).length;
      const tally = (field) => rows.reduce((m, e) => { const k = e[field] || 'unknown'; m[k] = (m[k] || 0) + 1; return m; }, {});
      return {
        data: {
          total: rows.length,
          installs: count('install_accepted') + count('installed'),
          prompts: count('beforeinstallprompt'),
          sessions: count('session_start'),
          by_platform: tally('platform'),
          recent: rows.slice(0, 25),
        },
        error: null,
      };
    });
  },

  /** Fire-and-forget client-side PWA event tracking. */
  async trackPwaEvent(event, sessionId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('pwa_events').insert({ event, session_id: sessionId || null, user_id: user?.id || null, platform: navigator.userAgent, user_agent: navigator.userAgent });
    } catch (e) {
      // tracking must never break the app
    }
  },
};

export default adminService;
