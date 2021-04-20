import { Router } from 'express';

import SettingsController from './controllers/SettingsController';

const app = Router();

const settingsController = new SettingsController();

app.post('/settings', settingsController.store);

export default app;
