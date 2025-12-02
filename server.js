const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this to "https://abbasuddin.com"
    methods: ["GET", "POST"]
  }
});

// 1. GET THE PASSWORD FROM RENDER ENVIRONMENT (OR DEFAULT TO 'admin123')
const ADMIN_PWD = process.env.ADMIN_PASSWORD || "admin123";

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('chat message', (data) => {
    // data = { text: "...", senderId: "...", isAdmin: boolean, password: "..." }

    // 2. SECURITY CHECK
    if (data.isAdmin) {
      if (data.password !== ADMIN_PWD) {
        // If password is wrong, tell ONLY the sender (Admin)
        io.to(socket.id).emit('auth_error', 'Invalid Access Code');
        return; // Stop execution, do not broadcast
      }
    }

    // 3. BROADCAST IF VALID
    // We remove the password before sending it to everyone else for security
    const safePayload = { 
      text: data.text, 
      senderId: data.senderId, 
      isAdmin: data.isAdmin 
    };
    
    io.emit('chat message', safePayload);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

