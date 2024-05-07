import { notFound } from '@hapi/boom';
import { IMessagesRepository } from '../repositories/MessagesRepository';
import { IUsersRepository } from '../repositories/UsersRepository';

interface IMessageCreate {
  admin_id?: string;
  user_id: string;
  text: string;
}

export class MessagesServices {
  constructor(
    private messagesRepository: IMessagesRepository,
    private usersRepository: IUsersRepository,
  ) {}

  async listByUserId(user_id: string) {
    const user = await this.usersRepository.findOneBy({ id: user_id });
    if (!user) {
      throw notFound('User not found', { code: 245 });
    }

    const messages = await this.messagesRepository.find({
      where: { user_id },
      relations: ['user'],
    });

    return messages;
  }

  async store({ admin_id, user_id, text }: IMessageCreate) {
    const user = await this.usersRepository.findOneBy({ id: user_id });
    if (!user) {
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
