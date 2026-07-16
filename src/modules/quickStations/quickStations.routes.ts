import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import * as quickStationsController from './quickStations.controller.js';

const quickStationsRouter = Router();

quickStationsRouter.use(authMiddleware);
quickStationsRouter.get('/', quickStationsController.listQuickStations);
quickStationsRouter.get('/:id', quickStationsController.getQuickStation);
quickStationsRouter.post('/', quickStationsController.createQuickStation);
quickStationsRouter.patch('/:id', quickStationsController.updateQuickStation);
quickStationsRouter.delete('/:id', quickStationsController.deleteQuickStation);

export default quickStationsRouter;
