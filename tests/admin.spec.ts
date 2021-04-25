import io from 'socket.io-client';
import { AddressInfo } from 'net';
import {
  Connection as TypeORMConnection,
  createConnection,
  getRepository,
  Repository,
} from 'typeorm';
import faker from 'faker';

import { http, io as server } from '../src/app';
import Connection from '../src/entities/Connection';
import '../src/websocket/admin';
import factory from './utils/factory';
import User from '../src/entities/User';
import Message from '../src/entities/Message';
import { Boom, notFound } from '@hapi/boom';

describe('Admin Socket', () => {
  let connection: TypeORMConnection;
  let serverAddress: AddressInfo;
  let connectionsRepository: Repository<Connection>;
  let usersRepository: Repository<User>;
  let messagesRepository: Repository<Message>;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    connectionsRepository = getRepository(Connection);
    usersRepository = connection.getRepository(User);
    messagesRepository = connection.getRepository(Message);

    const httpServer = http.listen();
    serverAddress = httpServer.address() as AddressInfo;
  });

  beforeEach(async () => {
    await messagesRepository.delete({});
    await Promise.all([
      connectionsRepository.delete({}),
      usersRepository.delete({}),
    ]);
  });

  afterAll(async () => {
    server.close();
    http.close();
    await connection.close();
  });

  it('should be able to get pending connections', async (done) => {
    const user = await factory.attrs<User>('User');
    const { id: user_id, created_at, email } = await usersRepository.save(
      usersRepository.create(user)
    );

    const socket_id = faker.datatype.uuid();
    const connection = await connectionsRepository.save(
      connectionsRepository.create({ user_id, socket_id })
    );

    const socket = io(
      `http://[${serverAddress.address}]:${serverAddress.port}`,
      {
        autoConnect: true,
        reconnection: false,
        forceNew: true,
        port: String(serverAddress.port),
        transports: ['websocket'],
      }
    );

    socket.on('admin_list_pending', (connectionPending: Connection[]) => {
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
      socket.close();
      done();
    });
  });

  it('should be able to get user messages', async (done) => {
    const user = await factory.attrs<User>('User');
    const {
      id: user_id,
      email,
      created_at: user_created_at,
    } = await usersRepository.save(usersRepository.create(user));

    const message = await factory.attrs<Message>('Message', { user_id });
    const { created_at, id, text } = await messagesRepository.save(
      messagesRepository.create(message)
    );

    const socket = io(
      `http://[${serverAddress.address}]:${serverAddress.port}`,
      {
        autoConnect: true,
        reconnection: true,
        forceNew: true,
        port: String(serverAddress.port),
        transports: ['websocket'],
      }
    );

    socket.on('admin_list_pending', () => {
      socket.emit(
        'admin_list_messages_by_user',
        { user_id },
        (messages: Message[]) => {
          setTimeout(() => {
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
            socket.close();
            done();
          }, 50);
        }
      );
    });
  });

  it('should not be able to get messages from non existing user', async (done) => {
    const user = await factory.attrs<User>('User');
    const { id: user_id } = await usersRepository.save(
      usersRepository.create(user)
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
      }
    );

    socket.on('admin_list_pending', async () => {
      socket.emit(
        'admin_list_messages_by_user',
        {
          user_id: faker.datatype.uuid(),
        },
        (err: Boom) => {
          const boomError = notFound('User not found', { code: 245 });
          expect(err).toStrictEqual({ ...boomError });
          socket.close();
          done();
        }
      );
    });
  });

  it('should be able to receive admin message', async (done) => {
    const user = await factory.attrs<User>('User');
    const { id: user_id } = await usersRepository.save(
      usersRepository.create(user)
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
      }
    );

    socket.on('admin_list_pending', async () => {
      await connectionsRepository.save(
        connectionsRepository.create({
          socket_id: socket.id,
          user_id,
        })
      );

      socket.on('admin_sent_message', ({ text, socket_id }) => {
        expect({ text, socket_id }).toStrictEqual({
          text: message.text,
          socket_id: expect.any(String),
        });
        socket.close();
        done();
      });
      socket.emit('admin_send_message', { user_id, text: message.text });
    });
  });

  it('should be able to set connection as handled', async (done) => {
    const user = await factory.attrs<User>('User');
    const { id: user_id, email, created_at } = await usersRepository.save(
      usersRepository.create(user)
    );

    const socket = io(
      `http://[${serverAddress.address}]:${serverAddress.port}`,
      {
        autoConnect: true,
        reconnection: true,
        forceNew: true,
        port: String(serverAddress.port),
        transports: ['websocket'],
      }
    );

    let connection: Connection;
    socket.on('connect', async () => {
      connection = await connectionsRepository.save(
        connectionsRepository.create({
          socket_id: socket.id,
          user_id,
        })
      );

      socket.emit('admin_user_in_support', {
        user_id,
        user_socket_id: socket.id,
      });
    });

    socket.on('set_admin_socket_id', async ({ socket_id }) => {
      socket.on(
        'admin_list_pending',
        async (connectionPending: Connection[]) => {
          expect(connectionPending).toContainEqual({
            id: connection.id,
            admin_id: null,
            socket_id: socket.id,
            user_id,
            created_at: connection.created_at.toISOString(),
            updated_at: connection.updated_at.toISOString(),
            user: {
              id: user_id,
              email,
              created_at: created_at.toISOString(),
            },
          });
        }
      );

      const { admin_id } = await connectionsRepository.findOne(connection.id);
      expect(admin_id).not.toBe(null);

      expect(socket_id).toBe(socket.id);
      socket.close();
      done();
    });
  });
});
