<template>
    <div class="create-group-view">
        <!-- Formulario para crear clase -->
        <div v-if="!showConfirmationCreatedGroup" class="form-container">
            <CreateGroupForm @submit="handleGroupCreated" @cancel="handleCancel" />
        </div>

        <!-- Mensaje de información de clase creada -->
        <div v-if="showConfirmationCreatedGroup" class="confirmation">
            <h3>Class created</h3>
            <p><strong>Institution:</strong> {{ createdGroup.institution }}</p>
            <p><strong>Class name:</strong> {{ createdGroup.name }}</p>
            <p><strong>Teacher:</strong> {{ createdGroup.teacher }}</p>
            <p><strong>Students:</strong></p>
            <ul>
                <li v-for="student in createdGroup.students" :key="student">
                        {{ student }}</li>
            </ul>
            <button @click="redirectToGroupDetails">OK</button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRouteStore } from '@/stores/routeStore';
import CreateGroupForm from '@/components/teacher/CreateGroupForm.vue';

const router = useRouter();
const routeStore = useRouteStore();

const showConfirmationCreatedGroup = ref(false);
const createdGroup = ref({});

const handleGroupCreated = (groupData) => {
    createdGroup.value = groupData;
    //llamada al back
    // si todo ha ido bien
    showConfirmationCreatedGroup.value = true;
    //si ha ido mal
    //showErrorCreatedGameSession.value = true;
};

const redirectToGroupDetails = () => {
    showConfirmationCreatedGroup.value = false;
    router.push(`/group-details/${createdGroup.value.id}`); // Redirige a la pagina de groupDetails del nuevo group creado
};

const handleCancel = () => {
    router.push(routeStore.getOriginalRoute()); // Redirige a la ruta original si se cancela
};
</script>

<style scoped>
.create-group-view {
    padding: 1rem;
}

.form-container {
    max-width: 50%;
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