require('dotenv').config();
const KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const BASE = process.env.EXPO_PUBLIC_SUPABASE_URL;
(async () => {
  const a = await fetch(BASE + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'codebufftest4@example.com', password: 'Test@1234' }),
  });
  const j = await a.json();
  const H = { apikey: KEY, Authorization: 'Bearer ' + j.access_token };
  const tc = await (await fetch(BASE + '/rest/v1/task_completions?user_id=eq.' + j.user.id + '&select=*&order=created_at.asc', { headers: H })).json();
  console.log('COMPLETIONS:', JSON.stringify(tc).slice(0, 1500));
})();
