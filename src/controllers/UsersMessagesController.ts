import { Request, Response } from 'express';

import MessagesServices from '../services/MessagesServices';

class UsersMessagesController {
  async index(request: Request, response: Response): Promise<Response> {
    const { user_id } = request.params;
    const messagesServices = new MessagesServices();

    const message = await messagesServices.listByUserId(user_id);

    return response.json(message);
  }
}

export default UsersMessagesController;
