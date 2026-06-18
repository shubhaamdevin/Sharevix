export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const method = req.method;
  let requestData = {};
  
  if (method === 'POST') {
    requestData = req.body || {};
  } else {
    requestData = req.query || {};
  }

  const { path, targetMethod = 'GET', params = {}, body = {} } = requestData;

  if (!path) {
    return res.status(400).json({ error: 'path parameter is required' });
  }

  try {
    // Extract access token from different potential locations
    let token = requestData.access_token || params.access_token || body.access_token;
    
    // Fallback: check Authorization header from request
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace('Bearer ', '');
    }

    if (!token) {
      return res.status(400).json({ error: 'X access token is required' });
    }

    // Clean up access token from params and body so we don't forward it to X API
    if (params.access_token) delete params.access_token;
    if (body.access_token) delete body.access_token;

    // Construct target URL (X API v2)
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const queryParams = new URLSearchParams(params);
    const targetUrl = `https://api.twitter.com/2${cleanPath}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    console.log(`X Proxy forwarding: ${targetMethod} ${targetUrl}`);

    const fetchOptions = {
      method: targetMethod.toUpperCase(),
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    if (fetchOptions.method !== 'GET' && fetchOptions.method !== 'HEAD') {
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(body);
    }

    const apiRes = await fetch(targetUrl, fetchOptions);
    const apiData = await apiRes.json();

    return res.status(apiRes.status).json(apiData);

  } catch (error) {
    console.error('X proxy error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
