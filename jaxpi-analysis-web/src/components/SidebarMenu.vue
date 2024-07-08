<template>
    <div class="sidebar">
        <template v-if="userType === 'teacher'">
            <router-link to="/teacher/classes">Classes</router-link>
            <router-link to="/teacher/students">Students</router-link>
            <router-link to="/teacher/games">Games</router-link>
        </template>
        <template v-else-if="userType === 'student'">
            <router-link to="/student/games">Games stats</router-link>
            <router-link to="/student/classes">Classes stats</router-link>
            <router-link to="/student/profile">Profile</router-link>
        </template>
        <template v-else-if="userType === 'dev'">
            <router-link to="/dev/stats">Players stats</router-link>
        </template>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const userType = computed(() => authStore.userType);
</script>

<style scoped>
.sidebar {
    width: 200px;
    background-color: #ffcc31;
    padding: 10px;
    display: flex;
    flex-direction: column;
}

.sidebar a {
    /* router-link */
    margin: 10px 0;
    text-decoration: none;
    color: #333;
}
</style>