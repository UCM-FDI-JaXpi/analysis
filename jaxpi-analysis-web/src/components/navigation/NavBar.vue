<template>
    <nav class="navbar">
        <router-link class="nav-item" to="/">Home</router-link>
        <router-link v-if="isTeacher" class="nav-item" to="/groups">Classes</router-link>
        <router-link v-if="isTeacher" class="nav-item" to="/teacher">Teacher View</router-link>
        <router-link v-if="isStudent" class="nav-item" to="/student">Student View</router-link>
        <router-link v-if="isDev" class="nav-item" to="/games">Games</router-link>
        <router-link v-if="isDev" class="nav-item" to="/dev">Dev View</router-link>
        <router-link v-if="!isLoggedIn" class="nav-item" to="/select-role">Login</router-link>
        <router-link v-if="!isLoggedIn" class="nav-item" to="/register">Register</router-link>
        <a v-if="isLoggedIn" class="nav-item" @click="showLogoutModal = true">Logout</a> <!-- a en vez de routerlink ya que no admite eventos personalizados como @click-->
        <router-link class="nav-item" to="/about-us">About us</router-link>

        <ConfirmModal v-if="showLogoutModal"
          :visible="showLogoutModal"
          title="Confirm logout"
          message="Are you sure you want to logout?"
          @confirm="logout" 
          @cancel="hideLogoutModal"
        />
    </nav>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isLoggedIn = computed(() => authStore.isAuthenticated);
const isTeacher = computed(() => authStore.userType === 'teacher');
const isStudent = computed(() => authStore.userType === 'student');
const isDev = computed(() => authStore.userType === 'dev');
const showLogoutModal = ref(false);

const logout = () => {
  authStore.logout();
  router.push('/select-role'); // Redirigir a la pagina de selección de rol después de cerrar sesión
  showLogoutModal.value = false;
};

const hideLogoutModal = () => {
  showLogoutModal.value = false;
};

// Observa los cambios en la ruta para cerrar el modal
watch(route, () => {
  hideLogoutModal();
});
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: center;
  background-color: #1976d2;
  padding: 0.5em;
}

.nav-item {
  padding: 0.5rem 2rem;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.876);
  text-decoration: none;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.nav-item:hover,
.nav-item.router-link-exact-active:hover {
  background-color: #7bb3e0;
  color: rgba(255, 255, 255, 0.87);
}

.nav-item.router-link-exact-active {
  background-color: transparent;
  color: #ffffff; 
  font-weight: bold;
}
</style>