<template>
    <div class="select-role-container">
        <h1>Select your role</h1>
        <div class="role-buttons">
            <button @click="selectRole('dev')">I'm a Developer</button>
            <button @click="selectRole('teacher')">I'm a Teacher</button>
            <button @click="selectRole('student')">I'm a Student</button>
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
.select-role-container {
  text-align: center;
  padding: 1rem;
}

.role-buttons button {
  margin: 1rem;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  cursor: pointer;
}
</style>