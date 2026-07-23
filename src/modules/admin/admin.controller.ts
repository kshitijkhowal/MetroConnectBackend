import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import * as adminService from './admin.service.js';

const contributorBodySchema = z.object({
  name: z.string().trim().min(1),
  avatar: z.union([z.string().url(), z.literal(''), z.null()]).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const developerBodySchema = z.object({
  name: z.string().trim().min(1),
  avatar: z.union([z.string().url(), z.literal(''), z.null()]).optional(),
  positions: z.array(z.string().trim().min(1)).min(1),
  sortOrder: z.number().int().min(0).optional(),
});

const releaseNoteBodySchema = z.object({
  version: z.string().trim().min(1),
  versionCode: z.number().int().positive(),
  releaseDate: z.string().trim().nullable().optional().or(z.literal('')),
  icons: z.array(z.string().trim().min(1)).optional().default([]),
  features: z
    .array(
      z.object({
        id: z.number().int().positive().optional(),
        title: z.string().trim().min(1),
      }),
    )
    .min(1),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

function normalizeAvatar(avatar: string | null | undefined): string | null {
  if (!avatar || avatar.trim() === '') {
    return null;
  }
  return avatar.trim();
}

export async function listPeople(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const people = await adminService.listPeople();
    res.status(200).json(people);
  } catch (err) {
    next(err);
  }
}

export async function createContributor(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = contributorBodySchema.parse(req.body);
    const contributor = await adminService.createContributor({
      name: body.name,
      avatar: normalizeAvatar(body.avatar),
      sortOrder: body.sortOrder,
    });
    res.status(201).json({ contributor });
  } catch (err) {
    next(err);
  }
}

export async function createDeveloper(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = developerBodySchema.parse(req.body);
    const developer = await adminService.createDeveloper({
      name: body.name,
      avatar: normalizeAvatar(body.avatar),
      positions: body.positions,
      sortOrder: body.sortOrder,
    });
    res.status(201).json({ developer });
  } catch (err) {
    next(err);
  }
}

export async function listReleaseNotes(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { page, limit } = listQuerySchema.parse(req.query);
    const result = await adminService.listReleaseNotes(page, limit);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function createReleaseNote(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = releaseNoteBodySchema.parse(req.body);
    const releaseNote = await adminService.createReleaseNote({
      version: body.version,
      versionCode: body.versionCode,
      releaseDate: body.releaseDate?.trim() ? body.releaseDate.trim() : null,
      icons: body.icons,
      features: body.features.map((f, index) => ({
        id: f.id ?? index + 1,
        title: f.title,
      })),
    });
    res.status(201).json({ releaseNote });
  } catch (err) {
    next(err);
  }
}

const versionCodeParamSchema = z.object({
  versionCode: z.coerce.number().int().positive(),
});

export async function updateReleaseNote(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { versionCode } = versionCodeParamSchema.parse(req.params);
    const body = releaseNoteBodySchema.parse(req.body);
    const releaseNote = await adminService.updateReleaseNote(versionCode, {
      version: body.version,
      versionCode: body.versionCode,
      releaseDate: body.releaseDate?.trim() ? body.releaseDate.trim() : null,
      icons: body.icons,
      features: body.features.map((f, index) => ({
        id: f.id ?? index + 1,
        title: f.title,
      })),
    });
    res.status(200).json({ releaseNote });
  } catch (err) {
    next(err);
  }
}
