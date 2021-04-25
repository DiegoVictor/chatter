import request from 'supertest';
import { Connection, createConnection, Repository } from 'typeorm';

import { http } from '../src/app';
import User from '../src/entities/User';
import factory from './utils/factory';

describe('Users', () => {
  let connection: Connection;
  let repository: Repository<User>;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    repository = connection.getRepository(User);
  });

  beforeEach(async () => {
    await repository.delete({});
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should be able to create a new user', async () => {
    const user = await factory.attrs<User>('User');
    const response = await request(http).post('/v1/users').send(user);

    expect(response.body).toStrictEqual({
      ...user,
      id: expect.any(String),
      created_at: expect.any(String),
    });
  });

  it('should be able to prevent to duplicate an user', async () => {
    const user = await factory.attrs<User>('User');
    await repository.save(repository.create(user));

    const response = await request(http).post('/v1/users').send(user);

    expect(response.body).toStrictEqual({
      ...user,
      id: expect.any(String),
      created_at: expect.any(String),
    });
  });
});
