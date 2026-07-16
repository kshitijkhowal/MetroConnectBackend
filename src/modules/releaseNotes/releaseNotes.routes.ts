import { Router } from 'express';
import * as releaseNotesController from './releaseNotes.controller.js';

const releaseNotesRouter = Router();

releaseNotesRouter.get('/', releaseNotesController.listReleaseNotes);
releaseNotesRouter.get('/:versionCode', releaseNotesController.getReleaseNoteByVersionCode);

export default releaseNotesRouter;
