<template>
    <h1>Student's view</h1>
    <h3 v-if="student">Student details</h3>
    <p v-if="student"> Name: {{ student.name }}</p>
    <p v-if="student"> Email: {{ student.email }}</p>
    <p v-else>Please log in as a student to view student details.</p>
    <router-link to="/charts">View Charts</router-link>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
import { computed } from 'vue';

const authStore = useAuthStore();
const student = computed(() => authStore.userData);
</script>

<style>
</style>