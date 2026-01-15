import puppeteer from 'puppeteer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOGIN_URL = 'https://leetcode.com/accounts/login/';
const COOKIE_FILE = path.resolve(__dirname, '..', '.leetcode-auth.json');

async function initBrowser() {
  const headless = false; // Always show browser for manual login from UI
  const userAgent =
    process.env.LC_USER_AGENT ||
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  const browser = await puppeteer.launch({
    headless,
    defaultViewport: {
      width: 1280,
      height: 800
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent(userAgent);

  return { browser, page };
}

async function waitForAuthCookies(page, timeoutMs = 5 * 60 * 1000, initialSessionValue = null) {
  const start = Date.now();

  console.log('Waiting for login cookies...');
  while (Date.now() - start < timeoutMs) {
    const cookies = await page.cookies('https://leetcode.com');
    const session = cookies.find((c) => c.name === 'LEETCODE_SESSION');
    const csrf = cookies.find((c) => c.name === 'csrftoken');

    if (session && csrf && (!initialSessionValue || session.value !== initialSessionValue)) {
      console.log('Cookies found!');
      return { cookies, session, csrf };
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  throw new Error('Timed out waiting for LEETCODE_SESSION and csrftoken cookies');
}

async function manualLogin(page) {
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle2' });

  const initialCookies = await page.cookies('https://leetcode.com');
  const initialSession = initialCookies.find((c) => c.name === 'LEETCODE_SESSION');
  const initialSessionValue = initialSession ? initialSession.value : null;

  console.log('Opened LeetCode login page in automated browser.');
  console.log('Please complete login manually in the opened browser window.');
  console.log('The script will automatically detect when you are logged in.');

  return waitForAuthCookies(page, undefined, initialSessionValue);
}

async function scriptedLogin(page) {
  const username = process.env.LC_USERNAME;
  const password = process.env.LC_PASSWORD;

  if (!username || !password) {
    throw new Error('LC_USERNAME and LC_PASSWORD environment variables are required for scripted login');
  }

  await page.goto(LOGIN_URL, { waitUntil: 'networkidle2' });

  const initialCookies = await page.cookies('https://leetcode.com');
  const initialSession = initialCookies.find((c) => c.name === 'LEETCODE_SESSION');
  const initialSessionValue = initialSession ? initialSession.value : null;

  try {
    await page.waitForSelector('input[name="login"]', { timeout: 10000 });
  } catch {
    throw new Error('Could not find login input field on LeetCode login page');
  }

  try {
    await page.type('input[name="login"]', username, { delay: 30 });
    await page.type('input[name="password"]', password, { delay: 30 });

    const submitSelector = 'button[type="submit"], button[data-cy="signin-button"]';

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }),
      page.click(submitSelector)
    ]);
  } catch (error) {
    throw new Error(`Scripted login attempt failed: ${error.message}`);
  }

  return waitForAuthCookies(page, undefined, initialSessionValue);
}

async function saveCookies({ cookies, session, csrf }) {
  const payload = {
    createdAt: new Date().toISOString(),
    session: session.value,
    csrf: csrf.value,
    cookies
  };

  const json = JSON.stringify(payload, null, 2);

  await fs.writeFile(COOKIE_FILE, json, { mode: 0o600 });

  console.log(`Saved cookies to ${COOKIE_FILE}`);
}

async function main() {
  const mode = (process.env.LC_LOGIN_MODE || 'manual').toLowerCase();

  console.log('Starting LeetCode login helper');
  console.log(`Mode: ${mode === 'scripted' ? 'Scripted (LC_USERNAME/LC_PASSWORD)' : 'Manual'}`);

  const { browser, page } = await initBrowser();

  try {
    let result;

    if (mode === 'scripted') {
      result = await scriptedLogin(page);
    } else {
      result = await manualLogin(page);
    }

    const { cookies, session, csrf } = result;

    await saveCookies({ cookies, session, csrf });

    const maskedSession =
      session.value.length > 12
        ? `${session.value.slice(0, 6)}...${session.value.slice(-4)}`
        : session.value;
    const maskedCsrf =
      csrf.value.length > 12
        ? `${csrf.value.slice(0, 6)}...${csrf.value.slice(-4)}`
        : csrf.value;

    console.log('\nExtracted authentication tokens:');
    console.log(`  LEETCODE_SESSION: ${maskedSession}`);
    console.log(`  csrftoken:        ${maskedCsrf}`);
    console.log('\nThese have been stored securely in .leetcode-auth.json (git-ignored).');
    console.log('Your web app can now load them via /api/local-tokens in dev mode.');
  } catch (error) {
    console.error('Login helper failed:', error.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
