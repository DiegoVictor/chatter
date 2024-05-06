import { Message } from '../entities/Message';
import { AppDataSource } from '../database/datasource';

export const MessagesRepository = AppDataSource.getRepository(Message);
