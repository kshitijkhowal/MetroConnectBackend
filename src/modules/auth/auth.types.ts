export type AuthUser = {
  id: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number | null;
  tokenType: string;
};

export type AuthResponse = {
  user: AuthUser;
  session: AuthSession;
  profile: ProfileRow | null;
};

export type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};
