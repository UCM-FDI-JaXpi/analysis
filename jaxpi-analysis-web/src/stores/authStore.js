import { defineStore } from 'pinia';
import axios from 'axios';

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
                    this.resetAuthState();
                    console.log(response.data.message); // Imprimir mensaje del servidor (exito)
                }
                else
                    console.error('Logout failed');
            } catch (error) {
                console.error('Error:', error);
            }
        },
        resetAuthState() {
            this.isAuthenticated = false;
            this.userData = null;
            this.userType = '';
        }
    },
});
