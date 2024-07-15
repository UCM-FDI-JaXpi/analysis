import { defineStore } from 'pinia';
import axios from 'axios';

export const useGamesStore = defineStore('games', {
    state: () => ({
        games: [],
        selectedGameId: null
    }),
    actions: {
        async fetchGames() {
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
        setSelectedGameId(gameId) {
            this.selectedGameId = gameId;
        },
        resetGamesState() {
            this.games = [];
            this.selectedGameId = null;
        }
    }, getters: {
        getSelectedGameId() {
            return this.selectedGameId;
        },
    }
});
