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

// Ett objekt som lagrar användare online och deras id/namn
let users = {};

// Namnet som en användare får vid första anslutningen
const guest = 'Gäst';

io.on('connection', (socket) => {
  // Körs vid ny anslutning
  users[socket.id] = guest;
  io.emit('updateUsersList', users);
  socket.broadcast.emit('change', 'En användare anslöt');

  // När servern tar emot ett nytt chatmeddelande
  socket.on('chat-message', (msgData) => {
    // Kontrollera om användarnamnet har ändrats och uppdatera i så fall det samt sänd
    // ut det nya användarnamnet till övriga deltagare
    if (users[socket.id] !== msgData.userName) {
      socket.broadcast.emit('change', `${users[socket.id]} ändrade namn till ${msgData.userName}`);
      users[socket.id] = msgData.userName;
      io.emit('updateUsersList', users);
    }
    // Skicka ut det nya meddelandet till alla utom klienten som skickade meddelandet
    socket.broadcast.emit('chat-message', msgData);
  });

  // När någon lämnar chatten
  socket.on('disconnect', () => {
    // Meddela övriga användare om vem som lämnat
    socket.broadcast.emit('change', `${users[socket.id]} lämnade chatten`);
    // Ta bort användaren från objektet med användare
    delete users[socket.id];
    // Skicka signal till klienten att uppdatera listan med användare
    io.emit('updateUsersList', users);
  });

  // När servern får signal om att någon skriver ska det skickas ut till övriga anslutna
  socket.on('typing', (user) => {
    socket.broadcast.emit('typing', `${users[socket.id]} skriver...`);
  });

  // När någon slutar skriva ska det skickas till övriga
  socket.on('no-longer-typing', () => {
    socket.broadcast.emit('no-longer-typing');
  });
});

server.listen(3000, () => {
  console.log('http://localhost:3000');
});
