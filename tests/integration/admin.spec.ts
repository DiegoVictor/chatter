import io from 'socket.io-client';
import { AddressInfo } from 'net';
import { faker } from '@faker-js/faker';
import { http, io as server } from '../../src/app';
import { Connection } from '../../src/entities/Connection';
import '../../src/websocket/admin';
import factory from '../utils/factory';
import { User } from '../../src/entities/User';
import { Message } from '../../src/entities/Message';
import { Boom, notFound } from '@hapi/boom';
import { Setting } from '../../src/entities/Setting';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/database/datasource';

const httpServer = http.listen();

describe('Admin Socket', () => {
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
    server.close();
    http.close();

    await datasource.destroy();
  });

  it('should be able to get pending connections', async () => {
    const usersRepository = datasource.getRepository(User);
    const connectionsRepository = datasource.getRepository(Connection);

    const serverAddress = httpServer.address() as AddressInfo;

    const user = await factory.attrs<User>('User');
    const {
      id: user_id,
      created_at,
      email,
    } = await usersRepository.save(usersRepository.create(user));

    const socket_id = faker.string.uuid();
    const connection = await connectionsRepository.save(
      connectionsRepository.create({ user_id, socket_id }),
    );

    const socket = io(
      `http://[${serverAddress.address}]:${serverAddress.port}`,
      {
        autoConnect: true,
        reconnection: false,
        forceNew: true,
        port: String(serverAddress.port),
        transports: ['websocket'],
      },
    );

    const connectionPending = await new Promise((resolve) => {
      socket.on('admin_list_pending', (connectionPending: Connection[]) => {
        resolve(connectionPending);
        socket.close();
      });
    });

    expect(connectionPending).toContainEqual({
      id: connection.id,
      admin_id: null,
      socket_id,
      user_id,
      created_at: connection.created_at.toISOString(),
      updated_at: connection.updated_at.toISOString(),
      user: {
        id: user_id,
        email,
        created_at: created_at.toISOString(),
      },
    });
  });

  it('should be able to get user messages', async () => {
    const usersRepository = datasource.getRepository(User);
    const messagesRepository = datasource.getRepository(Message);

    const serverAddress = httpServer.address() as AddressInfo;

    const user = await factory.attrs<User>('User');
    const {
      id: user_id,
      email,
      created_at: user_created_at,
    } = await usersRepository.save(usersRepository.create(user));

    const message = await factory.attrs<Message>('Message', { user_id });
    const { created_at, id, text } = await messagesRepository.save(
      messagesRepository.create(message),
    );

    const socket = io(
      `http://[${serverAddress.address}]:${serverAddress.port}`,
      {
        autoConnect: true,
        reconnection: true,
        forceNew: true,
        port: String(serverAddress.port),
        transports: ['websocket'],
      },
    );

    const messages = await new Promise((resolve) => {
      socket.on('admin_list_pending', () => {
        socket.emit(
          'admin_list_messages_by_user',
          { user_id },
          (messages: Message[]) => {
            socket.close();
            resolve(messages);
          },
        );
      });
    });

    expect(messages).toContainEqual({
      id,
      admin_id: null,
      text,
      user_id,
      created_at: created_at.toISOString(),
      user: {
        id: user_id,
        email,
        created_at: user_created_at.toISOString(),
      },
    });
  });

  it('should not be able to get messages from non existing user', async () => {
    const usersRepository = datasource.getRepository(User);
    const messagesRepository = datasource.getRepository(Message);

    const serverAddress = httpServer.address() as AddressInfo;

    const user = await factory.attrs<User>('User');
    const { id: user_id } = await usersRepository.save(
      usersRepository.create(user),
    );

    const message = await factory.attrs<Message>('Message', { user_id });
    await messagesRepository.save(messagesRepository.create(message));

    const socket = io(
      `http://[${serverAddress.address}]:${serverAddress.port}`,
      {
        autoConnect: true,
        reconnection: true,
        forceNew: true,
        port: String(serverAddress.port),
        transports: ['websocket'],
      },
    );

    await new Promise((_, reject) => {
      socket.on('admin_list_pending', async () => {
        socket.emit(
          'admin_list_messages_by_user',
          {
            user_id: faker.string.uuid(),
          },
          (err: Boom) => {
            socket.close();
            reject(err);
          },
        );
      });
    }).catch((err) => {
      const boomError = notFound('User not found', { code: 245 });
      expect(err).toStrictEqual({ ...boomError });
    });
  });

  it('should be able to receive admin message', async () => {
    const usersRepository = datasource.getRepository(User);
    const connectionsRepository = datasource.getRepository(Connection);

    const serverAddress = httpServer.address() as AddressInfo;

    const user = await factory.attrs<User>('User');
    const { id: user_id } = await usersRepository.save(
      usersRepository.create(user),
    );
    const message = await factory.attrs<Message>('Message', { user_id });

    const socket = io(
      `http://[${serverAddress.address}]:${serverAddress.port}`,
      {
        autoConnect: true,
        reconnection: true,
        forceNew: true,
        port: String(serverAddress.port),
        transports: ['websocket'],
      },
    );

    const { text, socket_id } = await new Promise<{
      text: string;
      socket_id: string;
    }>((resolve) => {
      socket.on('admin_list_pending', async () => {
        await connectionsRepository.save(
          connectionsRepository.create({
            socket_id: socket.id,
            user_id,
          }),
        );

        socket.on('admin_sent_message', ({ text, socket_id }) => {
          resolve({ text, socket_id });
          socket.close();
        });

        socket.emit('admin_send_message', { user_id, text: message.text });
      });
    });

    expect({ text, socket_id }).toStrictEqual({
      text: message.text,
      socket_id: expect.any(String),
    });
  });

  it('should be able to set connection as handled', async () => {
    const usersRepository = datasource.getRepository(User);
    const connectionsRepository =
      datasource.getRepository<Connection>(Connection);

    const serverAddress = httpServer.address() as AddressInfo;

    const user = await factory.attrs<User>('User');
    const {
      id: user_id,
      email,
      created_at,
    } = await usersRepository.save(usersRepository.create(user));

    const connection = await connectionsRepository.save(
      connectionsRepository.create({
        user_id,
      }),
    );

    const run = async (resolve: (value: unknown) => void) => {
      const socket = io(
        `http://[${serverAddress.address}]:${serverAddress.port}`,
        {
          autoConnect: true,
          reconnection: true,
          forceNew: true,
          port: String(serverAddress.port),
          transports: ['websocket'],
        },
      );

      socket.on(
        'admin_list_pending',
        async (connectionPending: Connection[]) => {
          expect(connectionPending).toContainEqual({
            id: connection.id,
            admin_id: null,
            socket_id: null,
            user_id,
            created_at: connection.created_at.toISOString(),
            updated_at: connection.updated_at.toISOString(),
            user: {
              id: user_id,
              email,
              created_at: created_at.toISOString(),
            },
          });

          connection.socket_id = socket.id;
          await connectionsRepository.save(connection);

          socket.emit('admin_user_in_support', {
            user_id,
            user_socket_id: socket.id,
          });
        },
      );

      socket.on('set_admin_socket_id', async ({ socket_id }) => {
        const { admin_id } = await connectionsRepository.findOneBy({
          id: connection.id,
        });

        expect(admin_id).not.toBe(null);
        expect(socket_id).toBe(socket.id);

        socket.close();
        resolve(null);
      });
    };

    await new Promise(run);
  });
});
