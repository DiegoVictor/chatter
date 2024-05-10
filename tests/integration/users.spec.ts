import request from 'supertest';
import { http, io } from '../../src/app';
import { User } from '../../src/entities/User';
import factory from '../utils/factory';
import { AppDataSource } from '../../src/database/datasource';
import { DataSource } from 'typeorm';

describe('Users', () => {
  let datasource: DataSource;
  beforeEach(async () => {
    datasource = AppDataSource.manager.connection;
    if (!AppDataSource.isInitialized) {
      datasource = await AppDataSource.initialize();
    }
  });

  afterAll(async () => {
    io.close();
    http.close();

    await datasource.destroy();
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
    const { email } = await factory.attrs<User>('User');

    const repository = datasource.getRepository(User);
    const user = await repository.save(repository.create({ email }));

    const response = await request(http).post('/v1/users').send({ email });

    expect(response.body).toStrictEqual({
      id: user.id,
      created_at: user.created_at.toISOString(),
      email,
    });
  });
});
