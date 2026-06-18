export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { code, redirect_uri } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  try {
    const client_id = process.env.VITE_X_CLIENT_ID || 'cDBfZDlidGJSNw1CTWNDamxrcUM6MTpjaQ';
    const client_secret = process.env.X_CLIENT_SECRET || '1f43cKeDsBnq4-j0HT3QV67hXwV16puFWutknQNfnCs_HP38jG';

    if (!client_id || !client_secret) {
      return res.status(500).json({ error: 'X OAuth Client ID or Client Secret environment variables are not configured' });
    }

    const authHeader = 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64');

    // Exchange authorization code for access token (and refresh token)
    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authHeader
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirect_uri || `${process.env.VITE_APP_URL || 'https://sharevix.vercel.app'}/auth/callback`,
        code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk' // PKCE verifier matching our challenge
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      return res.status(tokenRes.status).json({
        error: tokenData.error_description || tokenData.error || 'Failed to exchange X authorization code'
      });
    }

    // Return the tokens
    return res.status(200).json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in
    });

  } catch (error) {
    console.error('X token exchange error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
