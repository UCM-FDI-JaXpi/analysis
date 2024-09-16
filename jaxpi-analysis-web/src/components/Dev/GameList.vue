<template>
    <div class="game-list">
        <div v-if="games.length === 0" class="blueCard no-data-charts">
            <p>There are no games.</p>
        </div>

        <div v-else class="card-container">
            <div v-for="game in games" :key="game.id" class="card">
                <div class="game-info">
                    <h2>{{ game.name }}</h2>
                    <div class="token-container">
                        <p><strong>Token:</strong><span class="token-text">{{ game.token }}</span></p>
                        <button @click.stop="copyToken(game.token)" class="copy-button">Copy</button>
                    </div>
                </div>
                <div class="card-actions">
                    <router-link :to="{ name: 'GameDetailsView', params: { gameId: game.id } }" class="details-button">
                        View Details
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useGamesStore } from '@/stores/gamesStore';

const gamesStore = useGamesStore();
const games = computed(() => gamesStore.games);

const copyToken = (token) => {
    navigator.clipboard.writeText(token)
        .then(() => {
            console.log('Token copied to clipboard');
        })
        .catch(err => {
            console.error('Failed to copy token:', err);
        });
};
</script>

<style scoped>
.card-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    max-width: 600px;
    min-width: min-content;
    overflow: hidden;
    box-sizing: border-box;
}
.game-info {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.game-info h2 {
    margin: 0;
    font-size: 1.25rem;
}

.game-info p {
    margin: 0;
    color: #666;
}

.card-actions {
    flex-shrink: 0;
}

.details-button {
    display: inline-block;
    padding: 8px 12px;
    background-color: #1976D2;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.24s ease;
    white-space: nowrap;
}

.details-button:hover {
    background-color: #0479ffaf;
}
</style>