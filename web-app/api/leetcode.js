export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = req.headers['x-lc-session'];
    const csrf = req.headers['x-lc-csrf'];

    if (!session || !csrf) {
      return res.status(401).json({ error: 'Missing session/csrf' });
    }

    const upstream = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `LEETCODE_SESSION=${session}; csrftoken=${csrf}`,
        'x-csrftoken': csrf,
        'Referer': 'https://leetcode.com'
      },
      body: JSON.stringify(req.body)
    });

    const text = await upstream.text();
    try {
      return res.status(upstream.status).json(JSON.parse(text));
    } catch {
      return res.status(upstream.status).send(text);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Proxy failed', details: error.message });
  }
}
