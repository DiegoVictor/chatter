import { Router } from 'express';
import MessagesController from './controllers/MessagesController';

import SettingsController from './controllers/SettingsController';
import UsersController from './controllers/UsersController';

const app = Router();

const settingsController = new SettingsController();
const usersController = new UsersController();
const messagesController = new MessagesController();

app.post('/settings', settingsController.store);
app.post('/users', usersController.store);
app.post('/messages', messagesController.store);

export default app;
