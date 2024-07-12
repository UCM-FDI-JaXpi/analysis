<template>
    <h1>Teacher's view</h1>
    <h3 v-if="teacher">Teacher details</h3>
    <p v-if="teacher"> Name: {{ teacher.name }}</p>
    <p v-if="teacher"> Email: {{ teacher.email }}</p>
    <p v-else>Please log in as a teacher to view teacher details.</p>
    <router-link v-if="teacher" to="/charts">View Charts</router-link>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
import { computed } from 'vue';

const authStore = useAuthStore();
const teacher = computed(() => { // Devuelve todos los datos si usr_type = 'teacher', sino, null
    const teacherData = authStore.userData
    return teacherData && teacherData.usr_type === 'teacher' ? teacherData : null;
});
</script>

<style scoped>
</style>