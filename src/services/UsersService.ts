import { getCustomRepository, Repository } from 'typeorm';

import User from '../entities/User';
import UsersRepository from '../repositories/UsersRepository';

class UsersService {
  private usersRepository: Repository<User>;

  constructor() {
    this.usersRepository = getCustomRepository(UsersRepository);
  }

  async show(email: string) {
    const user = await this.usersRepository.findOneBy({ email });

    return user;
  }

  async store(email: string) {
    let user = await this.usersRepository.findOneBy({ email });
    if (user) {
      return user;
    }

    user = this.usersRepository.create({ email });
    await this.usersRepository.save(user);

    return user;
  }
}

export default UsersService;
