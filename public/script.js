const socket = io();

const form = document.querySelector('form');
const userName = document.querySelector('#name');
const input = document.querySelector('#input');
const messages = document.querySelector('.messages');
const onlineList = document.querySelector('.online-list');
const typingInfo = document.querySelector('.typing-info');

// När formuläret skickas
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

// När en användare skriver skickar en signal till servern om det
input.addEventListener('keypress', (e) => {
  if (userName.value) socket.emit('typing', userName.value);
});

// När servern skickar en signal om att uppdatera listan med användare online
socket.on('updateUsersList', (users) => {
  const usersHtml = Object.values(users)
    .map((user) => `<li class="user">${user}</li>`)
    .join('');

  onlineList.innerHTML = usersHtml;
});

// När servern skickar en signal om nytt chattmeddelande
socket.on('chat-message', (msg) => {
  typingInfo.innerText = '';
  let item = document.createElement('li');
  item.textContent = `${msg.userName}: ${msg.msg}`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

// När servern skickar en signal om att något ändrats, exempelvis någon som lämnat chatten eller bytt namn
socket.on('change', (msg) => {
  let item = document.createElement('li');
  item.textContent = msg;
  item.className = 'event';
  messages.appendChild(item);
});

// När servern skickar meddelande om att en användare skriver
socket.on('typing', (msg) => {
  typingInfo.innerText = msg;
});
