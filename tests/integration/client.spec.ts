import io from 'socket.io-client';
import { AddressInfo } from 'net';
import {
  Connection as TypeORMConnection,
  createConnection,
  getRepository,
  Repository,
} from 'typeorm';

import { http, io as server } from '../../src/app';
import Connection from '../../src/entities/Connection';
import '../../src/websocket/client';
import factory from '../utils/factory';
import User from '../../src/entities/User';
import Message from '../../src/entities/Message';

global.Promise = jest.requireActual('promise');
jest.setTimeout(10000);

describe('Client Socket', () => {
  let connection: TypeORMConnection;
  let serverAddress: AddressInfo;
  let connectionsRepository: Repository<Connection>;
  let usersRepository: Repository<User>;
  let messagesRepository: Repository<Message>;

  beforeAll(async () => {
    connection = await createConnection();

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

    await messagesRepository.delete({});
    await Promise.all([
      connectionsRepository.delete({}),
      usersRepository.delete({}),
    ]);
    await connection.close();
  });

  it('should be able to send initial message', async (done) => {
    const { email } = await factory.attrs<User>('User');
    const { text } = await factory.attrs<Message>('Message');

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

    socket.on('connect', () => {
      socket.emit('client_first_access', { email, text });
    });

    socket.on('client_list_messages', async (messages: Message[]) => {
      const user = await usersRepository.findOne({ email });
      const connection = await connectionsRepository.findOne({
        user_id: user.id,
      });

      expect(user).toBeTruthy();
      expect(connection).toBeTruthy();

      socket.on('admin_list_pending', (connectionPending: Connection[]) => {
        expect(connectionPending).toContainEqual({
          id: connection.id,
          admin_id: null,
          socket_id: socket.id,
          user_id: user.id,
          created_at: connection.created_at.toISOString(),
          updated_at: connection.updated_at.toISOString(),
          user: {
            id: user.id,
            email,
            created_at: user.created_at.toISOString(),
          },
        });
      });

      expect(messages).toContainEqual({
        admin_id: null,
        id: expect.any(String),
        created_at: expect.any(String),
        text,
        user_id: user.id,
        user: {
          id: user.id,
          email,
          created_at: user.created_at.toISOString(),
        },
      });

      socket.close();
      done();
    });
  });

  it('should be able to send initial message on already existing connection', async (done) => {
    const user = await factory.attrs<User>('User');
    const {
      id: user_id,
      email,
      created_at,
    } = await usersRepository.save(usersRepository.create(user));
    const { text } = await factory.attrs<Message>('Message');

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

    let connection: Connection;
    socket.on('connect', async () => {
      connection = await connectionsRepository.save(
        connectionsRepository.create({
          socket_id: socket.id,
          user_id,
        })
      );

      socket.emit('client_first_access', { email: user.email, text });
    });

    socket.on('client_list_messages', async (messages: Message[]) => {
      socket.on('admin_list_pending', (connectionPending: Connection[]) => {
        expect(connectionPending).toContainEqual({
          id: connection.id,
          admin_id: null,
          socket_id: socket.id,
          user_id: user.id,
          created_at: connection.created_at.toISOString(),
          updated_at: connection.updated_at.toISOString(),
          user: {
            id: user.id,
            email: email,
            created_at: created_at.toISOString(),
          },
        });
      });

      expect(messages).toContainEqual({
        admin_id: null,
        id: expect.any(String),
        created_at: expect.any(String),
        text,
        user_id: user_id,
        user: {
          id: user_id,
          email: email,
          created_at: created_at.toISOString(),
        },
      });

      socket.close();
      done();
    });
  });

  it('should be able to send messages', async (done) => {
    const [{ text }, user] = await Promise.all([
      factory.attrs<Message>('Message'),
      factory.attrs<User>('User'),
    ]);
    const { id: user_id } = await usersRepository.save(
      usersRepository.create(user),
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

    const adminSocket = io(
      `http://[${serverAddress.address}]:${serverAddress.port}`,
      {
        autoConnect: true,
        reconnection: false,
        forceNew: true,
        port: String(serverAddress.port),
        transports: ['websocket'],
      },
    );

    socket.on('connect', () => {
      adminSocket.on('connect', async () => {
        await connectionsRepository.save(
          connectionsRepository.create({
            admin_id: adminSocket.id,
            socket_id: socket.id,
            user_id,
          })
        );

        socket.emit('client_sent_message', {
          text,
          admin_socket_id: adminSocket.id,
        });
      });
    });

    adminSocket.on('admin_receive_message', ({ message, socket_id }) => {
      expect(socket_id).toBe(socket.id);
      expect(message).toStrictEqual({
        id: expect.any(String),
        created_at: expect.any(String),
        text,
        user_id: user_id,
      });

      socket.close();
      done();
    });
  });
});
