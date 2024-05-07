import { ref } from 'vue'

const storedStudentData = JSON.parse(localStorage.getItem('selectedStudent'))
export const selectedStudent = ref(storedStudentData || null)

export function updateSelectedStudent(selectedStudentData) {
    selectedStudent.value = selectedStudentData
    // Almacenamos los nuevos datos en Local Storage
    localStorage.setItem('selectedStudent', JSON.stringify(selectedStudentData))
}