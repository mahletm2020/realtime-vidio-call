<template>
  <div class="chat-container">
    <h2>Real-time Chat</h2>

    <!-- Chat Log Display -->
    <div class="chat-log">
      <ul>
        <li v-for="(msg, index) in chatLog" :key="index">
          <strong>{{ msg.sender }}</strong>: {{ msg.message }}
        </li>
      </ul>
    </div>

    <!-- Join Room and Message Forms -->
    <div class="chat-forms">
      <!-- Join Room Form -->
      <div class="join-room">
        <input v-model="room" placeholder="Enter room name" />
        <button @click="joinRoom">Join Room</button>
      </div>

      <!-- Chat Message Form -->
      <div class="message-form">
        <input v-model="message" placeholder="Type your message" @keyup.enter="sendMessage" />
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const message = ref('');
const chatLog = ref([]);
const room = ref('');
const { $socket } = useNuxtApp();

// Add a listener for the welcome message
onMounted(() => {
  $socket.on('welcome-message', (welcomeMsg) => {
    chatLog.value.push({ sender: 'Server', message: welcomeMsg });
  });

  // Listen for incoming chat messages
  $socket.on('chat-message', (msg) => {
    chatLog.value.push(msg);
  });
});

// Function to send a message
const sendMessage = () => {
  if (message.value.trim() !== '') {
    const msgData = {
      sender: 'User',
      message: message.value,
      room: room.value || null, // If a room is joined, add it to the message
    };
    $socket.emit('chat-message', msgData);
    message.value = '';
  }
};

// Function to join a specific chat room
const joinRoom = () => {
  if (room.value.trim() !== '') {
    $socket.emit('join-room', room.value);
  }
};
</script>

<style scoped>
.chat-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.chat-log {
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
  margin-bottom: 10px;
}

.chat-log ul {
  list-style-type: none;
  padding: 0;
}

.chat-log li {
  margin: 5px 0;
}

.chat-forms {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.join-room,
.message-form {
  display: flex;
  gap: 10px;
}

input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
