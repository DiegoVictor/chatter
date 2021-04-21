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
  async store({ admin_id, user_id, text }: IMessageCreate) {
    const messagesRepository = getCustomRepository(MessagesRepository);
    const usersRepository = getCustomRepository(UsersRepository);

    if (!(await usersRepository.findOne(user_id))) {
      throw notFound('User not found', { code: 244 });
    }

    const message = messagesRepository.create({
      admin_id,
      text,
      user_id,
    });

    await messagesRepository.save(message);

    return message;
  }
}

export default MessagesServices;
