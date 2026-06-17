import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';

import { OAUTH_CONFIG } from '@/constants/oauth';
import { useAuth } from '@/context/auth';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const { socialSignIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: OAUTH_CONFIG.google.androidClientId,
    iosClientId: OAUTH_CONFIG.google.iosClientId,
    webClientId: OAUTH_CONFIG.google.webClientId,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      fetchUserInfo(response.authentication?.accessToken ?? '');
    } else if (response?.type === 'error' || response?.type === 'dismiss') {
      setIsLoading(false);
    }
  }, [response]);

  async function fetchUserInfo(token: string) {
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      socialSignIn({
        id: data.id,
        name: data.name,
        email: data.email,
        avatar: data.picture,
        provider: 'google',
      });
    } catch (err) {
      console.error('Google profile fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSignIn() {
    setIsLoading(true);
    promptAsync();
  }

  return { handleSignIn, isLoading: isLoading || !request };
}
