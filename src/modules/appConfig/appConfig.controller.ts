import type { NextFunction, Request, Response } from 'express';
import * as appConfigService from './appConfig.service.js';

export async function getAppConfig(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const appConfig = await appConfigService.getAppConfig();
    res.status(200).json({ appConfig });
  } catch (err) {
    next(err);
  }
}
