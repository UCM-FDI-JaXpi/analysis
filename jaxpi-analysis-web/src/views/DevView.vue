<template>
  <div class="dev-view">
    <div class="developer-info">
      <h1>Dev's view</h1>
      <h3 v-if="dev">Dev details</h3>
      <p v-if="dev"> Name: {{ dev.name }}</p>
      <p v-if="dev"> Email: {{ dev.email }}</p>
      <p v-else>Please log in as a dev to view dev details.</p>
    </div>

    <div class="game-section">
      <h2 v-if="dev && !showAddGameForm">Game List</h2>
      <GameList v-if="dev && !showAddGameForm" :games="gamesStore.games" @selectGame="selectGame" />
      <button v-if="dev && !showAddGameForm" @click="showAddGameForm = true">Add Game</button>
      <AddGameForm v-if="showAddGameForm" @cancel="showAddGameForm = false" @submit="handleAddGame" />
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useGamesStore } from '@/stores/gamesStore';
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import GameList from '@/components/Dev/GameList.vue';
import AddGameForm from '@/components/Dev/AddGameForm.vue';

const authStore = useAuthStore();
const gamesStore = useGamesStore();
const dev = computed(() => { // devuelve todos los datos si usr_type = 'dev', sino, null
  const devData = authStore.userData;
  return devData && devData.usr_type === 'dev' ? devData : null;
});

const showAddGameForm = ref(false);
const router = useRouter();

const selectGame = (game) => { // Manejar la selección del juego, por ejemplo, navegar a la vista de detalles del juego
  gamesStore.setSelectedGameId(game.id);
  router.push('/charts');
};

const handleAddGame = async (gameData) => {
  gamesStore.addGame(gameData);
  showAddGameForm.value = false;
};

onMounted(async () => {
  await gamesStore.fetchGames();
});
</script>

<style scoped>
</style>