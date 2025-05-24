# Gmail API Integration Setup Guide

This guide will help you set up Gmail API integration to fetch and list emails from a user's Gmail account.

## Prerequisites

- Node.js and npm installed
- A Google Cloud Platform account
- The following packages are already installed:
  - `googleapis`
  - `google-auth-library`
  - `gapi-script`

## Google Cloud Platform Setup

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### 2. Enable Gmail API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Gmail API"
3. Click on "Gmail API" and click "Enable"

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (for testing)
3. Fill in the required information:
   - App name: Your app name
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes: `https://www.googleapis.com/auth/gmail.readonly`
5. Add test users (your Gmail account) for development

### 4. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/callback`
   - For production: `https://your-domain.com/api/auth/callback`
5. Note the Client ID and Client Secret

## Environment Configuration

Your `.env.local` file should contain:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CLIENT_API_KEY=your_api_key_here
```

**Note:** The API key is optional for this implementation as we're using OAuth 2.0.

## Project Structure

```
src/
├── lib/
│   └── google/
│       └── actions.ts          # Gmail API functions
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts    # OAuth callback handler
│   ├── dashboard/
│   │   └── page.tsx           # Main Gmail integration UI
│   └── auth/
│       └── page.tsx           # Auth error handling
```

## How It Works

### 1. Authentication Flow

1. User clicks "Authenticate with Google" on the dashboard
2. User is redirected to Google's OAuth consent screen
3. After granting permission, Google redirects to `/api/auth/callback`
4. The callback exchanges the authorization code for an access token
5. User is redirected back to dashboard with the access token

### 2. Email Fetching

1. The dashboard uses the access token to call Gmail API
2. Emails are fetched and parsed into a structured format
3. Email details are logged to the browser console

## Usage Instructions

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Open the Application

Navigate to `http://localhost:3000/dashboard`

### 3. Authenticate

1. Click "Authenticate with Google"
2. Sign in with your Google account
3. Grant permission to read Gmail
4. You'll be redirected back to the dashboard

### 4. Fetch Emails

1. Configure the number of emails to fetch (1-100)
2. Optionally add a search query using Gmail search operators
3. Click "Fetch Emails & Log to Console"
4. Open browser Developer Tools (F12) to see the console output

## Gmail Search Operators

You can use Gmail search operators in the search query:

- `from:sender@example.com` - Emails from specific sender
- `to:recipient@example.com` - Emails to specific recipient
- `subject:keyword` - Emails with keyword in subject
- `is:unread` - Unread emails
- `is:read` - Read emails
- `has:attachment` - Emails with attachments
- `after:2024/01/01` - Emails after specific date
- `before:2024/12/31` - Emails before specific date

## Security Considerations

### Development vs Production

- **Development**: Access tokens are passed via URL parameters (not secure)
- **Production**: Implement proper session management or secure token storage

### Recommended Production Changes

1. Use secure session storage for access tokens
2. Implement token refresh logic
3. Add proper error handling and logging
4. Use HTTPS for all OAuth redirects
5. Implement rate limiting
6. Add proper user authentication

## API Functions

### `getGmailAuthUrl()`
Returns the Google OAuth authorization URL.

### `setGmailCredentials(code: string)`
Exchanges authorization code for access tokens.

### `fetchGmailEmails(accessToken: string, maxResults?: number, query?: string)`
Fetches emails from Gmail and returns structured data.

### `listEmailsToConsole(accessToken: string, maxResults?: number, query?: string)`
Fetches emails and logs them to the console with formatted output.

## Error Handling

The application handles various error scenarios:

- OAuth authentication errors
- Missing authorization codes
- API request failures
- Token expiration
- Network connectivity issues

## Testing

1. Test with different Gmail accounts
2. Try various search queries
3. Test with different email counts
4. Verify console output formatting
5. Test error scenarios (invalid tokens, network issues)

## Next Steps

For a production application, consider:

1. Implementing proper user authentication
2. Storing emails in a database
3. Adding email search functionality
4. Implementing real-time email notifications
5. Adding email composition features
6. Implementing proper token refresh
7. Adding comprehensive error handling
8. Implementing rate limiting and quotas

## Troubleshooting

### Common Issues

1. **"Redirect URI mismatch"**: Ensure your OAuth redirect URI matches exactly
2. **"Access blocked"**: Make sure your app is configured correctly in OAuth consent screen
3. **"Invalid credentials"**: Check your `.env.local` file and Google Cloud credentials
4. **"Scope not granted"**: Ensure Gmail read scope is configured in OAuth consent screen

### Debug Tips

1. Check browser console for error messages
2. Verify environment variables are loaded
3. Check Google Cloud Console for API quotas and usage
4. Test OAuth flow step by step
5. Verify redirect URIs are correctly configured 