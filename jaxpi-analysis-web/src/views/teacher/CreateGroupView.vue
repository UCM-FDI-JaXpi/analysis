<template>
    <div class="create-group-view" v-if="authStore.isAuthenticated">
        <!-- Formulario para crear clase -->
        <div v-if="!showConfirmationCreatedGroup" class="form-container">
            <CreateGroupForm @submit="handleGroupCreated" @cancel="handleCancel" />
        </div>

        <!-- Mensaje de información de clase creada -->
        <div v-if="showConfirmationCreatedGroup" class="confirmation">
            <h3>Class created</h3>
            <img :src=checkImage alt="check image" class="check-image"/>
            <p><strong>Institution:</strong> {{ createdGroup.institution }}</p>
            <p><strong>Class name:</strong> {{ createdGroup.name }}</p>
            <p><strong>Teacher:</strong> {{ createdGroup.teacher }}</p>
            <p><strong>Students:</strong></p>
            <div class="students-list">
                <ul>
                    <li v-for="student in createdGroup.students" :key="student">
                            {{ student }}</li>
                </ul>
            </div>
            <button @click="redirectToGroupDetails">OK</button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import CreateGroupForm from '@/components/teacher/CreateGroupForm.vue';
import checkImage from '@/assets/check.png';

const router = useRouter();
const authStore = useAuthStore();

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
    router.back(); // Redirige a la ruta original si se cancela
};
</script>

<style scoped>
.create-group-view {
    padding: 2.5rem;
    background-color: #fff;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
	position: absolute;
	top: 54%;
	left: 58%;
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
    align-self: flex-start;
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

.check-image {
    max-width: 50px;
    height: auto;
}

.students-list {
    max-height: 200px;
    overflow-y: auto;
    padding-right: 5px;
    border: outset;
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