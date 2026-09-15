require('dotenv').config();
const KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const EMAIL = 'codebufftest4@example.com';
const PASS = 'Test@1234';

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  // 1. Sign in to get a user session
  const authRes = await fetch(URL + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  const authJson = await authRes.json();
  if (!authJson.access_token) {
    console.log('LOGIN FAILED:', authRes.status, JSON.stringify(authJson).slice(0, 200));
    process.exit(1);
  }
  const token = authJson.access_token;
  const userId = authJson.user.id;
  console.log('Logged in as', userId);

  const H = { apikey: KEY, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };

  // 2. Verify gift code is now readable by an authenticated user
  const gc = await fetch(URL + '/rest/v1/gift_codes?code=eq.TEST2026&select=code,income_wallet_amount,main_wallet_amount,is_active,current_uses', { headers: H });
  console.log('gift_codes read:', gc.status, JSON.stringify(await gc.json()));

  // 3. Fund wallets (income 5000 as admin_adjustment; recharge 30000 as deposit)
  const now = new Date().toISOString();
  const up = await fetch(URL + '/rest/v1/users?id=eq.' + userId, {
    method: 'PATCH',
    headers: H,
    body: JSON.stringify({
      income_wallet: 5000,
      recharge_wallet: 30000,
      total_earnings: 5000,
      today_earnings: 5000,
      week_earnings: 5000,
      month_earnings: 5000,
      updated_at: now,
    }),
  });
  console.log('wallet update:', up.status, JSON.stringify(await up.json()).slice(0, 150));

  for (const tx of [
    { type: 'deposit', amount: 30000, description: 'Test deposit (recharge wallet)' },
    { type: 'admin_adjustment', amount: 5000, description: 'Test credit (income wallet)' },
  ]) {
    const ins = await fetch(URL + '/rest/v1/transactions', {
      method: 'POST',
      headers: H,
      body: JSON.stringify({
        user_id: userId,
        amount: tx.amount,
        net_amount: tx.amount,
        fee: 0,
        status: 'completed',
        description: tx.description,
        type: tx.type,
        processed_at: now,
        created_at: now,
        metadata: { seeded: true },
      }),
    });
    console.log('tx insert', tx.type, ':', ins.status);
    if (ins.status >= 300) console.log('  body:', (await ins.text()).slice(0, 200));
  }

  // 4. Confirm final balances
  await sleep(500);
  const prof = await fetch(URL + '/rest/v1/users?id=eq.' + userId + '&select=income_wallet,recharge_wallet,main_wallet,total_earnings', { headers: H });
  console.log('balances:', JSON.stringify(await prof.json()));
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
