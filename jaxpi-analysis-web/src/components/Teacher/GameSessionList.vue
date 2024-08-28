<template>
    <div v-if="isTeacher" class="game-session-list">
        <div v-if="gameSessions.length === 0" class="no-data-charts">
            <p>No game sessions available for this group.</p>
        </div>
        <div v-else class="card-container">
            <div v-for="gameSession in gameSessions" :key="gameSession.sessionId" class="card">
                <div class="game-session-info">
                    <h2>{{ gameSession.sessionName }}</h2>
                    <p><strong>Game: </strong>{{ gameSession.gameName }}</p>
                    <p><strong>Created on: </strong>{{ new Date(gameSession.createdAt).toLocaleDateString() }}</p>
                </div>
                <div class="card-actions">
                    <router-link :to="{ name: 'StudentGameSessionKeyView', params: { groupId: gameSession.groupId, gameSessionId: gameSession.sessionId } }" 
                                 class="details-button"
                                 @click="selectSession(gameSession.sessionId)">
                        View students
                    </router-link>
                </div>
            </div>
        </div>
    </div>

    <div v-if="isStudent" class="game-session-list">
        <div v-if="gameSessions.length === 0" class="no-data">
            <p>No game sessions available.</p>
        </div>
        <div v-else class="card-container">
            <div v-for="gameSession in gameSessions" :key="gameSession.sessionId" class="card">
                <div class="game-session-info">
                    <h2>{{ gameSession.sessionName }}</h2>
                    <p><strong>Game: </strong>{{ gameSession.gameName }}</p>
                    <p><strong>Created on: </strong>{{ new Date(gameSession.createdAt).toLocaleDateString() }}</p> <br>
                    <p><strong>Your key: </strong>{{ gameSession.key }}</p>
                </div>
                <div class="card-actions">
                    <router-link :to="{ name: 'GameSessionDetailsByStudentView', params: { gameSessionId: gameSession.sessionId } }" 
                                 class="details-button"
                                 @click="selectSession(gameSession.sessionId)">
                        View details
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useGameSessionsStore } from '@/stores/gameSessionsStore';

const authStore = useAuthStore();
const gameSessionsStore = useGameSessionsStore();

const isTeacher = computed(() => authStore.userType === 'teacher');
const isStudent = computed(() => authStore.userType === 'student');
const gameSessions = computed(() => gameSessionsStore.gameSessions);

const selectSession = (sessionId) => {
  gameSessionsStore.setSelectedGameSessionId(sessionId);
};
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