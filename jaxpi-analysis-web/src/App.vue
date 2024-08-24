<template>
  <div id="app">
    <header>
      <NavBar />
    </header>
    <div class="main-container">
      <SidebarMenu v-if="showSidebar" />
      <div class="content-container">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import NavBar from './components/navigation/NavBar.vue';
import SidebarMenu from './components/navigation/SidebarMenu.vue';
import socket from './socket';

const route = useRoute();
const authStore = useAuthStore(); // To use Pinia store 

// Watch for changes in authStore.userData
watch(() => authStore.userData,
  (newValue) => {
    if (newValue) {
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

<style>
html, body, #app {
  height: 100vh;
  margin: 0;
  box-sizing: border-box;
}
#app {
  display: flex;
  flex-direction: column;
  margin: 0;
  font-family: Arial, sans-serif;
}
.main-container {
  display: flex;
  flex: 1;
}

.content-container {
  flex-grow: 1;
  padding: 1rem;
}
</style>
