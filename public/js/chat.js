document.querySelector('#start_chat').addEventListener('click', (event) => {
  const socket = io();

  const chat_help = document.getElementById('chat_help');
  chat_help.style.display = 'none';

  const chat_support = document.getElementById('chat_in_support');
  chat_support.style.display = 'block';

  const email = document.getElementById('email').value;
  const text = document.getElementById('txt_help').value;

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
          email,
        });
      } else {
        rendered = Mustache.render(template_client, {
          message: message.text,
          email,
        });
      }
      document.getElementById('messages').innerHTML += rendered;
    });
  });
});
