import { createContext, useContext, useState, type ReactNode } from 'react';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'email' | 'google' | 'facebook';
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  signIn: () => void;
  signUp: () => void;
  socialSignIn: (user: AuthUser) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const signIn = () =>
    setUser({ id: 'local', name: 'User', email: '', provider: 'email' });

  const signUp = () =>
    setUser({ id: 'local', name: 'User', email: '', provider: 'email' });

  const socialSignIn = (u: AuthUser) => setUser(u);

  const signOut = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: user !== null,
        user,
        signIn,
        signUp,
        socialSignIn,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
