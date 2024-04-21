<template>
  <div id="app">
    <router-view :socket="socket"></router-view>
  </div>
</template>

<script setup>
import { onBeforeUnmount } from 'vue';
import io from "socket.io-client"

// Create the Socket.io instance and send a 'connection' event to the server
const socket = io("http://localhost:3000");

onBeforeUnmount(() => {
  socket.disconnect(); // Close the websocket connection by sending a 'disconnect' event to the server
});
</script>

<style>
#app {
  font-family: Arial, sans-serif;
}
</style>
