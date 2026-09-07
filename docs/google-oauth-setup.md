# Google OAuth 2.0 Setup Guide for Pick Your Document

This document explains how to set up and configure official Google OAuth 2.0 authentication for both local development and production.

---

## 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Log in with your Google account.
3. Click the project dropdown at the top navigation bar and click **New Project**.
4. Project Name: `Pick Your Document`.
5. Click **Create**.

---

## 2. Configure the OAuth Consent Screen

1. In the Google Cloud left menu, navigate to **APIs & Services** > **OAuth consent screen**.
2. Select **External** user type and click **Create**.
3. Fill in the App Information:
   - **App Name**: Pick Your Document
   - **User support email**: `kirankr93439343@gmail.com`
   - **Developer contact email**: `kirankr93439343@gmail.com`
4. Click **Save and Continue**.
5. Under **Scopes**, click **Add or Remove Scopes** and select:
   - `openid`
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
6. Click **Save and Continue**.
7. Under **Test users**, add `kirankr93439343@gmail.com` and any test Google email addresses.
8. Click **Save and Continue**.

---

## 3. Create OAuth 2.0 Client Credentials

1. Navigate to **APIs & Services** > **Credentials**.
2. Click **Create Credentials** > **OAuth client ID**.
3. Select **Application type**: `Web application`.
4. Name: `Pick Your Document Web Client`.

### Authorized JavaScript Origins
- **Local Development**:
  - `http://localhost:3000`
  - `http://127.0.0.1:3000`
  - `http://localhost:8000`
- **Production Environment**:
  - `https://kirankr9343.github.io`

### Authorized Redirect URIs
- **Local Development**:
  - `http://localhost:8000/api/v1/auth/google/callback`
  - `http://localhost:3000/#/dashboard`
- **Production Environment**:
  - `https://kirankr9343.github.io/pick_your_document/`

5. Click **Create**.
6. Copy your generated **Client ID** and **Client Secret**.

---

## 4. Environment Variables Setup

Create or update the `.env` file in the project root:

```env
# Backend & Application Secrets
PROJECT_NAME="Pick Your Document"
APP_ENV="development"
SECRET_KEY="SUPER_SECRET_PRODUCTION_KEY_PICK_YOUR_DOCUMENT_2026"

# Initial Super-Admin Assignment
INITIAL_ADMIN_EMAIL="kirankr93439343@gmail.com"

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:8000/api/v1/auth/google/callback"
```

---

## 5. Restart Application & Verification

1. Restart the backend server:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```
2. Open `http://localhost:3000` in your browser.
3. Click **Sign In** -> **Continue with Google**.
4. Google OAuth 2.0 consent window will authenticate your account securely.
