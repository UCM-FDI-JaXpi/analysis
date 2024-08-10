<template>
    <div class="game-session-list">
        <div class="card-container">
            <div v-for="gameSession in gameSessions" :key="gameSession.sessionId" class="card">
                <div class="game-session-info">
                    <h2>{{ gameSession.sessionName }}</h2>
                    <p><strong>Game: </strong>{{ gameSession.gameName }}</p>
                    <p><strong>Created on: </strong>{{ new Date(gameSession.createdAt).toLocaleDateString() }}</p>
                </div>
                <div class="card-actions">
                    <router-link :to="{ name: 'StudentGameSessionKeyView', params: { gameSessionId: gameSession.sessionId } }" class="details-button">
                        View Students
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { useGameSessionsStore } from '@/stores/gameSessionsStore';

const props = defineProps({
    groupId: {
        type: String,
        required: true
    }
});

const gameSessionsStore = useGameSessionsStore();
const gameSessions = computed(() => gameSessionsStore.gameSessions);

const fetchGameSessions = async (groupId) => {
    await gameSessionsStore.fetchGameSessions(groupId);
};

onMounted(() => fetchGameSessions(props.groupId));

// Observamos los cambios en groupId y llamamos a fetchGameSessions cuando cambie
watch(() => props.groupId, (newGroupId, oldGroupId) => {
    if (newGroupId !== oldGroupId) {
        fetchGameSessions(newGroupId);
    }
});
</script>

<style scoped>
.card-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    max-width: 600px;
    min-width: min-content;
    overflow: hidden;
    box-sizing: border-box;
}

.game-session-info {
    flex-grow: 1;
    margin-right: 10px;
}

.game-session-info h2 {
    margin: 0;
    font-size: 1.25rem;
}

.game-session-info p {
    margin: 4px 0 0;
    color: #666;
}

.card-actions {
    flex-shrink: 0;
}

.details-button {
    display: inline-block;
    padding: 8px 12px;
    background-color: #1976D2;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.24s ease;
    white-space: nowrap;
}

.details-button:hover {
    background-color: #0479ffaf;
}
</style>