import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { useState } from 'react';

import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const redirectUri = makeRedirectUri({ scheme: 'mobile', path: 'auth-callback' });

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignIn() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUri, skipBrowserRedirect: true },
      });

      if (error || !data.url) {
        console.error('Google OAuth error:', error?.message);
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

      if (result.type === 'success') {
        // Exchange the auth code for a Supabase session
        await supabase.auth.exchangeCodeForSession(result.url);
        // onAuthStateChange in AuthProvider picks up the new session automatically
      }
    } catch (err) {
      console.error('Google sign-in failed:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return { handleSignIn, isLoading };
}
