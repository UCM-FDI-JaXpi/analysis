import { defineStore } from 'pinia';
import axios from 'axios';

export const useGamesStore = defineStore('games', {
    state: () => ({
        games: [],
        selectedGameId: null
    }),
    actions: {
        async fetchGames() { // When you're dev
            try {
                const response = await axios.get('http://localhost:3000/dev/games', {
                    withCredentials: true,
                });
                if (response.status === 200) {
                    this.games = response.data;
                } else {
                    console.error('Failed to fetch games');
                }
            } catch (error) {
                console.error('Error fetching games:', error);
            }
        },
        async fetchAllGames() { // When you're teacher
            try {
                const response = await axios.get('http://localhost:3000/games', {
                    withCredentials: true,
                });
                if (response.status === 200) {
                    this.games = response.data;
                } else {
                    console.error('Failed to fetch all games');
                }
            } catch (error) {
                console.error('Error fetching all games:', error);
            }
        },
        async addGame(gameData) {
            try {
                const response = await axios.post('http://localhost:3000/dev/games', gameData, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (response.status === 201) {
                    this.games.push(response.data);
                } else {
                    console.error('Failed to add game');
                }
            } catch (error) {
                console.error('Error adding game:', error);
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
        getSelectedGameId() { // Quizas borrar ya que tengo el gameId en un Game, el setSelectedGameId si que hace falta
            return this.selectedGameId;
        },
        getSelectedGame() {
          return this.games.find(game => game.id === this.selectedGameId);
        },
        getGameNameById: (state) => {
            return (gameId) => state.games.find((game) => game.id === gameId).name;
        },
        getGameById: (state) => {
            return (gameId) => state.games.find((game) => game.id === gameId);
        },
    }
});
