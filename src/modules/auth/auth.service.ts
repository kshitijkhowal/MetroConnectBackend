import type { Session, User } from '@supabase/supabase-js';
import { supabaseAdmin, supabaseAnon } from '../../lib/supabase.js';
import { ApiError } from '../../utils/ApiError.js';
import type { AuthResponse, AuthSession, AuthUser, ProfileRow } from './auth.types.js';

function mapAuthUser(user: User): AuthUser {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? null,
    displayName:
      (typeof meta.full_name === 'string' && meta.full_name) ||
      (typeof meta.name === 'string' && meta.name) ||
      null,
    photoUrl:
      (typeof meta.avatar_url === 'string' && meta.avatar_url) ||
      (typeof meta.picture === 'string' && meta.picture) ||
      null,
  };
}

function mapSession(session: Session): AuthSession {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresIn: session.expires_in,
    expiresAt: session.expires_at ?? null,
    tokenType: session.token_type,
  };
}

async function upsertProfile(user: AuthUser): Promise<ProfileRow | null> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email: user.email,
        display_name: user.displayName,
        photo_url: user.photoUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    .select()
    .single();

  if (error) {
    console.error('[auth] profile upsert failed:', error.message);
    return null;
  }

  return data as ProfileRow;
}

async function getProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('[auth] profile fetch failed:', error.message);
    return null;
  }

  return data as ProfileRow | null;
}

function toAuthResponse(user: User, session: Session, profile: ProfileRow | null): AuthResponse {
  return {
    user: mapAuthUser(user),
    session: mapSession(session),
    profile,
  };
}

export async function signInWithGoogleIdToken(idToken: string): Promise<AuthResponse> {
  const { data, error } = await supabaseAnon.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });

  if (error || !data.session || !data.user) {
    throw new ApiError(
      401,
      error?.message ?? 'Google sign-in failed',
      'GOOGLE_SIGN_IN_FAILED',
    );
  }

  const user = mapAuthUser(data.user);
  const profile = await upsertProfile(user);
  return toAuthResponse(data.user, data.session, profile);
}

export async function refreshSession(refreshToken: string): Promise<AuthResponse> {
  const { data, error } = await supabaseAnon.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session || !data.user) {
    throw new ApiError(
      401,
      error?.message ?? 'Session refresh failed',
      'REFRESH_FAILED',
    );
  }

  const profile = await getProfile(data.user.id);
  return toAuthResponse(data.user, data.session, profile);
}

export async function logout(accessToken: string): Promise<void> {
  const { error } = await supabaseAdmin.auth.admin.signOut(accessToken);
  if (error) {
    console.warn('[auth] logout warning:', error.message);
  }
}

export async function getMe(accessToken: string): Promise<{
  user: AuthUser;
  profile: ProfileRow | null;
}> {
  const { data, error } = await supabaseAnon.auth.getUser(accessToken);

  if (error || !data.user) {
    throw new ApiError(401, 'Invalid or expired access token', 'UNAUTHORIZED');
  }

  const user = mapAuthUser(data.user);
  const profile = await getProfile(user.id);
  return { user, profile };
}
