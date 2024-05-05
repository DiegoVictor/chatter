import { Router } from 'express';
import { settings } from './settings';
import { users } from './users';
import { messages } from './messages';

const app = Router();

app.use('/settings', settings);
app.use('/users', users);
app.use('/messages', messages);

export { app as routes };
