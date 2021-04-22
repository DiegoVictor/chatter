import { notFound } from '@hapi/boom';
import { getCustomRepository, Repository } from 'typeorm';

import Message from '../entities/Message';
import User from '../entities/User';
import MessagesRepository from '../repositories/MessagesRepository';
import UsersRepository from '../repositories/UsersRepository';

interface IMessageCreate {
  admin_id?: string;
  user_id: string;
  text: string;
}

class MessagesServices {
  private messagesRepository: Repository<Message>;
  private usersRepository: Repository<User>;

  constructor() {
    this.messagesRepository = getCustomRepository(MessagesRepository);
    this.usersRepository = getCustomRepository(UsersRepository);
  }

  async listByUserId(user_id: string) {
    if (!(await this.usersRepository.findOne(user_id))) {
      throw notFound('User not found', { code: 245 });
    }

    const messages = await this.messagesRepository.find({
      where: { user_id },
      relations: ['user'],
    });

    return messages;
  }

  async store({ admin_id, user_id, text }: IMessageCreate) {
    if (!(await this.usersRepository.findOne(user_id))) {
      throw notFound('User not found', { code: 244 });
    }

    const message = this.messagesRepository.create({
      admin_id,
      text,
      user_id,
    });

    await this.messagesRepository.save(message);

    return message;
  }
}

export default MessagesServices;
