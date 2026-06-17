/**
 * Utility functions for detecting Meta/Facebook & Google/YouTube API credential expiration or invalidation
 * and handling automatic cleanup of local accounts/tokens.
 */

export const isFacebookTokenError = (error) => {
  if (!error) return false;

  // If it's a response-like object or has error sub-properties (e.g. Graph API error)
  const code = error.code || error.error?.code;
  const errMsg = error.message || error.error?.message || '';

  // Graph API error code 190 represents OAuthException / invalid/expired token
  if (code === 190) return true;

  // String match checks on message content
  const lowerMsg = errMsg.toLowerCase();
  return (
    lowerMsg.includes('error validating access token') ||
    lowerMsg.includes('session has expired') ||
    lowerMsg.includes('expired') ||
    lowerMsg.includes('invalid access token') ||
    lowerMsg.includes('active access token') ||
    lowerMsg.includes('malformed access token') ||
    lowerMsg.includes('has expired')
  );
};

export const disconnectFacebookAndInstagram = () => {
  // Clear Facebook credentials
  localStorage.removeItem('fb_available_pages');
  localStorage.removeItem('fb_page_id');
  localStorage.removeItem('fb_page_name');
  localStorage.removeItem('fb_access_token');
  localStorage.removeItem('facebook_username');

  // Clear Instagram credentials
  localStorage.removeItem('ig_business_account_id');
  localStorage.removeItem('instagram_username');

  // Retrieve existing connection list and remove facebook/instagram
  const savedConnections = JSON.parse(localStorage.getItem('connectedAccounts') || '[]');
  const newConnections = savedConnections.filter(id => id !== 'facebook' && id !== 'instagram');
  localStorage.setItem('connectedAccounts', JSON.stringify(newConnections));

  // Trigger page / state reloads across listeners
  window.dispatchEvent(new CustomEvent('accounts-updated'));

  // Notify the user via a global notification toast
  window.dispatchEvent(new CustomEvent('show-notification', { 
    detail: { 
      type: 'error', 
      message: 'Your Facebook session has expired. The account has been automatically disconnected. Please reconnect on the Accounts page.' 
    } 
  }));
};

export const isGoogleTokenError = (error) => {
  if (!error) return false;
  const code = error.code || error.error?.code;
  const errMsg = error.message || error.error?.message || (typeof error === 'string' ? error : '');
  if (code === 401 || code === 403) return true;
  const lowerMsg = errMsg.toLowerCase();
  return (
    lowerMsg.includes('invalid credentials') ||
    lowerMsg.includes('expired') ||
    lowerMsg.includes('auth error') ||
    lowerMsg.includes('unauthorized') ||
    lowerMsg.includes('token is invalid')
  );
};

export const disconnectYouTube = () => {
  // Clear YouTube credentials
  localStorage.removeItem('youtube_channel_id');
  localStorage.removeItem('youtube_channel_name');
  localStorage.removeItem('youtube_access_token');
  localStorage.removeItem('youtube_username');
  localStorage.removeItem('youtube_subscribers');

  // Retrieve existing connection list and remove youtube
  const savedConnections = JSON.parse(localStorage.getItem('connectedAccounts') || '[]');
  const newConnections = savedConnections.filter(id => id !== 'youtube');
  localStorage.setItem('connectedAccounts', JSON.stringify(newConnections));

  // Trigger page / state reloads across listeners
  window.dispatchEvent(new CustomEvent('accounts-updated'));

  // Notify the user via a global notification toast
  window.dispatchEvent(new CustomEvent('show-notification', { 
    detail: { 
      type: 'error', 
      message: 'Your YouTube session has expired. The account has been automatically disconnected. Please reconnect on the Accounts page.' 
    } 
  }));
};

export const isThreadsTokenError = (error) => {
  if (!error) return false;
  const code = error.code || error.error?.code;
  const errMsg = error.message || error.error?.message || (typeof error === 'string' ? error : '');

  // API error code 190 represents OAuthException / invalid/expired token.
  if (code === 190) return true;

  const lowerMsg = errMsg.toLowerCase();
  return (
    lowerMsg.includes('error validating access token') ||
    lowerMsg.includes('session has expired') ||
    lowerMsg.includes('expired') ||
    lowerMsg.includes('invalid access token') ||
    lowerMsg.includes('active access token') ||
    lowerMsg.includes('malformed access token') ||
    lowerMsg.includes('has expired')
  );
};

export const disconnectThreads = () => {
  // Clear Threads credentials
  localStorage.removeItem('threads_username');
  localStorage.removeItem('threads_access_token');
  localStorage.removeItem('threads_user_id');

  // Retrieve existing connection list and remove threads
  const savedConnections = JSON.parse(localStorage.getItem('connectedAccounts') || '[]');
  const newConnections = savedConnections.filter(id => id !== 'threads');
  localStorage.setItem('connectedAccounts', JSON.stringify(newConnections));

  // Trigger page / state reloads across listeners
  window.dispatchEvent(new CustomEvent('accounts-updated'));

  // Notify the user via a global notification toast
  window.dispatchEvent(new CustomEvent('show-notification', { 
    detail: { 
      type: 'error', 
      message: 'Your Threads session has expired. The account has been automatically disconnected. Please reconnect on the Accounts page.' 
    } 
  }));
};
