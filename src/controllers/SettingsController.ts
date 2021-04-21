import { Request, Response } from 'express';
import SettingsService from '../services/SettingsService';

class SettingsController {
  async store(request: Request, response: Response): Promise<Response> {
    const { username, chat } = request.body;

    const settingsService = new SettingsService();
    const settings = await settingsService.store({ username, chat });

    return response.json(settings);
  }
}

export default SettingsController;
