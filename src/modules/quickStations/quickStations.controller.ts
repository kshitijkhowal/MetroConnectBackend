import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../../middleware/authMiddleware.js';
import { ApiError } from '../../utils/ApiError.js';
import * as quickStationsService from './quickStations.service.js';

const idParamSchema = z.object({
  id: z.string().min(1),
});

const createBodySchema = z.object({
  id: z.string().min(1),
  stationId: z.number().int().positive(),
  stationName: z.string().min(1),
  nickname: z.string().min(1),
  icon: z.string().min(1),
  iconColor: z.string().min(1),
});

const updateBodySchema = z.object({
  stationId: z.number().int().positive(),
  stationName: z.string().min(1),
  nickname: z.string().min(1),
  icon: z.string().min(1),
  iconColor: z.string().min(1),
  updatedAt: z.string().datetime(),
});

export async function listQuickStations(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const stations = await quickStationsService.listQuickStations(authReq.user.id);
    res.status(200).json({ stations });
  } catch (err) {
    next(err);
  }
}

export async function getQuickStation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    const authReq = req as AuthenticatedRequest;
    const station = await quickStationsService.getQuickStationById(id, authReq.user.id);
    res.status(200).json({ station });
  } catch (err) {
    next(err);
  }
}

export async function createQuickStation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = createBodySchema.parse(req.body);
    const authReq = req as AuthenticatedRequest;
    const station = await quickStationsService.createQuickStation(authReq.user.id, input);
    res.status(201).json({ station });
  } catch (err) {
    next(err);
  }
}

export async function updateQuickStation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    const input = updateBodySchema.parse(req.body);
    const authReq = req as AuthenticatedRequest;
    const result = await quickStationsService.updateQuickStation(id, authReq.user.id, input);

    if ('conflict' in result) {
      res.status(409).json({
        error: {
          message: 'Quick station has newer cloud data',
          code: 'QUICK_STATION_CONFLICT',
        },
        station: result.conflict,
      });
      return;
    }

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteQuickStation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    const authReq = req as AuthenticatedRequest;
    await quickStationsService.deleteQuickStation(id, authReq.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
