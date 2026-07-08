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

  if (!user) {
    // User is not logged in - show Netlify Identity modal
    showLoginModal();
    return false;
  }

  // Validate user email domain
  if (!isValidUserEmail(user.email)) {
    handleUnauthorizedUser(user);
    return false;
  }

  // User is authenticated and authorized
  showPortalContent();
  storeAuthUser(user);
  return true;
}

/**
 * Validate that user email ends with allowed domain
 */
function isValidUserEmail(email) {
  if (!email) return false;
  return email.toLowerCase().endsWith(AUTH_CONFIG.allowedEmailDomain);
}

/**
 * Handle successful login
 */
function handleLogin(user) {
  if (!isValidUserEmail(user.email)) {
    handleUnauthorizedUser(user);
    return;
  }

  storeAuthUser(user);
  showPortalContent();
}

/**
 * Handle logout
 */
function handleLogout() {
  clearAuthUser();
  showLoginModal();
}

/**
 * Handle unauthorized user (wrong email domain)
 */
function handleUnauthorizedUser(user) {
  console.warn(`Unauthorized user: ${user.email}`);
  netlifyIdentity.logout();
  
  // Show error message
  const errorMsg = `Access Denied: Your email (${user.email}) is not authorized. Only @allcaretherapygt.com emails can access this portal.`;
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
    localStorage.setItem(AUTH_CONFIG.authStorageKey, JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email,
      timestamp: Date.now()
    }));
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
 * Show Netlify Identity login modal
 */
function showLoginModal() {
  hidePortalContent();
  if (typeof netlifyIdentity !== 'undefined') {
    netlifyIdentity.open('login');
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
    max-width: 400px;
    text-align: center;
    font-family: 'Raleway', system-ui, -apple-system, sans-serif;
  `;
  
  errorDiv.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 16px;">⛔</div>
    <h2 style="margin: 0 0 12px 0; color: #17212A; font-size: 1.25rem;">Access Denied</h2>
    <p style="margin: 0 0 20px 0; color: #6E8592; font-size: 0.95rem;">${message}</p>
    <button onclick="this.parentElement.remove(); showLoginModal();" style="
      background: #5CA8B8;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    ">Try Another Account</button>
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
