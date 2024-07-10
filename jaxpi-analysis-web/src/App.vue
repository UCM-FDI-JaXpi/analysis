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
import { onBeforeUnmount, watch, toRaw, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import io from "socket.io-client"
import NavBar from './components/NavBar.vue';
import SidebarMenu from './components/SidebarMenu.vue';

const socket = io("http://localhost:3000"); // Create the Socket.io instance and send a 'connection' event to the server
const route = useRoute(); // To navigate from one tab to another
const authStore = useAuthStore(); // To use Pinia store 


// Watch for changes in authStore.userData
watch(() => authStore.userData,
  (newValue) => {
    if (newValue) {
      console.log("Datos del usuario (Pinia):", toRaw(newValue));
      socket.emit('authenticate', newValue.name);
    }
  },
  { immediate: true }
);

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
