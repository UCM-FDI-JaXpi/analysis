<template>
    <h2>Add Game</h2>
    <form @submit.prevent="addGame">
        <label for="name">Name *</label>
        <input type="text" v-model="gameData.name" id="name" required />

        <label for="description">Description</label>
        <textarea v-model="gameData.description" id="description" @input="adjustHeight"></textarea>

        <div class="button-container">
            <button type="submit">Create</button>
            <button type="button" @click="cancelForm">Cancel</button>
        </div>
    </form>
</template>

<script setup>
import { ref } from 'vue';
import { useGamesStore } from '@/stores/gamesStore';

const gamesStore = useGamesStore();

const emit = defineEmits(['submit', 'cancel']); // Definir los eventos que el componente puede emitir

const gameData = ref({
    name: '',
    description: '',
});

const addGame = async () => {
    const gameToAdd = { ...gameData.value };
    try {
        let createdGame;
        createdGame = await gamesStore.addGame(gameToAdd);
        if(createdGame){
            console.log('Game added successfully!');
            console.log('Game added: ', createdGame);
            resetForm();
            emit('submit', createdGame);
        }else{
            //aqui seteariamos para mostrar mensaje de error ya 
            //que queremos mostrar el mensaje, y que el form siga abierto
        }
    } catch (error) {
        console.error('Error no controlado: ', error);
    }
};

const resetForm = () => {
    gameData.value.name = '';
    gameData.value.description = '';
};

const cancelForm = () => {
    resetForm();
    emit('cancel'); // Emitir evento 'cancel' al padre DevView
};

const adjustHeight = (event) => {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
};
</script>

<style scoped>
h2 {
    margin-top: 0px;
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

form input,
form textarea {
    display: block;
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    box-sizing: border-box;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

input:focus, select:focus, textarea:focus {
    border-color: #4a90e2;
    outline: none;
    box-shadow: 0 0 5px rgba(74, 144, 226, 0.3);
}

textarea {
    height: 100%;
    max-width: 100%;
    min-height: 100px;
    max-height: 170px;
}

.button-container {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-top: 7px;
}

form button {
    padding: 10px;
    width: 100%;
    background-color: #1976D2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

form button[type="submit"] {
    margin-right: 10px;
}

form button:hover {
    background-color: #1565C0;
}
</style>