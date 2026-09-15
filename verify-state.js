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
  const H = { apikey: KEY, Authorization: 'Bearer ' + j.access_token };
  const uid = j.user.id;

  const p = await (await fetch(URL + '/rest/v1/users?id=eq.' + uid + '&select=current_level,level_investment,income_wallet,recharge_wallet,main_wallet,total_earnings,today_earnings,tasks_completed_today', { headers: H })).json();
  console.log('PROFILE:', JSON.stringify(p[0]));

  const t = await (await fetch(URL + '/rest/v1/transactions?user_id=eq.' + uid + '&select=type,amount,description,created_at&order=created_at.asc', { headers: H })).json();
  console.log('TRANSACTIONS:', JSON.stringify(t));

  const tc = await (await fetch(URL + '/rest/v1/task_completions?user_id=eq.' + uid + '&select=id,task_id,reward,created_at', { headers: H })).json();
  console.log('TASK_COMPLETIONS:', JSON.stringify(tc));

  const inv = await (await fetch(URL + '/rest/v1/investments?user_id=eq.' + uid + '&select=bank_name,amount,daily_rate,duration_days,status,created_at', { headers: H })).json();
  console.log('INVESTMENTS:', JSON.stringify(inv));

  const gc = await (await fetch(URL + '/rest/v1/gift_codes?code=eq.TEST2026&select=code,current_uses,is_active', { headers: H })).json();
  console.log('GIFT_CODE:', JSON.stringify(gc));
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
