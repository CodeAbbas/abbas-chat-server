const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

// Setup Socket.io with CORS to allow your website to connect
const io = new Server(server, {
  cors: {
    origin: "*", // Allow connections from anywhere (or restrict to "https://abbasuddin.com")
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for chat messages
  socket.on('chat message', (msg) => {
    console.log('Message received:', msg);
    
    // Broadcast message to everyone EXCEPT sender (optional)
    // socket.broadcast.emit('chat message', { text: msg, sender: socket.id });
    
    // Or just simulate a system reply for now if you aren't online
    setTimeout(() => {
        socket.emit('chat message', { 
            text: "Message received on server. (Auto-reply)", 
            sender: 'system' 
        });
    }, 1000);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
