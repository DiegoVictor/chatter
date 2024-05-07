import { IUsersRepository } from '../repositories/UsersRepository';

export class UsersService {
  constructor(private usersRepository: IUsersRepository) {}

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
