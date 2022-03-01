import request from 'supertest';
import { Connection, createConnection, Repository } from 'typeorm';
import faker from 'faker';

import { http, io } from '../../src/app';
import Message from '../../src/entities/Message';
import factory from '../utils/factory';
import User from '../../src/entities/User';

describe('Messages', () => {
  let connection: Connection;
  let messagesRepository: Repository<Message>;
  let usersRepository: Repository<User>;

  beforeAll(async () => {
    connection = await createConnection();

    messagesRepository = connection.getRepository(Message);
    usersRepository = connection.getRepository(User);
  });

  beforeEach(async () => {
    await messagesRepository.delete({});
    await usersRepository.delete({});
  });

  afterAll(async () => {
    io.close();
    http.close();
    await messagesRepository.delete({});
    await usersRepository.delete({});
    await connection.close();
  });

  it('should be able to create a new message', async () => {
    const user = await factory.attrs<User>('User');
    const { id: user_id } = await usersRepository.save(
      usersRepository.create(user)
    );

    const message = await factory.attrs<Message>('Message', { user_id });
    const response = await request(http).post('/v1/messages').send(message);

    expect(response.body).toStrictEqual({
      ...message,
      id: expect.any(String),
      created_at: expect.any(String),
    });
  });

  it('should not be able to create a new message with non existing user', async () => {
    const user_id = faker.datatype.uuid();
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
