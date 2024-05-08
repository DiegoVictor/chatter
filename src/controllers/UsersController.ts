import { Request, Response } from 'express';

import { UsersService } from '../services/UsersService';
import { UsersRepository } from '../repositories/UsersRepository';

export class UsersController {
  async store(request: Request, response: Response): Promise<Response> {
    const { email } = request.body;

    const usersService = new UsersService(UsersRepository);
    const user = await usersService.store(email);

    return response.status(201).json(user);
  }
}
