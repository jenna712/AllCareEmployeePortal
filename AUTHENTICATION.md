# Netlify Identity Authentication Setup

This guide explains how to configure Netlify Identity authentication for All Care Central.

## Overview

All Care Central now includes Netlify Identity authentication that:
- Requires users to sign in with their All Care email (@allcaretherapygt.com)
- Shows a centered login screen with the All Care logo and "Sign in with Google" button
- Restricts access to only users with valid @allcaretherapygt.com email addresses
- Provides a sign-out option in the Help section

## Setup Instructions

### 1. Deploy to Netlify

If not already done, deploy your site to Netlify:

```bash
npm install -D netlify-cli
# or
yarn add -D netlify-cli
```

Then deploy:
```bash
netlify deploy --prod
```

### 2. Enable Netlify Identity

1. Go to your Netlify site dashboard
2. Navigate to **Settings** → **Identity**
3. Click **Enable Identity**
4. Under "Registration," choose **Invite Only** (to prevent public signups)
5. Click **Save**

### 3. Configure Google OAuth

1. In the Identity settings, scroll to **External providers**
2. Click **Add provider** and select **Google**
3. You'll need a Google OAuth 2.0 Client ID:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project (if needed)
   - Enable the Google+ API
   - Create OAuth 2.0 credentials (Web application type)
   - Add authorized redirect URI: `https://yoursite.netlify.app/.netlify/identity/callback`
4. Copy the Client ID and Client Secret from Google into Netlify Identity settings
5. Click **Save**

### 4. Add Users

1. In Netlify Identity dashboard, click **Invite users**
2. Enter the email address of employees (must end with @allcaretherapygt.com)
3. They'll receive an invitation email to set their password
4. After signing in once, they can use "Sign in with Google" for future logins

### 5. Configure Site Settings

In your Netlify site settings, add this environment variable:

**Key:** `ALLOWED_EMAIL_DOMAIN`  
**Value:** `@allcaretherapygt.com`

(This is already configured in the auth.js file, but Netlify functions may reference it in the future)

## How It Works

### Login Flow

1. User visits any page in All Care Central
2. The `auth.js` script checks if user is authenticated
3. If not logged in:
   - Login screen is displayed with All Care logo
   - "Sign in with Google" button opens Netlify Identity modal
4. User signs in with Google account
5. Email domain is validated (@allcaretherapygt.com)
6. If valid: Portal loads normally
7. If invalid: Unauthorized message is shown, user can only sign out

### Logout Flow

1. User clicks "Sign Out" in the Help section
2. Netlify Identity session is cleared
3. Login screen is displayed again

### Files Modified/Created

- **js/auth.js** - Authentication module with Netlify Identity integration
- **css/design-system.css** - Added login screen styles
- **All HTML files** - Added Netlify Identity widget script and auth.js
- **help.html** - Added "Sign Out" option

## Browser Support

Netlify Identity works on all modern browsers. For older browser support, you may need to load polyfills.

## Troubleshooting

### "Netlify Identity widget not loaded"
- Ensure the Netlify Identity widget script loads before auth.js
- Check browser console for any script loading errors
- Verify site is deployed to Netlify (Identity only works on Netlify-hosted sites)

### Users can't sign in with Google
- Verify Google OAuth credentials are correctly set in Netlify
- Ensure redirect URI matches your site URL
- Check that redirect URI includes `/.netlify/identity/callback`

### "Access Denied" message appears
- Confirm user's email ends with @allcaretherapygt.com
- Have them sign out and try again
- Check Netlify Identity dashboard to verify user account exists

### Reset User Passwords

1. Go to Netlify Identity dashboard
2. Find the user
3. Click the dropdown menu
4. Select "Trigger password reset"
5. User will receive a password reset email

## Security Notes

- Netlify Identity uses JWT tokens stored in browser localStorage
- Tokens are automatically managed by the Netlify Identity widget
- All authentication happens securely through Netlify's servers
- Email domain validation happens client-side for immediate feedback
- Never store sensitive data in localStorage beyond what Netlify manages

## Local Development

To test authentication locally:

1. Ensure your local dev server points to your Netlify site domain
2. Or use Netlify Dev: `netlify dev`
3. This allows local testing with live Netlify Identity integration

## Additional Resources

- [Netlify Identity Documentation](https://docs.netlify.com/visitor-access/identity/overview/)
- [Netlify Identity Widget Reference](https://github.com/netlify/netlify-identity-widget)
- [Google OAuth Setup Guide](https://console.cloud.google.com/)

## Support

For issues with Netlify Identity or Google OAuth, contact:
- Netlify Support: https://support.netlify.com
- Google Cloud Support: https://cloud.google.com/support

For issues specific to All Care Central, contact your development team.
