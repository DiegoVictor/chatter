import { IsNull, Repository } from 'typeorm';
import { AppDataSource } from '../database/datasource';
import { Connection } from '../entities/Connection';

export type IConnectionsRepository = Repository<Connection> & {
  getPending: () => Promise<Connection[]>;
};

const ConnectionsRepository = AppDataSource.getRepository(Connection).extend({
  async getPending() {
    return this.createQueryBuilder('connections')
      .where({ admin_id: IsNull() })
      .leftJoinAndSelect('connections.user', 'user')
      .getMany();
  },
});

export { ConnectionsRepository };
