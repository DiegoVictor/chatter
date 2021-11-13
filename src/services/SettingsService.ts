import { badRequest } from '@hapi/boom';
import { getCustomRepository, Repository } from 'typeorm';

import Setting from '../entities/Setting';
import SettingsRepository from '../repositories/SettingsRepository';

interface ISettingsCreate {
  chat: boolean;
  user_id?: string;
}

class SettingsService {
  private settingsRepository: Repository<Setting>;

  constructor() {
    this.settingsRepository = getCustomRepository(SettingsRepository);
  }

  async getByUsername(username: string) {
    const settings = await this.settingsRepository.findOne({ username });

    return settings;
  }

  async store({ user_id, chat }: ISettingsCreate) {
    if (await this.settingsRepository.findOne({ user_id })) {
      throw badRequest('Setting already exists', { code: 140 });
    }

    const settings = this.settingsRepository.create({
      user_id,
      chat,
    });

    await this.settingsRepository.save(settings);

    return settings;
  }

  async update({ username, chat }: ISettingsCreate) {
    let settings = await this.settingsRepository.findOne({ username });
    if (!settings) {
      throw badRequest('Setting not found', { code: 144 });
    }

    settings.chat = chat;

    await this.settingsRepository.save(settings);

    return settings;
  }
}

export default SettingsService;
