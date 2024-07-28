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
                const response = await axios.post('http://localhost:3000/create-group-with-students', {
                    name: groupName,
                    students,
                }, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (response.status === 201) { // exito
                    console.log(response.data);
                    this.groups.push(response.data.group);
                    this.loading = false;
                    return response.data.group;
                } else {
                    console.log('error en el else')
                    throw new Error('Failed to create group');
                }
            } catch (error) {
                console.log(error.message)
                console.log(error.response?.data?.message)
                this.error = error.response?.data?.message || error.message;
                this.loading = false;
                throw error;
            }
        },
        async createGroupRandom(groupName, nStudents) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.post('http://localhost:3000/create-group-from-scratch', {
                    name: groupName,
                    nStudents,
                });
                this.groups.push(response.data.group);
                this.loading = false;
                return response.data.group;
            } catch (error) {
                this.error = error.message;
                this.loading = false;
                throw error;
            }
        },
    },
});
