// LeetCode Auth Helper - Background Service Worker
// Handles cookie extraction and authentication flow

let authInProgress = false;
let leetcodeTab = null;

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'START_AUTH') {
    handleAuthRequest(sendResponse);
    return true; // Keep channel open for async response
  } else if (request.type === 'GET_COOKIES') {
    getCookies(sendResponse);
    return true;
  } else if (request.type === 'CLEAR_AUTH') {
    clearAuth(sendResponse);
    return true;
  }
});

async function handleAuthRequest(sendResponse) {
  if (authInProgress) {
    sendResponse({ error: 'Authentication already in progress' });
    return;
  }

  authInProgress = true;

  try {
    // Check if already logged in
    const existingCookies = await getCookiesFromDomain();
    if (existingCookies.session) {
      authInProgress = false;
      sendResponse({ success: true, ...existingCookies });
      return;
    }

    // Open LeetCode login page
    leetcodeTab = await chrome.tabs.create({
      url: 'https://leetcode.com/accounts/login/',
      active: true
    });

    // Monitor for successful login (cookie appears)
    const checkInterval = setInterval(async () => {
      const cookies = await getCookiesFromDomain();
      
      if (cookies.session) {
        clearInterval(checkInterval);
        authInProgress = false;
        
        // Close the login tab
        if (leetcodeTab) {
          chrome.tabs.remove(leetcodeTab.id).catch(() => {});
        }

        // Send cookies back to content script
        chrome.tabs.query({ url: 'http://localhost:5173/*' }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: 'AUTH_SUCCESS',
              ...cookies
            });
          }
        });

        sendResponse({ success: true, ...cookies });
      }
    }, 1000);

    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(checkInterval);
      authInProgress = false;
      if (leetcodeTab) {
        chrome.tabs.remove(leetcodeTab.id).catch(() => {});
      }
      sendResponse({ error: 'Authentication timeout' });
    }, 300000);

  } catch (error) {
    authInProgress = false;
    sendResponse({ error: error.message });
  }
}

async function getCookiesFromDomain() {
  const cookies = {
    session: null,
    csrf: null
  };

  try {
    // Get LEETCODE_SESSION cookie
    const sessionCookie = await chrome.cookies.get({
      url: 'https://leetcode.com',
      name: 'LEETCODE_SESSION'
    });

    if (sessionCookie) {
      cookies.session = sessionCookie.value;
    }

    // Get csrftoken cookie
    const csrfCookie = await chrome.cookies.get({
      url: 'https://leetcode.com',
      name: 'csrftoken'
    });

    if (csrfCookie) {
      cookies.csrf = csrfCookie.value;
    }

    // Store in extension storage for persistence
    if (cookies.session) {
      await chrome.storage.local.set({ leetcode_auth: cookies });
    }

  } catch (error) {
    console.error('Error getting cookies:', error);
  }

  return cookies;
}

async function getCookies(sendResponse) {
  const cookies = await getCookiesFromDomain();
  sendResponse(cookies);
}

async function clearAuth(sendResponse) {
  try {
    await chrome.storage.local.remove('leetcode_auth');
    
    // Clear cookies
    await chrome.cookies.remove({
      url: 'https://leetcode.com',
      name: 'LEETCODE_SESSION'
    });
    
    await chrome.cookies.remove({
      url: 'https://leetcode.com',
      name: 'csrftoken'
    });

    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Check for existing session on startup
chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.local.get('leetcode_auth');
  if (stored.leetcode_auth) {
    console.log('LeetCode Auth Helper: Existing session found');
  }
});
