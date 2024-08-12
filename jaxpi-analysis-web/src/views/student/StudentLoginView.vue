<template>
    <div class="student-login-container">
        <h1>Student login</h1>
        <form @submit.prevent="login">
            <div>
                <label for="sessionKey">Session key </label>
                <input type="text" id="sessionKey" v-model="sessionKey" required>
            </div>
            <button type="submit">Login</button>
        </form>
        <p v-if="authStore.errorMessage" class="error-message">{{ authStore.errorMessage }}</p>
    </div>
</template>

<script setup>
import { ref } from 'vue';
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
</script>

<style scoped>
.student-login-container {
  padding: 1rem;
}

.error-message {
    color: red;
	font-weight: bold;
}
</style>