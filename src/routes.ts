import { Router } from 'express';
import MessagesController from './controllers/MessagesController';

import SettingsController from './controllers/SettingsController';
import UsersController from './controllers/UsersController';
import UsersMessagesController from './controllers/UsersMessagesController';

const app = Router();

const settingsController = new SettingsController();
const usersController = new UsersController();
const messagesController = new MessagesController();
const usersMessagesController = new UsersMessagesController();

app.post('/settings', settingsController.store);
app.post('/users', usersController.store);

app.get('/users/:user_id/messages', usersMessagesController.index);
app.post('/messages', messagesController.store);

export default app;
