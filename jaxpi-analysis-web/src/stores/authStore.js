import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isAuthenticated: false,
        userData: null, // All user details
        userType: ''
    }),
    actions: {
        initializeFromStorage() {
            const storedData = localStorage.getItem('authStore');
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                this.isAuthenticated = true;
                this.userData = parsedData;
                this.userType = parsedData.usr_type;
            }
        },
        login(user) {
            this.isAuthenticated = true;
            this.userData = user;
            this.userType = user.usr_type;

            // Guardar en localStorage
            localStorage.setItem('authStore', JSON.stringify(user));

            console.log("Login en authStore de:", this.userData)
        },
        logout() {
            this.isAuthenticated = false;
            this.userData = null;
            this.userType = '';

            localStorage.removeItem('authStore'); // Borrar del localStorage
        },
    },
});
