import request from 'supertest';
import { faker } from '@faker-js/faker';
import { http, io } from '../../src/app';
import { Message } from '../../src/entities/Message';
import factory from '../utils/factory';
import { User } from '../../src/entities/User';
import { Setting } from '../../src/entities/Setting';
import { Connection } from '../../src/entities/Connection';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/database/datasource';

describe('Messages', () => {
  let datasource: DataSource;
  beforeEach(async () => {
    datasource = AppDataSource.manager.connection;
    if (!AppDataSource.isInitialized) {
      datasource = await AppDataSource.initialize();
    }
  });

  beforeEach(async () => {
    for (const entity of [Setting, Connection, Message, User]) {
      await datasource.getRepository(entity).delete({});
    }
  });

  afterAll(async () => {
    io.close();
    http.close();

    await datasource.destroy();
  });

  it('should be able to create a new message', async () => {
    const user = await factory.attrs<User>('User');

    const repository = datasource.getRepository(User);
    const { id: user_id } = await repository.save(repository.create(user));

    const message = await factory.attrs<Message>('Message', { user_id });
    const response = await request(http).post('/v1/messages').send(message);

    expect(response.body).toStrictEqual({
      ...message,
      id: expect.any(String),
      created_at: expect.any(String),
    });
  });

  it('should not be able to create a new message with non existing user', async () => {
    const user_id = faker.string.uuid();
    const message = await factory.attrs<Message>('Message', { user_id });

    const response = await request(http)
      .post('/v1/messages')
      .expect(404)
      .send(message);

    expect(response.body).toStrictEqual({
      code: 244,
      docs: process.env.DOCS_URL,
      error: 'Not Found',
      message: 'User not found',
      statusCode: 404,
    });
  });
});
