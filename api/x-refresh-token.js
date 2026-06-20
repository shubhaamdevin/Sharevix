export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { refresh_token, redirect_uri } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'Missing refresh_token' });
  }

  try {
    const client_id = process.env.VITE_X_CLIENT_ID || 'cDBfZDlidGJSNw1CTWNDamxrcUM6MTpjaQ';
    const client_secret = process.env.X_CLIENT_SECRET || '1f43cKeDsBnq4-j0HT3QV67hXwV16puFWutknQNfnCs_HP38jG';

    if (!client_id || !client_secret) {
      return res.status(500).json({ error: 'X OAuth credentials not configured' });
    }

    const authHeader = 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64');

    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authHeader
      },
      body: new URLSearchParams({
        refresh_token,
        grant_type: 'refresh_token',
        redirect_uri: redirect_uri || `${process.env.VITE_APP_URL || 'https://sharevix.vercel.app'}/auth/callback`
      })
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      return res.status(tokenRes.status).json({ error: tokenData.error_description || tokenData.error || 'Failed to refresh token' });
    }

    return res.status(200).json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in
    });
  } catch (error) {
    console.error('X token refresh error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
