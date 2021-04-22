import { io } from '../app';
import ConnectionsService from '../services/ConnectionsService';
import MessagesServices from '../services/MessagesServices';
import UsersService from '../services/UsersService';

interface IParams {
  text: string;
  email: string;
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

    let connection = await connectionsService.getByUserId(user.id);
    if (!connection) {
      await connectionsService.store({
        socket_id: socket.id,
        user_id: user.id,
      });
    } else {
      connection.socket_id = socket.id;
      await connectionsService.store(connection);
    }

    await messagesServices.store({
      text,
      user_id: user.id,
    });
  });
});
