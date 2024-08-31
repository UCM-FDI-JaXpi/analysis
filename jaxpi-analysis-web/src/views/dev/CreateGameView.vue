<template>
    <div class="create-game-view" v-if="authStore.isAuthenticated">
        <!-- Formulario para añadir juego -->
        <div v-if="!showConfirmationCreatedGame" class="form-container">
            <AddGameForm @submit="handleAddGame" @cancel="handleCancel"/>
        </div>

        <!-- Mensaje de información de juego añadido -->
        <div v-if="showConfirmationCreatedGame" class="confirmation">
            <div class="title-container-image">
                <h3 style="font-size: 1.8rem; margin: 0px;">Game added</h3>
                <img :src=checkImage alt="check image" class="check-image"/>
            </div>
            <p><strong>Game name:</strong> {{ createdGame.name }}</p>
            <p><strong>Game id:</strong> {{ createdGame.id }}</p>
            <p><strong>Token:</strong> {{ createdGame.token }}</p>
            <p><strong>Description:</strong></p>
            <div class="game-description-content">
                <p>{{ createdGame.description }}</p>
            </div>
            <button @click="redirectToGameDetails">OK</button>
        </div>
    </div>
</template>

<script setup>
import checkImage from '@/assets/check.png';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import AddGameForm from '@/components/dev/AddGameForm.vue';

const router = useRouter();
const authStore = useAuthStore();

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
    router.back();
};
</script>

<style scoped>
.create-game-view {
    padding: 2.5rem;
    background-color: #fff;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
	position: absolute;
	top: 53%;
	left: 56.5%;
	transform: translate(-50%, -50%);
    width: 100%;
    max-width: 333px;
    max-height: 500px;
}

.form-container {
    max-width: 600px;
    margin: auto;
}

.confirmation {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 100%;
}

.confirmation > * {
    margin: 0;
}

.confirmation button {
    margin-top: 5px;
    align-self: center;
    padding: 10px 20px; 
    border: none;
    border-radius: 4px;
    background-color: #1976D2;
    color: white;
    cursor: pointer;
}

.confirmation button:hover {
    background-color: #0056b3;
}

.title-container-image {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
}

.check-image {
    max-width: 50px;
    height: auto;
}

.game-description-content {
    max-height: 170px;
    overflow-y: auto;
    border: 0px;
    box-sizing: border-box;
}
</style>