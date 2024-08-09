import { defineStore } from 'pinia';
import axios from 'axios';

export const useGroupsStore = defineStore('groups', {
    state: () => ({
        groups: [],
        loading: false,
        error: null,
        selectedGroupId: null,
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
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                alert('There was an error creating the group. Please try again.');
            } finally {
                this.loading = false;
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
                    return response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                alert('There was an error creating the group. Please try again.');
            } finally {
                this.loading = false;
            }
        },
        async fetchGroups() { // Your groups as a teacher
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.get('http://localhost:3000/teacher/get-groups', {
                    withCredentials: true,
                });
                if (response.status === 200) {
                    this.groups = response.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                console.log(error);
                alert('Error fetching groups');
            } finally {
                this.loading = false;
            }
        },
        setSelectedGroupId(groupId) {
            this.selectedGroupId = groupId;
        }
    },
    getters: {
        getGroupById: (state) => {
            return (groupId) => state.groups.find((group) => group.id === groupId);
        },
        /*getGroupNameById: (state) => {
            return (groupId) => state.groups.find((group) => group.id === groupId).name
        },*/
        getGroupNameById: (state) => (groupId) => {
            const group = state.groups.find(group => group.id === groupId);
            return group ? group.name : 'Unknown Group';
        }
    }
});
