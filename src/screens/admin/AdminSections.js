// Extended admin sections — mounted by AdminPanelScreen.
// Sections: Revenue Dashboard, Announcements, Platform Config, PWA Insights,
// Report Center (PNG / PDF / CSV export).
//
// Distinct visual identity: violet "back-office" theme, clearly separate from
// the blue user-facing app.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SafeIonicons from '../../components/SafeIonicons';
import { colors, spacing } from '../../constants/theme';
import { adminService } from '../../services/adminService';
import PlatformAlert from '../../utils/platformAlert';
import { exportRefAsPng, exportRefAsPdf, exportCsv } from '../../utils/reportExport';

// ---- admin-only palette (deliberately different from the user app) ---------
const AC = {
  bg: ['#1a0b2e', '#2d1b4e', '#1f1235'],
  surface: 'rgba(74, 20, 140, 0.28)',
  surfaceSolid: '#2b1847',
  border: 'rgba(156, 39, 176, 0.45)',
  text: '#f3e5f5',
  sub: '#ce93d8',
  accent: '#e040fb',
  accent2: '#7c4dff',
  money: '#00e676',
  warn: '#ffab00',
  danger: '#ff5252',
  dim: 'rgba(243, 229, 245, 0.55)',
};

const fmtKES = (n) => `KES ${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const fmtDT = (d) => (d ? new Date(d).toLocaleString() : '—');

// ---------------- Small building blocks ----------------

const Section = ({ title, icon, children, right }) => (
  <View style={sec.section}>
    <View style={sec.sectionHead}>
      <SafeIonicons name={icon} size={16} color={AC.accent} />
      <Text style={sec.sectionTitle}>{title}</Text>
      {right}
    </View>
    {children}
  </View>
);

const Stat = ({ icon, value, label, tone }) => (
  <View style={sec.stat}>
    <SafeIonicons name={icon} size={18} color={tone || AC.accent} />
    <Text style={[sec.statValue, { color: tone || AC.text }]} numberOfLines={1}>{value}</Text>
    <Text style={sec.statLabel}>{label}</Text>
  </View>
);

const Btn = ({ label, onPress, tone = 'violet', small, icon }) => {
  const bg = { violet: AC.accent2, green: '#2e7d32', red: '#b71c1c', ghost: 'transparent', amber: '#8d6e00' }[tone] || AC.accent2;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ backgroundColor: bg, borderWidth: tone === 'ghost' ? 1 : 0, borderColor: AC.border, borderRadius: 10, paddingVertical: small ? 7 : 11, paddingHorizontal: small ? 12 : 16, marginRight: spacing.sm, marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center' }}
    >
      {icon ? <SafeIonicons name={icon} size={14} color={AC.text} style={{ marginRight: 6 }} /> : null}
      <Text style={{ color: AC.text, fontWeight: '700', fontSize: small ? 12 : 13 }}>{label}</Text>
    </TouchableOpacity>
  );
};

const TF = ({ label, value, onChangeText, placeholder, numeric, multiline }) => (
  <View style={{ marginTop: spacing.sm }}>
    {label ? <Text style={sec.tfLabel}>{label}</Text> : null}
    <TextInput
      style={[sec.tf, multiline && { minHeight: 70, textAlignVertical: 'top' }]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={AC.dim}
      keyboardType={numeric ? 'numeric' : 'default'}
      multiline={multiline}
    />
  </View>
);

const Row = ({ title, sub, right, onPress }) => {
  const body = (
    <>
      <View style={{ flex: 1 }}>
        <Text style={sec.rowTitle} numberOfLines={1}>{title}</Text>
        {sub ? <Text style={sec.rowSub} numberOfLines={2}>{sub}</Text> : null}
      </View>
      {right}
    </>
  );
  return onPress ? (
    <TouchableOpacity style={sec.row} onPress={onPress}>{body}</TouchableOpacity>
  ) : (
    <View style={sec.row}>{body}</View>
  );
};

const Chip = ({ text, tone = 'violet' }) => {
  const color = { violet: AC.accent, green: AC.money, red: AC.danger, amber: AC.warn, gray: AC.dim }[tone] || AC.accent;
  return (
    <View style={{ borderWidth: 1, borderColor: color, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 6 }}>
      <Text style={{ color, fontSize: 10, fontWeight: '700' }}>{text}</Text>
    </View>
  );
};

const BarChart = ({ data, h = 120 }) => {
  const max = Math.max(1, ...data.map((d) => Math.max(d.income, d.expense)));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: h + 26 }}>
      {data.map((d) => (
        <View key={d.period} style={{ flex: 1, alignItems: 'center', marginHorizontal: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: h }}>
            <View style={{ width: 7, height: Math.max(2, (d.income / max) * h), backgroundColor: AC.money, borderRadius: 3, marginRight: 2 }} />
            <View style={{ width: 7, height: Math.max(2, (d.expense / max) * h), backgroundColor: AC.danger, borderRadius: 3 }} />
          </View>
          <Text style={sec.chartX} numberOfLines={1}>{d.period}</Text>
        </View>
      ))}
    </View>
  );
};

// ---------------- Announcements form ----------------

const ANNOUNCE_PAGES = ['all_pages', 'home', 'task', 'upgrade', 'team', 'account', 'wealth_fund', 'recharge', 'withdraw', 'history', 'spin'];

const AnnouncementForm = ({ initial, onSaved, onCancel }) => {
  const [f, setF] = useState(initial ? {
    page_name: initial.page_name || 'all_pages',
    poster_number: initial.poster_number || 1,
    type: initial.type || initial.notification_type || 'news',
    icon: initial.icon || 'megaphone',
    heading: initial.heading || initial.title || '',
    content: initial.content || initial.body || '',
    button_1: initial.button_1 || '',
    button_2: initial.button_2 || '',
    image_url: initial.image_url || '',
    apply_to_levels: initial.apply_to_levels || [0, 1, 2, 3, 4, 5, 6],
    status: initial.status ?? initial.is_active ?? true,
  } : {
    page_name: 'all_pages', poster_number: 1, type: 'news', icon: 'megaphone',
    heading: '', content: '', button_1: '', button_2: '', image_url: '',
    apply_to_levels: [0, 1, 2, 3, 4, 5, 6], status: true,
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!f.heading.trim() || !f.content.trim()) {
      PlatformAlert.alert('Missing content', 'Give the announcement a heading and a message.');
      return;
    }
    setSaving(true);
    const payload = {
      page_name: f.page_name,
      poster_number: Number(f.poster_number) || 1,
      status: !!f.status,
      is_active: !!f.status,
      apply_to_levels: f.apply_to_levels,
      type: f.type,
      icon: f.icon || 'megaphone',
      heading: f.heading.trim(),
      content: f.content.trim(),
      button_1: f.button_1 || null,
      button_2: f.button_2 || null,
      show_on_startup: false,
      dismissible: true,
      has_image: !!f.image_url,
      image_url: f.image_url || null,
    };
    const res = initial
      ? await adminService.updateAnnouncement(initial.id, payload, { reason: 'edited in admin panel' })
      : await adminService.createAnnouncement(payload, { reason: 'created in admin panel' });
    setSaving(false);
    if (res.error) PlatformAlert.alert('Save failed', res.error.message || 'Could not save the announcement.');
    else { PlatformAlert.alert('Saved', 'Announcement is live.'); onSaved(); }
  };

  return (
    <Modal visible animationType="slide" transparent={false}>
      <LinearGradient colors={AC.bg} style={{ flex: 1 }}>
        <View style={sec.modalHead}>
          <TouchableOpacity onPress={onCancel}><SafeIonicons name="arrow-back" size={22} color={AC.text} /></TouchableOpacity>
          <Text style={sec.modalTitle}>{initial ? 'Edit Announcement' : 'New Announcement'}</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 80 }}>
          <TF label="Heading" value={f.heading} onChangeText={(v) => setF((s) => ({ ...s, heading: v }))} placeholder="e.g. Weekend Bonus Event!" />
          <TF label="Message" value={f.content} onChangeText={(v) => setF((s) => ({ ...s, content: v }))} multiline placeholder="What do you want users to know?" />
          <Text style={sec.tfLabel}>Show on page</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {ANNOUNCE_PAGES.map((p) => (
              <Btn key={p} small tone={f.page_name === p ? 'violet' : 'ghost'} label={p.replace('_', ' ')} onPress={() => setF((s) => ({ ...s, page_name: p }))} />
            ))}
          </View>
          <Text style={sec.tfLabel}>Type</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {['news', 'advertisement', 'warning', 'promotion', 'update', 'maintenance'].map((t) => (
              <Btn key={t} small tone={f.type === t ? 'violet' : 'ghost'} label={t} onPress={() => setF((s) => ({ ...s, type: t }))} />
            ))}
          </View>
          <Text style={sec.tfLabel}>Poster slot</Text>
          <View style={{ flexDirection: 'row' }}>
            {[1, 2, 3].map((n) => (
              <Btn key={n} small tone={Number(f.poster_number) === n ? 'violet' : 'ghost'} label={`Poster ${n}`} onPress={() => setF((s) => ({ ...s, poster_number: n }))} />
            ))}
          </View>
          <TF label="Image URL (optional)" value={f.image_url} onChangeText={(v) => setF((s) => ({ ...s, image_url: v }))} placeholder="https://…" />
          <TF label="Button 1 label (optional)" value={f.button_1} onChangeText={(v) => setF((s) => ({ ...s, button_1: v }))} />
          <TF label="Button 2 label (optional)" value={f.button_2} onChangeText={(v) => setF((s) => ({ ...s, button_2: v }))} />
          <Text style={sec.tfLabel}>Visible to levels</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {[0, 1, 2, 3, 4, 5, 6].map((n) => {
              const on = f.apply_to_levels.includes(n);
              return <Btn key={n} small tone={on ? 'violet' : 'ghost'} label={`L${n}`} onPress={() => setF((s) => ({ ...s, apply_to_levels: on ? s.apply_to_levels.filter((x) => x !== n) : [...s.apply_to_levels, n] }))} />;
            })}
          </View>
          <View style={{ flexDirection: 'row', marginTop: spacing.md }}>
            <Btn label="Cancel" tone="ghost" onPress={onCancel} />
            <Btn label={saving ? 'Saving…' : 'Publish Announcement'} tone="green" onPress={saving ? () => {} : save} />
          </View>
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
};

// ---------------- Section: Revenue Dashboard ----------------

export const RevenueDashboard = ({ refreshKey }) => {
  const [rev, setRev] = useState(null);
  const [loading, setLoading] = useState(true);
  const captureRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await adminService.getRevenueSummary();
    setRev(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  if (loading) return <ActivityIndicator color={AC.accent} style={{ marginTop: 30 }} />;
  if (!rev) return <Text style={sec.dimText}>Revenue data unavailable.</Text>;

  const last7 = rev.daily_30.slice(-7);

  return (
    <View ref={captureRef} collapsable={false}>
      <Section title="Platform Money Flow" icon="trending-up">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Stat icon="arrow-down" value={fmtKES(rev.gross_income)} label="Total Income (deposits & upgrades)" tone={AC.money} />
          <Stat icon="arrow-up" value={fmtKES(rev.gross_expense)} label="Total Expense (payouts)" tone={AC.danger} />
          <Stat icon="stats-chart" value={fmtKES(rev.net)} label="Net Position" tone={rev.net >= 0 ? AC.money : AC.danger} />
          <Stat icon="hourglass" value={fmtKES(rev.withdrawals_pending)} label={`Awaiting payout (${rev.pending_withdrawal_count})`} tone={AC.warn} />
        </View>
      </Section>

      <Section title="Last 7 Days" icon="calendar">
        <BarChart data={last7} />
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <Chip text="■ income" tone="green" />
          <Chip text="■ expense" tone="red" />
        </View>
      </Section>

      <Section title="Monthly" icon="bar-chart">
        {rev.monthly.length === 0 ? <Text style={sec.dimText}>No history yet.</Text> : <BarChart data={rev.monthly} h={90} />}
      </Section>

      <Section title="Business Snapshot" icon="business">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Stat icon="people" value={rev.total_users} label="Total users" />
          <Stat icon="person" value={rev.active_users} label="Active users" tone={AC.money} />
          <Stat icon="cash" value={fmtKES(rev.deposits_total)} label="Deposits all-time" />
          <Stat icon="ribbon" value={fmtKES(rev.upgrades_total)} label="Upgrades all-time" />
          <Stat icon="checkmark-done" value={fmtKES(rev.withdrawals_completed)} label="Paid out" />
        </View>
      </Section>
    </View>
  );
};

// ---------------- Section: Announcements ----------------

export const AnnouncementsSection = ({ can, refreshKey }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState(null); // {} new | announcement edit

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await adminService.listAnnouncements();
    setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const toggle = async (a) => {
    const next = !(a.status ?? a.is_active);
    const { error } = await adminService.updateAnnouncement(a.id, { status: next, is_active: next }, { reason: next ? 'shown' : 'hidden' });
    if (error) PlatformAlert.alert('Failed', error.message);
    else load();
  };

  const remove = (a) => {
    PlatformAlert.alert('Delete announcement?', `"${a.heading || a.title}" will be removed for all users.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const { error } = await adminService.deleteAnnouncement(a.id, 'deleted in admin panel');
        if (error) PlatformAlert.alert('Failed', error.message);
        else load();
      } },
    ]);
  };

  if (loading) return <ActivityIndicator color={AC.accent} style={{ marginTop: 30 }} />;

  return (
    <View>
      {can('notifications.create') ? (
        <Btn label="＋ New Announcement" icon="add" tone="green" onPress={() => setEditor({})} />
      ) : null}
      {items.length === 0 ? (
        <Text style={sec.dimText}>No announcements yet. Create one — it appears instantly on the selected page for the selected levels.</Text>
      ) : items.map((a) => (
        <Row
          key={a.id}
          title={a.heading || a.title || '(untitled)'}
          sub={`${(a.page_name || '').replace('_', ' ')} · ${(a.type || a.notification_type || '')} · ${(a.content || a.body || '').slice(0, 60)}`}
          right={(
            <View style={{ alignItems: 'flex-end' }}>
              <Chip text={(a.status ?? a.is_active) ? 'LIVE' : 'HIDDEN'} tone={(a.status ?? a.is_active) ? 'green' : 'gray'} />
              <View style={{ flexDirection: 'row', marginTop: 6 }}>
                {can('notifications.edit') ? <Btn small label="Edit" tone="ghost" onPress={() => setEditor(a)} /> : null}
                {can('notifications.edit') ? <Btn small label={(a.status ?? a.is_active) ? 'Hide' : 'Show'} tone="ghost" onPress={() => toggle(a)} /> : null}
                {can('notifications.delete') ? <Btn small label="Del" tone="red" onPress={() => remove(a)} /> : null}
              </View>
            </View>
          )}
        />
      ))}
      {editor ? (
        <AnnouncementForm initial={editor.heading ? editor : null} onSaved={() => { setEditor(null); load(); }} onCancel={() => setEditor(null)} />
      ) : null}
    </View>
  );
};

// ---------------- Section: Platform Config ----------------

export const PlatformConfigSection = ({ can, refreshKey }) => {
  const [vals, setVals] = useState(null);
  const [edit, setEdit] = useState(null); // { key, value, hint }

  const DEFINITIONS = [
    { group: 'Money & Payouts', icon: 'cash', items: [
      { key: 'withdrawal_fee_percentage', label: 'Withdrawal fee (%)', numeric: true },
      { key: 'min_withdrawal_amount', label: 'Minimum withdrawal (KES)', numeric: true },
      { key: 'max_withdrawal_amount', label: 'Maximum withdrawal (KES)', numeric: true },
    ] },
    { group: 'Referrals', icon: 'people', items: [
      { key: 'referral_level1_percentage', label: 'Level-1 referral bonus (%)', numeric: true },
      { key: 'referral_level2_percentage', label: 'Level-2 referral bonus (%)', numeric: true },
      { key: 'referral_level3_percentage', label: 'Level-3 referral bonus (%)', numeric: true },
    ] },
    { group: 'Tasks & Spin', icon: 'checkbox', items: [
      { key: 'task_reward_multiplier', label: 'Task reward multiplier', numeric: true },
      { key: 'spin_cost', label: 'Spin cost (KES)', numeric: true },
      { key: 'spin_max_daily', label: 'Max daily spins', numeric: true },
      { key: 'spin_enabled', label: 'Spins enabled (true/false)' },
    ] },
    { group: 'WhatsApp & Support', icon: 'chatbubbles', items: [
      { key: 'whatsapp_group_link', label: 'WhatsApp group link' },
      { key: 'whatsapp_support_number', label: 'WhatsApp customer care number' },
    ] },
    { group: 'PWA Install Prompt', icon: 'phone-portrait', items: [
      { key: 'pwa_install_prompt', label: 'Install prompt (enabled/disabled)' },
      { key: 'pwa_prompt_every_visit', label: 'Prompt every visit (true/false)' },
      { key: 'pwa_prompt_delay_seconds', label: 'Prompt delay (seconds)', numeric: true },
      { key: 'pwa_ios_banner', label: 'iOS banner (enabled/disabled)' },
    ] },
    { group: 'Other', icon: 'settings', items: [
      { key: 'maintenance_mode', label: 'Maintenance mode (true/false)' },
    ] },
  ];
  const ALL_KEYS = DEFINITIONS.flatMap((g) => g.items.map((i) => i.key));

  const load = useCallback(async () => {
    const { data } = await adminService.getConfig(ALL_KEYS);
    setVals(data || {});
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  if (!vals) return <ActivityIndicator color={AC.accent} style={{ marginTop: 30 }} />;

  const save = async () => {
    if (!edit) return;
    const v = String(edit.value).trim();
    if (!v) { PlatformAlert.alert('Empty value', 'Enter a value or cancel.'); return; }
    const { error } = await adminService.setConfig(edit.key, v, { reason: `changed ${edit.key}` });
    if (error) PlatformAlert.alert('Save failed', error.message);
    else { setEdit(null); load(); }
  };

  return (
    <View>
      <Text style={sec.dimText}>These are live platform defaults — every user's app reads them on load. Saved changes apply within seconds.</Text>
      {DEFINITIONS.map((g) => (
        <Section key={g.group} title={g.group} icon={g.icon}>
          {g.items.map((it) => (
            <Row
              key={it.key}
              title={it.label}
              sub={it.key}
              right={(
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={can('settings.app') ? () => setEdit({ key: it.key, value: String(vals[it.key] ?? '') }) : null}>
                  <Text style={sec.valText} numberOfLines={1}>{String(vals[it.key] ?? '—')}</Text>
                  <SafeIonicons name="create" size={15} color={AC.accent} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              )}
            />
          ))}
        </Section>
      ))}
      <Modal visible={!!edit} animationType="fade" transparent>
        <View style={sec.overlay}>
          <View style={sec.modalCard}>
            <Text style={sec.modalTitle2}>{edit?.key}</Text>
            <TF label="New value" value={edit?.value || ''} onChangeText={(v) => setEdit((e) => ({ ...e, value: v }))} multiline={false} />
            <View style={{ flexDirection: 'row' }}>
              <Btn label="Cancel" tone="ghost" onPress={() => setEdit(null)} />
              <Btn label="Save" tone="green" onPress={save} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ---------------- Section: PWA Insights ----------------

export const PwaInsightsSection = ({ refreshKey }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let on = true;
    adminService.getPwaStats().then(({ data }) => { if (on) setStats(data); });
    return () => { on = false; };
  }, [refreshKey]);

  if (!stats) return <ActivityIndicator color={AC.accent} style={{ marginTop: 30 }} />;

  const rate = stats.sessions > 0 ? Math.round((stats.installs / stats.sessions) * 100) : 0;

  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <Stat icon="log-in" value={stats.sessions} label="Browser sessions tracked" />
        <Stat icon="download" value={stats.installs} label="Installs completed" tone={AC.money} />
        <Stat icon="notifications" value={stats.prompts} label="Install prompts shown" tone={AC.warn} />
        <Stat icon="trending-up" value={`${rate}%`} label="Session → install rate" tone={AC.accent} />
      </View>
      <Section title="By Platform" icon="desktop">
        {Object.entries(stats.by_platform).map(([k, v]) => <Row key={k} title={k} right={<Chip text={String(v)} tone="violet" />} />)}
      </Section>
      <Section title="Latest Events" icon="pulse">
        {stats.recent.length === 0 ? <Text style={sec.dimText}>No events yet — open the app in a browser to generate them.</Text> : stats.recent.map((e, i) => (
          <Row key={`${e.created_at}-${i}`} title={e.event} sub={`${e.platform?.slice(0, 60) || ''} · ${fmtDT(e.created_at)}`} />
        ))}
      </Section>
    </View>
  );
};

// ---------------- Section: Report Center ----------------

const REPORT_TYPES = [
  { key: 'revenue', label: 'Revenue & Expense', icon: 'trending-up', priv: 'reports.revenue' },
  { key: 'transactions', label: 'Transactions', icon: 'swap-horizontal', priv: 'reports.transactions' },
  { key: 'withdrawals', label: 'Withdrawals', icon: 'cash', priv: 'reports.withdrawals' },
  { key: 'users', label: 'Users', icon: 'people', priv: 'reports.users' },
  { key: 'pwa', label: 'PWA & Installs', icon: 'phone-portrait', priv: 'reports.pwa' },
];

export const ReportCenter = ({ can }) => {
  const [type, setType] = useState('revenue');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState('');
  const captureRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setData(null);
    if (type === 'revenue') {
      const { data: d } = await adminService.getRevenueSummary();
      setData(d);
    } else if (type === 'transactions') {
      const { data: d } = await adminService.listTransactions({ limit: 40 });
      setData(d || []);
    } else if (type === 'withdrawals') {
      const { data: d } = await adminService.listWithdrawals({ status: '' });
      setData(d || []);
    } else if (type === 'users') {
      const { data: d } = await adminService.listUsers({ limit: 60 });
      setData(d || []);
    } else if (type === 'pwa') {
      const { data: d } = await adminService.getPwaStats();
      setData(d);
    }
    setLoading(false);
  }, [type]);

  useEffect(() => { load(); }, [load]);

  const tableRows = () => {
    if (!data) return [];
    if (type === 'revenue') {
      return [
        ['Metric', 'Value'],
        ['Total income', fmtKES(data.gross_income)],
        ['Total expense', fmtKES(data.gross_expense)],
        ['Net', fmtKES(data.net)],
        ['Income last 30d', fmtKES(data.income_30d)],
        ['Expense last 30d', fmtKES(data.expense_30d)],
        ['Deposits all-time', fmtKES(data.deposits_total)],
        ['Upgrades all-time', fmtKES(data.upgrades_total)],
        ['Withdrawals pending', fmtKES(data.withdrawals_pending)],
        ['Withdrawals paid', fmtKES(data.withdrawals_completed)],
        ['Users', `${data.active_users}/${data.total_users} active`],
      ];
    }
    if (type === 'transactions') {
      return [['Date', 'Type', 'Amount', 'Description'], ...data.map((t) => [fmtDT(t.created_at), t.type, fmtKES(t.amount), t.description || ''])];
    }
    if (type === 'withdrawals') {
      return [['Date', 'User', 'Amount', 'Status'], ...data.map((w) => [fmtDT(w.created_at), w.user_email || w.user_phone || w.user_id, fmtKES(w.amount), w.status])];
    }
    if (type === 'users') {
      return [['Joined', 'Name', 'Email', 'Level', 'Income', 'Recharge', 'Status'], ...data.map((u) => [fmtDT(u.created_at), u.name || '', u.email || '', String(u.current_level ?? ''), String(u.income_wallet ?? ''), String(u.recharge_wallet ?? ''), u.is_active ? 'active' : 'inactive'])];
    }
    if (type === 'pwa') {
      return [
        ['Metric', 'Value'],
        ['Sessions', String(data.sessions)],
        ['Install prompts', String(data.prompts)],
        ['Installs', String(data.installs)],
        ...Object.entries(data.by_platform).map(([k, v]) => [`Platform: ${k}`, String(v)]),
      ];
    }
    return [];
  };

  const doExport = async (kind) => {
    setBusy(kind);
    if (kind === 'csv') {
      exportCsv(tableRows(), `earnii_${type}_${new Date().toISOString().slice(0, 10)}`);
    } else if (kind === 'png') {
      const r = await exportRefAsPng(captureRef, `earnii_${type}_${new Date().toISOString().slice(0, 10)}`);
      if (!r.ok) PlatformAlert.alert('Export failed', r.error?.message || 'Could not capture the report.');
    } else if (kind === 'pdf') {
      const r = await exportRefAsPdf(captureRef, `earnii_${type}_${new Date().toISOString().slice(0, 10)}`, `Earnii ${type} report`);
      if (!r.ok) PlatformAlert.alert('Export failed', r.error?.message || 'Could not build the PDF.');
    }
    setBusy('');
  };

  const visibleReports = REPORT_TYPES.filter((r) => !r.priv || can(r.priv));

  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {visibleReports.map((r) => (
          <Btn key={r.key} small icon={r.icon} tone={type === r.key ? 'violet' : 'ghost'} label={r.label} onPress={() => setType(r.key)} />
        ))}
      </View>

      <View ref={captureRef} collapsable={false} style={{ marginTop: spacing.md }}>
        <Section title={`${REPORT_TYPES.find((r) => r.key === type)?.label || ''} — ${new Date().toLocaleDateString()}`} icon="document-text">
          {loading ? <ActivityIndicator color={AC.accent} /> : (
            type === 'revenue' && data ? (
              <>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  <Stat icon="arrow-down" value={fmtKES(data.gross_income)} label="Income" tone={AC.money} />
                  <Stat icon="arrow-up" value={fmtKES(data.gross_expense)} label="Expense" tone={AC.danger} />
                  <Stat icon="stats-chart" value={fmtKES(data.net)} label="Net" />
                </View>
                {data.daily_30?.length ? <BarChart data={data.daily_30.slice(-10)} h={80} /> : null}
              </>
            ) : (
              tableRows().slice(0, 25).map((r, i) => (
                <View key={i} style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: AC.border, paddingVertical: 5 }}>
                  {r.slice(0, 4).map((c, j) => (
                    <Text key={j} style={{ flex: 1, color: j === 0 ? AC.sub : AC.text, fontSize: 11, fontWeight: i === 0 ? '700' : '400' }} numberOfLines={1}>{String(c)}</Text>
                  ))}
                </View>
              ))
            )
          )}
        </Section>
      </View>

      <Section title="Download" icon="cloud-download">
        <Text style={sec.dimText}>The export captures exactly what is shown above, including the chart.</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Btn label={busy === 'png' ? 'Building…' : 'PNG image'} icon="image" tone="violet" onPress={() => doExport('png')} />
          <Btn label={busy === 'pdf' ? 'Building…' : 'PDF document'} icon="document" tone="violet" onPress={() => doExport('pdf')} />
          <Btn label="CSV data" icon="grid" tone="ghost" onPress={() => doExport('csv')} />
        </View>
      </Section>
    </View>
  );
};

// ---------------- styles ----------------

const sec = {
  section: { backgroundColor: AC.surface, borderRadius: 14, borderWidth: 1, borderColor: AC.border, padding: spacing.md, marginBottom: spacing.md },
  sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { color: AC.text, fontWeight: '800', fontSize: 14, marginLeft: 8, flex: 1 },
  stat: { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: spacing.sm, width: '47%', marginRight: '3%', marginBottom: spacing.sm },
  statValue: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  statLabel: { color: AC.dim, fontSize: 10.5, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: 10, padding: 10, marginBottom: 8 },
  rowTitle: { color: AC.text, fontWeight: '700', fontSize: 13 },
  rowSub: { color: AC.dim, fontSize: 11, marginTop: 2 },
  valText: { color: AC.money, fontWeight: '700', fontSize: 12, maxWidth: 130 },
  tf: { backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: AC.border, borderRadius: 10, color: AC.text, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13 },
  tfLabel: { color: AC.sub, fontSize: 11, fontWeight: '700', marginTop: spacing.md, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  dimText: { color: AC.dim, fontSize: 12, lineHeight: 18, marginBottom: spacing.sm },
  chartX: { color: AC.dim, fontSize: 8.5, marginTop: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  modalCard: { backgroundColor: AC.surfaceSolid, borderRadius: 16, borderWidth: 1, borderColor: AC.border, padding: spacing.lg, width: '100%' },
  modalTitle2: { color: AC.text, fontWeight: '800', fontSize: 15, marginBottom: spacing.xs },
  modalHead: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: AC.border },
  modalTitle: { color: AC.text, fontWeight: '800', fontSize: 16, marginLeft: spacing.md, flex: 1 },
};

export const adminSectionStyles = sec;
export const ADMIN_COLORS = AC;
