import { io } from '../app';
import { ConnectionsRepository } from '../repositories/ConnectionsRepository';
import { MessagesRepository } from '../repositories/MessagesRepository';
import { UsersRepository } from '../repositories/UsersRepository';
import { ConnectionsService } from '../services/ConnectionsService';
import { MessagesServices } from '../services/MessagesServices';

const connectionsService = new ConnectionsService(ConnectionsRepository);
const messagesServices = new MessagesServices(
  MessagesRepository,
  UsersRepository,
);

io.on('connect', async (socket) => {
  const connectionsPending = await connectionsService.getPending();
  io.emit('admin_list_pending', connectionsPending);

  socket.on('admin_list_messages_by_user', async (params, callback) => {
    const { user_id } = params;

    try {
      const messages = await messagesServices.listByUserId(user_id);
      callback(messages);
    } catch (err) {
      callback(err);
    }
  });

  socket.on('admin_send_message', async (params) => {
    const { user_id, text } = params;

    const [{ socket_id }] = await Promise.all([
      connectionsService.getByUserId(user_id),
      messagesServices.store({
        user_id,
        text,
        admin_id: socket.id,
      }),
    ]);

    io.to(socket_id).emit('admin_sent_message', {
      text,
      socket_id: socket.id,
    });
  });

  socket.on('admin_user_in_support', async (params) => {
    const { user_id, user_socket_id } = params;

    await connectionsService.setAdminId(user_id, socket.id);

    io.to(user_socket_id).emit('set_admin_socket_id', { socket_id: socket.id });
  });
});
