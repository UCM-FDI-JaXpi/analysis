<template>
	<div class="login-container">
		<h1>Login</h1>

		<form @submit.prevent="login">
			<div class="input-container">
				<label for="email">Email</label>
				<input type="text" id="email" v-model="email" required>
			</div>
			<div class="input-container">
				<label for="password">Password</label>
				<input type="password" id="password" v-model="password" required>
			</div>
			<button type="submit">Login</button>
		</form>

		<router-link to="/register" class="link">Register</router-link>

		<p v-if="authStore.errorMessage" class="error-message">{{ authStore.errorMessage }}</p>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useGroupsStore } from '@/stores/groupsStore';
import { useGamesStore } from '@/stores/gamesStore';

const email = ref('');
const password = ref('');
const router = useRouter();
const authStore = useAuthStore();
const groupsStore = useGroupsStore();
const gamesStore = useGamesStore();

const login = async () => {
	try {
		const userData = await authStore.login({ email: email.value, password: password.value });
		switch (userData.usr_type) {
			case 'teacher':
				groupsStore.fetchGroups();
				gamesStore.fetchAllGames();
				router.push('/teacher');
				break;
			case 'dev':
				gamesStore.fetchGames();
				router.push('/dev');
				break;
			default:
				console.error('Invalid user type or not authenticated');
				break;
		}
	} catch (error) {
		console.error('Login failed:', error); // El error esta seteado en el store, este catch es por seguridad
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
	margin-bottom: 27px;
}

.error-message {
    color: #ef0000;
	font-weight: bold;
}

.login-container {
    background: linear-gradient(135deg, #95e8fd, #93a5f8);
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
	border-color: #74ddeb;
	outline: none;
	box-shadow: 0 0 5px rgba(116, 235, 213, 0.5);
}

button {
	width: 55%;
	padding: 10px;
	border: none;
	border-radius: 8px;
	background-color: #5cd8e8;
	color: white;
	font-size: 16px;
	cursor: pointer;
	transition: background-color 0.2s ease;
}

button:hover {
	background-color: #1dcce3;
}

.link {
	display: block;
	margin-top: 15px;
	color: #5ce8cf;
	text-decoration: none;
	font-weight: bold;
	transition: color 0.2s ease;
}

.link:hover {
	color: #21afc1;
}
</style>
