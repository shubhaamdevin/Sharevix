export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const method = req.method;
  const requestData = method === 'POST' ? (req.body || {}) : (req.query || {});

  const { path, targetMethod = 'GET', params = {}, body = {} } = requestData;

  if (!path) {
    return res.status(400).json({ error: 'path parameter is required' });
  }

  try {
    // Resolve access token from multiple places
    let token = requestData.access_token || params.access_token || body.access_token;
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace('Bearer ', '');
    }
    if (!token) {
      return res.status(400).json({ error: 'X access token is required' });
    }

    // Remove token from forwarded params/body
    delete params.access_token;
    delete body.access_token;

    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const query = new URLSearchParams(params).toString();
    const targetUrl = `https://api.twitter.com/2${cleanPath}${query ? '?' + query : ''}`;

    const fetchOptions = {
      method: targetMethod.toUpperCase(),
      headers: { Authorization: `Bearer ${token}` }
    };
    if (fetchOptions.method !== 'GET' && fetchOptions.method !== 'HEAD') {
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(body);
    }

    const apiRes = await fetch(targetUrl, fetchOptions);
    const apiData = await apiRes.json();
    return res.status(apiRes.status).json(apiData);
  } catch (err) {
    console.error('X proxy error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
