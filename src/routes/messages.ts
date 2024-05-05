import { Router } from 'express';
import { MessagesController } from '../controllers/MessagesController';
import createMessagesValidator from '../validators/createMessagesValidator';

const app = Router();
const messagesController = new MessagesController();

app.post('/', createMessagesValidator, messagesController.store);

export { app as messages };
