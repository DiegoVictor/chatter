import { badRequest } from '@hapi/boom';
import { getCustomRepository } from 'typeorm';
import UsersRepository from '../repositories/UsersRepository';

class UsersService {
  private usersRepository: UsersRepository;

  constructor() {
    this.usersRepository = getCustomRepository(UsersRepository);
  }
  async store(email: string) {
    let user = await this.usersRepository.findOne({ email });
    if (user) {
      return user;
    }

    user = this.usersRepository.create({ email });
    await this.usersRepository.save(user);

    return user;
  }
}

export default UsersService;
