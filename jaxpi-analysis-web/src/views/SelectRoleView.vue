<template>
    <div class="select-role-container">
        <h1>Select your role</h1>
        <div class="role-buttons">
            <button @click="selectRole('teacher')">Login </button>
            <button @click="selectRole('student')">Login as a student</button>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const selectRole = (role) => {
    if (role === 'student')
        router.push('/student-login');
    else
        router.push('/login'); // Redirige al login común para 'dev' y 'teacher'
};
</script>

<style scoped>
h1 {
  font-size: 25px;
}

.select-role-container {
    text-align: center;
    padding: 1rem;
}

.role-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.role-buttons button {
    margin: 1rem;
    padding: 1rem 2rem;
    font-size: 1.2rem;
    cursor: pointer;
    width: 100%;
    max-width: 250px;
}
</style>