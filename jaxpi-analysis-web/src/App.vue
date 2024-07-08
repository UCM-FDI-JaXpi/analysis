<template>
  <div id="app">
    <header>
      <NavBar />
    </header>
    <div class="main-container">
      <SidebarMenu v-if="showSidebar" />
      <router-view :socket="socket"></router-view>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import io from "socket.io-client"
import axios from 'axios';
import NavBar from './components/NavBar.vue';
import SidebarMenu from './components/SidebarMenu.vue';

const socket = io("http://localhost:3000"); // Create the Socket.io instance and send a 'connection' event to the server
const userData = ref(null);
const route = useRoute(); // To navigate from one tab to another
const authStore = useAuthStore(); // To use Pinia store 

onMounted(() => { // REVISAR PORQUE YA NO USO ESTE USERDATA CON PINIA (?)
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

const showSidebar = computed(() => { // In these views we don't want to have SidebarMenu
  const noSidebarRoutes = ['HomeView', 'AboutUsView', 'LoginView', 'RegisterView'];
  return authStore.isAuthenticated && !noSidebarRoutes.includes(route.name);
});
</script>

<style scoped>
#app {
  font-family: Arial, sans-serif;
}
</style>
