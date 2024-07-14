<template>
    <div>
        <h2>Add Game</h2>
        <form @submit.prevent="addGame">
            <label for="name">Name:</label>
            <input type="text" v-model="gameData.name" id="name" required />

            <label for="description">Description:</label>
            <textarea v-model="gameData.description" id="description"></textarea>

            <button type="submit">Create</button>
            <button type="button" @click="cancelForm">Cancel</button>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['submit', 'cancel']); // Definir los eventos que el componente puede emitir

const gameData = ref({
    name: '',
    description: '',
});

const addGame = () => {
    const gameToAdd = { ...gameData.value };
    resetForm();
    emit('submit', gameToAdd); // Emitir evento 'submit' con los datos del juego al padre DevView para añadir el juego
};

const resetForm = () => {
    gameData.value.name = '';
    gameData.value.description = '';
};

const cancelForm = () => {
    resetForm();
    emit('cancel'); // Emitir evento 'cancel' al padre DevView
};
</script>

<style scoped>
form {
    margin-top: 20px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

form label {
    display: block;
    margin-bottom: 8px;
}

form input,
form textarea {
    width: 40%;
    display: block;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
}
form textarea {
    height: 7em;
}

form button {
    padding: 10px;
    background-color: #1976D2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

form button[type="submit"] {
    margin-right: 10px;
}

form button:hover {
    background-color: #1565C0;
}
</style>