import { defineStore } from 'pinia';

export const useStudentStore = defineStore('selectedStudent', {
    state: () => ({
        selectedStudent: null // studentName
    }),

    actions: {
        setSelectedStudent(selectedStudentData) {
            this.selectedStudent = selectedStudentData;
        },
        clearSelectedStudent() {
            this.selectedStudent = null;
        }
    }
});