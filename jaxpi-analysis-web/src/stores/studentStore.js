import { defineStore } from 'pinia';

export const useStudentStore = defineStore('selectedStudent', {
    state: () => ({
        selectedStudent: null // All info like class, studentData(statements and studentName)
    }),

    actions: {
        updateSelectedStudent(selectedStudentData) {
            this.selectedStudent = selectedStudentData;
        },
        clearSelectedStudent() {
            this.selectedStudent = null;
        }
    }
});