const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

// Serve any frontend static files if needed
app.use(express.static('public'));

// Start the server on port 3001
const PORT = 3001;
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Initialize Socket.IO with the Express server
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Frontend URL
    methods: ['GET', 'POST'],
    credentials: true,
  },
  path: '/socket.io',
});

// Listen for new client connections
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Send a welcome message with the user's socket ID
  socket.emit('welcome-message', `You are connected as ID: ${socket.id}`);

  // Handle incoming chat messages and broadcast them
  socket.on('chat-message', (msg) => {
    if (!msg.room) {
      // If no room is specified, broadcast to all clients
      socket.broadcast.emit('chat-message', msg);
    } else {
      // Send message to a specific room
      socket.to(msg.room).emit('chat-message', msg);
    }
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
