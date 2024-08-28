<template>
    <nav class="navbar">
        <router-link class="nav-item" to="/" @click="navigateToHomeView">Home</router-link>
        <!-- <router-link v-if="isTeacher" class="nav-item" to="/groups"  @click="navigateToGroupsView">Classes</router-link> -->
        <router-link v-if="isTeacher" class="nav-item" to="/teacher" @click="navigateToTeacherView">Teacher View</router-link>
        <router-link v-if="isStudent" class="nav-item" to="/student" @click="navigateToStudentView">Student View</router-link>
        <router-link v-if="isDev" class="nav-item" to="/games" @click="navigateToGamesView">Games</router-link>
        <router-link v-if="isDev" class="nav-item" to="/dev" @click="navigateToDevView">Dev View</router-link>
        <router-link v-if="!isLoggedIn" class="nav-item" to="/select-role">Login</router-link>
        <router-link v-if="!isLoggedIn" class="nav-item" to="/register">Register</router-link>
        <a v-if="isLoggedIn" class="nav-item" @click="showLogoutModal = true">Logout</a> <!-- a en vez de routerlink ya que no admite eventos personalizados como @click-->
        <router-link class="nav-item" to="/about-us"  @click="navigateToAboutUsView">About us</router-link>

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
import { useRouteStore } from '@/stores/routeStore';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const routeStore = useRouteStore();

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

const navigateToHomeView = () => {
  if (isLoggedIn.value) 
    routeStore.setOriginalRoute(route.fullPath);
};

// const navigateToGroupsView = () => {
//   if (isLoggedIn.value) 
//     routeStore.setOriginalRoute(route.fullPath);
// };

const navigateToTeacherView = () => {
  if (isLoggedIn.value) 
    routeStore.setOriginalRoute(route.fullPath);
};

const navigateToStudentView = () => {
  if (isLoggedIn.value) 
    routeStore.setOriginalRoute(route.fullPath);
};

const navigateToGamesView = () => {
  if (isLoggedIn.value) 
    routeStore.setOriginalRoute(route.fullPath);
};

const navigateToDevView = () => {
  if (isLoggedIn.value)
    routeStore.setOriginalRoute(route.fullPath);
};

const navigateToAboutUsView = () => {
  if (isLoggedIn.value)
    routeStore.setOriginalRoute(route.fullPath);
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