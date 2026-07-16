import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import * as releaseNotesService from './releaseNotes.service.js';

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const versionCodeParamSchema = z.object({
  versionCode: z.coerce.number().int().positive(),
});

export async function listReleaseNotes(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { page, limit } = listQuerySchema.parse(req.query);
    const result = await releaseNotesService.listReleaseNotes(page, limit);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getReleaseNoteByVersionCode(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { versionCode } = versionCodeParamSchema.parse(req.params);
    const releaseNote = await releaseNotesService.getReleaseNoteByVersionCode(versionCode);
    res.status(200).json({ releaseNote });
  } catch (err) {
    next(err);
  }
}
