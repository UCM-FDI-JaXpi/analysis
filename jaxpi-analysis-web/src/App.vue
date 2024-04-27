<template>
  <div id="app">
    <router-view :socket="socket" :userData="userData"></router-view>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import io from "socket.io-client"
import axios from 'axios';

const socket = io("http://localhost:3000"); // Create the Socket.io instance and send a 'connection' event to the server
const userData = ref(null);

onMounted(() => {
  fetchUserFromMongoDB().then(data => {
    userData.value = data;
    if(data.user){ // Si no hay conexion con el server, salta al catch
      socket.emit('authenticate', data.user.name);
    }
  })
  .catch(error => {
    console.error('Error al obtener los datos del usuario en el punto de montaje:', error);
  });
});

const fetchUserFromMongoDB = async () => {
  try {
    const user = await axios.get('http://localhost:3000/api/session', {
      withCredentials: true
    });
    console.log('Datos del usuario:', user.data);
    return user.data;
  } catch (error) {
    console.error('Error al obtener los datos del usuario a través de la petición HTTP:', error);
  }
};

onBeforeUnmount(() => {
  socket.disconnect(); // Close the websocket connection by sending a 'disconnect' event to the server
});
</script>

<style>
#app {
  font-family: Arial, sans-serif;
}
</style>
