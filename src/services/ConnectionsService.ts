import { IConnectionsRepository } from '../repositories/ConnectionsRepository';

interface IConnectionCreate {
  socket_id: string;
  user_id: string;
  admin_id?: string;
  id?: string;
}

export class ConnectionsService {
  constructor(private connectionsRepository: IConnectionsRepository) {}

  async getByUserId(user_id: string) {
    const connection = await this.connectionsRepository.findOne({
      where: { user_id },
      relations: ['user'],
    });

    return connection;
  }

  async getPending() {
    return this.connectionsRepository.getPending();
  }

  async getBySocketId(socket_id: string) {
    return this.connectionsRepository.findOneBy({ socket_id });
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
