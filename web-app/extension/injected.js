(function() {
  console.log('💉 Injecting LeetCode Auth API into page context...');
  
  // Create the API object in the main window
  window.leetcodeAuth = {
    login: async function() {
      return new Promise((resolve, reject) => {
        window.postMessage({ type: 'LEETCODE_AUTH_LOGIN' }, '*');
        
        const handler = (event) => {
          if (event.data && event.data.type === 'LEETCODE_AUTH_LOGIN_RESULT') {
            window.removeEventListener('message', handler);
            if (event.data.error) reject(new Error(event.data.error));
            else resolve(event.data.data);
          }
        };
        window.addEventListener('message', handler);
      });
    },

    getToken: async function() {
      return new Promise((resolve, reject) => {
        window.postMessage({ type: 'LEETCODE_AUTH_GET_TOKEN' }, '*');
        
        const handler = (event) => {
          if (event.data && event.data.type === 'LEETCODE_AUTH_GET_TOKEN_RESULT') {
            window.removeEventListener('message', handler);
            resolve(event.data.data);
          }
        };
        window.addEventListener('message', handler);
      });
    },

    logout: async function() {
      return new Promise((resolve, reject) => {
        window.postMessage({ type: 'LEETCODE_AUTH_LOGOUT' }, '*');
        
        const handler = (event) => {
          if (event.data && event.data.type === 'LEETCODE_AUTH_LOGOUT_RESULT') {
            window.removeEventListener('message', handler);
            if (event.data.error) reject(new Error(event.data.error));
            else resolve();
          }
        };
        window.addEventListener('message', handler);
      });
    },

    isInstalled: true,
    version: '1.0.0'
  };

  // Dispatch event to notify app
  window.dispatchEvent(new CustomEvent('leetcode-auth-ready'));
  console.log('✅ LeetCode Auth API injected successfully!');
})();

