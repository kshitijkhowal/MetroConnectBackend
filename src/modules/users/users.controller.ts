import type { NextFunction, Request, Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/authMiddleware.js';
import { ApiError } from '../../utils/ApiError.js';
import * as usersService from './users.service.js';

export async function getMyProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const profile = await usersService.getProfileById(authReq.user.id);
    res.status(200).json({ profile });
  } catch (err) {
    next(err);
  }
}

export async function getProfileById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ApiError(400, 'User id is required', 'VALIDATION_ERROR');
    }

    const authReq = req as AuthenticatedRequest;
    if (id !== authReq.user.id) {
      throw new ApiError(403, 'Cannot view another user profile', 'FORBIDDEN');
    }

    const profile = await usersService.getProfileById(id);
    res.status(200).json({ profile });
  } catch (err) {
    next(err);
  }
}
