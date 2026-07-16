import type { NextFunction, Request, Response } from 'express';
import { createUserClient } from '../lib/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import type { AuthUser } from '../modules/auth/auth.types.js';

export type AuthenticatedRequest = Request & {
  accessToken: string;
  user: AuthUser;
};

function mapUser(data: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): AuthUser {
  const meta = data.user_metadata ?? {};
  return {
    id: data.id,
    email: data.email ?? null,
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

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new ApiError(401, 'Missing or invalid Authorization header', 'UNAUTHORIZED');
    }

    const accessToken = header.slice('Bearer '.length).trim();
    if (!accessToken) {
      throw new ApiError(401, 'Missing access token', 'UNAUTHORIZED');
    }

    const client = createUserClient(accessToken);
    const { data, error } = await client.auth.getUser();

    if (error || !data.user) {
      throw new ApiError(401, 'Invalid or expired access token', 'UNAUTHORIZED');
    }

    const authReq = req as AuthenticatedRequest;
    authReq.accessToken = accessToken;
    authReq.user = mapUser(data.user);
    next();
  } catch (err) {
    next(err);
  }
}
