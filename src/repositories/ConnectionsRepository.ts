import { Repository } from 'typeorm';
import { AppDataSource } from '../database/datasource';
import { Connection } from '../entities/Connection';

export type IConnectionsRepository = Repository<Connection>;
export const ConnectionsRepository = AppDataSource.getRepository(Connection);
