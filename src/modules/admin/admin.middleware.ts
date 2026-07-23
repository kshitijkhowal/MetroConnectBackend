import type { NextFunction, Request, Response } from 'express';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!env.ADMIN_SECRET) {
    next(
      new ApiError(
        503,
        'Admin API is not configured. Set ADMIN_SECRET in .env for local use.',
        'ADMIN_NOT_CONFIGURED',
      ),
    );
    return;
  }

  const secret = req.header('x-admin-secret');
  if (!secret || secret !== env.ADMIN_SECRET) {
    next(new ApiError(401, 'Invalid admin secret', 'ADMIN_UNAUTHORIZED'));
    return;
  }

  next();
}
