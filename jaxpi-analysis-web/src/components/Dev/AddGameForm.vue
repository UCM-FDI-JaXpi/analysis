<template>
    <div>
        <h2>Add Game</h2>
        <form @submit.prevent="addGame">
            <label for="name">Name:</label>
            <input type="text" v-model="gameData.name" id="name" required />

            <label for="description">Description:</label>
            <textarea v-model="gameData.description" id="description"></textarea>

            <button type="submit">Create</button>
            <button type="button" @click="$emit('cancel')">Cancel</button>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const gameData = ref({
    name: '',
    description: '',
});

const addGame = () => {
    // Emitir evento para agregar el juego con los datos actuales
    const gameToAdd = { ...gameData.value };
    resetForm();
    return gameToAdd;
};

const resetForm = () => {
    gameData.value.name = '';
    gameData.value.description = '';
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
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
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