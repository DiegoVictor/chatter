import { Router } from 'express';

import MessagesController from './controllers/MessagesController';
import SettingsController from './controllers/SettingsController';
import UsersController from './controllers/UsersController';
import UsersMessagesController from './controllers/UsersMessagesController';

import createMessagesValidator from './validators/createMessagesValidator';
import createSettingsValidator from './validators/createSettingsValidator';
import emailValidator from './validators/emailValidator';
import idValidator from './validators/idValidator';
import chatValidator from './validators/chatValidator';

const app = Router();

const settingsController = new SettingsController();
const usersController = new UsersController();
const messagesController = new MessagesController();
const usersMessagesController = new UsersMessagesController();

app.get('/settings/:id', idValidator, settingsController.show);
app.post('/settings', createSettingsValidator, settingsController.store);
app.put('/settings/:id', idValidator, chatValidator, settingsController.update);

app.post('/users', emailValidator, usersController.store);

app.get('/users/:id/messages', idValidator, usersMessagesController.index);
app.post('/messages', createMessagesValidator, messagesController.store);

export default app;
