import express from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.post('/api/local-tokens/login', (req, res) => {
  const scriptPath = path.resolve(__dirname, '../web-app/scripts/leetcode-login.js');

  const child = spawn('node', [scriptPath], {
    stdio: 'inherit'
  });

  child.on('close', (code) => {
    if (code === 0) {
      const filePath = path.resolve(__dirname, '../web-app/.leetcode-auth.json');
      fs.readFile(filePath, 'utf8')
        .then((raw) => {
          const data = JSON.parse(raw);

          const allCookies = data.cookies
            ? data.cookies.map((c) => `${c.name}=${c.value}`).join('; ')
            : `LEETCODE_SESSION=${data.session}; csrftoken=${data.csrf}`;

          res.status(200).json({ session: data.session, csrf: data.csrf, allCookies });
        })
        .catch((err) => {
          res.status(500).json({
            error: 'Failed to read auth file after login',
            details: err.message
          });
        });
    } else {
      res.status(500).json({
        error: 'Login script failed',
        code
      });
    }
  });
});

app.get('/api/local-tokens', async (req, res) => {
  const filePath = path.resolve(__dirname, '../web-app/.leetcode-auth.json');

  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(raw);

    if (!data.session || !data.csrf) {
      res.status(400).json({ error: 'Missing session or csrf in auth file' });
      return;
    }

    const allCookies = data.cookies
      ? data.cookies.map((c) => `${c.name}=${c.value}`).join('; ')
      : `LEETCODE_SESSION=${data.session}; csrftoken=${data.csrf}`;

    res.status(200).json({ session: data.session, csrf: data.csrf, allCookies });
  } catch (error) {
    res.status(404).json({
      error: 'Auth file not found',
      details: error.message
    });
  }
});

app.post('/api/leetcode', async (req, res) => {
  const session = req.header('x-lc-session');
  const csrf = req.header('x-lc-csrf');
  const allCookies = req.header('x-lc-all-cookies');

  const cookieHeader =
    allCookies || (session && csrf ? `LEETCODE_SESSION=${session}; csrftoken=${csrf}` : null);

  if (!cookieHeader) {
    res.status(400).json({ error: 'Missing authentication cookies' });
    return;
  }

  try {
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
        Referer: 'https://leetcode.com',
        Origin: 'https://leetcode.com'
      },
      body: JSON.stringify(req.body)
    });

    const text = await response.text();

    res.status(response.status);
    res.type('application/json');
    res.send(text);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to proxy request to LeetCode',
      details: error.message
    });
  }
});

const distPath = path.resolve(__dirname, '../web-app/dist');

app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});

