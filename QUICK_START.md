# Quick Start - Netlify Identity Setup

Complete these steps to enable authentication for All Care Central.

## 1. Deploy to Netlify (5 minutes)

If not already deployed:

```bash
npm install -D netlify-cli
netlify deploy --prod
```

## 2. Enable Netlify Identity (2 minutes)

1. Go to your Netlify site dashboard
2. Click **Settings** → **Identity**
3. Click **Enable Identity**
4. Under "Registration," select **Invite Only**
5. Save

✅ Identity is now enabled!

## 3. Add Google OAuth (5 minutes)

### Get Google OAuth Credentials
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one
3. Search for and enable "Google+ API"
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose "Web application"
6. Add authorized redirect URI:
   ```
   https://yoursite.netlify.app/.netlify/identity/callback
   ```
   (Replace `yoursite` with your actual Netlify domain)
7. Click Create
8. Copy the **Client ID** and **Client Secret**

### Add to Netlify
1. Back in Netlify Identity settings, scroll to **External Providers**
2. Click **Add provider** → **Google**
3. Paste Client ID and Client Secret
4. Click Save

✅ Google OAuth is now configured!

## 4. Add Your First User (2 minutes)

1. In Netlify Identity, click **Invite users**
2. Enter your test email (must end with @allcaretherapygt.com)
3. Click Send
4. Check your email for invitation
5. Click the link and set your password
6. You're ready to test!

## 5. Test It Out (1 minute)

1. Visit your All Care Central site in an incognito window (clears cookies)
2. You should see the login screen with the All Care logo
3. Click "Sign in with Google"
4. Sign in with the test account you just created
5. The portal should load!

To test logout:
1. Go to the **Help** page
2. Click "Sign Out"
3. Login screen appears again ✓

## 6. Invite Employees (Variable time)

For each employee:
1. Go to Netlify Identity in site settings
2. Click **Invite users**
3. Enter their email (must end with @allcaretherapygt.com)
4. They'll get an email with instructions
5. They set their password and can sign in!

---

## Common Issues

### Can't see Google button?
- Clear your browser cache
- Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
- Check DevTools console for errors

### "Access Denied" after signing in?
- Make sure your email ends with **exactly** `@allcaretherapygt.com`
- Ask admin to verify your account exists in Netlify Identity

### Forgot your password?
- In Netlify Identity, find your user and click menu → "Trigger password reset"

---

## Next Steps

- Read `AUTHENTICATION.md` for detailed documentation
- See `IMPLEMENTATION_SUMMARY.md` for technical details
- Review `js/auth.js` for the authentication code

---

## Need Help?

- **Netlify Support**: https://support.netlify.com
- **Google OAuth Help**: https://cloud.google.com/docs/authentication/oauth2
- **Local Dev**: Use `netlify dev` to test locally

You're all set! 🎉
