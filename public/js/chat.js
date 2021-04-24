let email;
let socket;
let admin_socket_id;

document.querySelector('#start_chat').addEventListener('click', () => {
  socket = io();

  const chat_help = document.getElementById('chat_help');
  chat_help.style.display = 'none';

  const chat_support = document.getElementById('chat_in_support');
  chat_support.style.display = 'block';

  email = document.getElementById('email').value;
  const text = document.getElementById('txt_help').value;

  const container = document.getElementById('messages');
  const scroll = document.querySelector('.scroll__messages');

  socket.on('connect', () => {
    const params = { email, text };

    socket.emit('client_first_access', params, (cb, error) => {
      if (error) {
        console.error(error);
      }

      cb();
    });
  });

  socket.on('client_list_messages', (messages) => {
    const template_client = document.getElementById('message-user-template')
      .innerHTML;
    const template_admin = document.getElementById('admin-template').innerHTML;

    messages.forEach((message) => {
      let rendered;

      if (message.admin_id) {
        rendered = Mustache.render(template_admin, {
          message_admin: message.text,
        });
      } else {
        rendered = Mustache.render(template_client, {
          message: message.text,
        });
      }

      container.innerHTML += rendered;
      setTimeout(() => {
        scroll.scrollTo(0, container.offsetHeight);
      }, 50);
    });
  });

  socket.on('set_admin_socket_id', ({ socket_id }) => {
    admin_socket_id = socket_id;
  });

  socket.on('admin_sent_message', (message) => {
    ({ socket_id: admin_socket_id } = message);
    const template_admin = document.getElementById('admin-template').innerHTML;
    const rendered = Mustache.render(template_admin, {
      message_admin: message.text,
    });

    container.innerHTML += rendered;
    setTimeout(() => {
      scroll.scrollTo(0, container.offsetHeight);
    }, 50);
  });
});

document.querySelector('#send_message_button').addEventListener('click', () => {
  const text = document.getElementById('message_user');

  const params = {
    text: text.value,
    admin_socket_id,
  };
  socket.emit('client_sent_message', params);

  const template_client = document.getElementById('message-user-template')
    .innerHTML;
  const rendered = Mustache.render(template_client, {
    message: text.value,
  });

  const container = document.getElementById('messages');
  const scroll = container.parentNode;
  container.innerHTML += rendered;
  text.value = '';

  setTimeout(() => {
    scroll.scrollTo(0, container.offsetHeight);
  }, 50);
});
