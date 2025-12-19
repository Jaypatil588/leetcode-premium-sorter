// LeetCode Auth Helper - Content Script
// Injects window.leetcodeAuth API into the web app

console.log('🔧 LeetCode Auth Helper: Content script starting...', {
  url: window.location.href,
  hasChrome: typeof chrome !== 'undefined',
  hasRuntime: typeof chrome?.runtime !== 'undefined'
});

// We need to inject the API script into the page context (Main World)
// so the web app can access it. Content scripts live in an "Isolated World".

const injectScript = document.createElement('script');
injectScript.src = chrome.runtime.getURL('injected.js');
injectScript.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(injectScript);

// Listen for messages from the injected script and forward to background
window.addEventListener('message', async (event) => {
  if (event.source !== window) return;

  if (event.data.type === 'LEETCODE_AUTH_LOGIN') {
    chrome.runtime.sendMessage({ type: 'START_AUTH' }, (response) => {
      window.postMessage({ 
        type: 'LEETCODE_AUTH_LOGIN_RESULT',
        data: response,
        error: chrome.runtime.lastError ? chrome.runtime.lastError.message : (response?.error)
      }, '*');
    });
  }
  
  else if (event.data.type === 'LEETCODE_AUTH_GET_TOKEN') {
    chrome.runtime.sendMessage({ type: 'GET_COOKIES' }, (response) => {
      window.postMessage({ 
        type: 'LEETCODE_AUTH_GET_TOKEN_RESULT',
        data: response,
        error: chrome.runtime.lastError ? chrome.runtime.lastError.message : null
      }, '*');
    });
  }
  
  else if (event.data.type === 'LEETCODE_AUTH_LOGOUT') {
    chrome.runtime.sendMessage({ type: 'CLEAR_AUTH' }, (response) => {
      window.postMessage({ 
        type: 'LEETCODE_AUTH_LOGOUT_RESULT',
        data: response,
        error: chrome.runtime.lastError ? chrome.runtime.lastError.message : (response?.error)
      }, '*');
    });
  }
});

// Listen for background messages (auth success)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'AUTH_SUCCESS') {
    // Forward to main page
    window.postMessage({
      type: 'LEETCODE_AUTH_SUCCESS_EVENT',
      detail: { session: request.session, csrf: request.csrf }
    }, '*');
    
    // Also dispatch legacy event for compatibility
    const script = document.createElement('script');
    script.textContent = `
      window.dispatchEvent(new CustomEvent('leetcode-auth-success', {
        detail: ${JSON.stringify({ session: request.session, csrf: request.csrf })}
      }));
    `;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
    
    sendResponse({ received: true });
  }
});

console.log('LeetCode Auth Helper: Extension loaded and ready');
