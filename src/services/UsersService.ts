import { badRequest } from '@hapi/boom';
import { getCustomRepository } from 'typeorm';
import UsersRepository from '../repositories/UsersRepository';

class UsersService {
  async store(email: string) {
    const usersRepository = getCustomRepository(UsersRepository);

    let user = await usersRepository.findOne({ email });
    if (user) {
      return user;
    }

    user = usersRepository.create({ email });
    await usersRepository.save(user);

    return user;
  }
}

export default UsersService;
