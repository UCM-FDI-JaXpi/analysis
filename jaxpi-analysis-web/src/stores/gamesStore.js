import { defineStore } from 'pinia';
import axios from 'axios';

export const useGamesStore = defineStore('games', {
    state: () => ({
        games: [],
        loading: false,
        error: null,
        selectedGameId: null
    }),
    actions: {
        async fetchGames() { // When you're dev
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.get('http://localhost:3000/dev/games', {
                    withCredentials: true,
                });
                if (response.status === 200) {
                    this.games = response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                console.log(error);
                alert('Error fetching games');
            } finally {
                this.loading = false;
            }
        },
        async fetchAllGames() { // When you're teacher
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.get('http://localhost:3000/games', {
                    withCredentials: true,
                });
                if (response.status === 200) {
                    this.games = response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                console.log(error);
                alert('Error fetching games');
            } finally {
                this.loading = false;
            }
        },
        async addGame(gameData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.post('http://localhost:3000/dev/games', gameData, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (response.status === 201) {
                    this.games.push(response.data);
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                alert('There was an error creating the game. Please try again.');
            } finally {
                this.loading = false;
            }
        },
        async deleteGame(gameId) {
            try {
                const response = await axios.delete(`http://localhost:3000/dev/games/${gameId}`, {
                    withCredentials: true
                });
                if (response.status === 200) {
                    console.log('Success:', response.data.message);
                    this.games = this.games.filter(game => game.id !== gameId);
                } else {
                    console.error('Failed to delete game');
                }
            } catch (error) {
                console.error('Error deleting game:', error);
            }
        },
        setSelectedGameId(gameId) {
            this.selectedGameId = gameId;
        }
    }, getters: {
        getSelectedGame: (state) => {
          return state.games.find(game => game.id === state.selectedGameId);
        },
        getGameNameById: (state) => {
            return (gameId) => state.games.find((game) => game.id === gameId).name;
        },
        getGameById: (state) => {
            return (gameId) => state.games.find((game) => game.id === gameId);
        },
    }
});
