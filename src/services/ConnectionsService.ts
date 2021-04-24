import { getCustomRepository, Repository } from 'typeorm';

import Connection from '../entities/Connection';
import ConnectionsRepository from '../repositories/ConnectionsRepository';

interface IConnectionCreate {
  socket_id: string;
  user_id: string;
  admin_id?: string;
  id?: string;
}

class ConnectionsService {
  private connectionsRepository: Repository<Connection>;

  constructor() {
    this.connectionsRepository = getCustomRepository(ConnectionsRepository);
  }

  async getByUserId(user_id: string) {
    const connection = await this.connectionsRepository.findOne({
      where: { user_id },
      relations: ['user'],
    });

    return connection;
  }

  async getPending() {
    return await this.connectionsRepository.find({
      where: { admin_id: null },
      relations: ['user'],
    });
  }

  async getBySocketId(socket_id: string) {
    return await this.connectionsRepository.findOne({ socket_id });
  }

  async setAdminId(user_id: string, admin_id: string) {
    await this.connectionsRepository.update({ user_id }, { admin_id });
  }

  async store({ socket_id, user_id, admin_id, id }: IConnectionCreate) {
    const connection = this.connectionsRepository.create({
      socket_id,
      user_id,
      admin_id,
      id,
    });

    await this.connectionsRepository.save(connection);

    return connection;
  }
}

export default ConnectionsService;
