<template>
	<div class="container">
    <div class="student-info">
      <div class="info-pair">
        <span class="title">Student:</span> 
        <span class="value">{{ selectedStudent.studentData.name }}</span>
      </div>
      <div  v-if="groupId" class="info-pair">
        <span class="title">Class:</span> 
        <span class="value"> {{ groupName }} </span>
      </div>
    </div>

    <BarChart v-if="dataVerbCount.length > 0" :data="dataVerbCount" chartId="bar-chart-student-detail1" title="Verb count" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useStudentStore } from '@/stores/studentStore'
import { useGroupsStore } from '@/stores/groupsStore';
import BarChart from '@/components/BarChart.vue';

const studentStore = useStudentStore();
const groupsStore = useGroupsStore();

const selectedStudent = computed(() => studentStore.selectedStudent);
const groupId = computed(() => groupsStore.selectedGroupId);
const groupName = computed(() => groupsStore.getGroupNameById(groupId.value));

// Para el recuento de verbos
const verbCount = ref({});
const dataVerbCount = ref([]);

// Función para actualizar los datos del estudiante y los datos para el chart
const updateStudentData = () => {
  if (selectedStudent.value && selectedStudent.value.studentData) {
    verbCount.value = {}; // Reinicia el verbCount
    selectedStudent.value.studentData.statements.forEach(entry => { // Actualiza el conteo de verbos basándose en el nuevo estudiante seleccionado
      const verb = entry.verb.display['en-US'];
      verbCount.value[verb] = (verbCount.value[verb] || 0) + 1;
    });
    console.log(verbCount.value);
    dataVerbCount.value = Object.entries(verbCount.value).map(([nameObject, value]) => ({ nameObject, value })); // Convierte el conteo de verbos a un formato adecuado para el gráfico  
  } else {
    console.log(verbCount.value);
    dataVerbCount.value = [];
  }
};

// Observa los cambios en selectedStudent y actualiza los datos
watch(selectedStudent, () => {
  updateStudentData();
}, { immediate: true }); // Ejecuta la función inmediatamente para inicializar, al montar el componente por ejemplo, la ejecuta si o si, y cuando cambia selectedStudent tambien
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
