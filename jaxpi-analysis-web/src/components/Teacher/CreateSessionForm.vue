<template>
    <h2>Create Session</h2>
    <form @submit.prevent="addSession">
        <label for="sessionName">Session name:</label>
        <input type="text" v-model="sessionData.sessionName" id="sessionName" required />

        <label for="game">Game:</label>
        <select v-model="sessionData.gameName" id="game" required>
            <option v-for="game in games" :key="game.id" :value="game.name">{{ game.name }}</option>
        </select>

        <label for="group">Group:</label>
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
import { ref } from 'vue';

const emit = defineEmits(['submit', 'cancel']);

const games = ref([
    { id: 1, name: 'Pop' },
    { id: 2, name: 'Tetris' },
    { id: 3, name: 'Mario' },
]);

const groups = ref([
    { id: 1, name: 'Group A', students: ['Student 0'] },
    { id: 2, name: 'Group B', students: ['Student 1', 'Student 2', 'Student 3'] },
    { id: 3, name: 'Group C', students: ['Student 4', 'Student 5'] },
]);

const sessionData = ref({
    sessionName: '',
    gameName: '',
    groupName: '',
    studentPasswordPair: [],
});

const selectedGroup = ref(null);

const updateSelectedGroup = () => {
    sessionData.value.groupName = selectedGroup.value.name;
};

const generatePasswords = (students) => { // Devuelve un array de studentNames junto a sus contraseñas
    return students.map(student => ({
        name: student,
        password: Math.random().toString(36).substring(2, 8) // Generate a random password
    }));
};

const addSession = () => {
    const sessionToAdd = { ...sessionData.value };
    sessionToAdd.studentPasswordPair = generatePasswords(selectedGroup.value.students);

    resetForm();
    emit('submit', sessionToAdd);
};

const resetForm = () => {
    sessionData.value.sessionName = '';
    sessionData.value.gameName = '';
    sessionData.value.groupName = '';
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