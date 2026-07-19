import { Router } from 'express';
import * as communityController from './community.controller.js';

const communityRouter = Router();

communityRouter.get('/contributors', communityController.listContributors);
communityRouter.get('/developers', communityController.listDevelopers);

export default communityRouter;
