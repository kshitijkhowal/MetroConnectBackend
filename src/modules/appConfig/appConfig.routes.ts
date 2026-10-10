import { Router } from 'express';
import * as appConfigController from './appConfig.controller.js';

const appConfigRouter = Router();

appConfigRouter.get('/', appConfigController.getAppConfig);

export default appConfigRouter;
