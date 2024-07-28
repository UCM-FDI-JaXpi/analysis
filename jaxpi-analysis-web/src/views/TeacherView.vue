<template>
    <div class="teacher-view">
        <h1>Teacher's view</h1>
        <div class="teacher-details" v-if="teacher">
            <h3>Teacher details</h3>
            <p> Name: {{ teacher.name }}</p>
            <p> Email: {{ teacher.email }}</p>
            <router-link to="/charts">View Charts</router-link>
        </div>
        <div class="buttons" v-if="teacher && !showConfirmationCreatedSession">
            <button v-if="!showCreateGroupForm && !showCreateSessionForm" @click="showCreateGroupForm = true">Create group</button>
            <button v-if="!showCreateGroupForm && !showCreateSessionForm" @click="showCreateSessionForm = true">Create session</button>
        </div>

        <!-- Formulario para crear clase -->
        <div v-if="showCreateGroupForm" class="form-container">
            <CreateGroupForm @cancel="showCreateGroupForm = false" @submit="handleCreateGroup" />
        </div>

        <!-- Formulario para crear sesión -->
        <div v-if="showCreateSessionForm" class="form-container">
            <CreateSessionForm @cancel="showCreateSessionForm = false" @submit="handleCreateSession" />
        </div>

        <!-- Mensaje de información de sesión creada -->
        <div v-if="showConfirmationCreatedSession" class="confirmation">
            <h3>Session Created</h3>
            <p>Session Name: {{ createdSession.sessionName }}</p>
            <p>Game: {{ createdSession.gameName }}</p>
            <p>Group: {{ createdSession.groupName }}</p>
            <p>Students and passwords:</p>
            <ul>
                <li v-for="student in createdSession.studentPasswordPair" :key="student.name">
                        {{ student.name }}: {{ student.password }}</li>
            </ul>
            <button @click="showConfirmationCreatedSession = false">OK</button>
        </div>

        <p v-if="!teacher">Please log in as a teacher to view teacher details.</p>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import CreateGroupForm from '@/components/Teacher/CreateGroupForm.vue';
import CreateSessionForm from '@/components/Teacher/CreateSessionForm.vue';

const authStore = useAuthStore();
const teacher = computed(() => { // Devuelve todos los datos si usr_type = 'teacher', sino, null
    const teacherData = authStore.userData
    return teacherData && teacherData.usr_type === 'teacher' ? teacherData : null;
});

const showCreateGroupForm = ref(false);
const showCreateSessionForm = ref(false);
const showConfirmationCreatedSession = ref(false);
const createdSession = ref({});

const handleCreateGroup = async (groupData) => {
    showCreateGroupForm.value = false;
    console.log(groupData);
    console.log(groupData.students.split('\n'));
};

const handleCreateSession = async (sessionData) => {
    showCreateSessionForm.value = false;
    createdSession.value = sessionData;
    console.log(sessionData);
    console.log(createdSession.value);
    //llamada al back
    // si todo ha ido bien
    showConfirmationCreatedSession.value = true;
    //si ha ido mal
    //showErrorCreatedSession.value = true;
};
</script>

<style scoped>
.teacher-view {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.teacher-details {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.teacher-details > * {
    margin: 0; /* Elimina el margin de todos los elementos dentro de teacher-details */
}

.buttons {
    display: flex;
    gap: 10px;
}

.confirmation {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 20px;
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