<template>
    <div class="student-view">
        <h1>Student's view</h1>
        <div class="student-details" v-if="student">
            <h3>Student details</h3>
            <p><strong>Name:</strong> {{ student.name }}</p>
            <p><strong>Email:</strong> {{ student.email }}</p>
            <router-link to="/charts">View Charts</router-link>
        </div>
        <p v-else>Please log in as a student to view student details.</p>
    </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
import { computed } from 'vue';

const authStore = useAuthStore();
const student = computed(() => { // Devuelve todos los datos si usr_type = 'student', sino, null
    const studentData = authStore.userData
    return studentData && studentData.usr_type === 'student' ? studentData : null;
});
</script>

<style scoped>
.student-view {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.student-details {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.student-details > * {
    margin: 0; /* Elimina el margin de todos los elementos dentro de student-details */
}

h1 {
    margin-bottom: 0;
}
</style>