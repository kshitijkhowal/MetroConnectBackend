import { Router } from 'express';
import * as communityController from './community.controller.js';

const communityRouter = Router();

communityRouter.get('/contributors', communityController.listContributors);

export default communityRouter;
