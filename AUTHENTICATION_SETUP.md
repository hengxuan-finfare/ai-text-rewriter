# Email/Password Authentication Setup

This extension uses Supabase email/password authentication to secure access to the text rewriting feature.

## Setup Steps

### 1. Enable Email Authentication in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/iwinuithcugihfsgepgo
2. Navigate to **Authentication** → **Providers**
3. Find **Email** in the list
4. Ensure **Enable Email provider** is toggled ON
5. Configure email settings:
   - **Enable email confirmations**: Toggle ON if you want users to verify their email
   - **Enable email change confirmations**: Toggle ON for security
   - **Secure email change**: Toggle ON for additional security

### 2. Configure Email Templates (Optional)

1. In Supabase Dashboard, go to **Authentication** → **Email Templates**
2. Customize the templates for:
   - **Confirm signup**: Email sent when users sign up
   - **Magic Link**: For passwordless login (if needed)
   - **Change Email Address**: When users change their email
   - **Reset Password**: For password recovery

### 3. Test the Authentication Flow

1. Build the extension: `pnpm run build`
2. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder
3. Click the extension icon
4. Click "Don't have an account? Sign up"
5. Enter email and password (minimum 6 characters)
6. Click "Sign Up"
7. If email confirmation is enabled, check your email and click the confirmation link
8. Sign in with your credentials
9. You should now see your email in the header and can use the text rewriter

## How It Works

- **Sign Up**: Creates a new user account with email and password
- **Sign In**: Authenticates users with their credentials
- **Session Management**: Uses Chrome storage to persist sessions across popup opens
- **Backend Validation**: Every API request validates the user's access token
- **Database**: Saves `user_id`, `prompt`, and `tone` with each rewrite request

## User Flow

1. **New User**: 
   - Opens extension → Sees sign-up form
   - Enters email and password → Clicks "Sign Up"
   - Receives confirmation email (if enabled)
   - Confirms email → Can now sign in

2. **Returning User**:
   - Opens extension → Sees sign-in form
   - Enters credentials → Clicks "Sign In"
   - Authenticated → Can use text rewriter

3. **Signed In User**:
   - Opens extension → Automatically signed in (session persisted)
   - Can use text rewriter immediately
   - Can sign out using the button in the header

## Troubleshooting

### "Invalid login credentials" error
- Check that the email and password are correct
- Ensure the user has confirmed their email (if confirmation is enabled)
- Verify the user exists in Supabase Dashboard → Authentication → Users

### "User already registered" error
- The email is already in use
- Try signing in instead of signing up
- Or use the password reset feature (if implemented)

### Session not persisting
- Verify Chrome storage permissions are granted in manifest.json
- Check browser console for any storage errors
- Try signing out and signing in again

### Email confirmation not received
- Check spam/junk folder
- Verify email settings in Supabase Dashboard
- Check Supabase logs for email delivery issues
- Ensure SMTP is properly configured in Supabase

## Security Best Practices

- Passwords must be at least 6 characters (enforced by Supabase)
- Sessions are stored securely in Chrome storage
- Access tokens are validated on every backend request
- Enable email confirmation for production use
- Consider implementing password reset functionality
- Use HTTPS for all API requests (already configured)
