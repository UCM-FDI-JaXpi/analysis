import { defineStore } from 'pinia';
import axios from 'axios';

export const useGameSessionStore = defineStore('gameSessionStore', {
    state: () => ({
        gameSessions: [],
        loading: false,
        error: null,
    }),
    actions: {
        async createGameSession(groupId, gameId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.post('http://localhost:3000/teacher/create-game-session', {
                    groupId,
                    gameId,
                }, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (response.status === 201) { // exito
                    this.gameSessions.push(response.data);
                    this.loading = false;
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                this.loading = false;
                alert('There was an error creating the game session. Please try again.');
            }
        }
    },
});
