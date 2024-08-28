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
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin: 0;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
}

#app {
  display: flex;
  flex-direction: column;
  margin: 0;
  background-color: #cfe9ff;
}

.main-container {
  display: flex;
  flex: 1;
}

.content-container {
  flex-grow: 1;
  padding: 2rem;
}

.card-details {
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 62%;
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd; 
  margin-bottom: 20px;
}

.card-details h1 {
  margin-top: 10px;
}

.card-details p {
  margin-top: 0px;
  margin-bottom: 10px; 
}

.card-details p strong {
  color: #3498db;
}

.blueCard {
  background-color: #A8D8FF;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  margin-bottom: 20px;
  max-width: 1300px;
}

.no-data-charts {
  text-align: center;
  color: #696866;
  font-size: 1.5rem;
}

.chart-container-barchart {
  display: flex;
  width: 100%;
  place-content: center;
  gap: 28px;
}

.filter-container {
  flex: 0 0 250px;
  padding: 1rem;
  box-sizing: border-box;
  max-height: 365px;
  overflow-y: auto; /* Muestra scrollbar vertical cuando el contenido desborda */
  scrollbar-color: #79c1fd #f0f0f0;
  margin-top: 22px;
  padding-top: 0px;
}

.chart-container-linechart {
  display: flex;
  width: 100%;
  place-content: center;
  gap: 22px;
}
</style>