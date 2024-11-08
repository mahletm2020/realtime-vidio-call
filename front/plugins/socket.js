// plugins/socket.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  path: '/socket.io',
  transports: ['websocket'],
  withCredentials: true,
});

export default defineNuxtPlugin(() => {
  return {
    provide: {
      socket,
    },
  };
});
