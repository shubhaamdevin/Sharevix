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
    const client_id = process.env.VITE_THREADS_CLIENT_ID || '1326065365671425';
    const client_secret = process.env.THREADS_CLIENT_SECRET || '0d69561cdb902abe89d902bd5c46bfb7';

    if (!client_id || !client_secret) {
      return res.status(500).json({ error: 'Threads VITE_THREADS_CLIENT_ID or THREADS_CLIENT_SECRET environment variables are not configured on Vercel' });
    }

    // 1. Exchange authorization code for a short-lived access token
    const tokenRes = await fetch('https://graph.threads.net/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id,
        client_secret,
        grant_type: 'authorization_code',
        redirect_uri: redirect_uri || `${process.env.VITE_APP_URL || 'https://sharevix.vercel.app'}/auth/callback`,
        code
      })
    });

    const tokenData = await tokenRes.json();
    
    if (!tokenRes.ok) {
      return res.status(tokenRes.status).json({ error: tokenData.error_message || tokenData.error?.message || 'Failed to exchange Threads authorization code' });
    }

    const shortLivedToken = tokenData.access_token;
    const threadsUserId = tokenData.user_id;

    // 2. Exchange short-lived token for a long-lived access token (valid for 60 days)
    const longLivedRes = await fetch(`https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${client_secret}&access_token=${shortLivedToken}`);
    const longLivedData = await longLivedRes.json();

    if (!longLivedRes.ok) {
      // Fallback: return short-lived token if long-lived token exchange fails
      return res.status(200).json({
        access_token: shortLivedToken,
        user_id: threadsUserId
      });
    }

    return res.status(200).json({
      access_token: longLivedData.access_token,
      user_id: threadsUserId,
      expires_in: longLivedData.expires_in
    });

  } catch (error) {
    console.error('Threads token exchange error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
