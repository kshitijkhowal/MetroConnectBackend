import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRouter from './modules/auth/auth.routes.js';
import communityRouter from './modules/community/community.routes.js';
import quickStationsRouter from './modules/quickStations/quickStations.routes.js';
import usersRouter from './modules/users/users.routes.js';

export function createApp() {
  const app = express();

  const corsOrigin =
    env.CORS_ORIGIN === '*'
      ? true
      : env.CORS_ORIGIN.split(',').map((o) => o.trim());

  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'metroconnect-backend' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/community', communityRouter);
  app.use('/api/quick-stations', quickStationsRouter);
  app.use('/api/users', usersRouter);

  app.use(errorHandler);

  return app;
}
