import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import * as usersController from './users.controller.js';

const usersRouter = Router();

usersRouter.use(authMiddleware);
usersRouter.get('/me', usersController.getMyProfile);
usersRouter.get('/:id', usersController.getProfileById);

export default usersRouter;
