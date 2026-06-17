/**
 * Vercel Serverless Function: /api/youtube-refresh
 * Uses a stored refresh_token to get a fresh access_token silently.
 * Called automatically before YouTube uploads when the access token has expired.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const body = req.method === 'POST' ? req.body : req.query;
  const { refresh_token } = body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'refresh_token is required' });
  }

  const clientId = process.env.VITE_YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

  if (!clientSecret) {
    return res.status(500).json({ error: 'YOUTUBE_CLIENT_SECRET environment variable is not configured on Vercel' });
  }

  try {
    const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token'
      })
    });

    const refreshData = await refreshRes.json();

    if (!refreshRes.ok || refreshData.error) {
      console.error('[youtube-refresh] Token refresh failed:', refreshData);
      return res.status(400).json({ error: refreshData.error_description || refreshData.error || 'Failed to refresh YouTube access token' });
    }

    return res.status(200).json({
      access_token: refreshData.access_token,
      expires_in: refreshData.expires_in || 3600,
      token_type: refreshData.token_type || 'Bearer'
    });
  } catch (err) {
    console.error('[youtube-refresh] Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
