// server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const PORT = 3001;

// CORS configuration to allow the frontend to connect
app.use(cors({
  origin: 'http://localhost:3000', // Adjust to your frontend URL
  methods: ['GET', 'POST'],
  credentials: true,
}));

const server = http.createServer(app);

// Initialize Socket.io server with CORS settings
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  path: '/socket.io',
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // ====== Chat Functionality ======
  // Send a welcome message
  socket.emit('welcome-message', `You are connected as ID: ${socket.id}`);

  // Listen for chat messages
  socket.on('chat-message', (msg) => {
    if (!msg.room) {
      // Broadcast to all clients if no room specified
      socket.broadcast.emit('chat-message', msg);
    } else {
      // Send message to a specific room
      socket.to(msg.room).emit('chat-message', msg);
    }
  });

  // Join a chat room
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  // ====== Video Call Functionality ======

  // Handle initiating a call
  socket.on('call-user', ({ targetUserId, callerId }) => {
    console.log(`User ${callerId} is attempting to call ${targetUserId}`);
    io.to(targetUserId).emit('incoming-call', { callerId });
  });

  // Handle accepting the call and notify the caller
  socket.on('accept-call', ({ callerId, receiverId }) => {
    console.log(`User ${receiverId} accepted the call from ${callerId}`);
    io.to(callerId).emit('call-accepted', { receiverId });
  });

  // Handle rejecting the call and notify the caller
  socket.on('reject-call', ({ callerId }) => {
    console.log(`Call rejected by receiver`);
    io.to(callerId).emit('call-rejected');
  });

  // Handle WebRTC signaling data (offer, answer, ICE candidates)
  socket.on('webrtc-signal', ({ targetUserId, signal }) => {
    console.log(`Forwarding WebRTC signal to ${targetUserId}`);
    io.to(targetUserId).emit('webrtc-signal', { signal, senderId: socket.id });
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
