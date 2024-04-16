<template>
  <div id="app">
    <router-view :socket="socket"></router-view>
  </div>
</template>

<script setup>
import { onBeforeUnmount } from 'vue';
import io from "socket.io-client"

const socket = io("http://localhost:3000");

// Before the component is destroyed 
onBeforeUnmount(() => {
  socket.disconnect(); // Close the websocket connection
});
</script>

<style>
#app {
  font-family: Arial, sans-serif;
}
</style>
