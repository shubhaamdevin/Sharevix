/**
 * Vercel Serverless Function: /api/fb-long-token
 * Exchanges a Facebook short-lived user access token for a long-lived token (~60 days).
 * This is done server-side so the App Secret is never exposed to the browser.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { short_token } = req.method === 'POST' ? req.body : req.query;

  if (!short_token) {
    return res.status(400).json({ error: 'short_token is required' });
  }

  const appId = process.env.VITE_FACEBOOK_CLIENT_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!appSecret) {
    // App secret not configured – return the token as-is with a warning
    // The token will still work but expires sooner (~2 hours)
    console.warn('[fb-long-token] FACEBOOK_APP_SECRET not set in environment variables. Returning short-lived token.');
    return res.status(200).json({
      access_token: short_token,
      token_type: 'bearer',
      expires_in: 5183944, // ~60 days in seconds (optimistic fallback)
      fallback: true
    });
  }

  try {
    const url = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${encodeURIComponent(short_token)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.error) {
      const errMsg = data.error?.message || 'Failed to exchange Facebook token';
      console.error('[fb-long-token] Facebook API error:', data);
      return res.status(400).json({ error: errMsg });
    }

    return res.status(200).json({
      access_token: data.access_token,
      token_type: data.token_type || 'bearer',
      expires_in: data.expires_in || 5183944 // ~60 days
    });
  } catch (err) {
    console.error('[fb-long-token] Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
