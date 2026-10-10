import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRouter from './modules/auth/auth.routes.js';
import adminRouter from './modules/admin/admin.routes.js';
import appConfigRouter from './modules/appConfig/appConfig.routes.js';
import communityRouter from './modules/community/community.routes.js';
import quickStationsRouter from './modules/quickStations/quickStations.routes.js';
import releaseNotesRouter from './modules/releaseNotes/releaseNotes.routes.js';
import usersRouter from './modules/users/users.routes.js';

/** Public prefix on the shared API host, e.g. api.kshitijkhowal.in/metroconnect */
export const API_MOUNT_PATH = '/metroconnect';

function createApiRouter() {
  const router = express.Router();

  router.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'metroconnect-backend' });
  });

  router.use('/api/auth', authRouter);
  router.use('/api/admin', adminRouter);
  router.use('/api/app-config', appConfigRouter);
  router.use('/api/community', communityRouter);
  router.use('/api/quick-stations', quickStationsRouter);
  router.use('/api/release-notes', releaseNotesRouter);
  router.use('/api/users', usersRouter);

  return router;
}

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

  app.use(API_MOUNT_PATH, createApiRouter());
  // Unprefixed routes stay so the current app, local admin, and Postman keep working.
  app.use(createApiRouter());

  app.use(errorHandler);

  return app;
}
