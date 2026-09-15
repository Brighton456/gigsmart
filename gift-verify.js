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

  const g = await (await fetch(URL + '/rest/v1/gift_codes?select=code,current_uses,is_active,updated_at', { headers: H })).json();
  console.log('GIFT CODES:', JSON.stringify(g));

  // Mark the partially-redeemed TEST2026 as used (the app's update failed pre-fix).
  const up = await fetch(URL + '/rest/v1/gift_codes?code=eq.TEST2026', {
    method: 'PATCH', headers: H,
    body: JSON.stringify({ current_uses: 1, is_active: false, updated_at: new Date().toISOString() }),
  });
  console.log('cleanup TEST2026:', up.status, up.status >= 300 ? (await up.text()).slice(0, 150) : 'ok');
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
