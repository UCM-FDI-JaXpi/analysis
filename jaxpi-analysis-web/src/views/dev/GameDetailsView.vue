<template>
    <div class="game-details" v-if="game">
        <h1>Game details for {{ game.name }}</h1>
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
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useGamesStore } from '@/stores/gamesStore';

//import ChartsView from './ChartsView.vue';

const route = useRoute();
const gamesStore = useGamesStore();
const gameId = computed(() => route.params.gameId);
const game = computed(() => gamesStore.getGameById(gameId.value));

const tabs = ref(["Charts", "Others"]);
const activeTab = ref(0); // Define active tab
</script>

<style scoped>
.game-details {
    padding: 10px;
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
</style>