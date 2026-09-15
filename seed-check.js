require('dotenv').config();
const KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

(async () => {
  const a = await fetch(URL + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'codebufftest4@example.com', password: 'Test@1234' }),
  });
  const j = await a.json();
  const H = { apikey: KEY, Authorization: 'Bearer ' + j.access_token, 'Content-Type': 'application/json' };
  const uid = j.user.id;

  const p = await fetch(URL + '/rest/v1/users?id=eq.' + uid + '&select=income_wallet,recharge_wallet,main_wallet,total_earnings,today_earnings', { headers: H });
  console.log('balances now:', JSON.stringify(await p.json()));

  const t = await fetch(URL + '/rest/v1/transactions?user_id=eq.' + uid + '&select=type,amount,description', { headers: H });
  const txs = await t.json();
  console.log('transactions count:', Array.isArray(txs) ? txs.length : txs);

  // Insert seed transactions if missing
  const now = new Date().toISOString();
  const types = Array.isArray(txs) ? txs.map(x => x.type) : [];
  for (const tx of [
    { type: 'deposit', amount: 30000, description: 'Test deposit (recharge wallet)' },
    { type: 'admin_adjustment', amount: 5000, description: 'Test credit (income wallet)' },
  ]) {
    if (types.includes(tx.type)) { console.log('skip', tx.type, '(already present)'); continue; }
    const ins = await fetch(URL + '/rest/v1/transactions', {
      method: 'POST',
      headers: H,
      body: JSON.stringify({
        user_id: uid, amount: tx.amount, net_amount: tx.amount, fee: 0,
        status: 'completed', description: tx.description, type: tx.type,
        processed_at: now, created_at: now, metadata: { seeded: true },
      }),
    });
    console.log('tx insert', tx.type, ':', ins.status);
    if (ins.status >= 300) console.log('  body:', (await ins.text()).slice(0, 250));
  }
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
