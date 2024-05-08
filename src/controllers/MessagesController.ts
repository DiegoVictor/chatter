import { Request, Response } from 'express';
import { MessagesServices } from '../services/MessagesServices';
import { MessagesRepository } from '../repositories/MessagesRepository';
import { UsersRepository } from '../repositories/UsersRepository';

export class MessagesController {
  async store(request: Request, response: Response): Promise<Response> {
    const { user_id, admin_id, text } = request.body;

    const messagesServices = new MessagesServices(
      MessagesRepository,
      UsersRepository,
    );
    const message = await messagesServices.store({
      user_id,
      admin_id,
      text,
    });

    return response.status(201).json(message);
  }
}
