import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isAuthenticated: false,
        userType: null, // 'teacher', 'student' or 'dev'
    }),
    actions: {
        login(userType) {
            this.isAuthenticated = true;
            this.userType = userType;
        },
        logout() {
            this.isAuthenticated = false;
            this.userType = null;
        },
    },
});
