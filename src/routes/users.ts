import { Router } from 'express';
import { UsersController } from '../controllers/UsersController';
import { UsersMessagesController } from '../controllers/UsersMessagesController';
import emailValidator from '../validators/emailValidator';
import idValidator from '../validators/idValidator';

const app = Router();
const usersController = new UsersController();
const usersMessagesController = new UsersMessagesController();

app.post('/', emailValidator, usersController.store);
app.get('/:id/messages', idValidator, usersMessagesController.index);

export { app as users };
