const socket = io();

const form = document.querySelector('form');
const userName = document.querySelector('#name');
const input = document.querySelector('#input');
const messages = document.querySelector('.messages');
const onlineList = document.querySelector('.online-list');
const typingInfo = document.querySelector('.typing-info');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (input.value && userName.value) {
    msgData = {
      userName: userName.value,
      msg: input.value,
    };
    socket.emit('chat-message', msgData);
    input.value = '';
  }
});

input.addEventListener('keypress', (e) => {
  if (userName.value) socket.emit('typing', userName.value);
});

socket.on('updateUsersList', (users) => {
  const usersHtml = Object.values(users)
    .map((user) => `<li class="user">${user}</li>`)
    .join('');

  onlineList.innerHTML = usersHtml;
});

socket.on('chat-message', (msg) => {
  typingInfo.innerText = '';
  let item = document.createElement('li');
  item.textContent = `${msg.userName}: ${msg.msg}`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on('change', (msg) => {
  let item = document.createElement('li');
  item.textContent = msg;
  item.className = 'event';
  messages.appendChild(item);
});

socket.on('typing', (msg) => {
  typingInfo.innerText = msg;
});
