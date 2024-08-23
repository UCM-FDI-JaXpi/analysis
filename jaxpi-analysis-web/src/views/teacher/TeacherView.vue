<template>
    <div class="teacher-view">
        <h1 v-if="!teacher">Teacher's view</h1>
        <p v-if="!teacher">Please log in as a teacher to view teacher details.</p>

        <div class="teacher-details" v-if="teacher">
            <h3 class="teacher-name">{{ teacher.name }}</h3>
            <p class="teacher-role">Role: {{ teacher.usr_type }}</p>
            <p><strong>Email:</strong> {{ teacher.email }}</p>
            <p><strong>Institution:</strong> {{ teacher.institution }}</p>  
        </div>
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

.teacher-name {
    font-size: 1.5rem; /* Tamaño más grande para resaltar el nombre */
}

.teacher-role {
    font-size: 0.9rem; /* Tamaño más pequeño para los detalles */
    color: #727171; /* Color gris claro para los detalles */
    font-weight: bold;
}
</style>