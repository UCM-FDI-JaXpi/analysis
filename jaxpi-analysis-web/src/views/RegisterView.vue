<template>
  <div class="register-container">
    <h1>Register</h1>

    <form @submit.prevent="register">
      <div class="input-container">
        <label for="name">Name *</label>
        <input type="text" id="name" v-model="name" required>
      </div>
      <div class="input-container">
        <label for="email">Email *</label>
        <input type="text" id="email" v-model="email" required>
      </div>
      <div class="input-container">
        <label for="pwd">Password *</label>
        <input type="password" id="pwd" v-model="pwd" required>
      </div>
      <div class="input-container">
        <label for="rep_pwd">Repeat password *</label>
        <input type="password" id="rep_pwd" v-model="rep_pwd" required>
      </div>
      <div class="input-container">
        <label for="usr_type">I am a </label>
        <select id="usr_type" v-model="userType" required>
          <option value="teacher">Teacher</option>
          <option value="dev">Developer</option>
        </select>
      </div>
      <div v-if="userType === 'teacher'" class="input-container">
        <label for="institution">Institution *</label>
        <input type="text" id="institution" v-model="institution" required>
      </div>
      <button type="submit">Register</button>
    </form>

    <router-link to="/login" class="link">Login</router-link>

    <p v-if="authStore.errorMessage" class="error-message">{{ authStore.errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const name = ref('');
const email = ref('');
const pwd = ref('');
const rep_pwd = ref('');
const userType = ref('teacher');
const institution = ref('');

const authStore = useAuthStore();
const router = useRouter();

const register = async () => {
  try {
    const userDetails = {
      name: name.value,
      email: email.value,
      pwd: pwd.value,
      rep_pwd: rep_pwd.value,
      usr_type: userType.value,
      ...(userType.value === 'teacher' && { institution: institution.value }),  // Solo agregar institution si es un teacher
    };

    await authStore.register(userDetails);
    router.push('/login');
  } catch (error) {
    console.error('Registration failed:', error);
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

.link {
  display: block;
  margin-bottom: 10px;
}

.error-message {
  color: #ef0000;
  font-weight: bold;
}

.register-container {
  background: linear-gradient(135deg, #f8d151, #ffb6a1);
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
	margin-bottom: 15px;
	text-align: left;
}

label {
	display: block;
	margin-bottom: 3px;
	font-weight: bold;
	color: #555;
}

input, select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

input:focus, select:focus {
  border-color: #f6d365;
  outline: none;
  box-shadow: 0 0 5px rgba(246, 211, 101, 0.5);
}

button {
  width: 55%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background-color: #fda085;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.1s ease;
}

button:hover {
  background-color: #e38000;
}

.link {
  display: block;
  margin-top: 15px;
  color: #ffdad0;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.1s ease;
}

.link:hover {
  color: #e38000;
}
</style>