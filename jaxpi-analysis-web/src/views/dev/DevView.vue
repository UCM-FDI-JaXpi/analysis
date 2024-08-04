<template>
  <div class="dev-view">
    <h1>Dev's view</h1>
    <div class="dev-details" v-if="dev">
      <h3>Dev details</h3>
      <p><strong>Name:</strong> {{ dev.name }}</p>
      <p><strong>Email:</strong> {{ dev.email }}</p>
    </div>

    <div class="game-section" v-if="dev">
      <h2 v-if="!showAddGameForm">Game List</h2>
      <GameList v-if="!showAddGameForm"/>
      <button v-if="!showAddGameForm" @click="showAddGameForm = true">Add Game</button>
      <AddGameForm v-if="showAddGameForm" @cancel="showAddGameForm = false" @submit="handleAddGame" />
    </div>

    <p v-else>Please log in as a dev to view dev details.</p>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useGamesStore } from '@/stores/gamesStore';
import { computed, ref, onMounted } from 'vue';
import GameList from '@/components/dev/GameList.vue';
import AddGameForm from '@/components/dev/AddGameForm.vue';

const authStore = useAuthStore();
const gamesStore = useGamesStore();
const dev = computed(() => { // devuelve todos los datos si usr_type = 'dev', sino, null
  const devData = authStore.userData;
  return devData && devData.usr_type === 'dev' ? devData : null;
});

const showAddGameForm = ref(false);

const handleAddGame = async (gameData) => {
  gamesStore.addGame(gameData);
  showAddGameForm.value = false;
};

onMounted(async () => {
  await gamesStore.fetchGames();
});
</script>

<style scoped>
.dev-view {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.dev-details {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.dev-details > * {
    margin: 0; /* Elimina el margin de todos los elementos dentro de dev-details */
}

.game-section > * {
    margin-bottom: 0;
}

h1 {
    margin-bottom: 0;
}
</style>