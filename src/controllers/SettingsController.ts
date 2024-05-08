import { Request, Response } from 'express';

import SettingsService from '../services/SettingsService';

export class SettingsController {
  async show(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const settingsService = new SettingsService();
    const settings = await settingsService.getById(id);

    return response.json(settings);
  }

  async store(request: Request, response: Response): Promise<Response> {
    const { user_id, chat } = request.body;

    const settingsService = new SettingsService();
    const settings = await settingsService.store({ user_id, chat });

    return response.status(201).json(settings);
  }

  async update(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const { chat } = request.body;

    const settingsService = new SettingsService();
    const settings = await settingsService.update({ id, chat });

    return response.json(settings);
  }
}
