import { notFound } from '@hapi/boom';
import { getCustomRepository } from 'typeorm';

import MessagesRepository from '../repositories/MessagesRepository';
import UsersRepository from '../repositories/UsersRepository';

interface IMessageCreate {
  admin_id?: string;
  user_id: string;
  text: string;
}

class MessagesServices {
  private messagesRepository: MessagesRepository;
  private usersRepository: UsersRepository;

  constructor() {
    this.messagesRepository = getCustomRepository(MessagesRepository);
    this.usersRepository = getCustomRepository(UsersRepository);
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
