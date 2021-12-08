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

  // När servern tar emot ett nytt chatmeddelande
  socket.on('chat-message', (msgData) => {
    // Kontrollera om användarnamnet har ändrats och uppdatera i så fall det samt sänd
    // ut det nya användarnamnet till övriga deltagare
    if (users[socket.id] !== msgData.userName) {
      io.emit('change', `${users[socket.id]} ändrade namn till ${msgData.userName}`);
      users[socket.id] = msgData.userName;
      io.emit('updateUsersList', users);
    }
    // Skicka ut det nya meddelandet
    io.emit('chat-message', msgData);
  });

  // När någon lämnar chatten
  socket.on('disconnect', () => {
    // Meddela övriga användare om vem som lämnat
    io.emit('change', `${users[socket.id]} lämnade chatten`);
    // Ta bort användaren från objektet med användare
    delete users[socket.id];
    // Skicka signal till klienten att uppdatera listan med användare
    io.emit('updateUsersList', users);
  });

  socket.on('typing', (user) => {
    // if (users[socket.id] === user.userName) {
    //   io.emit('typing', `${user} skriver...`);
    // } else {
    //   io.emit('typing', `${users[socket.id]} amn och skriver ett meddelande...`);
    // }

    io.emit('typing', `${users[socket.id]} skriver...`);
  });
});

server.listen(3000, () => {
  console.log('http://localhost:3000');
});
