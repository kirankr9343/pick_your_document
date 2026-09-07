# Google OAuth 2.0 / Sign-In Setup Guide

This document provides step-by-step instructions to configure Google Cloud OAuth 2.0 credentials for **Pick Your Document**.

---

## 1. Open Google Cloud Console
1. Navigate to [Google Cloud Console](https://console.cloud.google.com/).
2. Log in with your Google account.
3. Create a new project or select an existing project (e.g. `Pick Your Document App`).

---

## 2. Configure OAuth Consent Screen
1. In the left navigation sidebar, go to **APIs & Services** > **OAuth consent screen**.
2. Select **External** (accessible to any user with a Google account) and click **Create**.
3. Fill in the required App information:
   - **App Name**: `Pick Your Document`
   - **User support email**: Your support email address.
   - **Developer contact information**: Your developer email address.
4. Click **Save and Continue**.
5. Under **Scopes**, click **Add or Remove Scopes** and add:
   - `openid`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
6. Click **Save and Continue** until setup completes.

---

## 3. Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**.
2. Click **+ Create Credentials** at the top and choose **OAuth client ID**.
3. Select **Application type**: `Web application`.
4. Name: `Pick Your Document Web Client`.

### 5. Authorized JavaScript Origins
Add your local development and production URLs:
- `http://localhost:3000`
- `http://localhost:8000`
- `https://kirankr9343.github.io`

### 6. Authorized Redirect URIs
Add the exact callback URL defined in the backend API:
- Development: `http://localhost:8000/api/v1/auth/google/callback`
- Production: `https://yourdomain.com/api/v1/auth/google/callback`

---

## 4. Save Secrets to `.env` File
Once created, Google will display your **Client ID** and **Client Secret**.

Update your backend `.env` file:
```env
GOOGLE_CLIENT_ID="1234567890-abcdefg.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxx"
GOOGLE_REDIRECT_URI="http://localhost:8000/api/v1/auth/google/callback"
```

---

## 5. Test Google OAuth Sign-In Flow
1. Start the FastAPI backend server:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```
2. Start the React frontend server:
   ```bash
   cd frontend
   npm run dev
   ```
3. Open `http://localhost:3000`, click **Sign In**, and select **Sign in with Gmail / Google**.
4. Complete Google authentication and verify seamless sign-in!
