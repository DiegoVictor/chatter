import { Router } from 'express';
import { SettingsController } from '../controllers/SettingsController';
import chatValidator from '../validators/chatValidator';
import createSettingsValidator from '../validators/createSettingsValidator';
import idValidator from '../validators/idValidator';

const app = Router();
const settingsController = new SettingsController();

app.get('/:id', idValidator, settingsController.show);
app.post('/', createSettingsValidator, settingsController.store);
app.put('/:id', idValidator, chatValidator, settingsController.update);

export { app as settings };
