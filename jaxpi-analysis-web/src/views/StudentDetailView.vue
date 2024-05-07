<template>
  <div class="student-info">
    <div class="info-pair">
      <span class="title">Estudiante:</span> 
      <span class="value">{{ selectedStudent.studentData.studentName }}</span>
    </div>
    <div class="info-pair">
      <span class="title">Clase:</span> 
      <span class="value">{{ selectedStudent.selectedClass }}</span>
    </div>
  </div>
</template>

<script setup>
import { selectedStudent } from '../store/studentStore'
</script>

<style>
.student-info {
  background-color: #f5f5f5;
  border: 2px solid #000000;
  border-radius: 8px;
  padding: 10px;
  max-width: max-content; /* ajustar el ancho máximo según tus preferencias */
}

.info-pair {
  margin-bottom: 5px; /* Añade espacio entre los pares de información */
}

.title {
  font-weight: bold;
  margin-right: 5px; /* Espacio entre el título y el valor */
}

.value {
  display: inline-block; /* Asegura que el valor esté en la misma línea que el título */
}
</style>
