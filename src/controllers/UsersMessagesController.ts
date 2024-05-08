import { Request, Response } from 'express';

import { MessagesServices } from '../services/MessagesServices';
import { MessagesRepository } from '../repositories/MessagesRepository';
import { UsersRepository } from '../repositories/UsersRepository';

export class UsersMessagesController {
  async index(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const messagesServices = new MessagesServices(
      MessagesRepository,
      UsersRepository,
    );
    const message = await messagesServices.listByUserId(id);

    return response.json(message);
  }
}
