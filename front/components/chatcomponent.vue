<template>
  <div class="chat-container">
  
    <div class="chat-log">
      <ul>
        <li
          v-for="(msg, index) in chatLog"
          :key="index"
          :class="msg.sender === 'User' ? 'sent' : 'received'"
        >
          <div class="message-bubble">
            <strong>{{ msg.sender }}</strong>
            <p>{{ msg.message }}</p>
            <span class="timestamp">{{ msg.timestamp }}</span>
          </div>
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
        <input
          v-model="message"
          placeholder="Type your message"
          @keyup.enter="sendMessage"
        />
        <button @click="sendMessage">Send</button>
      </div>
    </div>

    <!-- Participants List (Toggle) -->
    <div v-if="showParticipants" class="participants-list">
      <h3>Participants</h3>
      <ul>
        <li v-for="(participant, index) in participants" :key="index">
          {{ participant }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const message = ref('');
const chatLog = ref([]);
const room = ref('');
const showParticipants = ref(false);
const participants = ref(['Alice', 'Bob', 'Charlie']); // Example participants list
const { $socket } = useNuxtApp();

// Add a listener for the welcome message
onMounted(() => {
  $socket.on('welcome-message', (welcomeMsg) => {
    addMessage({ sender: 'Server', message: welcomeMsg });
  });

  // Listen for incoming chat messages
  $socket.on('chat-message', (msg) => {
    addMessage(msg);
  });

  // Listen for participant updates
  $socket.on('update-participants', (list) => {
    participants.value = list;
  });
});

// Function to send a message
const sendMessage = () => {
  if (message.value.trim() !== '') {
    const msgData = {
      sender: 'User',
      message: message.value,
      timestamp: new Date().toLocaleTimeString(),
      room: room.value || null,
    };
    $socket.emit('chat-message', msgData);
    addMessage(msgData);
    message.value = '';
  }
};

// Function to join a specific chat room
const joinRoom = () => {
  if (room.value.trim() !== '') {
    $socket.emit('join-room', room.value);
  }
};

// Function to add a message to the chat log
const addMessage = (msg) => {
  chatLog.value.push(msg);
};

// Function to toggle the participants list
const toggleParticipants = () => {
  showParticipants.value = !showParticipants.value;
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  height: 90%;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background-color: #fff;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.chat-log {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.chat-log ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.chat-log li {
  margin-bottom: 10px;
}

.sent {
  text-align: right;
}

.received {
  text-align: left;
}

.message-bubble {
  display: inline-block;
  padding: 10px;
  border-radius: 10px;
  background-color: #02aa2f;
  color: #0b0b0b;
  max-width: 70%;
  word-wrap: break-word;
}

.received .message-bubble {
  background-color: #693103;
  color: #fbf5f5;
}

.timestamp {
  display: block;
  font-size: 12px;
  color: #8afe05;
  margin-top: 5px;
}

.chat-forms {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
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
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #218838;
}

.participants-list {
  position: absolute;
  right: 20px;
  top: 20px;
  width: 200px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.participants-list h3 {
  margin: 0;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: bold;
}

.participants-list ul {
  list-style: none;
  padding: 0;
}

.participants-list li {
  padding: 5px 0;
  font-size: 14px;
}
</style>
