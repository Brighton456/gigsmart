// Netlify Edge Function for API optimization
export default async (request, context) => {
  const url = new URL(request.url);
  
  // Handle Supabase API requests
  if (url.pathname.startsWith('/api/supabase')) {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    // Rewrite to Supabase endpoint
    const newUrl = `${supabaseUrl}/rest/v1/${url.pathname.replace('/api/supabase/', '')}`;
    
    const response = await fetch(newUrl, {
      method: request.method,
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        ...Object.fromEntries(request.headers)
      },
      body: request.method !== 'GET' ? await request.text() : undefined
    });
    
    return response;
  }
  
  // Handle static assets with caching
  if (url.pathname.startsWith('/assets/')) {
    const response = await fetch(request);
    
    // Add caching headers
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    
    return response;
  }
  
  // Default: serve static files
  return await fetch(request);
};
