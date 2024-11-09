<template>
  <div class="main-container">
    <!-- Left Side: Video Call Section -->
    <VidioCall />

    <!-- Right Side: Chat Section -->
    <ChatComponent />
  </div>
</template>

<script setup>
import VidioCall from '../components/vidiocall/vidiocall.vue';
import ChatComponent from '../components/chatcomponent.vue';
</script>

<style scoped>
.main-container {
  display: flex;
  height: 100vh;
  padding: 20px;
  gap: 20px;
  background-color: #f0f2f5
}

/* Left side (Video Call) styling */
.main-container > *:first-child {
  flex: 2;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Right side (Chat Component) styling */
.main-container > *:last-child {
  flex: 1;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
