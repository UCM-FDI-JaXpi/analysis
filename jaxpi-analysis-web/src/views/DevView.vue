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
        <h2 v-if="!showAddGameForm">Game List</h2>
        <GameList v-if="dev && !showAddGameForm" :games="games" @selectGame="selectGame" />
        <button v-if="dev && !showAddGameForm" @click="showAddGameForm = true">Add Game</button>
        <AddGameForm v-if="showAddGameForm" @cancel="showAddGameForm = false" @submit="handleAddGame" />
        </div>
    </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
import { computed, ref } from 'vue';
import axios from 'axios';
import GameList from '@/components/Dev/GameList.vue';
import AddGameForm from '@/components/Dev/AddGameForm.vue';

const authStore = useAuthStore();
const dev = computed(() => { // devuelve todos los datos si usr_type = 'dev', sino, null
    const devData = authStore.userData;
    return devData && devData.usr_type === 'dev' ? devData : null;
});

const games = ref([]);
const showAddGameForm = ref(false);

const fetchGames = async () => {
  try {
    const response = await axios.get('http://localhost:3000/dev/games', { //???
      withCredentials: true
    })
    games.value = response.data;
  } catch (error) {
    console.error('Error fetching games:', error);
  }
}

const selectGame = (game) => {
  // Manejar la selección del juego, por ejemplo, navegar a la vista de detalles del juego
  console.log(game);
};

const handleAddGame = async (gameData) => {
  try {
    const response = await axios.post('http://localhost:3000/dev/games', gameData, { //??
      withCredentials: true
    });
    if (response.status === 201) {
      games.value.push(response.data);
      showAddGameForm.value = false;
    } else {
      console.error('Failed to add game');
    }
  } catch (error) {
    console.error('Error adding game:', error);
  }
};

fetchGames();
</script>

<style scoped>

</style>