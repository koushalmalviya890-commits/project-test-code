# Setting Up Google OAuth for Cumma

This guide will walk you through the process of setting up Google OAuth for the Cumma application.

## Prerequisites

1. A Google account
2. Access to the [Google Cloud Console](https://console.cloud.google.com/)

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click on "New Project"
4. Enter a name for your project (e.g., "Cumma")
5. Click "Create"

## Step 2: Configure OAuth Consent Screen

1. In your new project, go to "APIs & Services" > "OAuth consent screen"
2. Select "External" as the user type (unless you have a Google Workspace account)
3. Click "Create"
4. Fill in the required information:
   - App name: Cumma
   - User support email: Your email address
   - Developer contact information: Your email address
5. Click "Save and Continue"
6. Skip adding scopes by clicking "Save and Continue"
7. Add test users if you're in testing mode, then click "Save and Continue"
8. Review your settings and click "Back to Dashboard"

## Step 3: Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Name: "Cumma Web Client"
5. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production URL (e.g., `https://your-domain.com`)
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://your-domain.com/api/auth/callback/google` (for production)
7. Click "Create"
8. Note down the Client ID and Client Secret

## Step 4: Update Environment Variables

Add the following variables to your `.env.local` file:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here
```

For production, make sure to update the `NEXTAUTH_URL` to your production URL.

## Step 5: Generate a NextAuth Secret

You can generate a random string for `NEXTAUTH_SECRET` using:

```bash
openssl rand -base64 32
```

## Testing the Integration

1. Start your development server
2. Go to the sign-in page
3. Click "Sign in with Google"
4. You should be redirected to Google's authentication page
5. After signing in, you'll be redirected back to your application
6. If you're a new user, you'll be prompted to choose an account type (Startup or Service Provider)

## Troubleshooting

- If you encounter "Error 400: redirect_uri_mismatch", make sure your redirect URIs in the Google Cloud Console match exactly with what your application is using.
- If you're getting "Invalid client" errors, double-check your Client ID and Client Secret in the `.env.local` file.
- For other issues, check the server logs for more detailed error messages. 