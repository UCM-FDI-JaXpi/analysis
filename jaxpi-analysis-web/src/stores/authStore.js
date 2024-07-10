import { defineStore } from 'pinia';

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
            console.log("Login en authStore de: ", this.userData)
        },
        logout() {
            this.isAuthenticated = false;
            this.userData = null;
            this.userType = '';
            console.log("Logout en authStore")
        },
    },
});
