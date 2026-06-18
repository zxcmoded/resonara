import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { useState } from 'react';

import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const redirectUri = makeRedirectUri({ scheme: 'mobile', path: 'auth-callback' });

export function useFacebookAuth() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignIn() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: { redirectTo: redirectUri, skipBrowserRedirect: true },
      });

      if (error || !data.url) {
        console.error('Facebook OAuth error:', error?.message);
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

      if (result.type === 'success') {
        await supabase.auth.exchangeCodeForSession(result.url);
      }
    } catch (err) {
      console.error('Facebook sign-in failed:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return { handleSignIn, isLoading };
}
