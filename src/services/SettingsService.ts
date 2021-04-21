import { badRequest } from '@hapi/boom';
import { getCustomRepository } from 'typeorm';

import SettingsRepository from '../repositories/SettingsRepository';

interface ISettingsCreate {
  chat: boolean;
  username: string;
}

class SettingsService {
  private settingsRepository: SettingsRepository;

  constructor() {
    this.settingsRepository = getCustomRepository(SettingsRepository);
  }

  async store({ username, chat }: ISettingsCreate) {
    if (await this.settingsRepository.findOne({ username })) {
      throw badRequest('Setting already exists', { code: 140 });
    }

    const settings = this.settingsRepository.create({
      username,
      chat,
    });

    await this.settingsRepository.save(settings);

    return settings;
  }
}

export default SettingsService;
