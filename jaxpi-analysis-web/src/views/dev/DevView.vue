<template>
  <div class="dev-view">
    <h1 v-if="!dev">Dev's view</h1>
    <p v-if="!dev">Please log in as a dev to view dev details.</p>
    
    <div class="dev-details" v-if="dev">
      <div class="dev-info">

        <div class="dev-left">
          <h3 class="dev-name">{{ dev.name }}</h3>
          <p class="dev-role">Role: {{ dev.usr_type }}</p>
          <p><strong>Email:</strong> {{ dev.email }}</p>
        </div>

        <div class="games-right">
          <h3 class="games-count">
            <span class="count">{{ gamesCount }}</span>
            <span class="label">games</span>
          </h3>
        </div>

      </div>
    </div>

    <div class="game-section" v-if="dev">
      <h2>Games</h2>
      <GameList />
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
import { computed } from 'vue';
import { useGamesStore } from '@/stores/gamesStore';
import GameList from '@/components/dev/GameList.vue';

const authStore = useAuthStore();
const gamesStore = useGamesStore();

const dev = computed(() => { // devuelve todos los datos si usr_type = 'dev', sino, null
  const devData = authStore.userData;
  return devData && devData.usr_type === 'dev' ? devData : null;
});
const gamesCount = computed(() => gamesStore.games.length);
</script>

<style scoped>
.dev-view {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

h1 {
    margin-bottom: 0;
}

.dev-details {
    display: flex;
    flex-direction: column;
    background-color: #f9f9f9;
    padding: 1.5rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #ddd; 
    margin-bottom: 20px;
    width: -webkit-fill-available;
    max-width: 800px;
}

.dev-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-start; /* Alinea el contenido hacia arriba */
}

.dev-left {
    display: flex;
    flex-direction: column;
}

.dev-left > p{
    margin-top: 5px;
}

.dev-name {
    font-size: 1.7rem;
    margin: 0;
}

.dev-role {
    font-size: 0.9rem;
    color: #727171;
    font-weight: bold;
}

.games-right {
    text-align: center;
}

.games-count {
    display: flex;
    flex-direction: column; /* Apila los elementos dentro del h3 verticalmente */
    margin: 0;
}

.count {
    font-size: 3rem;
    color: #7c15dd;
}

.label {
    color: #7c15dd;
    margin-top: -5px;
}
</style>