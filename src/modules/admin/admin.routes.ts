import { Router } from 'express';
import * as adminController from './admin.controller.js';
import { requireAdmin } from './admin.middleware.js';

const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get('/people', adminController.listPeople);
adminRouter.post('/contributors', adminController.createContributor);
adminRouter.post('/developers', adminController.createDeveloper);
adminRouter.get('/release-notes', adminController.listReleaseNotes);
adminRouter.post('/release-notes', adminController.createReleaseNote);
adminRouter.get('/app-config', adminController.getAppConfig);
adminRouter.put('/app-config', adminController.updateAppConfig);

export default adminRouter;
