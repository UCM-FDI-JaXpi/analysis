import { defineStore } from 'pinia';
import axios from 'axios';
import { useGameSessionsStore } from './gameSessionsStore';
import { useGamesStore } from './gamesStore';
import { useGroupsStore } from './groupsStore';
import { useStudentStore } from './studentStore';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isAuthenticated: false,
        userData: null, // All user details
        userType: ''
    }),
    actions: {
        login(user) {
            this.isAuthenticated = true;
            this.userData = user;
            this.userType = user.usr_type;
            console.log("Login successful")
        },
        async logout() {
            try {
                const response = await axios.delete('http://localhost:3000/logout', {
                    withCredentials: true
                });

                if (response.status === 200) {
                    this.$reset(); // Limpiar authStore

                    const gameSessionsStore = useGameSessionsStore();
                    gameSessionsStore.$reset(); // Limpiar gameSessionsStore

                    const gamesStore = useGamesStore();
                    gamesStore.$reset(); // Limpiar gamesStore

                    const groupsStore = useGroupsStore();
                    groupsStore.$reset(); // Limpiar groupsStore                    

                    const studentStore = useStudentStore();
                    studentStore.$reset(); // Limpiar studentStore

                    console.log(response.data.message); // Imprimir mensaje del servidor (exito)
                }
                else
                    console.error('Logout failed');
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }
});
