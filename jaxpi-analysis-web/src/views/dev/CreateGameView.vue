<template>
    <div class="create-game-view">
        <!-- Formulario para añadir juego -->
        <div v-if="!showConfirmationCreatedGame" class="form-container">
            <AddGameForm @submit="handleAddGame" @cancel="handleCancel"/>
        </div>

        <!-- Mensaje de información de juego añadido -->
        <div v-if="showConfirmationCreatedGame" class="confirmation">
            <h3>Game added</h3>
            <p><strong>Game name:</strong> {{ createdGame.name }}</p>
            <p><strong>Game id:</strong> {{ createdGame.id }}</p>
            <p><strong>Token:</strong> {{ createdGame.token }}</p>
            <p><strong>Description:</strong> {{ createdGame.description }}</p>
            <button @click="redirectToGameDetails">OK</button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRouteStore } from '@/stores/routeStore';
import AddGameForm from '@/components/dev/AddGameForm.vue';

const router = useRouter();
const routeStore = useRouteStore();

const showConfirmationCreatedGame = ref(false);
const createdGame = ref({});

const handleAddGame = (gameData) => {
    createdGame.value = gameData;
    //llamada al back
    // si todo ha ido bien
    showConfirmationCreatedGame.value = true;
    //si ha ido mal
    //showErrorCreatedGameSession.value = true;
};

const redirectToGameDetails = () => {
    showConfirmationCreatedGame.value = false;
    router.push(`/game-details/${createdGame.value.id}`); // Redirige a la pagina de gameDetails del nuevo juego añadido
};

const handleCancel = () => {
    router.push(routeStore.getOriginalRoute()); // Redirige a la ruta original si se cancela
};
</script>

<style scoped>
.create-game-view {
    padding: 1rem;
}

.confirmation {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #f9f9f9;
}

.confirmation > * {
    margin: 0;
}

.confirmation button {
    align-self: flex-start;
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    background-color: #1976D2;
    color: white;
    cursor: pointer;
}

.confirmation button:hover {
    background-color: #0056b3;
}
</style>