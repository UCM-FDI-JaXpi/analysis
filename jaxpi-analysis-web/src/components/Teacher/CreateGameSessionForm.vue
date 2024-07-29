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

        <p v-if="selectedGroup">{{ selectedGroup.students.length }} 
                                {{ selectedGroup.students.length === 1 ? 'student' : 'students' }}</p>

        <button type="submit">Create</button>
        <button type="button" @click="cancelForm">Cancel</button>
    </form>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
//import { useGameSessionStore } from '@/stores/gameSessionStore';
import { useGamesStore } from '@/stores/gamesStore';
import { useGroupStore } from '@/stores/groupStore';

const emit = defineEmits(['submit', 'cancel']);
//const gameSessionStore = useGameSessionStore();
const gamesStore = useGamesStore();
const groupStore = useGroupStore();

const games = computed(() => gamesStore.games);
const groups = computed(() => groupStore.groups);

const gameSessionData = ref({
    gameSessionName: '',
    gameName: '',
    groupName: '',
    studentPasswordPair: [],
});

const selectedGroup = ref(null);

onMounted(async () => {
    // Load games
    if (!gamesStore.games.length) {
        await gamesStore.fetchAllGames();
    }
});

const updateSelectedGroup = () => {
    gameSessionData.value.groupName = selectedGroup.value.name;
};

const generatePasswords = (students) => { // Devuelve un array de studentNames junto a sus contraseñas
    return students.map(student => ({
        name: student,
        password: Math.random().toString(36).substring(2, 8) // Generate a random password
    }));
};

const addGameSession = () => {
    const gameSessionToAdd = { ...gameSessionData.value };
    gameSessionToAdd.studentPasswordPair = generatePasswords(selectedGroup.value.students);

    resetForm();
    emit('submit', gameSessionToAdd);
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
</style>