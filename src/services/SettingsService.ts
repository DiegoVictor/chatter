import { badRequest, notFound } from '@hapi/boom';
import { getCustomRepository, Repository } from 'typeorm';

import Setting from '../entities/Setting';
import SettingsRepository from '../repositories/SettingsRepository';

interface ISettingsCreate {
  id?: string;
  chat: boolean;
  user_id?: string;
}

class SettingsService {
  private settingsRepository: Repository<Setting>;

  constructor() {
    this.settingsRepository = getCustomRepository(SettingsRepository);
  }

  async getById(id: string) {
    const settings = await this.settingsRepository.findOne(id);

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

  async update({ id, chat }: ISettingsCreate) {
    let settings = await this.settingsRepository.findOne(id);
    if (!settings) {
      throw notFound('Setting not found', { code: 144 });
    }

    settings.chat = chat;

    await this.settingsRepository.save(settings);

    return settings;
  }
}

export default SettingsService;
