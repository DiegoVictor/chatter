import { Request, Response } from 'express';

import UsersService from '../services/UsersService';

export class UsersController {
  async store(request: Request, response: Response): Promise<Response> {
    const { email } = request.body;

    const usersService = new UsersService();
    const user = await usersService.store(email);

    return response.status(201).json(user);
  }
}
