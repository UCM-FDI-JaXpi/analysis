<template>
    <div v-if="isTeacher" class="game-session-list">
        <!-- Instructions, only if we don´t have any game sessions -->
        <div class="instructions" v-if="isTeacher && gameSessions.length === 0 && !gameSessionsStore.loading">
            <p><strong style="color: #FF8800;">Remember:</strong> If you want to see your students' analytics you have to create a game session.</p>
            <ol>
                <li><strong>Create Game Sessions:</strong> Click on the "Create Game Session" button and create
                 session keys for your students.</li>
                <li><strong>Give session keys to your students:</strong> Provide the generated session keys to you students
                    so they can play the game and access the app.</li>
            </ol>
            <p>As soon as your students start playing, you'll be able to see their analytics!</p>
        </div>

        <div v-if="isTeacher && gameSessionsStore.loading" class="no-data-charts loading-nodata-container">
            Loading...
        </div>

        <div v-else class="card-container">
            <div v-for="gameSession in gameSessions" :key="gameSession.sessionId" class="card">
                <div class="game-session-info">
                    <h2>Session: {{ gameSession.sessionName }}</h2>
                    <p><strong>Game: </strong>{{ gameSession.gameName }}</p>
                    <p><strong>Created On: </strong>{{ new Date(gameSession.createdAt).toLocaleDateString() }}</p>
                </div>
                <div class="card-actions">
                    <router-link :to="{ name: 'StudentGameSessionKeyView', params: { gameSessionId: gameSession.sessionId } }" 
                                 class="details-button"
                                 @click="selectSession(gameSession.sessionId)">
                        View Analytics
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
                    <h2>Session: {{ gameSession.sessionName }}</h2>
                    <p><strong>Game: </strong>{{ gameSession.gameName }}</p>
                    <p><strong>Created On: </strong>{{ new Date(gameSession.createdAt).toLocaleDateString() }}</p> <br>
                    <p><strong>Your Key: </strong>{{ gameSession.key }}</p>
                </div>
                <div class="card-actions">
                    <router-link :to="{ name: 'GameSessionDetailsByStudentView', params: { gameSessionId: gameSession.sessionId } }" 
                                 class="details-button"
                                 @click="selectSession(gameSession.sessionId)">
                        View Details
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
.game-session-list {
    min-height: 407px;
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

.instructions li {
    line-height: 1.6;
}

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