import { io } from '../app';
import ConnectionsService from '../services/ConnectionsService';
import MessagesServices from '../services/MessagesServices';
import UsersService from '../services/UsersService';

interface IParams {
  text: string;
  email: string;
}

interface IConnection {
  socket_id: string;
  user_id: string;
  admin_id?: string;
  id?: string;
}

io.on('connect', (socket) => {
  const connectionsService = new ConnectionsService();
  const usersService = new UsersService();
  const messagesServices = new MessagesServices();

  socket.on('client_first_access', async (params: IParams) => {
    const { email, text } = params;
    let user = await usersService.show(email);

    if (!user) {
      user = await usersService.store(email);
    }

    let connection: IConnection = await connectionsService.getByUserId(user.id);
    if (!connection) {
      connection = {
        socket_id: socket.id,
        user_id: user.id,
      };
    } else {
      connection.socket_id = socket.id;
    }

    await Promise.all([
      messagesServices.store({
        text,
        user_id: user.id,
      }),
      connectionsService.store(connection),
    ]);

    const [messages, pendingConnections] = await Promise.all([
      messagesServices.listByUserId(user.id),
      connectionsService.getPending(),
    ]);

    socket.emit('client_list_messages', messages);

    io.emit('admin_list_pending', pendingConnections);
  });

  socket.on('client_sent_message', async (params) => {
    const { text, admin_socket_id } = params;

    const { user_id } = await connectionsService.getBySocketId(socket.id);
    const message = await messagesServices.store({
      text,
      user_id,
    });

    io.to(admin_socket_id).emit('admin_receive_message', {
      message,
      socket_id: socket.id,
    });
  });
});
