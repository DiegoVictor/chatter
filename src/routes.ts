import { Router } from 'express';

import SettingsController from './controllers/SettingsController';
import UsersController from './controllers/UsersController';

const app = Router();

const settingsController = new SettingsController();
const usersController = new UsersController();

app.post('/settings', settingsController.store);
app.post('/users', usersController.store);

export default app;
