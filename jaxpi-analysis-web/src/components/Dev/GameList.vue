<template>
    <div class="game-list">
        <div v-if="games.length === 0" class="no-games-message">
            <p>There are no games.</p>
        </div>

        <div v-else class="card-container">
            <div v-for="game in games" :key="game.id" class="card">
                <div class="game-info">
                    <h2>{{ game.name }}</h2>
                    <div class="token-container">
                        <p><strong>Token:</strong> {{ game.token }}</p>
                        <button @click.stop="copyToken(game.token)">Copy Token</button>
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

const copyToken = (token) => { // Copiar al portapapeles del usuario
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
.game-list {
    padding: 20px;
}

.no-games-message {
    text-align: center;
    color: #666;
    font-size: 1.125rem;
}

.card-container {
    display: flex;
    flex-direction: column; /* Apila los elementos verticalmente */
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
    flex-grow: 1; /* Permite que esta sección crezca y tome el espacio disponible */
    display: flex;
    flex-direction: column;
    gap: 10px; /* Espacio entre el título y el contenedor del token */
}

.token-container {
    display: flex;
    align-items: center; /* Alinea verticalmente el texto y el botón */
    gap: 10px; /* Espacio entre el texto y el botón */
}

.game-info h2 {
    margin: 0;
    font-size: 1.25rem;
}

.game-info p {
    margin: 0; /* Elimina el margen por defecto */
    color: #666;
}

.card-actions {
    flex-shrink: 0; /* Para que el div del botón no se reduzca */
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
    white-space: nowrap; /* Evita que el texto se divida en varias líneas */
}

.details-button:hover {
    background-color: #0479ffaf;
}
</style>