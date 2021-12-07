const socket = io();

const form = document.querySelector('form');
const name = document.querySelector('#name');
const input = document.querySelector('#input');
const messages = document.querySelector('.messages');
const onlineList = document.querySelector('.online-list');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (input.value && name.value) {
    msgData = {
      name: name.value,
      msg: input.value,
    };
    socket.emit('chat-message', msgData);
    input.value = '';
  }
});

socket.on('updateUsersList', (users) => {
  const usersHtml = Object.values(users)
    .map((user) => `<li class="user">${user}</li>`)
    .join('');

  onlineList.innerHTML = usersHtml;
});

socket.on('chat-message', (msg) => {
  let item = document.createElement('li');
  item.textContent = `${msg.name}: ${msg.msg}`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on('change', (msg) => {
  let item = document.createElement('li');
  item.textContent = msg;
  item.className = 'event';
  messages.appendChild(item);
});
