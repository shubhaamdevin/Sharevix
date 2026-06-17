export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle both GET and POST requests by parsing query params and request body
  const method = req.method;
  let requestData = {};
  
  if (method === 'POST') {
    requestData = req.body || {};
  } else {
    // For GET request, parse query params
    requestData = req.query || {};
  }

  const { path, targetMethod = 'GET', params = {}, body = {} } = requestData;

  if (!path) {
    return res.status(400).json({ error: 'path parameter is required' });
  }

  try {
    // Construct target URL
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const queryParams = new URLSearchParams(params);
    const targetUrl = `https://graph.threads.net/v1.0${cleanPath}?${queryParams.toString()}`;

    console.log(`Threads Proxy forwarding: ${targetMethod} ${targetUrl}`);

    const fetchOptions = {
      method: targetMethod.toUpperCase(),
    };

    if (fetchOptions.method !== 'GET' && fetchOptions.method !== 'HEAD' && Object.keys(body).length > 0) {
      fetchOptions.headers = {
        'Content-Type': 'application/json'
      };
      fetchOptions.body = JSON.stringify(body);
    }

    const apiRes = await fetch(targetUrl, fetchOptions);
    const apiData = await apiRes.json();

    return res.status(apiRes.status).json(apiData);

  } catch (error) {
    console.error('Threads proxy error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
