import { defineStore } from 'pinia';
import axios from 'axios';

export const useGroupStore = defineStore('groupStore', {
    state: () => ({
        groups: [],
        loading: false,
        error: null,
    }),
    actions: {
        async createGroupManual(groupName, students) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.post('http://localhost:3000/teacher/create-group-with-students', {
                    name: groupName,
                    students,
                }, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (response.status === 201) { // exito
                    this.groups.push(response.data);
                    this.loading = false;
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                this.loading = false;
                alert('There was an error creating the group. Please try again.');
            }
        },
        async createGroupRandom(groupName, nStudents) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.post('http://localhost:3000/teacher/create-group-from-scratch', {
                    name: groupName,
                    nStudents,
                }, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (response.status === 201) { // exito
                    this.groups.push(response.data);
                    this.loading = false;
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                this.loading = false;
                alert('There was an error creating the group. Please try again.');
            }
        },
    },
});
