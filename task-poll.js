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

  const tc = await (await fetch(URL + '/rest/v1/task_completions?user_id=eq.' + uid + '&select=app_id,earnings,created_at&order=created_at.desc&limit=5', { headers: H })).json();
  const p = await (await fetch(URL + '/rest/v1/users?id=eq.' + uid + '&select=tasks_completed_today,income_wallet', { headers: H })).json();
  const now = new Date().toISOString().slice(11, 19);
  console.log(now, '| count:', (Array.isArray(tc) ? tc.length : 'ERR'), '| latest:', JSON.stringify(Array.isArray(tc) ? tc.slice(0, 3) : tc), '| profile:', JSON.stringify(p[0] || p));
})();
