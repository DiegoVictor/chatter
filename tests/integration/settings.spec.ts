import request from 'supertest';
import { faker } from '@faker-js/faker';
import { http, io } from '../../src/app';
import { Setting } from '../../src/entities/Setting';
import factory from '../utils/factory';
import { User } from '../../src/entities/User';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/database/datasource';

describe('Settings', () => {
  let datasource: DataSource;
  beforeEach(async () => {
    datasource = AppDataSource.manager.connection;
    if (!AppDataSource.isInitialized) {
      datasource = await AppDataSource.initialize();
    }
  });

  beforeEach(async () => {
    await datasource.getRepository(Setting).delete({});
  });

  afterAll(async () => {
    io.close();
    http.close();

    await datasource.destroy();
  });

  it('should be able to create a new setting', async () => {
    const user = await factory.attrs<User>('User');

    const repository = datasource.getRepository(User);
    const { id } = await repository.save(repository.create(user));

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

    const usersRepository = datasource.getRepository(User);
    const { id } = await usersRepository.save(usersRepository.create(user));

    const setting = await factory.attrs<Setting>('Setting', { user_id: id });

    const settingsRepository = datasource.getRepository(Setting);
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

    const usersRepository = datasource.getRepository(User);
    const settingsRepository = datasource.getRepository(Setting);

    const { id: user_id } = await usersRepository.save(
      usersRepository.create(user),
    );

    const setting = await factory
      .attrs<Setting>('Setting', { user_id })
      .then((setting) =>
        settingsRepository.save(settingsRepository.create(setting)),
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
    const user_id = faker.string.uuid();
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

    const usersRepository = datasource.getRepository(User);
    const settingsRepository = datasource.getRepository(Setting);

    const { id } = await usersRepository.save(usersRepository.create(user));

    const setting = await settingsRepository.save(
      settingsRepository.create(
        await factory.attrs<Setting>('Setting', { user_id: id }),
      ),
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
