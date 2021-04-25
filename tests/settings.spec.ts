import request from 'supertest';
import { Connection, createConnection, Repository } from 'typeorm';
import faker from 'faker';

import { http, io } from '../src/app';
import Setting from '../src/entities/Setting';
import factory from './utils/factory';

describe('Settings', () => {
  let connection: Connection;
  let repository: Repository<Setting>;

  beforeAll(async () => {
    connection = await createConnection();
    repository = connection.getRepository(Setting);
  });

  beforeEach(async () => {
    await repository.delete({});
  });

  afterAll(async () => {
    io.close();
    http.close();
    await connection.close();
  });

  it('should be able to create a new setting', async () => {
    const setting = await factory.attrs<Setting>('Setting');
    const response = await request(http).post('/v1/settings').send(setting);

    expect(response.body).toStrictEqual({
      ...setting,
      id: expect.any(String),
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });

  it('should not be able to duplicate a setting', async () => {
    const setting = await factory.attrs<Setting>('Setting');
    await repository.save(repository.create(setting));

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
    const setting = await factory.attrs<Setting>('Setting');
    const { username, chat, id, created_at } = await repository.save(
      repository.create(setting)
    );

    const response = await request(http)
      .put(`/v1/settings/${username}`)
      .send({ chat: !chat });

    expect(response.body).toStrictEqual({
      id,
      username,
      chat: !chat,
      created_at: created_at.toISOString(),
      updated_at: expect.any(String),
    });
  });

  it('should not be able to update a non existing setting', async () => {
    const username = faker.internet.userName();
    const response = await request(http)
      .put(`/v1/settings/${username}`)
      .expect(400)
      .send({ chat: false });

    expect(response.body).toStrictEqual({
      code: 144,
      docs: process.env.DOCS_URL,
      error: 'Bad Request',
      message: 'Setting not found',
      statusCode: 400,
    });
  });

  it('should be able to retrieve a setting', async () => {
    const setting = await repository.save(
      repository.create(await factory.attrs<Setting>('Setting'))
    );

    const response = await request(http)
      .get(`/v1/settings/${setting.username}`)
      .send();

    expect(response.body).toStrictEqual({
      ...setting,
      created_at: setting.created_at.toISOString(),
      updated_at: setting.updated_at.toISOString(),
    });
  });
});
