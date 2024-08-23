<template>
  <div class="dev-view">
    <h1 v-if="!dev">Dev's view</h1>
    <p v-if="!dev">Please log in as a dev to view dev details.</p>

    <div class="dev-details" v-if="dev">
      <h3 class="dev-name">{{ dev.name }}</h3>
      <p class="dev-role">Role: {{ dev.usr_type }}</p>
      <p><strong>Email:</strong> {{ dev.email }}</p>
    </div>

    <div class="game-section" v-if="dev">
      <h2>Game List</h2>
      <GameList />
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
import { computed } from 'vue';
import GameList from '@/components/dev/GameList.vue';

const authStore = useAuthStore();
const dev = computed(() => { // devuelve todos los datos si usr_type = 'dev', sino, null
  const devData = authStore.userData;
  return devData && devData.usr_type === 'dev' ? devData : null;
});
</script>

<style scoped>
.dev-view {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.dev-details {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.dev-details > * {
    margin: 0; /* Elimina el margin de todos los elementos dentro de dev-details */
}

.game-section > * {
    margin-bottom: 0;
}

h1 {
    margin-bottom: 0;
}
.dev-name {
    font-size: 1.5rem; /* Tamaño más grande para resaltar el nombre */
}

.dev-role {
    font-size: 0.9rem; /* Tamaño más pequeño para los detalles */
    color: #727171; /* Color gris claro para los detalles */
    font-weight: bold;
}
</style>