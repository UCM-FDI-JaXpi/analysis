<template>
    <h2>Create game session</h2>
    <form @submit.prevent="addGameSession">
        <label for="gameSessionName">Game Session Name *</label>
        <input type="text" v-model="gameSessionData.gameSessionName" id="gameSessionName" required />

        <label for="game">Game *</label>
        <select v-model="gameSessionData.gameName" id="game" required>
            <option v-for="game in games" :key="game.id" :value="game.name">{{ game.name }}</option>
        </select>

        <label for="group">Class </label>
        <input type="text" :value="group.name" id="group" readonly />

        <small>{{ group.students.length }} 
            {{ group.students.length === 1 ? 'student' : 'students' }}</small>

        <div class="button-container">
            <button type="submit">Create</button>
            <button type="button" @click="cancelForm">Cancel</button>
        </div>
        </form>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameSessionsStore } from '@/stores/gameSessionsStore';
import { useGamesStore } from '@/stores/gamesStore';
import { useGroupsStore } from '@/stores/groupsStore';

const emit = defineEmits(['submit', 'cancel']);
const gameSessionsStore = useGameSessionsStore();
const gamesStore = useGamesStore();
const groupsStore = useGroupsStore();

const games = computed(() => gamesStore.games);
const groupId = computed(() => groupsStore.selectedGroupId);
const group = computed(() => groupsStore.getGroupById(groupId.value));

const gameSessionData = ref({
    gameSessionName: '',
    gameName: '',
});

const addGameSession = async () => {
    try {
        const groupId = group.value.id;
        const game = games.value.find(game => game.name === gameSessionData.value.gameName);
        const gameId = game ? game.id : null;

        if (groupId && gameId) {
            const response = await gameSessionsStore.createGameSession(gameSessionData.value.gameSessionName, groupId, gameId);

            if (response) {
                console.log('Game session created successfully!');
                console.log('Game session created:', response);
                resetForm();
                emit('submit', response);
            } else {
                alert('Failed to create game session. Please try again.');
            }
        } else {
            alert('Please select a valid group and game.');
        }

    } catch (error) {
        console.error('Error creating game session:', error);
    }
};

const resetForm = () => {
    gameSessionData.value.gameSessionName = '';
    gameSessionData.value.gameName = '';
};

const cancelForm = () => {
    resetForm();
    emit('cancel');
};
</script>

<style scoped>
h2 {
    margin-top: 0;
    font-size: 1.8rem;
    text-align: center;
}

form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 100%;
}

form label {
    display: block;
    color: #444;
    font-weight: bold;
    font-size: 1rem;
}

form input {
    display: block;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.button-container {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-top: 7px;
}

form button {
    padding: 10px 20px;
    width: 100%;
    background-color: #1976D2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

form button:hover {
    background-color: #1565C0;
}

input, select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

input:focus, select:focus {
  border-color: #4a90e2;
  outline: none;
  box-shadow: 0 0 5px rgba(246, 211, 101, 0.5);
}

small {
    color: gray;
}
</style>