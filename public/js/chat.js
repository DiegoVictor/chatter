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
});
