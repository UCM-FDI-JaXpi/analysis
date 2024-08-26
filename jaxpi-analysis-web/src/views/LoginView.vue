<template>
	<div class="login-container">
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

		<p v-if="authStore.errorMessage" class="error-message">{{ authStore.errorMessage }}</p>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useGroupsStore } from '@/stores/groupsStore';
import { useGamesStore } from '@/stores/gamesStore';
import { useRouteStore } from '@/stores/routeStore';

const email = ref('');
const password = ref('');
const router = useRouter();
const routeStore = useRouteStore();
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
				routeStore.setOriginalRoute('/teacher');
				router.push('/teacher');
				break;
			case 'dev':
				gamesStore.fetchGames();
				routeStore.setOriginalRoute('/dev');
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
}
.error-message {
    color: red;
	font-weight: bold;
}
</style>
