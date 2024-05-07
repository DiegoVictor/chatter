import { badRequest, notFound } from '@hapi/boom';
import { ISettingsRepository } from '../repositories/SettingsRepository';

interface ISettingsCreate {
  id?: string;
  chat: boolean;
  user_id?: string;
}

export class SettingsService {
  constructor(private settingsRepository: ISettingsRepository) {}

  async getById(id: string) {
    const settings = await this.settingsRepository.findOneBy({ id });

    return settings;
  }

  async store({ user_id, chat }: ISettingsCreate) {
    if (await this.settingsRepository.findOneBy({ user_id })) {
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
    let settings = await this.settingsRepository.findOneBy({ id });
    if (!settings) {
      throw notFound('Setting not found', { code: 144 });
    }

    settings.chat = chat;

    await this.settingsRepository.save(settings);

    return settings;
  }
}
