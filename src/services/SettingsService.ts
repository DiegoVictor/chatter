import { badRequest } from '@hapi/boom';
import { getCustomRepository } from 'typeorm';

import SettingsRepository from '../repositories/SettingsRepository';

interface ISettingsCreate {
  chat: boolean;
  username: string;
}

class SettingsService {
  async store({ username, chat }: ISettingsCreate) {
    const settingsRepository = getCustomRepository(SettingsRepository);

    if (await settingsRepository.findOne({ username })) {
      throw badRequest('Setting already exists', { code: 140 });
    }

    const settings = settingsRepository.create({
      username,
      chat,
    });

    await settingsRepository.save(settings);

    return settings;
  }
}

export default SettingsService;
