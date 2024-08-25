<template>
    <div class="student-view">
        <h1 v-if="!student">Student's view</h1>
        <p v-if="!student">Please log in as a student to view student details.</p>

        <div class="student-details" v-if="student">
            <h3 class="student-name">{{ student.name }}</h3>
            <p class="student-role">Role: {{ student.usr_type }}</p>
        </div>

        <div class="content-container" v-if="student">
            <div class="tabs">
                <button v-for="(tab, index) in tabs" :key="index" @click="activeTab = index"
                    :class="{ 'active': activeTab === index }">
                    {{ tab }}
                </button>
            </div>

            <div v-if="activeTab === 0" class="tab-content">
                <ChartsStudentComponent :groupId="groupId"
                                        :filteredDataByGroupId ="filteredDataByGroupId"
                                        :dataTableFormat="dataTableFormat"
                                        :dataLevelCompletionTimes="dataLevelCompletionTimes"
                                        :dataVerbCount="dataVerbCount"
                                        :dataPieChartGamesStartedCompleted="dataPieChartGamesStartedCompleted"
                                        :dataBestCompletionTimePerLevelPerGroup="dataBestCompletionTimePerLevelPerGroup"
                                        :dataAttemptTimesForStudentLevel ="dataAttemptTimesForStudentLevel" />
            </div>

            <div v-if="activeTab === 1" class="tab-content">
                <GameSessionList />
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useGameSessionsStore } from '@/stores/gameSessionsStore.js';
import socket from '@/socket';
import axios from 'axios';
import ChartsStudentComponent from '@/components/student/ChartsStudentComponent.vue';
import GameSessionList from '@/components/teacher/GameSessionList.vue';

import { calculateLevelCompletionTimes } from '../../utils/utilities.js';

const authStore = useAuthStore();
const gameSessionsStore = useGameSessionsStore();

const userType = computed(() => authStore.userType);
const student = computed(() => { // Devuelve todos los datos si usr_type = 'student', sino, null
    const studentData = authStore.userData
    return studentData && studentData.usr_type === 'student' ? studentData : null;
});

const tabs = ref(["Stats", "Game sessions"]);
const activeTab = ref(0); // Define active tab
const groupId = ref('');
const originalData = ref([]); // Guardo todo lo que me da response.data cuando soy student al montar el componente
const dataTableFormat = ref([]); // De filteredDataByGroupId preparo bien los campos de la tabla y se lo paso a DataTable
const filteredDataByGroupId = ref([]); // Datos del filtrados por groupID de originalData
const dataLevelCompletionTimes = ref([]);
const dataVerbCount = ref([]);
const dataPieChartGamesStartedCompleted = ref([]);
const dataBestCompletionTimePerLevelPerGroup = ref([]);
const dataAttemptTimesForStudentLevel  = ref([]);

onMounted(async () => {
  await fetchDataFromMongoDB();

  socket.on('newStatement', (updatedData) => { // Recibe record a record, no un array de records
    if (userType.value === 'student') {
      if (originalData.value[0] && (updatedData.context.contextActivities.parent.id == originalData.value[0].groupId) 
          && student.value.session_keys.find( e => e == updatedData.context.extensions["https://www.jaxpi.com/sessionKey"]) ) {
        let actorFound = false;
        if (Array.isArray(originalData.value)) { // Comprueba si originalData es un array o no (sea vacio o con algo), lo hago con originalData porque es el que tiene TODOS los groups
          let group = undefined;
          group = originalData.value[0];

          if (group) {
            group.actors.forEach(actor => {
              if (actor.sessionKey === updatedData.context.extensions["https://www.jaxpi.com/sessionKey"]) {
                // Verifica que updatedData tiene la estructura esperada
                if (updatedData && updatedData.actor && updatedData.context && updatedData.object && updatedData.stored && updatedData.timestamp && updatedData.verb) {
                  actor.statements.push(updatedData);
                  actorFound = true;
                } else {
                  console.warn('updatedData tiene una estructura inesperada', updatedData);
                }
              }
            });
            if (!actorFound) { // Tengo que añadir el estudiante en su group por primera vez
              let actor = {};
              actor.name = updatedData.context.extensions["https://www.jaxpi.com/studentName"];
              actor.sessionKey = updatedData.context.extensions["https://www.jaxpi.com/sessionKey"];
              actor.gameId = updatedData.context.extensions["https://www.jaxpi.com/gameId"];
              actor.gameName = updatedData.context.extensions["https://www.jaxpi.com/gameName"];
              actor.sessionId = updatedData.context.extensions["https://www.jaxpi.com/sessionId"];
              actor.sessionName = updatedData.context.extensions["https://www.jaxpi.com/sessionName"];
              actor.statements = [updatedData];
              group.actors.push(actor);
            } else {
              console.log('Datos actualizados en originalData:', originalData.value);
            }
          }
        } else {
          console.warn('originalData no está definido o no es un array');
        }
      }
    }
  });
});

onUnmounted(() => {
  // Remove all socket listeners
  socket.off('message');
  socket.off('newStatement');
});

const fetchDataFromMongoDB = async () => {
  try {
      const response = await axios.get('http://localhost:3000/records', {
      withCredentials: true
      });
      console.log('response.data:', response.data);
      if (userType.value === 'student') {
        groupId.value = response.data[0].groupId;
        originalData.value = response.data;
      }
  } catch (error) {
      console.error('Error al obtener los datos de http://localhost:3000/records', error);
  }
};

watch(originalData, (newValue) => { // Actualizo filteredData segun originalData
  if (groupId.value)
    filteredDataByGroupId.value = newValue.filter(item => item.groupId === groupId.value);
  else 
    filteredDataByGroupId.value = newValue;

  // FORMATEAR DATOS PARA TABLE
  if (filteredDataByGroupId.value.length > 0) {
    dataTableFormat.value = filteredDataByGroupId.value.flatMap(item => {
      return item.actors.map(actor => {
        // Ordenar los timestamps dentro de cada actor del más reciente al más antiguo
        let copyStatements = [...actor.statements];
        copyStatements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
         // Comprueba si el actor tiene statements, si los tiene devuelve el primer timestamp que es el mas reciente, sino devuelve null
        const lastStatement = copyStatements.length > 0 ? copyStatements[0].timestamp : null;
        return {
          student: actor.name,
          session: actor.sessionName + " (" + actor.sessionId + ")",
          game: actor.gameName,
          numberOfStatements: actor.statements.length,
          lastTimestamp: lastStatement
        };
      });
    }).sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp)); // Sort by timestamp, from latest to oldest
  }  else { // Limpia todas las stats var si no hay datos
    dataTableFormat.value = []; 
    dataVerbCount.value = [];
    dataLevelCompletionTimes.value = [];
    dataPieChartGamesStartedCompleted.value = [];
    dataBestCompletionTimePerLevelPerGroup.value = [];
  }

  // FORMATEAR DATOS PARA EL PRIMER BARCHART - COMPLETION TIME PER LEVEL
  if (filteredDataByGroupId.value.length > 0) {
    if (groupId.value) {
      const dataGroup = calculateLevelCompletionTimes(filteredDataByGroupId.value[0]);
      dataLevelCompletionTimes.value = [];
      dataGroup.forEach(actorInfo => {
        const keys = Object.keys(actorInfo.actorData).filter(key => key.includes('level'));
        if (keys) { // [ 'level1','level2', ...]
          keys.forEach(key => {
            if (dataLevelCompletionTimes.value.find(e => e.nameObject == key)) {
              let times = actorInfo.actorData[key];
              let previousData = dataLevelCompletionTimes.value.find(e => e.nameObject == key);
              const averageTime = (times.reduce((sum, num) => sum + num, 0) + previousData.sum) / (times.length + previousData.numElem);
              previousData.completionTime = averageTime;
              previousData.sum = times.reduce((sum, num) => sum + num, 0) + previousData.sum;
              previousData.numElem = times.length + previousData.numElem;
            } else {
              let times = actorInfo.actorData[key];
              if (times.length > 0) {
                const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
                let level = { nameObject: key, completionTime: averageTime, sum: times.reduce((sum, num) => sum + num, 0), numElem: times.length };
                dataLevelCompletionTimes.value.push(level);
              }
            }
          }); 
        }
      });
      // PARA PRIMER BARCHART DEL TAB COMPLETION TIME (el mejor tiempo por nivel del grupo)
      dataBestCompletionTimePerLevelPerGroup.value = [];
      dataGroup.forEach(actorInfo => {
        const keys = Object.keys(actorInfo.actorData).filter(key => key.includes('level') && key != 'level 15' && actorInfo.actorData[key].length > 0); // [ 'level1','level2', ...] menos el level 15 y los levels que no tienen tiempos de completado
        if(keys){
          keys.forEach(key => {
              if (dataBestCompletionTimePerLevelPerGroup.value.find(e => e.nameObject == key)) {
                let resTempo = dataBestCompletionTimePerLevelPerGroup.value.find(e => e.nameObject == key);
                let minTime;
                let times = actorInfo.actorData[key];
                  if (times.length > 0){
                    minTime = Math.min(...times);
                    if ( minTime < resTempo.value || resTempo.value === 0){
                      resTempo.value = minTime;
                      resTempo.student = actorInfo.actorName;
                    }
                  }
              } else {
                  let times = actorInfo.actorData[key];
                  let minTime;
                  if (times.length > 0)
                    minTime = Math.min(...times);
                  else minTime = 0;
                  let level = { nameObject: key, value: minTime, student: actorInfo.actorName};
                  dataBestCompletionTimePerLevelPerGroup.value.push(level);
              }
          });
        }
      }); 
      console.log('dataBestCompletionTimePerLevelPerGroup', dataBestCompletionTimePerLevelPerGroup.value);
      // PARA EL SEGUNDO BARCHART - COUNTVERBS 
      dataVerbCount.value = [];
      dataGroup.forEach(actorInfo => {
          const keysVerbs = Object.keys(actorInfo.actorData.verbs);
          if (keysVerbs) { // [ 'started','jumped', ...]
            keysVerbs.forEach(key => {
              if (dataVerbCount.value.find(e => e.nameObject == key)) {
                let times = actorInfo.actorData.verbs[key];
                let previousData = dataVerbCount.value.find(e => e.nameObject == key);
                const sumVerbs = previousData.value + times;
                previousData.value = sumVerbs;
              } else { // No esta el verb por primera vez
                let times = actorInfo.actorData.verbs[key];
                let count = { nameObject: key, value: times};
                dataVerbCount.value.push(count); 
              }
            }); 
          }
        });

      // PARA EL PRIMER PIECHART - GAMES STARTED AND COMPLETED
      dataPieChartGamesStartedCompleted.value = [];
      dataGroup.forEach(actorInfo => {
          // actorInfo.actorData.starteds = > [{"level": "level 1"},{"level": "level 2"}]
          let levels1 = actorInfo.actorData.starteds.filter( start => start.level == 'level 1')
          let completeds14 = actorInfo.actorData.completeds.filter( completed => completed.level == 'level 14')
          if (levels1.length == 0 && completeds14.length == 0) { // No pinto el piechart si no hay datos
            dataPieChartGamesStartedCompleted.value = [];
          } else {
            if (dataPieChartGamesStartedCompleted.value.find(e => e.nameObject == 'started')) {
                let previousData = dataPieChartGamesStartedCompleted.value.find(e => e.nameObject == 'started');
                const sumStarted = previousData.value + (levels1.length - completeds14.length);  // No completados 
                previousData.value = sumStarted;
                previousData = dataPieChartGamesStartedCompleted.value.find(e => e.nameObject == 'completed');
                const sumCompleted = previousData.value + completeds14.length;
                previousData.value = sumCompleted;
              } else { // No hay datos aun 
                let countStarted = { nameObject: 'started', value: levels1.length - completeds14.length};
                let countCompleted = { nameObject: 'completed', value: completeds14.length};
                dataPieChartGamesStartedCompleted.value.push(countStarted); 
                dataPieChartGamesStartedCompleted.value.push(countCompleted); 
              }
          }
        });
    }
    console.log('dataLevelCompletionTimes:', dataLevelCompletionTimes.value);
    console.log('dataVerbCount:', dataVerbCount.value);
    console.log('dataPieChartGamesStartedCompleted:', dataPieChartGamesStartedCompleted.value);
  }
}, { deep: true }); // Observa cambios profundos, cambios en propiedades internas del objeto o los elementos del array

watch(activeTab, async (newTab) => {
    if (newTab === 1) { // Si es la pestaña de "Game sessions"
      await gameSessionsStore.fetchGameSessionsByStudentName(student.value.name);
    }
});
</script>

<style scoped>ç
.student-view {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

h1 {
    margin-bottom: 0;
}

.student-details {
    display: flex;
    flex-direction: column;
    background-color: #f9f9f9;
    padding: 1.5rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #ddd; 
    margin-bottom: 20px;
    width: -webkit-fill-available;
    max-width: 800px;
}

.student-details > * {
    margin: 0; /* Elimina el margin de todos los elementos dentro de student-details */
}

.student-name {
    font-size: 1.7rem;
}

.student-role {
    font-size: 0.9rem;
    color: #727171; /* Color gris claro para los detalles */
    font-weight: bold;
}

.content-container {
    /* overflow-y: auto; Habilita el scroll si el contenido es muy grande */
    padding: 1rem;
    background-color: #f9f9f9; /* Color de fondo para diferenciarlo */
    border-radius: 10px; /* Bordes redondeados */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* Sombra para el contenedor */
}
/* Add styling for tabs */
.tabs {
    display: flex;
}

.tabs button {
    padding: 10px 20px;
    margin-right: 1px;
    cursor: pointer;
    border: none;
}

.tabs button.active {
    background-color: #79c1fd;
}

.tab-content {
    display: flex;
    flex-wrap: wrap; /* Permite que los elementos se muevan a la siguiente fila cuando no quepan */
    gap: 50px;
    padding: 1rem;
    background-color: #79c1fd;
}
</style>