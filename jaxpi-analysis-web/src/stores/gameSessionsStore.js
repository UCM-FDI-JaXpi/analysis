import { defineStore } from 'pinia';
import axios from 'axios';
import { useGamesStore } from './gamesStore';

export const useGameSessionsStore = defineStore('gameSessions', {
    state: () => ({
        gameSessions: [],
        loading: true,
        error: null,
        selectedGameSessionId: null,
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
                    const gameSessions = response.data;
                    const gamesStore = useGamesStore(); // Obtener instancia del store de juegos

                    // Mapear las sesiones de juego para incluir el nombre del juego usando el gamesStore
                    this.gameSessions = gameSessions.map(session => ({
                        ...session,
                        gameName: gamesStore.getGameNameById(session.gameId) // Usa el nombre del juego del gamesStore
                    }));
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                alert('Error fetching game sessions');
            } finally {
                setTimeout(() => {
                    this.loading = false;
                  }, 400);                
            }
        },
        async fetchGameSessionsByStudentName(studentName) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.get(`http://localhost:3000/student/get-game-sessions/${studentName}`, {
                    withCredentials: true
                });
                if (response.status === 200) {
                    this.gameSessions = response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                console.error('Error fetching game sessions:', error);
            } finally {
                this.loading = false;
            }
        },
        setSelectedGameSessionId(gameSessionId) {
            this.selectedGameSessionId = gameSessionId;
        }
    },
    getters: {
      getGameSessionById: (state) => (gameSessionId) => {
        return state.gameSessions.find(session => session.sessionId === gameSessionId);
      }
    }
});
