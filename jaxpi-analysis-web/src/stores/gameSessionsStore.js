import { defineStore } from 'pinia';
import axios from 'axios';

export const useGameSessionsStore = defineStore('gameSessions', {
    state: () => ({
        gameSessions: [],
        loading: false,
        error: null,
    }),
    actions: {
        async createGameSession(gameSessionName, groupId, gameId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.post('http://localhost:3000/teacher/create-game-session', {
                    gameSessionName,
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
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                alert('There was an error creating the game session. Please try again.');
                console.log(error);
            } finally {
                this.loading = false;
            }
        },
        async fetchGameSessions(groupId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.get(`http://localhost:3000/teacher/get-game-sessions/${groupId}`, {
                    withCredentials: true,
                });
                if (response.status === 200) {
                    this.gameSessions = response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                alert('Error fetching game sessions');
            } finally {
                this.loading = false;
            }
        }
    }
});
