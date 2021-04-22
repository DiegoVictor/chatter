import { Router } from 'express';
import MessagesController from './controllers/MessagesController';

import SettingsController from './controllers/SettingsController';
import UsersController from './controllers/UsersController';
import UsersMessagesController from './controllers/UsersMessagesController';
import createMessagesValidator from './validators/createMessagesValidator';
import createSettingsValidator from './validators/createSettingsValidator';
import emailValidator from './validators/emailValidator';
import userIdValidator from './validators/userIdValidator';

const app = Router();

const settingsController = new SettingsController();
const usersController = new UsersController();
const messagesController = new MessagesController();
const usersMessagesController = new UsersMessagesController();

app.post('/settings', createSettingsValidator, settingsController.store);

app.post('/users', emailValidator, usersController.store);

app.get(
  '/users/:user_id/messages',
  userIdValidator,
  usersMessagesController.index
);
app.post('/messages', createMessagesValidator, messagesController.store);

export default app;
