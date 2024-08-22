<template>
    <div class="create-game-session-view">
        <!-- Formulario para crear sesión -->
        <div v-if="!showConfirmationCreatedGameSession" class="form-container">
            <CreateGameSessionForm @submit="handleGameSessionCreated" @cancel="handleCancel" />
        </div>

         <!-- Mensaje de información de game sesion creada -->
         <div v-if="showConfirmationCreatedGameSession" class="confirmation">
            <h3>Game session created</h3>
            <p><strong>Game session name:</strong> {{ createdGameSession.sessionName }}</p>
            <p><strong>Game:</strong> {{ gameName }}</p>
            <p><strong>Class:</strong> {{ groupName }}</p>
            <p><strong>Students and keys:</strong></p>
            <ul>
                <li v-for="student in createdGameSession.students" :key="student.key">
                        {{ student.name }} - {{ student.key }}</li>
            </ul>
            <div class="buttons">
               <button @click="redirectToGameSessionDetails">OK</button>
               <button @click="exportDataToCSV">Export CSV</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useRouteStore } from '@/stores/routeStore';
import { useGamesStore } from '@/stores/gamesStore';
import { useGroupsStore } from '@/stores/groupsStore';
import CreateGameSessionForm from '@/components/teacher/CreateGameSessionForm.vue';

const router = useRouter();
const routeStore = useRouteStore();
const gamesStore = useGamesStore();
const groupsStore = useGroupsStore();

const showConfirmationCreatedGameSession = ref(false);
const createdGameSession = ref({});

const gameName = computed(() => {
    return createdGameSession.value.gameId ? gamesStore.getGameNameById(createdGameSession.value.gameId) : 'No game selected';
});
const groupName = computed(() => {
    return createdGameSession.value.gameId ? groupsStore.getGroupNameById(createdGameSession.value.groupId) : 'No group selected';
});

const handleGameSessionCreated = (gameSessionData) => {
    createdGameSession.value = gameSessionData;
    //llamada al back
    // si todo ha ido bien
    showConfirmationCreatedGameSession.value = true;
    //si ha ido mal
    //showErrorCreatedGameSession.value = true;
};

const redirectToGameSessionDetails = () => {
    showConfirmationCreatedGameSession.value = false;
    router.push(routeStore.getOriginalRoute()); // Redirige a la ruta original
};

const handleCancel = () => {
    router.push(routeStore.getOriginalRoute()); // Redirige a la ruta original si se cancela
};

const exportDataToCSV = () => {
    const students = createdGameSession.value.students;
    let csvContent = "Name,Key\n";
    students.forEach(student => {
        csvContent += `${student.name},${student.key}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); // Tipo MIME y codificacion de caracteres utf-8
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob); // Crea una URL temporal que apunta al Blob
    link.setAttribute("href", url);
    link.setAttribute("download", "students_keys.csv"); // Nombre del archivo a descargar
    document.body.appendChild(link); // Añadimos temporalmente link al documento

    link.click(); // Simulamos un click para desencadenar la descarga
    document.body.removeChild(link); // Eliminamos link del documento
};
</script>

<style scoped>
.create-game-session-view {
    padding: 1rem;
}

.buttons {
    display: flex;
    gap: 10px;
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
    margin: 0; /* Elimina el margin de todos los elementos dentro de teacher-details */
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