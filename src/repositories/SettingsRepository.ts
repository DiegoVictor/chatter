import { Setting } from '../entities/Setting';
import { AppDataSource } from '../database/datasource';

export const SettingsRepository = AppDataSource.getRepository(Setting);
