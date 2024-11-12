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

// Handle socket connection
io.on('connection', (socket) => {
  console.log('New client connected with ID:', socket.id);

  // Send a notification to the newly connected client with their ID
  socket.emit('notification', `You are connected as ID: ${socket.id}`);

  // Listen for incoming chat messages
  socket.on('chat-message', (msg) => {
    if (!msg.room) {
      // Broadcast to all clients if no room is specified
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

  // Notify others when the client disconnects
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    socket.broadcast.emit('notification', `User ${socket.id} has disconnected`);
  });

  // Call-related notifications and functionality are left untouched
  socket.on('accept-call', ({ callerId, receiverId }) => {
    io.to(callerId).emit('call-accepted', { receiverId });
    io.emit('notification', `Call started between ${callerId} and ${receiverId}`);
    console.log(`User ${receiverId} accepted the call from ${callerId}`);
  });
  
// Notify when a user disconnects
socket.on('disconnect', () => {
  socket.broadcast.emit('notification', `User ${socket.id} has disconnected`);
  console.log(`User ${socket.id} disconnected`);
});

  socket.on('accept-call', ({ callerId, receiverId }) => {
    io.to(callerId).emit('call-accepted', { receiverId });
    console.log(`User ${receiverId} accepted the call from ${callerId}`);
  });

  socket.on('reject-call', ({ callerId }) => {
    console.log('Call rejected by receiver');
    io.to(callerId).emit('call-rejected');
  });

  socket.on('webrtc-signal', ({ targetUserId, signal }) => {
    if (targetUserId) {
      console.log(`Forwarding WebRTC signal to ${targetUserId}`);
      io.to(targetUserId).emit('webrtc-signal', { signal, senderId: socket.id });
    }
  });
  
});


// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
