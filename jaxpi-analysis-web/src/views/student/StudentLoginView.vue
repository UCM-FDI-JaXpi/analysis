<template>
    <div class="student-login-container">
        <h1>Student login</h1>
        <form @submit.prevent="login">
            <div class="input-container">
                <label for="sessionKey">Key </label>
                <input type="text" id="sessionKey" v-model="sessionKey" required>
            </div>
            <button type="submit">Login</button>
        </form>
        <p v-if="authStore.errorMessage" class="error-message">{{ authStore.errorMessage }}</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const sessionKey = ref('');
const router = useRouter();
const authStore = useAuthStore();

const login = async () => {
    try {
        await authStore.login({ sessionKey: sessionKey.value });
        router.push('/student');
    } catch (error) {
        console.error('Student login failed:', error);
    }
};

onMounted(() => {
  if (authStore.errorMessage) {
    authStore.errorMessage = '';
  }
});
</script>

<style scoped>
h1 {
	font-size: 25px;
}

.error-message {
    color: #ef0000;
	font-weight: bold;
}

.student-login-container {
    background: linear-gradient(135deg, #95e8fd, #99a9f1);
	padding: 40px;
	border-radius: 12px;
	box-shadow: 0 4px 17px rgba(0, 0, 0, 0.1);
	text-align: center;
	width: 300px;
	position: relative;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}

.input-container {
	margin-bottom: 18px;
	text-align: left;
}

label {
	display: block;
	margin-bottom: 5px;
	font-weight: bold;
	color: #555;
}

input {
	width: 100%;
	padding: 10px;
	border: 1px solid #ddd;
	border-radius: 8px;
	font-size: 14px;
	box-sizing: border-box;
}

input:focus {
	border-color: #74ebd5;
	outline: none;
	box-shadow: 0 0 5px rgba(116, 235, 213, 0.5);
}

button {
	width: 55%;
	padding: 10px;
	border: none;
	border-radius: 8px;
	background-color: #5CD8E8;
	color: white;
	font-size: 16px;
	cursor: pointer;
	transition: background-color 0.2s ease;
}

button:hover {
	background-color: #1dcce3;
}
</style>