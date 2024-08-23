<template>
    <nav class="navbar">
        <router-link class="nav-item" to="/">Home</router-link>
        <router-link v-if="isDev || isTeacher" class="nav-item" to="/charts">Charts</router-link>
        <router-link v-if="isTeacher" class="nav-item" to="/groups">Classes</router-link>
        <router-link v-if="isTeacher" class="nav-item" to="/teacher">Teacher View</router-link>
        <router-link v-if="isStudent" class="nav-item" to="/student">Student View</router-link>
        <router-link v-if="isDev" class="nav-item" to="/games">Games</router-link>
        <router-link v-if="isDev" class="nav-item" to="/dev">Dev View</router-link>
        <router-link v-if="!isLoggedIn" class="nav-item" to="/select-role">Login</router-link>
        <router-link v-if="!isLoggedIn" class="nav-item" to="/register">Register</router-link>
        <a v-if="isLoggedIn" class="nav-item" @click="showLogoutModal = true">Logout</a> <!-- a en vez de routerlink ya que no admite eventos personalizados como @click-->
        <router-link class="nav-item" to="/about-us">About us</router-link>

        <ConfirmModal
          :visible="showLogoutModal"
          title="Confirm logout"
          message="Are you sure you want to logout?"
          @confirm="logout" 
          @cancel="showLogoutModal = false"
        />
    </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';

const authStore = useAuthStore();
const router = useRouter();

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
</script>

<style scoped>
.navbar {
  display: flex; /* Flexbox para alinear los elementos */
  justify-content: center; /* Centrar los elementos horizontalmente */
  background-color: #1976d2;
  padding: 0.5em;
}

.nav-item {
  padding: 0.5rem 2rem; /* Espaciado interno de los enlaces */
  cursor: pointer; /* Cambiar el cursor al pasar por encima */
  color: rgba(255, 255, 255, 0.876); /* Color de texto */
  text-decoration: none; /* Quitar la decoración de texto (no underline) */
  transition: background-color 0.2s ease, color 0.2s ease;
}

.nav-item:hover,
.nav-item.router-link-exact-active:hover {
  background-color: #7bb3e0; /* Color de fondo al pasar el mouse */
  color: rgba(255, 255, 255, 0.87); /* Color de texto al pasar el mouse */
}

.nav-item.router-link-exact-active { /* Cuando un link esta seleccionado */
  background-color: transparent;
  color: #ffffff; 
  font-weight: bold;
}
</style>