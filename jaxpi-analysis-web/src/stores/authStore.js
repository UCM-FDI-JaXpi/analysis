import { defineStore } from 'pinia';
import axios from 'axios';
import { useGameSessionsStore } from './gameSessionsStore';
import { useGamesStore } from './gamesStore';
import { useGroupsStore } from './groupsStore';
import { useStudentStore } from './studentStore';
import { useRouteStore } from './routeStore';
import { usePaginationStore } from './paginationStore';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isAuthenticated: false,
        userData: null, // All user details
        userType: '',
        errorMessage: ''
    }),
    actions: {
        loginStore(user) {
            this.isAuthenticated = true;
            this.userData = user;
            this.userType = user.usr_type;
            this.errorMessage = '';
        },
        async register(userDetails) {
            try {
                const response = await axios.post('http://localhost:3000/register',
                    userDetails, {
                    withCredentials: true
                });

                if (response.status === 200) {
                    console.log(response.data.message);
                    return response.data;
                } else {
                    throw new Error('Unexpected response status');
                }
            } catch (error) {
                if (error.response)
                    this.errorMessage = error.response.data.message || 'Registration failed';
                else
                    this.errorMessage = 'Network error or unexpected error occurred';
                
                console.error('Error registering:', error);
                throw error; // Propaga el error al componente
            }
        },
        async login(credentials) { // email and password when is a dev or a teacher, sessionKey when is a Student
            try {
                const response = await axios.post('http://localhost:3000/login',
                    credentials, {
                    withCredentials: true
                });

                if (response.status === 200) {
                    console.log(response.data.message);  // success
                    const userDataResponse = await axios.get('http://localhost:3000/api/session', {
                        withCredentials: true
                    });
                    const userData = userDataResponse.data.user;
                    console.log("Login successful, userData: ", userData);

                    this.loginStore(userData);
                    return userData;
                } else {
                    throw new Error('Unexpected response status');
                }
            } catch (error) {
                if (error.response) // Error específico del back
                    this.errorMessage = error.response.data.message || 'Login failed';
                else
                    this.errorMessage = 'Network error or unexpected error occurred'; // Error de red u otro tipo de error
                
                console.error('Error logging in:', error);
                throw error; // Propaga el error al componente
            }
        },
        async logout() {
            try {
                const response = await axios.delete('http://localhost:3000/logout', {
                    withCredentials: true
                });

                if (response.status === 200) {
                    this.$reset();

                    const gameSessionsStore = useGameSessionsStore();
                    gameSessionsStore.$reset();

                    const gamesStore = useGamesStore();
                    gamesStore.$reset();

                    const groupsStore = useGroupsStore();
                    groupsStore.$reset();               

                    const studentStore = useStudentStore();
                    studentStore.$reset();

                    const routeStore = useRouteStore();
                    routeStore.$reset();

                    const paginationStore = usePaginationStore();
                    paginationStore.$reset();

                    console.log(response.data.message); // Imprimir mensaje del servidor (success)
                }
                else
                    console.error('Logout failed');
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }
});
