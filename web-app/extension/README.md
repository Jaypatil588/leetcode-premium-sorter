# LeetCode Auth Helper Extension

A Chrome extension that provides OAuth-like authentication for the LeetCode Premium Sorter web app.

## Quick Installation

1. Download `extension.zip` from the app
2. Open `chrome://extensions` in Chrome
3. Enable "Developer mode" (toggle in top right)
4. Drag & drop `extension.zip` OR click "Load unpacked" and select extracted folder
5. Refresh the web app

**Note:** After installation, you MUST refresh the app page for detection to work!

## How It Works

1. The extension injects a `window.leetcodeAuth` API into your web app
2. When you click "Login with LeetCode", it opens LeetCode in a new tab
3. After you log in, the extension automatically extracts your session cookies
4. The cookies are securely stored and used for GraphQL API requests
5. The login tab closes automatically

## Features

- ✅ Automatic cookie extraction
- ✅ Secure local storage
- ✅ No data leaves your computer
- ✅ Works completely offline after initial auth
- ✅ OAuth-like user experience

## Privacy

This extension:
- Only accesses leetcode.com and localhost
- Never sends data to external servers
- Stores cookies locally in your browser
- Is completely open source

## API

The extension provides these methods:

```javascript
// Start OAuth-like login flow
await window.leetcodeAuth.login();

// Get current session token
await window.leetcodeAuth.getToken();

// Clear authentication
await window.leetcodeAuth.logout();
```

## Troubleshooting

**Extension not detected:**
- Make sure you've enabled it in `chrome://extensions`
- Refresh the web app page
- Check browser console for errors

**Login not working:**
- Make sure you're logged into LeetCode
- Try clearing cookies and logging in again
- Check if LeetCode has changed their authentication

## Development

The extension consists of:
- `manifest.json` - Extension configuration
- `background.js` - Service worker for cookie access
- `content.js` - Injects API into web pages
- `icon.png` - Extension icon

## License

Open source - same as the main project.
