import type { NextFunction, Request, Response } from 'express';
import * as communityService from './community.service.js';

export async function listContributors(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const contributors = await communityService.listContributors();
    res.status(200).json({
      contributors,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function listDevelopers(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const developers = await communityService.listDevelopers();
    res.status(200).json({
      developers,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}
