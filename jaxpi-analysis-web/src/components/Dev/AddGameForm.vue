<template>
    <div>
        <h2>Add Game</h2>
        <form @submit.prevent="addGame">
            <label for="name">Name *</label>
            <input type="text" v-model="gameData.name" id="name" required />

            <label for="description">Description</label>
            <textarea v-model="gameData.description" id="description"></textarea>

            <button type="submit">Create</button>
            <button type="button" @click="cancelForm">Cancel</button>
        </form>
    </div>
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
</script>

<style scoped>
form label {
    display: block;
    margin-bottom: 8px;
}

form input,
form textarea {
    width: 50%;
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