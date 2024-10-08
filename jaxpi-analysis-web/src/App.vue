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
const authStore = useAuthStore();

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
  max-width: 850px;
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
  padding: 2rem;
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
  overflow-y: auto;
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

#bar-chart2, #bar-chart3, #bar-chart4, #bar-chart-time-per-attempt, #bar-chart-verb-count,
#pie-chart1,
#line-chart1,
#stacked-bar-chart-interactions-items, #stacked-bar-chart-number-completed-levels {
  background-color: rgba(255, 255, 255, 0.8);
  min-width: 110px; /* Por si la grafica tiene solo una barra en la grafica para que tenga como min un tamaño a cuando hay mas datos */
}

.tabs-charts {
  display: flex;
}

.tabs-charts button {
  padding: 10px 20px;
  margin-right: 2px;
  cursor: pointer;
  border: none;
  background-color: #f0f0f0;
  border-radius: 5px 5px 0 0;
  transition: background-color 0.2s, color 0.2s;
}

.tabs-charts button.active {
  background-color: #79C1FD;
  color: white;
}

.tab-content-charts {
  padding: 2rem;
  background-color: #79C1FDBA;
}

.marginBottom90 {
  margin-bottom: 90px;
}

.datatable-charts {
  display: contents;
}

form#search {
  margin-bottom: 1rem;
  margin-top: 1rem;
}

.centerItems {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.token-container {
  display: flex;
  align-items: baseline;
}

.token-text {
  font-family: monospace;
  font-size: 0.85rem;
  padding: 0px 5px;
  margin-right: 3px;
}

.copy-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: inline-block;
}

.copy-icon {
  width: 20px;
  height: 20px;
  display: block;
}

.copy-button:hover .copy-icon {
  transform: scale(1.03);
}

.game-description-content {
  background-color: #f9f9f9;
  padding: 10px;
  line-height: 1.5;
  white-space: pre-wrap;
  border-left: 3px solid #3498db;
  border-right: 3px solid #3498db;
  border-radius: 8px;
  max-height: 140px;
  overflow-y: auto;
}

.loading-nodata-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: inherit;
}

.chart-details {
  margin-top: 10px;
  margin-bottom: 20px;
  border: 2px solid #1274b5;
}

.chart-details p {
  font-size: 16px;
  margin: 5px 0;
}
</style>