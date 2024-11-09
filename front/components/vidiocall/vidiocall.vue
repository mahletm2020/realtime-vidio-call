<template>
  <div class="video-call-container">
    <!-- Top Bar -->
    <div class="top-bar">
      <h2 class="room-title">One-on-One Call</h2>
      <div class="room-info">{{ Roomid }}</div>
    </div>

    <!-- Call Input Form (Left Top Corner) -->
    <div v-if="!inCall" class="call-form">
      <input v-model="targetUserId" placeholder="Enter user ID to call" />
      <button @click="callUser">Call</button>
    </div>

    <!-- Incoming Call Section -->
    <div v-if="incomingCall" class="incoming-call">
      <p>{{ callerId }} is calling you!</p>
      <button @click="acceptCall">Accept</button>
      <button @click="rejectCall">Reject</button>
    </div>

    <!-- Video Call Section -->
    <div v-if="inCall" class="video-wrapper">
      <div class="main-video">
        <video ref="localVideo" autoplay playsinline muted></video>
      </div>
      <div class="remote-video">
        <video ref="remoteVideo" autoplay playsinline></video>
      </div>

      <!-- Video Call Controls -->
      <div class="video-controls">
        <button @click="toggleCamera" :class="{ active: cameraOn }">
          <i class="icon-camera"></i> {{ cameraOn ? 'Camera On' : 'Camera Off' }}
        </button>
        <button @click="toggleMicrophone" :class="{ active: microphoneOn }">
          <i class="icon-microphone"></i> {{ microphoneOn ? 'Mic On' : 'Mic Off' }}
        </button>
        <button @click="endCall" class="end-call">
          <i class="icon-end-call"></i> End Call
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const { $socket } = useNuxtApp();

const targetUserId = ref('');
const callerId = ref('');
const incomingCall = ref(false);
const inCall = ref(false);
const cameraOn = ref(true);
const microphoneOn = ref(true);

const localStream = ref(null);
const remoteStream = ref(null);
const localVideo = ref(null);
const remoteVideo = ref(null);
let peerConnection = null;

// Join room on mount
onMounted(() => {
  $socket.emit('join', $socket.id);
});

// Function to start the call
const callUser = () => {
  $socket.emit('call-user', {
    targetUserId: targetUserId.value,
    callerId: $socket.id,
  });
  console.log(`Calling ${targetUserId.value}`);
};

// Listener for incoming call
$socket.on('incoming-call', ({ callerId: id }) => {
  callerId.value = id;
  incomingCall.value = true;
});

// Accept the call
const acceptCall = async () => {
  incomingCall.value = false;
  inCall.value = true;
  $socket.emit('accept-call', { callerId: callerId.value, receiverId: $socket.id });
  await startVideo();
};

// Reject the call
const rejectCall = () => {
  $socket.emit('reject-call', { callerId: callerId.value });
  incomingCall.value = false;
};

// Start video and set up WebRTC connection
const startVideo = async () => {
  try {
    localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.value.srcObject = localStream.value;

    peerConnection = new RTCPeerConnection();

    localStream.value.getTracks().forEach(track => peerConnection.addTrack(track, localStream.value));

    peerConnection.ontrack = (event) => {
      remoteStream.value = event.streams[0];
      remoteVideo.value.srcObject = remoteStream.value;
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        $socket.emit('webrtc-signal', { targetUserId: targetUserId.value, signal: event.candidate });
      }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    $socket.emit('webrtc-signal', { targetUserId: targetUserId.value, signal: offer });
  } catch (err) {
    console.error("Error starting video: ", err);
  }
};

// Handle WebRTC signaling data
$socket.on('webrtc-signal', async (signal) => {
  if (signal.type === 'offer') {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    $socket.emit('webrtc-signal', { targetUserId: targetUserId.value, signal: answer });
  } else if (signal.type === 'answer') {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
  } else if (signal.type === 'candidate') {
    await peerConnection.addIceCandidate(new RTCIceCandidate(signal));
  }
});

// End the call
const endCall = () => {
  inCall.value = false;
  peerConnection.close();
  localStream.value.getTracks().forEach((track) => track.stop());
  console.log('Call ended');
};

// Toggle camera
const toggleCamera = () => {
  cameraOn.value = !cameraOn.value;
  const videoTrack = localStream.value.getVideoTracks()[0];
  videoTrack.enabled = cameraOn.value;
  console.log(cameraOn.value ? 'Camera Enabled' : 'Camera Disabled');
};

// Toggle microphone
const toggleMicrophone = () => {
  microphoneOn.value = !microphoneOn.value;
  const audioTrack = localStream.value.getAudioTracks()[0];
  audioTrack.enabled = microphoneOn.value;
  console.log(microphoneOn.value ? 'Microphone Enabled' : 'Microphone Disabled');
};
</script>





<style scoped>
.video-call-container {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1c1e21;
}

/* Top Bar */
.top-bar {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  background: #333;
  color: #fff;
  border-bottom: 1px solid #444;
}

.room-title {
  font-size: 18px;
  font-weight: bold;
}

.room-info {
  font-size: 14px;
  color: #aaa;
}

/* Call Form */
.call-form {
  position: absolute;
  top: 100px; /* Adjusted lower position */
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 5px;
  color: #fff;
}

.call-form input {
  padding: 5px;
  margin-right: 10px;
  border: none;
  border-radius: 3px;
}

.call-form button {
  padding: 5px 10px;
  background: #4caf50;
  border: none;
  border-radius: 5px;
  color: #fff;
  cursor: pointer;
}

.call-form button:hover {
  background: #45a049;
}

/* Incoming Call Section */
.incoming-call {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  background: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 5px;
  color: #fff;
}

.incoming-call button {
  background: #4caf50;
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.incoming-call button:hover {
  background: #45a049;
}

/* Video Section */
.video-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.main-video {
  flex: 0 0 70%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
  width: 100%;
}

.main-video video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remote-video {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 180px;
  height: 130px;
  background: #333;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #4caf50;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.remote-video video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Video Controls */
.video-controls {
  position: absolute;
  bottom: 20px;
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.7);
  border-top: 1px solid #444;
}

button {
  background: #444;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  color: #fff;
  font-size: 14px;
  margin: 0 5px;
}

button.active {
  background: #4caf50;
}

button.end-call {
  background: #f44336;
}

button:hover {
  background: #555;
}
</style>
