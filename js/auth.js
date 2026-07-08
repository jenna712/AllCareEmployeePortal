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
    // User is not logged in
    showLoginScreen();
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
  hideLoginScreen();
}

/**
 * Handle logout
 */
function handleLogout() {
  clearAuthUser();
  showLoginScreen();
}

/**
 * Handle unauthorized user (wrong email domain)
 */
function handleUnauthorizedUser(user) {
  console.warn(`Unauthorized user: ${user.email}`);
  netlifyIdentity.logout();
  showUnauthorizedScreen(user.email);
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
 * Show login screen and hide portal content
 */
function showLoginScreen() {
  const loginScreen = document.getElementById('netlify-login-screen');
  const appContent = document.querySelector('.app');

  if (loginScreen) {
    loginScreen.classList.add('visible');
  }
  if (appContent) {
    appContent.classList.add('hidden');
  }
}

/**
 * Hide login screen and show portal content
 */
function hideLoginScreen() {
  const loginScreen = document.getElementById('netlify-login-screen');
  const appContent = document.querySelector('.app');

  if (loginScreen) {
    loginScreen.classList.remove('visible');
  }
  if (appContent) {
    appContent.classList.remove('hidden');
  }
}

/**
 * Show portal content
 */
function showPortalContent() {
  const appContent = document.querySelector('.app');
  if (appContent) {
    appContent.classList.remove('hidden');
    appContent.classList.add('visible');
  }
}

/**
 * Show unauthorized screen for invalid email domain
 */
function showUnauthorizedScreen(email) {
  const loginScreen = document.getElementById('netlify-login-screen');
  if (loginScreen) {
    loginScreen.classList.add('visible', 'unauthorized-state');
    
    const content = loginScreen.querySelector('.login-content');
    if (content) {
      content.innerHTML = `
        <div class="unauthorized-message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h2>Access Denied</h2>
          <p>This portal is only available for All Care Therapy employees.</p>
          <p class="email-notice">Your email: <strong>${email}</strong></p>
          <p class="email-notice">Required domain: <strong>${AUTH_CONFIG.allowedEmailDomain}</strong></p>
          <button class="btn btn-secondary" onclick="netlifyIdentity.logout()">Sign out</button>
        </div>
      `;
    }
  }
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
 * Open Netlify Identity modal for login
 */
function openLoginModal() {
  if (typeof netlifyIdentity !== 'undefined') {
    netlifyIdentity.open('login');
  }
}

/**
 * Initialize auth when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNetlifyIdentity);
} else {
  initNetlifyIdentity();
}
