<template>
  <div class="container">
    <h1>Register</h1>

    <form @submit.prevent="register">
      <div>
        <label for="name">Name</label>
        <input type="text" id="name" v-model="name" required>
      </div>
      <div>
        <label for="email">Email</label>
        <input type="text" id="email" v-model="email" required>
      </div>
      <div>
        <label for="pwd">Password</label>
        <input type="password" id="pwd" v-model="pwd" required>
      </div>
      <div>
        <label for="rep_pwd">Repeat password</label>
        <input type="password" id="rep_pwd" v-model="rep_pwd" required>
      </div>
      <div>
        <label for="usr_type">I am a </label>
        <select id="usr_type" v-model="userType" required>
          <option value="teacher">Teacher</option>
          <option value="dev">Developer</option>
        </select>
      </div>
      <div v-if="userType === 'teacher'">
        <label for="institution">Institution</label>
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
  color: #333;
}

.link {
  display: block;
  margin-bottom: 10px;
}

.error-message {
  color: red;
  font-weight: bold;
}
</style>