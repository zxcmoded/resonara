// OAuth credentials — replace placeholder strings with real values before publishing.
//
// Google: https://console.cloud.google.com → APIs & Services → Credentials
//   Create OAuth 2.0 Client IDs (one each for Android, iOS, Web).
//   For Android add SHA-1 fingerprint; for iOS add your bundle ID.
//
// Facebook: https://developers.facebook.com → My Apps → Create App
//   Copy the App ID shown in the App Dashboard.

export const OAUTH_CONFIG = {
  google: {
    androidClientId: 'YOUR_GOOGLE_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    iosClientId: 'YOUR_GOOGLE_IOS_CLIENT_ID.apps.googleusercontent.com',
    webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com',
  },
  facebook: {
    appId: 'YOUR_FACEBOOK_APP_ID',
  },
} as const;
