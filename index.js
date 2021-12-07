const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

let users = {};

const guest = 'Gäst';

io.on('connection', (socket) => {
  console.log(users);

  // Körs vid ny anslutning
  //users[socket.id] = 'Guest';

  users[socket.id] = guest;
  io.emit('updateUsersList', users);

  socket.on('chat-message', (msgData) => {
    if (users[socket.id.toLocaleLowerCase] === guest) {
      io.emit('change', `${guest} byter namn till ${msgData.name}`);
    } else if (users[socket.id] !== msgData.name) {
      io.emit('change', `${users[socket.id]} ändrade namn till ${msgData.name}`);
      users[socket.id] = msgData.name;
      io.emit('updateUsersList', users);
    }
    io.emit('chat-message', msgData);
  });

  socket.on('disconnect', () => {
    io.emit('change', `${users[socket.id]} lämnade chatten.`);
    delete users[socket.id];
    io.emit('updateUsersList', users);
    //users = users.filter((user) => user.id !== socket.id);
  });
});

server.listen(3000, () => {
  console.log('http://localhost:3000');
});
