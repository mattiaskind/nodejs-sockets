const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('En användare anslöt');

  socket.on('chat-message', (msg) => {
    console.log(msg);
    io.emit('chat-message', msg);
  });

  socket.on('disconnect', () => {
    console.log('En användare avslutade');
  });
});

server.listen(3000, () => {
  console.log('http://localhost:3000');
});
