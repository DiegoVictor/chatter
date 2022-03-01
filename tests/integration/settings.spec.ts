import request from 'supertest';
import { Connection, createConnection, Repository } from 'typeorm';
import faker from 'faker';

import { http, io } from '../../src/app';
import Setting from '../../src/entities/Setting';
import factory from '../utils/factory';
import User from '../../src/entities/User';

describe('Settings', () => {
  let connection: Connection;
  let settingsRepository: Repository<Setting>;
  let usersRepository: Repository<User>;

  beforeAll(async () => {
    connection = await createConnection();
    settingsRepository = connection.getRepository(Setting);
    usersRepository = connection.getRepository(User);
  });

  beforeEach(async () => {
    await settingsRepository.delete({});
  });

  afterAll(async () => {
    io.close();
    http.close();
    await settingsRepository.delete({});
    await connection.close();
  });

  it('should be able to create a new setting', async () => {
    const user = await factory.attrs<User>('User');
    const { id } = await usersRepository.save(usersRepository.create(user));

    const setting = await factory.attrs<Setting>('Setting', { user_id: id });
    const response = await request(http)
      .post('/v1/settings')
      .expect(201)
      .send(setting);

    expect(response.body).toStrictEqual({
      ...setting,
      id: expect.any(String),
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });

  it('should not be able to duplicate a setting', async () => {
    const user = await factory.attrs<User>('User');
    const { id } = await usersRepository.save(usersRepository.create(user));

    const setting = await factory.attrs<Setting>('Setting', { user_id: id });
    await settingsRepository.save(settingsRepository.create(setting));

    const response = await request(http)
      .post('/v1/settings')
      .expect(400)
      .send(setting);

    expect(response.body).toStrictEqual({
      code: 140,
      docs: process.env.DOCS_URL,
      error: 'Bad Request',
      message: 'Setting already exists',
      statusCode: 400,
    });
  });

  it('should be able to update a setting', async () => {
    const user = await factory.attrs<User>('User');
    const { id: user_id } = await usersRepository.save(
      usersRepository.create(user)
    );

    const setting = await factory
      .attrs<Setting>('Setting', { user_id })
      .then((setting) =>
        settingsRepository.save(settingsRepository.create(setting))
      );

    const response = await request(http)
      .put(`/v1/settings/${setting.id}`)
      .send({ chat: !setting.chat });

    expect(response.body).toStrictEqual({
      id: setting.id,
      user_id,
      chat: !setting.chat,
      created_at: setting.created_at.toISOString(),
      updated_at: expect.any(String),
    });
  });

  it('should not be able to update a non existing setting', async () => {
    const user_id = faker.datatype.uuid();
    const response = await request(http)
      .put(`/v1/settings/${user_id}`)
      .expect(404)
      .send({ chat: false });

    expect(response.body).toStrictEqual({
      code: 144,
      docs: process.env.DOCS_URL,
      error: 'Not Found',
      message: 'Setting not found',
      statusCode: 404,
    });
  });

  it('should be able to retrieve a setting', async () => {
    const user = await factory.attrs<User>('User');
    const { id } = await usersRepository.save(usersRepository.create(user));

    const setting = await settingsRepository.save(
      settingsRepository.create(
        await factory.attrs<Setting>('Setting', { user_id: id })
      )
    );

    const response = await request(http)
      .get(`/v1/settings/${setting.id}`)
      .send();

    expect(response.body).toStrictEqual({
      ...setting,
      created_at: setting.created_at.toISOString(),
      updated_at: setting.updated_at.toISOString(),
    });
  });
});
