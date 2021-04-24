import { Request, Response } from 'express';

import SettingsService from '../services/SettingsService';

class SettingsController {
  async show(request: Request, response: Response): Promise<Response> {
    const { username } = request.params;

    const settingsService = new SettingsService();
    const settings = await settingsService.getByUsername(username);

    return response.json(settings);
  }

  async store(request: Request, response: Response): Promise<Response> {
    const { username, chat } = request.body;

    const settingsService = new SettingsService();
    const settings = await settingsService.store({ username, chat });

    return response.json(settings);
  }

  async update(request: Request, response: Response): Promise<Response> {
    const { username } = request.params;
    const { chat } = request.body;

    const settingsService = new SettingsService();
    const settings = await settingsService.update({ username, chat });

    return response.json(settings);
  }
}

export default SettingsController;
