<template>
    <div class="game-details" v-if="game">
        <div class="header">
            <h1>Game details for {{ game.name }}</h1>
            <button @click="showDeleteModal = true" class="delete-button">Delete Game</button>
        </div>
        <p><strong>Game id:</strong> {{ game.id }}</p>
        <div class="tabs">
            <button v-for="(tab, index) in tabs" :key="index" @click="activeTab = index"
                :class="{ 'active': activeTab === index }">
                {{ tab }}
            </button>
        </div>

        <div v-if="activeTab === 0" class="tab-content">
            chartsss
        </div>

        <div v-if="activeTab === 1" class="tab-content">
            othersss
        </div>

        <ConfirmModal
          :visible="showDeleteModal"
          title="Confirm Deletion"
          message="Are you sure you want to delete this game?<br>This action cannot be undone. Data will be lost."
          @confirm="deleteGame"
          @cancel="showDeleteModal = false"
        />
    </div>
    <div v-else>
        <SuccessModal
          :visible="showSuccessModal"
          title="Success!"
          message="Game deleted successfully!"
          @ok="handleSuccessModalOk"
        />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGamesStore } from '@/stores/gamesStore';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';
import SuccessModal from '@/components/modals/SuccessModal.vue';

//import ChartsView from './ChartsView.vue';

const route = useRoute();
const router = useRouter();
const gamesStore = useGamesStore();
const gameId = computed(() => route.params.gameId);
const game = computed(() => gamesStore.getGameById(gameId.value));

const tabs = ref(["Charts", "Others"]);
const activeTab = ref(0); // Define active tab
const showDeleteModal = ref(false);
const showSuccessModal = ref(false);

const deleteGame = async () => {
    try {
        await gamesStore.deleteGame(gameId.value);
        showDeleteModal.value = false;
        showSuccessModal.value = true;
    } catch (error) {
        console.error('Failed to delete game:', error);
    }
};
const handleSuccessModalOk = () => {
    showSuccessModal.value = false;
    router.push('/games'); // Navigate to the games list after closing the success modal
};
</script>

<style scoped>
.game-details {
    padding: 20px;
    background-color: #f9f9f9;
    max-width: 900px; /* Aumentado para un mejor uso del espacio */
    margin: 0 auto;
}

.game-details p {
    margin-top: 0;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.delete-button {
    background-color: #d32f2f;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    cursor: pointer;
    transition: background-color 0.24s ease;
}

.delete-button:hover {
    background-color: #b71c1c;
}

/* Add styling for tabs */
.tabs {
    display: flex;
}

.tabs button {
    padding: 10px 20px;
    margin-right: 1px;
    cursor: pointer;
    border: none;
}

.tabs button.active {
    background-color: #79c1fd;
}

.tab-content {
    display: flex;
    flex-wrap: wrap; /* Permite que los elementos se muevan a la siguiente fila cuando no quepan */
    gap: 50px; /* Espacio entre los elementos */
    padding: 10px;
    background-color: #79c1fd;
}

h1 {
    font-size: 2rem;
    margin: 0;
}
</style>