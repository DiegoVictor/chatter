import { AppDataSource } from '../database/datasource';
import { Connection } from '../entities/Connection';

export const ConnectionsRepository = AppDataSource.getRepository(Connection);
