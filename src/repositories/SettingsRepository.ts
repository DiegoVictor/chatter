import { Setting } from '../entities/Setting';
import { AppDataSource } from '../database/datasource';
import { Repository } from 'typeorm';

export type ISettingsRepository = Repository<Setting>;
export const SettingsRepository = AppDataSource.getRepository(Setting);
