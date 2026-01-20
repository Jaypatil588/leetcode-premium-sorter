export const MAJOR_COMPANIES = [
  'Microsoft',
  'Apple',
  'Google',
  'Netflix',
  'Meta',
  'Uber',
  'Amazon',
  'TikTok',
  'X'
];

export const SIDEBAR_STORAGE_KEY = 'sidebarCollapsed';

export async function fetchUserProfileApi(sessionToken, csrfToken, allCookies) {
  const query = `
    query globalData {
      userStatus {
        username
        isSignedIn
        isPremium
        avatar
      }
    }
  `;

  const headers = {
    'Content-Type': 'application/json',
    'x-lc-session': sessionToken,
    'x-lc-csrf': csrfToken,
    'x-csrftoken': csrfToken
  };

  if (allCookies) {
    headers['x-lc-all-cookies'] = allCookies;
  }

  const response = await fetch('/api/leetcode', {
    method: 'POST',
    headers,
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  const data = await response.json();
  return data;
}

