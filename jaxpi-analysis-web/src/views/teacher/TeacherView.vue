<template>
    <div class="teacher-view">
        <h1>Teacher's view</h1>
        <div class="teacher-details" v-if="teacher">
            <h3>Teacher details</h3>
            <p><strong>Name:</strong> {{ teacher.name }}</p>
            <p><strong>Email:</strong> {{ teacher.email }}</p>
            <p><strong>Institution:</strong> {{ teacher.institution }}</p>  
            <router-link to="/charts">View Charts</router-link>
        </div>
        <p v-if="!teacher">Please log in as a teacher to view teacher details.</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

const teacher = computed(() => { // Devuelve todos los datos si usr_type = 'teacher', sino, null
    const teacherData = authStore.userData
    return teacherData && teacherData.usr_type === 'teacher' ? teacherData : null;
});
</script>

<style scoped>
h1 {
    margin-bottom: 0;
}

.teacher-view {
    padding: 1rem;
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
</style>