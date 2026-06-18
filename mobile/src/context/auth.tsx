import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
};

type UpdateProfileData = {
  name?: string;
  username?: string;
  avatarUrl?: string | null;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  updateProfile: (data: UpdateProfileData) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

// ─── helpers ────────────────────────────────────────────────────────────────

/** Derive a safe username from an email local-part */
function sanitizeUsername(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 30);
}

/**
 * Load (and, if needed, create) the user's profile row.
 *
 * Called every time the Supabase session changes — covers:
 *  • First-time email sign-up        → creates row if trigger hasn't run yet
 *  • First-time Google/Facebook      → creates row if trigger hasn't run yet
 *  • Returning OAuth users           → syncs provider avatar (name is user-managed)
 *  • Returning email users           → reads from profiles table
 */
async function loadUser(authUser: User): Promise<AuthUser> {
  // --- Data from the auth provider (email sign-up metadata or OAuth) ---
  const providerName: string =
    authUser.user_metadata?.full_name ??
    authUser.user_metadata?.name ??
    authUser.email?.split('@')[0] ??
    'User';

  const providerAvatar: string | null =
    authUser.user_metadata?.avatar_url ??
    authUser.user_metadata?.picture ??
    null;

  const rawEmailPart = authUser.email?.split('@')[0] ?? authUser.id.slice(0, 8);
  const providerUsername = sanitizeUsername(rawEmailPart) || authUser.id.slice(0, 8);

  const isOAuth = (authUser.app_metadata?.provider ?? 'email') !== 'email';

  // --- Fetch existing profile row ---
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url')
    .eq('id', authUser.id)
    .single();

  // --- Profile doesn't exist yet ------------------------------------------------
  // The DB trigger runs asynchronously; race condition means it may not be done.
  // We guarantee creation here with upsert, falling back to an id-based username
  // if the preferred one conflicts with another account.
  if (!existingProfile) {
    let row: { username: string; full_name: string | null; avatar_url: string | null } | null = null;

    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        { id: authUser.id, username: providerUsername, full_name: providerName, avatar_url: providerAvatar },
        { onConflict: 'id' }
      )
      .select('username, full_name, avatar_url')
      .single();

    if (error?.code === '23505') {
      // Username uniqueness conflict — fall back to a guaranteed-unique handle
      const fallback = `user_${authUser.id.slice(0, 8)}`;
      const { data: fb } = await supabase
        .from('profiles')
        .upsert(
          { id: authUser.id, username: fallback, full_name: providerName, avatar_url: providerAvatar },
          { onConflict: 'id' }
        )
        .select('username, full_name, avatar_url')
        .single();
      row = fb;
    } else {
      row = data;
    }

    return {
      id: authUser.id,
      email: authUser.email ?? '',
      name: row?.full_name ?? providerName,
      username: row?.username ?? providerUsername,
      avatar: row?.avatar_url ?? providerAvatar ?? undefined,
    };
  }

  // --- Profile exists -----------------------------------------------------------
  // For OAuth users: sync the provider avatar if it has changed.
  // We intentionally do NOT overwrite name/username — those are user-managed.
  if (isOAuth && providerAvatar && providerAvatar !== existingProfile.avatar_url) {
    await supabase
      .from('profiles')
      .update({ avatar_url: providerAvatar })
      .eq('id', authUser.id);
    existingProfile.avatar_url = providerAvatar;
  }

  return {
    id: authUser.id,
    email: authUser.email ?? '',
    name: existingProfile.full_name ?? providerName,
    username: existingProfile.username ?? providerUsername,
    avatar: existingProfile.avatar_url ?? providerAvatar ?? undefined,
  };
}

// ─── provider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ? await loadUser(session.user) : null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ? await loadUser(session.user) : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── auth actions ─────────────────────────────────────────────────────────

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUp(name: string, email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) return { error: error.message };
    // Supabase returns a user but no session when email confirmation is required
    if (data.user && !data.session) {
      return { error: null, needsConfirmation: true };
    }
    return { error: null, needsConfirmation: false };
  }

  async function updateProfile(data: UpdateProfileData) {
    if (!session?.user) return { error: 'Not authenticated' };
    try {
      const patch: Record<string, string | null> = {};
      if (data.name !== undefined) patch.full_name = data.name;
      if (data.username !== undefined) patch.username = data.username;
      if (data.avatarUrl !== undefined) patch.avatar_url = data.avatarUrl;

      if (Object.keys(patch).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(patch)
          .eq('id', session.user.id);
        if (profileError) return { error: profileError.message };
      }

      // Keep auth user_metadata in sync (survives token refresh)
      const meta: Record<string, string | null> = {};
      if (data.name !== undefined) meta.full_name = data.name;
      if (data.avatarUrl !== undefined) meta.avatar_url = data.avatarUrl;
      if (Object.keys(meta).length > 0) {
        await supabase.auth.updateUser({ data: meta });
      }

      // Refresh local state
      const refreshed = await loadUser(session.user);
      setUser(refreshed);
      return { error: null };
    } catch (e: any) {
      return { error: e?.message ?? 'Update failed' };
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ isAuthenticated: session !== null, user, session, signIn, signUp, updateProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
