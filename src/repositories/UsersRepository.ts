import { User } from '../entities/User';
import { AppDataSource } from '../database/datasource';

export const UsersRepository = AppDataSource.getRepository(User);
