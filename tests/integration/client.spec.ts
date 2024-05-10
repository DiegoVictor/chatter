import io from 'socket.io-client';
import { AddressInfo } from 'net';
import { http, io as server } from '../../src/app';
import { Connection } from '../../src/entities/Connection';
import '../../src/websocket/client';
import factory from '../utils/factory';
import { User } from '../../src/entities/User';
import { Message } from '../../src/entities/Message';
import { Setting } from '../../src/entities/Setting';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/database/datasource';

const httpServer = http.listen();

describe('Client Socket', () => {
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

  it('should be able to send initial message', async () => {
    const { email } = await factory.attrs<User>('User');
    const { text } = await factory.attrs<Message>('Message');

    const serverAddress = httpServer.address() as AddressInfo;

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

    const { messages, connectionPending } = await new Promise<{
      messages: Message[];
      connectionPending: Connection[];
    }>((resolve) => {
      socket.on('connect', () => {
        socket.emit('client_first_access', { email, text });
      });

      socket.on('client_list_messages', async (messages: Message[]) => {
        socket.on('admin_list_pending', (connectionPending: Connection[]) => {
          resolve({ messages, connectionPending });
        });
      });
    });

    const usersRepository = datasource.getRepository(User);
    const connectionsRepository = datasource.getRepository(Connection);

    const user = await usersRepository.findOneBy({ email });
    const connection = await connectionsRepository.findOneBy({
      user_id: user.id,
    });

    expect(user).toBeTruthy();
    expect(connection).toBeTruthy();
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

    socket.close();
  });

  it('should be able to send initial message on already existing connection', async () => {
    const user = await factory.attrs<User>('User');

    const usersRepository = datasource.getRepository(User);
    const connectionsRepository =
      datasource.getRepository<Connection>(Connection);

    const serverAddress = httpServer.address() as AddressInfo;

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

    const { messages, connectionPending, connection } = await new Promise<{
      messages: Message[];
      connectionPending: Connection[];
      connection: Connection;
    }>((resolve) => {
      let connection: Connection;

      socket.on('connect', async () => {
        connection = connectionsRepository.create({
          socket_id: socket.id,
          user_id,
        });

        await connectionsRepository.save(connection);

        socket.emit('client_first_access', { email: user.email, text });
      });

      socket.on('client_list_messages', async (messages: Message[]) => {
        socket.on('admin_list_pending', (connectionPending: Connection[]) => {
          resolve({
            messages,
            connectionPending,
            connection,
          });
        });
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
    expect(connectionPending).toContainEqual({
      id: connection.id,
      admin_id: null,
      socket_id: socket.id,
      user_id: user_id,
      created_at: connection.created_at.toISOString(),
      updated_at: connection.updated_at.toISOString(),
      user: {
        id: user_id,
        email: email,
        created_at: created_at.toISOString(),
      },
    });

    socket.close();
  });

  it('should be able to send messages', async () => {
    const [{ text }, user] = await Promise.all([
      factory.attrs<Message>('Message'),
      factory.attrs<User>('User'),
    ]);

    const usersRepository = datasource.getRepository(User);
    const connectionsRepository = datasource.getRepository(Connection);

    const serverAddress = httpServer.address() as AddressInfo;

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

    const { message, socket_id } = await new Promise<{
      message: Message;
      socket_id: string;
    }>((resolve) => {
      socket.on('connect', () => {
        adminSocket.on('connect', async () => {
          await connectionsRepository.save(
            connectionsRepository.create({
              admin_id: adminSocket.id,
              socket_id: socket.id,
              user_id,
            }),
          );

          socket.emit('client_sent_message', {
            text,
            admin_socket_id: adminSocket.id,
          });
        });
      });
      adminSocket.on('admin_receive_message', ({ message, socket_id }) => {
        resolve({
          socket_id,
          message,
        });
      });
    });

    expect(socket_id).toBe(socket.id);
    expect(message).toStrictEqual({
      id: expect.any(String),
      created_at: expect.any(String),
      text,
      user_id: user_id,
    });

    socket.close();
  });
});
