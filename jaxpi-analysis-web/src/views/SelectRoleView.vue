<template>
    <div class="select-role-container">
        <h1>Select your role</h1>
        <div class="role-buttons">
            <button @click="selectRole('teacher')" class="role-button">Login</button>
            <button @click="selectRole('student')" class="role-button student-button">Login as Student</button>
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
    background-color: #f7f9fc;
    padding: 50px 30px;
    border-radius: 12px;
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    margin: 40px auto;
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

    font-weight: bold;
    border: none;
    border-radius: 10px;
    background: linear-gradient(135deg, #74ebd5, #acb6e5);
    color: white;
    transition: background-color 0.3s ease;
}

.role-button:hover {
    background: linear-gradient(135deg, #acb6e5, #74ebd5);
}

.student-button:hover {
    background: linear-gradient(135deg, #79d9fc, #af93ec);
}
</style>