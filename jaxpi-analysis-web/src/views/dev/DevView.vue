<template>
  <div class="dev-view">
    <h1 v-if="!dev">Dev's view</h1>
    <p v-if="!dev">Please log in as a dev to view dev details.</p>
    
    <div class="dev-details" v-if="dev">
      <div class="dev-info">

        <div class="dev-left">
          <h3 class="dev-name">{{ dev.name }}</h3>
          <p class="dev-role">Role: {{ dev.usr_type }}</p>
          <p><strong>Email:</strong> {{ dev.email }}</p>
        </div>

        <div class="games-right">
          <h3 class="games-count">
            <span class="count">{{ gamesCount }}</span>
            <span class="label">games</span>
          </h3>
        </div>
      </div>
    </div>

     <!-- Instructions, only if we don´t have any games -->
     <div class="instructions" v-if="dev && gamesStore.games.length === 0">
        <h2>Getting Started</h2>
        <p>To start viewing your games analytics, follow these steps:</p>
        <ol>
          <li><strong>Create a new game:</strong> Click the "Add Game" button in your sidebar.</li>
          <li><strong>Obtain a token:</strong> When you add your game you will be given a <strong>token</strong>.
            <strong style="color: #FF8800;">IMPORTANT:</strong> you have to go to this <a :href="libUrl" target="_blank">link</a>
              to know everything about how to use this token and be able to see your statistics in our application.
              You will have this token and this link in your game details.</li>
          <li><strong>View game statistics:</strong> Once you have followed the instructions in that link,
            all you have to do is wait to see the analytics of your added games.</li>
        </ol>
        <p style="margin-bottom: 0;">If you need more help, please <router-link to="/about-us">contact us</router-link>.</p>
      </div>

    <div class="game-section" v-if="dev && gamesStore.games.length > 0">
      <h2>Games</h2>
      <GameList />
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
import { computed } from 'vue';
import { useGamesStore } from '@/stores/gamesStore';
import GameList from '@/components/dev/GameList.vue';

const authStore = useAuthStore();
const gamesStore = useGamesStore();

const dev = computed(() => { // devuelve todos los datos si usr_type = 'dev', sino, null
  const devData = authStore.userData;
  return devData && devData.usr_type === 'dev' ? devData : null;
});
const gamesCount = computed(() => gamesStore.games.length);

const libUrl = 'https://github.com/UCM-FDI-JaXpi/lib/blob/main/README.md';
</script>

<style scoped>
.dev-view {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

h1 {
    margin-bottom: 0;
}

.dev-details {
    display: flex;
    flex-direction: column;
    background-color: #f9f9f9;
    padding: 1.5rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #ddd; 
    margin-bottom: 20px;
    width: -webkit-fill-available;
    max-width: 800px;
}

.dev-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-start; /* Alinea el contenido hacia arriba */
}

.dev-left {
    display: flex;
    flex-direction: column;
}

.dev-left > p{
    margin-top: 5px;
}

.dev-name {
    font-size: 1.7rem;
    margin: 0;
}

.dev-role {
    font-size: 0.9rem;
    color: #727171;
    font-weight: bold;
}

.games-right {
    text-align: center;
}

.games-count {
    display: flex;
    flex-direction: column; /* Apila los elementos dentro del h3 verticalmente */
    margin: 0;
}

.count {
    font-size: 3rem;
    color: #7c15dd;
}

.label {
    color: #7c15dd;
    margin-top: -5px;
}

.instructions {
    background-color: #e7fcff;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    max-width: 900px;
}

.instructions h2 {
    margin-top: 0;
}

.instructions ol {
    padding-left: 20px;
}

.instructions p, .instructions li {
    line-height: 1.6;
}
</style>