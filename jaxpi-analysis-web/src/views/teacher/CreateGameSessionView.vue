<template>
    <div class="create-game-session-view">
        <!-- Formulario para crear sesión -->
        <div v-if="!showConfirmationCreatedGameSession" class="form-container">
            <CreateGameSessionForm @submit="handleGameSessionCreated" @cancel="handleCancel" />
        </div>

         <!-- Mensaje de información de game sesion creada -->
         <div v-if="showConfirmationCreatedGameSession" class="confirmation">
            <div class="title-container-image">
                <h3 style="font-size: 1.8rem; margin: 0px; margin-top: 7px; margin-bottom: 10px;">Game session created</h3>
                <img :src=checkImage alt="check image" class="check-image"/>
            </div>
            <p><strong>Game session name:</strong> {{ createdGameSession.sessionName }}</p>
            <p><strong>Game:</strong> {{ gameName }}</p>
            <p><strong>Class:</strong> {{ groupName }}</p>
            <p><strong>Students and keys:</strong></p>
            <div class="students-list">
                <ul>
                <li v-for="student in createdGameSession.students" :key="student.key">
                        {{ student.name }} - {{ student.key }}</li>
                </ul>
            </div>
            <div class="buttons">
               <button @click="redirectToGameSessionDetails">OK</button>
               <button @click="exportDataToCSV">Export CSV</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import checkImage from '@/assets/check.png';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGamesStore } from '@/stores/gamesStore';
import { useGroupsStore } from '@/stores/groupsStore';
import CreateGameSessionForm from '@/components/teacher/CreateGameSessionForm.vue';

const router = useRouter();
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
    router.back();
};

const handleCancel = () => {
    router.back();
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

.buttons {
    display: flex;
    margin-top: 5px;
    gap: 10px;
    justify-content: center;
    width: 100%;
}

.confirmation {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 100%;
}

.confirmation > * {
    margin: 0; /* Elimina el margin de todos los elementos dentro de teacher-details */
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
    align-self: flex-start;
}

.students-list {
    max-height: 170px;
    overflow-y: auto;
    padding-right: 5px;
    border: 1px solid #c1c1c1;
}

.students-list ul {
    padding: 0;
    margin: 0;
    list-style-type: none;
}

.students-list li {
    padding: 5px 0;
}
</style>