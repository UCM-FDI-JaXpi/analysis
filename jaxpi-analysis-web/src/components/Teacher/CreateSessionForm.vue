<template>
    <h2>Create Session</h2>
    <form @submit.prevent="addSession">
        <label for="sessionName">Session name:</label>
        <input type="text" v-model="sessionData.sessionName" id="sessionName" required />

        <label for="game">Game:</label>
        <select v-model="sessionData.gameName" id="game" required>
            <option v-for="game in games" :key="game.id" :value="game.name">{{ game.name }}</option>
        </select>

        <label for="class">Class:</label>
        <select v-model="selectedClass" id="class" @change="updateSelectedClass" required>
            <option v-for="classItem in classes" :key="classItem.id" :value="classItem">{{ classItem.name }}</option>
        </select>

        <p v-if="selectedClass">{{ selectedClass.students.length }} 
                                {{ selectedClass.students.length === 1 ? 'student' : 'students' }}</p>

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

const classes = ref([
    { id: 1, name: 'Class A', students: ['Student 0'] },
    { id: 2, name: 'Class B', students: ['Student 1', 'Student 2', 'Student 3'] },
    { id: 3, name: 'Class C', students: ['Student 4', 'Student 5'] },
]);

const sessionData = ref({
    sessionName: '',
    gameName: '',
    className: '',
    studentPasswordPair: [],
});

const selectedClass = ref(null);

const updateSelectedClass = () => {
    sessionData.value.className = selectedClass.value.name;
};

const generatePasswords = (students) => { // Devuelve un array de studentNames junto a sus contraseñas
    return students.map(student => ({
        name: student,
        password: Math.random().toString(36).substring(2, 8) // Generate a random password
    }));
};

const addSession = () => {
    const sessionToAdd = { ...sessionData.value };
    sessionToAdd.studentPasswordPair = generatePasswords(selectedClass.value.students);

    resetForm();
    emit('submit', sessionToAdd);
};

const resetForm = () => {
    sessionData.value.sessionName = '';
    sessionData.value.gameName = '';
    sessionData.value.className = '';
    selectedClass.value = null;
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