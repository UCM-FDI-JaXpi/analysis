<template>
    <h2>Create game session</h2>
    <form @submit.prevent="addGameSession">
        <label for="gameSessionName">Game session name</label>
        <input type="text" v-model="gameSessionData.gameSessionName" id="gameSessionName" />

        <label for="game">Game *</label>
        <select v-model="gameSessionData.gameName" id="game" required>
            <option v-for="game in games" :key="game.id" :value="game.name">{{ game.name }}</option>
        </select>

        <label for="group">Group *</label>
        <select v-model="selectedGroup" id="group" @change="updateSelectedGroup" required>
            <option v-for="group in groups" :key="group.id" :value="group">{{ group.name }}</option>
        </select>

        <small v-if="selectedGroup">{{ selectedGroup.students.length }} 
                                {{ selectedGroup.students.length === 1 ? 'student' : 'students' }}</small>

        <button type="submit">Create</button>
        <button type="button" @click="cancelForm">Cancel</button>
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
const groups = computed(() => groupsStore.groups);

const gameSessionData = ref({
    gameSessionName: '',
    gameName: '',
    groupName: '',
});

const selectedGroup = ref(null);

const updateSelectedGroup = () => {
    gameSessionData.value.groupName = selectedGroup.value.name;
};

const addGameSession = async () => {
    try {
        const groupId = selectedGroup.value.id;
        const game = games.value.find(game => game.name === gameSessionData.value.gameName);
        const gameId = game ? game.id : null;

        if (groupId && gameId) {
            const response = await gameSessionsStore.createGameSession(gameSessionData.value.gameSessionName, groupId, gameId);

            if (response) {
                console.log('Game session created successfully!');
                console.log(response);
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
    gameSessionData.value.groupName = '';
    selectedGroup.value = null;
};

const cancelForm = () => {
    resetForm();
    emit('cancel');
};
</script>

<style scoped>
form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

textarea {
    width: 100%;
    height: 100px;
}

small {
    color: gray;
}
</style>