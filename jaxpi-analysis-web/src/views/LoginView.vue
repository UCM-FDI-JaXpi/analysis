<template>
	<div class="container">
		<h1>Login</h1>

		<form @submit.prevent="login">
			<div>
				<label for="email">Email</label>
				<input type="text" id="email" v-model="email" required>
			</div>
			<div>
				<label for="password">Password</label>
				<input type="password" id="password" v-model="password" required>
			</div>
			<button type="submit">Login</button>
		</form>

		<router-link to="/register" class="link">Register</router-link>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';

const email = ref('');
const password = ref('');
const router = useRouter();
const authStore = useAuthStore();

const login = async () => {
	try {
		const response = await axios.post('http://localhost:3000/login', {
			email: email.value,
			password: password.value
		}, { withCredentials: true });

		if (response.status === 200) {
			console.log(response.data.message); // Imprimir  mensaje del servidor (exito)
			const userDataResponse = await axios.get('http://localhost:3000/api/session', { // podria dar error??
				withCredentials: true
			});
			const userData = userDataResponse.data.user;
			console.log("Login successful, userData: ", userData);

			switch (userData.usr_type) {
				case 'teacher':
					router.push('/teacher');
					break;
				case 'student':
					router.push('/student');
					break;
				case 'dev':
					router.push('/dev');
					break;
				default:
					router.push('/');
			}
			authStore.login(userData);
		} else {
			console.error('Login failed');
		}
	} catch (error) {
		console.error('Error:', error);
	}
};
</script>

<style>
h1 {
	font-size: 25px;
	color: #333;
}

.link {
	display: block;
	margin-bottom: 10px;
	/* Space between links */
}
</style>
