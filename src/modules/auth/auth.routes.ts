import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import * as authController from './auth.controller.js';

const authRouter = Router();

authRouter.post('/google', authController.googleSignIn);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authMiddleware, authController.logout);
authRouter.get('/me', authMiddleware, authController.me);

export default authRouter;
