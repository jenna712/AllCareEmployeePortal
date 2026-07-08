/**
 * Netlify Identity Authentication Module
 * Manages user authentication and email domain validation for All Care Central
 */

const AUTH_CONFIG = {
  allowedEmailDomain: '@allcaretherapygt.com',
  authStorageKey: 'ac_auth_user'
};

/**
 * Initialize Netlify Identity and setup authentication
 */
function initNetlifyIdentity() {
  if (typeof netlifyIdentity === 'undefined') {
    console.error('Netlify Identity widget not loaded');
    return;
  }

  // Initialize Netlify Identity
  netlifyIdentity.init();

  // Set up event listeners
  netlifyIdentity.on('login', handleLogin);
  netlifyIdentity.on('logout', handleLogout);
  netlifyIdentity.on('error', handleAuthError);

  // Check if user is already logged in
  checkAuthStatus();
}

/**
 * Check current authentication status and validate user
 */
function checkAuthStatus() {
  const user = netlifyIdentity.currentUser();
  console.log('Checking auth status - Current user:', user);

  if (!user) {
    // User is not logged in - show Netlify Identity modal
    console.log('No user found, showing login modal');
    showLoginModal();
    return false;
  }

  // Extract and validate user email
  const email = getUserEmail(user);
  console.log('User email:', email);
  
  if (!email) {
    console.error('Unable to retrieve email from user object');
    showErrorDialog('Unable to verify email. Please refresh or sign in again.');
    return false;
  }

  // Validate user email domain
  const isValid = isValidUserEmail(user);
  
  if (isValid === null) {
    // Unable to verify
    console.error('Unable to verify email domain');
    showErrorDialog('Unable to verify email. Please refresh or sign in again.');
    return false;
  }
  
  if (!isValid) {
    console.warn(`Unauthorized email domain: ${email}`);
    handleUnauthorizedUser(user);
    return false;
  }

  // User is authenticated and authorized
  console.log(`Authorized user: ${email}`);
  showPortalContent();
  storeAuthUser(user);
  return true;
}

/**
 * Decode JWT payload (base64 decode the middle section)
 */
function decodeJWT(token) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (second part)
    const payload = parts[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (err) {
    console.error('Failed to decode JWT:', err);
    return null;
  }
}

/**
 * Extract email from Netlify Identity user object
 * Checks multiple possible locations for email data
 */
function getUserEmail(user) {
  if (!user) {
    console.warn('getUserEmail: user object is null/undefined');
    return null;
  }

  console.log('FULL NETLIFY USER:', user);
  
  // Try direct email property first
  if (user.email) {
    console.log('Email found in user.email:', user.email);
    return user.email;
  }
  
  // Try user_metadata.email
  if (user.user_metadata && user.user_metadata.email) {
    console.log('Email found in user.user_metadata.email:', user.user_metadata.email);
    return user.user_metadata.email;
  }
  
  // Try app_metadata.email
  if (user.app_metadata && user.app_metadata.email) {
    console.log('Email found in user.app_metadata.email:', user.app_metadata.email);
    return user.app_metadata.email;
  }
  
  // Try full_name from user_metadata (sometimes contains email)
  if (user.user_metadata && user.user_metadata.full_name) {
    const fullName = user.user_metadata.full_name;
    if (fullName.includes('@')) {
      console.log('Email found in user.user_metadata.full_name:', fullName);
      return fullName;
    }
  }
  
  // Try to decode JWT token
  if (user.token && user.token.access_token) {
    console.log('Attempting to decode JWT token...');
    const decoded = decodeJWT(user.token.access_token);
    if (decoded && decoded.email) {
      console.log('Email found in JWT payload:', decoded.email);
      return decoded.email;
    }
    if (decoded) {
      console.log('JWT payload (no email):', decoded);
    }
  }
  
  // Try app_metadata.provider_id (sometimes has email info)
  if (user.app_metadata && user.app_metadata.provider_id) {
    console.log('Provider ID:', user.app_metadata.provider_id);
  }
  
  console.warn('No email found in user object after checking all locations');
  return null;
}

/**
 * Validate that user email ends with allowed domain
 */
function isValidUserEmail(user) {
  const email = getUserEmail(user);
  
  if (!email) {
    console.warn('Cannot validate email: no email found in user object');
    return null; // Return null to indicate "unable to verify" rather than false (deny)
  }
  
  const lowerEmail = email.toLowerCase();
  const isValid = lowerEmail.endsWith(AUTH_CONFIG.allowedEmailDomain);
  
  console.log('DETECTED EMAIL:', email);
  console.log('Email validation result:', isValid);
  
  return isValid;
}

/**
 * Handle successful login
 */
function handleLogin(user) {
  console.log('Login event - User object:', user);
  
  const email = getUserEmail(user);
  console.log('Extracted email:', email);
  
  if (!email) {
    console.error('No email found in user object');
    showErrorDialog('Unable to verify email. Please refresh or sign in again.');
    return;
  }
  
  const isValid = isValidUserEmail(user);
  
  if (isValid === null) {
    // Unable to verify
    console.error('Unable to verify email domain');
    showErrorDialog('Unable to verify email. Please refresh or sign in again.');
    return;
  }
  
  if (!isValid) {
    handleUnauthorizedUser(user);
    return;
  }

  storeAuthUser(user);
  showPortalContent();
  updateSignedInEmail();
}

/**
 * Handle logout
 */
function handleLogout() {
  console.log('Logout event');
  clearAuthUser();
  showLoginModal();
}

/**
 * Handle unauthorized user (wrong email domain)
 */
function handleUnauthorizedUser(user) {
  const email = getUserEmail(user) || 'unknown';
  console.warn(`Unauthorized user: ${email}`);
  netlifyIdentity.logout();
  
  // Show error message
  const errorMsg = `Access Denied: Your email (${email}) is not authorized. Only @allcaretherapygt.com emails can access this portal.`;
  showErrorDialog(errorMsg);
}

/**
 * Handle authentication errors
 */
function handleAuthError(err) {
  console.error('Auth error:', err);
}

/**
 * Store authenticated user in local storage
 */
function storeAuthUser(user) {
  try {
    const email = getUserEmail(user);
    localStorage.setItem(AUTH_CONFIG.authStorageKey, JSON.stringify({
      id: user.id,
      email: email,
      name: user.user_metadata?.full_name || email,
      timestamp: Date.now()
    }));
    console.log('User stored in localStorage:', email);
  } catch (err) {
    console.error('Failed to store user:', err);
  }
}

/**
 * Clear stored auth user
 */
function clearAuthUser() {
  try {
    localStorage.removeItem(AUTH_CONFIG.authStorageKey);
  } catch (err) {
    console.error('Failed to clear user:', err);
  }
}

/**
 * Get stored authenticated user
 */
function getStoredAuthUser() {
  try {
    const stored = localStorage.getItem(AUTH_CONFIG.authStorageKey);
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.error('Failed to retrieve stored user:', err);
    return null;
  }
}

/**
 * Show portal content
 */
function showPortalContent() {
  const appContent = document.querySelector('.app');
  if (appContent) {
    appContent.style.display = 'flex';
  }
  updateSignedInEmail();
}

/**
 * Hide portal content
 */
function hidePortalContent() {
  const appContent = document.querySelector('.app');
  if (appContent) {
    appContent.style.display = 'none';
  }
}

/**
 * Update signed-in email display in the sidebar
 */
function updateSignedInEmail() {
  const emailEl = document.getElementById('signedInEmail');
  if (!emailEl) return;

  const user = netlifyIdentity.currentUser();
  const email = getUserEmail(user) || 'Unknown user';
  emailEl.textContent = `Signed in as: ${email}`;

  const signOutBtn = document.getElementById('sidebarSignOut');
  if (signOutBtn) {
    signOutBtn.removeEventListener('click', logoutUser);
    signOutBtn.addEventListener('click', logoutUser);
  }
}

/**
 * Show Netlify Identity login modal
 */
function showLoginModal() {
  console.log('Showing login modal');
  hidePortalContent();
  if (typeof netlifyIdentity !== 'undefined') {
    netlifyIdentity.open('login');
  } else {
    console.error('Netlify Identity widget not loaded');
  }
}

/**
 * Show error dialog
 */
function showErrorDialog(message) {
  // Create a simple error alert
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 32px;
    border-radius: 8px;
    box-shadow: 0 18px 45px rgba(20,34,44,0.08);
    z-index: 10000;
    max-width: 450px;
    text-align: center;
    font-family: 'Raleway', system-ui, -apple-system, sans-serif;
  `;
  
  // Check if this is a retry/email issue or access denied
  const isRetryable = message.includes('Unable to verify') || message.includes('refresh');
  const buttonText = isRetryable ? 'Try Again' : 'Try Another Account';
  
  errorDiv.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 16px;">⛔</div>
    <h2 style="margin: 0 0 12px 0; color: #17212A; font-size: 1.25rem;">
      ${isRetryable ? 'Verification Issue' : 'Access Denied'}
    </h2>
    <p style="margin: 0 0 20px 0; color: #6E8592; font-size: 0.95rem;">${message}</p>
    <button onclick="this.parentElement.remove(); showLoginModal();" style="
      background: #5CA8B8;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    ">${buttonText}</button>
  `;
  
  document.body.appendChild(errorDiv);
}

/**
 * Logout current user
 */
function logoutUser() {
  netlifyIdentity.logout();
}

/**
 * Get current authenticated user
 */
function getCurrentUser() {
  return netlifyIdentity.currentUser() || getStoredAuthUser();
}

/**
 * Initialize auth when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNetlifyIdentity);
} else {
  initNetlifyIdentity();
}
