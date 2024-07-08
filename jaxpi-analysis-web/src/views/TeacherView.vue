<template>
    <h1>Teacher's view</h1>
    <h3>Teacher details</h3>
    <p> Name: {{ teacher.name }}</p>
    <p> Email: {{ teacher.email }}</p>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
import { computed } from 'vue';

const authStore = useAuthStore();
const teacher = computed(() => authStore.userData);
</script>

<style scoped>
</style>