import { Request, Response } from 'express';

import MessagesServices from '../services/MessagesServices';

class MessagesController {
  async store(request: Request, response: Response): Promise<Response> {
    const { user_id, admin_id, text } = request.body;
    const messagesServices = new MessagesServices();

    const message = await messagesServices.store({
      user_id,
      admin_id,
      text,
    });

    return response.json(message);
  }
}

export default MessagesController;
