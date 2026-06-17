/**
 * Vercel Serverless Function: /api/youtube-token
 * Exchanges a Google authorization code for access_token + refresh_token.
 * Uses server-side client_secret (never exposed to browser).
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const body = req.method === 'POST' ? req.body : req.query;
  const { code, redirect_uri } = body;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  const clientId = process.env.VITE_YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

  if (!clientSecret) {
    return res.status(500).json({ error: 'YOUTUBE_CLIENT_SECRET environment variable is not configured on Vercel' });
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirect_uri || `${process.env.VITE_APP_URL || 'https://sharevix.vercel.app'}/auth/callback`,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error) {
      console.error('[youtube-token] Google token exchange error:', tokenData);
      return res.status(400).json({ error: tokenData.error_description || tokenData.error || 'Failed to exchange YouTube authorization code' });
    }

    return res.status(200).json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in || 3600,
      token_type: tokenData.token_type || 'Bearer'
    });
  } catch (err) {
    console.error('[youtube-token] Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
