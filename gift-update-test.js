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

  const r = await fetch(URL + '/rest/v1/gift_codes?code=eq.TEST2026', { method: 'PATCH', headers: H, body: JSON.stringify({ current_uses: 1, is_active: false, updated_at: new Date().toISOString() }) });
  console.log('PATCH TEST2026:', r.status, (await r.text()).slice(0, 300));
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
