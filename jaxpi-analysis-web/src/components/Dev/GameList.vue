<template>
    <div class="game-list">
        <ul>
            <li v-for="game in games" :key="game.id" @click="selectGame(game)" class="game-item">
                <div class="game-info">
                    <h4>{{ game.name }}</h4>
                    <p>Token: {{ game.token }}</p>
                    <button @click.stop="copyToken(game.token)">Copy Token</button>
                </div>

            </li>
        </ul>
    </div>
</template>

<script setup>
// eslint-disable-next-line
const props = defineProps({
    games: Array
})

const emit = defineEmits(['selectGame'])

const selectGame = (game) => {
    emit('selectGame', game)
}

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
    margin-top: 20px;
}

.game-list ul {
    padding: 0;
}

.game-item {
    padding: 10px;
    margin-bottom: 10px;
    background-color: #f0f0f0;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.game-item:hover {
    background-color: #e0e0e0;
}

.game-info h4 {
    margin: 0;
    font-size: 1.2rem;
}

.game-info p {
    margin-top: 10px;
    margin-bottom: 0;
    color: #666;
}

.game-info button {
    padding: 5px 10px;
    background-color: #1976D2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 5px;
}

.game-info button:hover {
    background-color: #1565C0;
}
</style>