const socket = io();
let connectionsUsers = new Map();

socket.on('admin_list_pending', (connections) => {
  document.getElementById('list_users').innerHTML = '';

  let template = document.getElementById('template').innerHTML;

  connections.forEach((connection) => {
    connectionsUsers.set(connection.socket_id, connection);
    if (!connection.admin_id) {
      const rendered = Mustache.render(template, {
        email: connection.user.email,
        id: connection.socket_id,
      });
      document.getElementById('list_users').innerHTML += rendered;
    }
  });
});

function call(id) {
  const connection = connectionsUsers.get(id);
  const template = document.getElementById('admin_template').innerHTML;

  const rendered = Mustache.render(template, {
    email: connection.user.email,
    id: connection.user_id,
  });

  document.getElementById('supports').innerHTML += rendered;

  const params = {
    user_id: connection.user_id,
    user_socket_id: connection.socket_id,
  };

  socket.emit('admin_user_in_support', params);

  socket.emit('admin_list_messages_by_user', params, (messages) => {
    const container = document.getElementById(
      `allMessages${connection.user_id}`
    );

    messages.forEach((message) => {
      const div = document.createElement('div');

      div.className = 'admin_message_admin';
      if (message.admin_id === null) {
        div.className = 'admin_message_client';
      }

      div.innerHTML = `<span>${message.text}</span>`;

      container.appendChild(div);
    });
  });
}

function sendMessage(id) {
  const text = document.getElementById(`send_message_${id}`);

  if (text.value.length > 0) {
    const params = {
      text: text.value,
      user_id: id,
    };

    socket.emit('admin_send_message', params);

    const container = document.getElementById(`allMessages${id}`);

    const div = document.createElement('div');
    div.className = 'admin_message_admin';
    div.innerHTML = `<span>${params.text}</span>`;

    container.appendChild(div);
    text.value = '';

    setTimeout(() => {
      container.scrollTo(0, container.offsetHeight);
    }, 50);
  }
}

function closeChat(id) {
  connectionsUsers.delete(id);
  document.getElementById(`admin${id}`).remove();
}

socket.on('admin_receive_message', (data) => {
  const connection = connectionsUsers.get(data.socket_id);
  const container = document.getElementById(`allMessages${connection.user_id}`);

  const div = document.createElement('div');

  div.className = 'admin_message_client';
  div.innerHTML += `<span>${data.message.text}</span>`;

  container.appendChild(div);

  setTimeout(() => {
    container.scrollTo(0, container.offsetHeight);
  }, 50);
});
