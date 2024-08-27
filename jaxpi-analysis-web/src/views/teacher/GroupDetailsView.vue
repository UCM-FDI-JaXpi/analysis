<template>
    <div class="group-details-view">
      <div class="group-details" v-if="group">
        <h1>Details of {{ group.name }}</h1>
        <p>Total students: {{ group.students.length }}</p>
        <p>Active students: {{ activeUsers }}</p>
        <p>No active students: {{ group.students.length - activeUsers }}</p>
      </div>
      <div v-else>There are no details to show.</div>

      <div class="tabs-container">
        <div class="tabs">
            <button v-for="(tab, index) in tabs" :key="index" @click="activeTab = index"
                :class="{ 'active': activeTab === index }">
                {{ tab }}
            </button>
        </div>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 0">
          <ChartsComponent :groupId="group.id"
                            :originalData="originalData"
                            :filteredDataByGroupId ="filteredDataByGroupId"
                            :dataTableFormat="dataTableFormat"
                            :dataLevelCompletionTimes="dataLevelCompletionTimes"
                            :dataVerbCount="dataVerbCount"
                            :dataPieChartGamesStartedCompleted="dataPieChartGamesStartedCompleted"
                            :dataBestCompletionTimePerLevelPerGroup="dataBestCompletionTimePerLevelPerGroup"
                            :dataAttemptTimesForStudentLevel ="dataAttemptTimesForStudentLevel" />
        </div>

        <div v-if="activeTab === 1">
            <GameSessionList />
        </div>

        <div v-if="activeTab === 2">
            <StudentList :groupId="group.id"
                        :dataStudentList = "dataTableFormat"
                        :filteredDataByGroupId ="filteredDataByGroupId"/>
        </div>
      </div>
    </div>

    <!-- <div class="group-details-general-charts" v-else> ESTO ES POR SI CHARTSGENERAL
        <h1>General charts</h1>
        <ChartsComponent 
            :originalData="originalData"
            :filteredDataByGroupId ="filteredDataByGroupId"
            :dataTableFormat="dataTableFormat"
            :dataLevelCompletionTimes="dataLevelCompletionTimes"
            :dataVerbCount="dataVerbCount"
            :dataPieChartGamesStartedCompleted="dataPieChartGamesStartedCompleted"
            :dataAttemptTimesForStudentLevel ="dataAttemptTimesForStudentLevel "/>
    </div> -->
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import socket from '@/socket';
import { useGroupsStore } from '@/stores/groupsStore';
import { useAuthStore } from '@/stores/authStore';
import { useGameSessionsStore } from '@/stores/gameSessionsStore';

import ChartsComponent from '@/components/ChartsComponent.vue';
import GameSessionList from '@/components/teacher/GameSessionList.vue';
import StudentList from '@/components/teacher/StudentList.vue';

import { calculateLevelCompletionTimes } from '../../utils/utilities.js';

const route = useRoute();
const groupsStore = useGroupsStore();
const authStore = useAuthStore(); // To use Pinia store (desestructuracion)
const gameSessionsStore = useGameSessionsStore();

const groupId = computed(() => route.params.groupId);
const group = computed(() => groupsStore.getGroupById(groupId.value));
const userType = computed(() => authStore.userType);

const tabs = ref(["Stats", "Game sessions", "Students"]);
const activeTab = ref(0); // Define active tab

const originalData = ref([]); // Guardo todo lo que me da response.data cuando soy profesor al montar el componente
const dataTableFormat = ref([]); // De filteredDataByGroupId preparo bien los campos de la tabla y se lo paso a DataTable
const filteredDataByGroupId = ref([]); // Datos del filtrados por groupID de originalData
const dataLevelCompletionTimes = ref([]);
const dataVerbCount = ref([]);
const dataPieChartGamesStartedCompleted = ref([]);
const dataBestCompletionTimePerLevelPerGroup = ref([]);
const dataAttemptTimesForStudentLevel  = ref([]);
const activeUsers  = ref(0);

onMounted(async () => {
  await fetchDataFromMongoDB();
  fetchGameSessions(groupId.value); // Al cambiar a esta vista y montarla, llamo a los gamesessions del group dado

  // EVENTOS DE SOCKET
  // To send data to the server
  // const hello = 'hello websocket'
  // socket.emit('message', hello);

  // Data received from server
  // console.log(props)
  // socket.on('message', (msg) => {
  //   console.log('Message received from server:', msg);
  // });
  
  socket.on('newStatement', (updatedData) => { // Recibe record a record, no un array de records
    if (userType.value === 'teacher') {
      let actorFound = false;
      if (Array.isArray(originalData.value)) { // Comprueba si originalData es un array o no (sea vacio o con algo), lo hago con originalData porque es el que tiene TODOS los groups
        let group = undefined;
        group = originalData.value.find(item => item.groupId ===  updatedData.context.contextActivities.parent.id);

        if (group) {
          group.actors.forEach(actor => {
            if (actor.sessionKey === updatedData.context.extensions["https://www.jaxpi.com/sessionKey"]) { // Me viene de back deshaseada
              // Verifica que updatedData tiene la estructura esperada
              if (updatedData && updatedData.actor && updatedData.context && updatedData.object && updatedData.stored && updatedData.timestamp && updatedData.verb) {
                actor.statements.push(updatedData);
                actorFound = true;
                //console.log('Dato añadido al actor:', actor);
              } else {
                console.warn('updatedData tiene una estructura inesperada', updatedData);
              }
            }
          });
          if (!actorFound) { // Tengo que añadir el estudiante en su group por primera vez
            console.log("Este estudiante no corresponde a este group");
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
        } else { // Si en originalData(primer fetch) no tengo ningun group, añado este nuevo group, o si hay groups, añado este group al resto
          console.log('No se encontró el group con groupId:', groupId);
          let newGroup = {};
          newGroup.groupId = updatedData.context.contextActivities.parent.id;
          if (groupId.value){
            newGroup.groupName = groupsStore.getGroupNameById(groupId);
          } else {
            newGroup.groupName = groupsStore.getGroupNameById(updatedData.context.contextActivities.parent.id);
          }
          newGroup.actors = [];
          let actor = {};
          actor.name = updatedData.context.extensions["https://www.jaxpi.com/studentName"];
          actor.sessionKey = updatedData.context.extensions["https://www.jaxpi.com/sessionKey"];
          actor.gameId = updatedData.context.extensions["https://www.jaxpi.com/gameId"];
          actor.gameName = updatedData.context.extensions["https://www.jaxpi.com/gameName"];
          actor.sessionId = updatedData.context.extensions["https://www.jaxpi.com/sessionId"];
          actor.sessionName = updatedData.context.extensions["https://www.jaxpi.com/sessionName"];
          actor.statements = [updatedData];

          newGroup.actors.push(actor);
          originalData.value.push(newGroup);
        }
      } else {
        console.warn('originalData no está definido o no es un array');
      }
    }
  });
});
  
onUnmounted(() => {
  // Remove all socket listeners
  socket.off('message');
  socket.off('newStatement');
});

const fetchGameSessions = async (groupId) => {
  if (groupId) // Si tengo groupdId, cogo sus gamesessions sino, limpio gamesessions []
    await gameSessionsStore.fetchGameSessions(groupId);
  else
    gameSessionsStore.$reset();
};

const fetchDataFromMongoDB = async () => {
    try {
        const response = await axios.get('http://localhost:3000/records', {
        withCredentials: true
        });

        if (userType.value === 'student') {
          console.log('response.data:', response.data);
          originalData.value = response.data;

        } else if (userType.value === 'teacher') {
          console.log('response.data:', response.data);
          originalData.value = response.data;

        if (originalData.value.length === 0)
            console.log('No data for teacher');

        } else if (userType.value === 'dev'){
          console.log('Im dev');
          console.log('response.data:', response.data);
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
      ///////////////////////////////////////////////////////////////////////////////////////////// CALCULAR USUARIOS ACTIVOS DEL GRUPO
      let dataTempo = filteredDataByGroupId.value[0].actors.map( e => e.name);
      activeUsers.value = [...new Set(dataTempo)].length;
      /////////////////////////////////////////////////////////////////////////////////////////////
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
      activeUsers.value = 0;
    }
  
    // FORMATEAR DATOS PARA EL PRIMER BARCHART - COMPLETION TIME PER LEVEL
    if (filteredDataByGroupId.value.length > 0) { // Pueden venir varios grupos
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
      // else 
      // bucle for para cada grupo
      console.log('dataLevelCompletionTimes:', dataLevelCompletionTimes.value);
      console.log('dataVerbCount:', dataVerbCount.value);
      console.log('dataPieChartGamesStartedCompleted:', dataPieChartGamesStartedCompleted.value);
    }
}, { deep: true }); // Observa cambios profundos, cambios en propiedades internas del objeto o los elementos del array

watch(() => groupId.value, (newGroupId, oldGroupId) => {
    if (newGroupId !== oldGroupId) {
      fetchDataFromMongoDB(newGroupId);
      fetchGameSessions(newGroupId);
    }
});
</script>

<style scoped>
.group-details-view {
    padding: 1rem;
}

.group-details {
  margin-bottom: 2rem;
}

.group-details-general-charts {
    padding: 1rem;
}

.tabs {
    display: flex;
    border-bottom: 2px solid #ddd;
    max-width: 1300px;
}

.tabs button {
    padding: 10px 20px;
    margin-right: 2px;
    cursor: pointer;
    border: none;
    background-color: #f0f0f0;
    border-radius: 5px 5px 0 0;
    transition: background-color 0.2s, color 0.2s;
}

.tabs button.active {
    background-color: #79c1fd;
    color: white;
}

.tab-content {
    padding: 1rem;
    background-color: #ffffff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    max-width: 1300px;
    box-sizing: border-box; /* Incluye el padding y el border en el ancho total */
    overflow-y: auto; /* Permite desplazamiento si el contenido es demasiado grande */
    display: flex;
    flex-direction: column;
    min-height: 477px;
}
</style>