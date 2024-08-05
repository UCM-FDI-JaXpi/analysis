<template>
    <div class="student-game-session-key" v-if="session">
        <h1>{{ session.sessionName }}</h1>
        <p><strong>Game: </strong>{{ session.gameId }}</p>
        <p><strong>Created on: </strong>{{ new Date(session.createdAt).toLocaleDateString() }}</p>
        <div class="student-list">
            <h2>Students:</h2>
            <BaseTable 
                :headers="['Name', 'Key']"
                :rows="session.students"
                :rowKeys="['name', 'key']"
            />
        </div>
    </div>
</template>
<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useGameSessionsStore } from '@/stores/gameSessionsStore';
import BaseTable from '@/components/BaseTable.vue';

const route = useRoute();
const gameSessionsStore = useGameSessionsStore();

const session = computed(() => {
    const sessionId = route.params.gameSessionId;
    return gameSessionsStore.getSessionById(sessionId);
});

onMounted(async () => {
    if (gameSessionsStore.gameSessions.length === 0) { // Si los datos de gameSessions no están cargados, los cargo
        await gameSessionsStore.fetchGameSessions();
    }
});
</script>

<style scoped>
.student-game-session-key {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.student-game-session-key > * {
    margin: 0;
}
</style>