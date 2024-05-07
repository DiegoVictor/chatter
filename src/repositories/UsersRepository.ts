import { User } from '../entities/User';
import { AppDataSource } from '../database/datasource';
import { Repository } from 'typeorm';

export type IUsersRepository = Repository<User>;
export const UsersRepository = AppDataSource.getRepository(User);
