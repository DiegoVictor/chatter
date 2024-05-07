import { Message } from '../entities/Message';
import { AppDataSource } from '../database/datasource';
import { Repository } from 'typeorm';

export type IMessagesRepository = Repository<Message>;
export const MessagesRepository = AppDataSource.getRepository(Message);
