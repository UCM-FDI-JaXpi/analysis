<template>
    <div class="create-game-view" v-if="authStore.isAuthenticated">
        <!-- Add game form -->
        <div v-if="!showConfirmationCreatedGame" class="form-container">
            <AddGameForm @submit="handleAddGame" @cancel="handleCancel"/>
        </div>

        <!-- Information message: game added -->
        <div v-if="showConfirmationCreatedGame" class="confirmation">
            <div class="title-container-image">
                <h3 style="font-size: 1.8rem; margin: 0px;">Game added</h3>
                <img :src=checkImage alt="check image" class="check-image"/>
            </div>
            <p><strong>Game name:</strong> {{ createdGame.name }}</p>

            <div class="token-container">
              <p style="margin:0px"><strong>Token:</strong><span class="token-text" style="background-color: #c6e8ff;">{{ createdGame.token }}</span></p>
              <button @click="copyToken(createdGame.token)" class="copy-button" title="Copy the token to the clipboard">
                <img :src=copiarImage alt="Copy icon" class="copy-icon"/>
              </button>
            </div>
            <p><a href="https://github.com/UCM-FDI-JaXpi/lib/blob/main/README.md#4-integration-with-jaxpi-server" target="_blank">How to use the token</a></p> <!-- Instrucciones para el token -->
              
            <p v-if="createdGame.description.length > 0"><strong>Description:</strong></p>
            <div class="game-description-content" v-if="createdGame.description.length > 0">
                <p style="margin: 0px;">{{ createdGame.description }}</p>
            </div>
            <button class="button-ok" @click="redirectToGameDetails">OK</button>
        </div>
        <!-- Notification for copying token -->
        <div v-if="showNotification" class="notification" style="text-align: center; color: green; margin-top:10px;">
            Token copied!
        </div>
    </div>
</template>

<script setup>
import checkImage from '@/assets/check.png';
import copiarImage from '@/assets/copiar.png';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import AddGameForm from '@/components/dev/AddGameForm.vue';

const router = useRouter();
const authStore = useAuthStore();

const showConfirmationCreatedGame = ref(false);
const createdGame = ref({});
const showNotification = ref(false);

const handleAddGame = (gameData) => {
    createdGame.value = gameData;
    showConfirmationCreatedGame.value = true;
};

const redirectToGameDetails = () => {
    showConfirmationCreatedGame.value = false;
    router.push(`/game-details/${createdGame.value.id}`);
};

const handleCancel = () => {
    router.back();
};

const copyToken = (token) => {
    navigator.clipboard.writeText(token)
        .then(() => {
            console.log('Token copied to clipboard');
            showNotification.value = true;
            setTimeout(() => {
                showNotification.value = false;
            }, 1000);
        })
        .catch(err => {
            console.error('Failed to copy token:', err);
        });
};
</script>

<style scoped>
.create-game-view {
    padding: 2.5rem;
    background-color: #fff;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
	position: relative;
	top: 50%;
	left: 50%;
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
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 100%;
}

.confirmation > * {
    margin: 0;
}

.button-ok {
    margin-top: 7px;
    align-self: center;
    padding: 10px 20px; 
    border: none;
    border-radius: 4px;
    background-color: #1976D2;
    color: white;
    cursor: pointer;
}

.button-ok:hover {
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