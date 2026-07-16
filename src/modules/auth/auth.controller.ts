import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../../middleware/authMiddleware.js';
import * as authService from './auth.service.js';

const googleBodySchema = z.object({
  idToken: z.string().min(1),
});

const refreshBodySchema = z.object({
  refreshToken: z.string().min(1),
});

export async function googleSignIn(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { idToken } = googleBodySchema.parse(req.body);
    const result = await authService.signInWithGoogleIdToken(idToken);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { refreshToken } = refreshBodySchema.parse(req.body);
    const result = await authService.refreshSession(refreshToken);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    await authService.logout(authReq.accessToken);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const result = await authService.getMe(authReq.accessToken);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
