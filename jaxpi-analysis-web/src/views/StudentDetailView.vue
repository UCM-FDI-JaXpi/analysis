<template>
  <div class="student-info">
    <div class="info-pair">
      <span class="title">Student:</span> 
      <span class="value">{{ selectedStudent.studentData.studentName }}</span>
    </div>
    <div class="info-pair">
      <span class="title">Class:</span> 
      <span class="value">{{ selectedStudent.selectedClass }}</span>
    </div>
  </div>

  <BarChart v-if="dataVerbCount.length > 0" :data="dataVerbCount" chartId="bar-chart-student-detail1" title="Verb count" />
</template>

<script setup>
import { selectedStudent } from '../store/studentStore'
import BarChart from '../components/BarChart.vue';
import { ref } from 'vue';

// Para el recuento de verbos
const verbCount = ref({});
const dataVerbCount = ref([]);

if (selectedStudent.value && selectedStudent.value.studentData) {
  selectedStudent.value.studentData.statements.forEach(entry => {
    const verb = entry.verb.display['en-US'];
    verbCount.value[verb] = (verbCount.value[verb] || 0) + 1;
  });
}

console.log(verbCount.value)
dataVerbCount.value = Object.entries(verbCount.value).map(([nameObject, value]) => ({ nameObject, value }));
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

#bar-chart-student-detail1 {
  background-color: rgba(255, 255, 255, 0.8);
  min-width: 415px; /* Por si la grafica tiene solo una barra en la grafica para que tenga como min un tamaño a cuando hay mas datos */
}
</style>
