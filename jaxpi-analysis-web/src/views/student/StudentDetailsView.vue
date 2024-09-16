<template>
	<div class="student-details-container" v-if="selectedStudent">
    <div class="card-details">
      <div class="student-name">
        <h1>{{ selectedStudent.slice(0, -6) }}</h1>
      </div>
      <div v-if="groupId" class="student-class">
        <p><strong>Class: </strong> {{ groupName }}</p>
      </div>
    </div>

    <div class="blueCard centerItems" v-if="gameSessionOptions.length > 0">
      <div class="marginBottom90">
        <h2 style="text-align: center; margin-top: 0px;">Game Sessions List</h2>
        <BaseTable
          :headers="['Game Session', 'Game', 'Session Key']"
          :rows="formattedGameSessions"
          :rowKeys="['gameSession', 'game', 'sessionKey']" />
      </div>
      <div>
        <select style="margin-bottom: 40px;" v-model="selectedGameSession">
          <option v-for="gameSessionData in gameSessionOptions" :key="gameSessionData.sessionId" :value="gameSessionData.sessionId">
            {{ gameSessionData.sessionName }}</option>
        </select>
      </div>
      <div class="centerItems" v-if="!loading">
        <div class="centerItems marginBottom90" v-if="dataTableFormat.length > 0">
          <h2 style="margin-bottom: 0px;">Last Interactions Received</h2>
          <p>You can see information about this student's interactions in this game session.</p>
          <DataTable
            :data="dataTableFormat" 
            :columns="tableColumnsTeacher"
            :columnTitles="dataTableColumnTitlesTeacher"
            :filter-key="searchQueryTeacher" />
            <p style="color: darkblue;"><strong>Note:</strong> there is no guarantee that all interactions have been received correctly.</p>
        </div>
        <div class="marginBottom90" v-if="dataLevelCompletionTimes.length > 0">
          <BarChart 
            :data="dataLevelCompletionTimes"
            chartId="bar-chart2"
            title="Average Completion Time per Level" />
        </div>
        <div class="marginBottom90" v-if="dataTableFormat.length > 0">
          <BarChart v-if="dataVerbCount.length > 0" 
          :data="dataVerbCount"
          chartId="bar-chart-verb-count"
          title="Count of Verbs Used" />
        </div>

        <div class="for-pie-student" v-if="dataTableFormat.length > 0">
          <PieChart v-if="dataPieChartGamesStartedCompleted.length > 0" 
            :data="dataPieChartGamesStartedCompleted"
            chartId="pie-chart1"
            title="Games Completed and Not Completed" />
            <div class="chart-details">
              <p><strong>Total number of games:</strong> {{ dataPieChartGamesStartedCompleted[0].value + dataPieChartGamesStartedCompleted[1].value }}</p>
              <p><strong>Number of games completed:</strong> {{ dataPieChartGamesStartedCompleted[0].value }}</p>
              <p><strong>Number of games not completed:</strong> {{ dataPieChartGamesStartedCompleted[1].value }}</p>
            </div>
        </div>
        <div v-else style="margin-top:10px;" class="no-data-charts">
          No data for this student in this game session.
        </div>
      </div>
      <div v-if="loading" class="no-data-charts">
        Loading...
      </div>
    </div>
    <div v-else class="blueCard no-data-charts">
      No data for this student.
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted} from 'vue';
import { useStudentStore } from '@/stores/studentStore'
import { useGroupsStore } from '@/stores/groupsStore';
import { useGameSessionsStore } from '@/stores/gameSessionsStore';
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';

import { sortStatements, calculateForStatements } from '../../utils/utilities.js';

import BaseTable from '@/components/BaseTable.vue';
import DataTable from '@/components/DataTable.vue';
import BarChart from '@/components/BarChart.vue';
import PieChart from '@/components/PieChart.vue';

const gameSessionsStore = useGameSessionsStore();
const studentStore = useStudentStore();
const groupsStore = useGroupsStore();
const authStore = useAuthStore();

const selectedStudent = computed(() => studentStore.selectedStudent);
const groupId = computed(() => groupsStore.selectedGroupId);
const groupName = computed(() => groupsStore.getGroupNameById(groupId.value));
const userType = computed(() => authStore.userType);

const formattedGameSessions = ref([]);
const originalData = ref([]); // Guardo todo lo que me da response.data
const dataTableFormat = ref([]); // De filteredDataByGroupId preparo bien los campos de la tabla y se lo paso a DataTable
const filteredDataByGroupId = ref([]); // Datos del filtrados por groupID de originalData
const dataLevelCompletionTimes = ref([]);
const dataGroup = ref([]);
const dataVerbCount = ref([]);
const dataPieChartGamesStartedCompleted = ref([]);
const loading = ref(true);

const searchQueryTeacher = ref('')
const tableColumnsTeacher = ['session', 'game', 'numberOfStatements', 'lastTimestamp']
const dataTableColumnTitlesTeacher = {
    session: 'Session',
    game: 'Game',
    numberOfStatements: 'Number of Interactions',
    lastTimestamp: 'Last Interaction Received'
};

// For select-dropdown
const selectedGameSession = ref('');
const gameSessionOptions = computed(() => gameSessionsStore.gameSessions);

const formatGameSessionsForTable = () => {
  try{
    formattedGameSessions.value = gameSessionOptions.value.map(session => ({
    gameSession: session.sessionName,
    game: session.gameName,
    sessionKey: session.students.find( student => student.name == selectedStudent.value).key,
  }));
  } catch(error){
    gameSessionOptions.value = [];
    console.log('error in formatGameSessionsForTable')
  }
};

const handleGameSessionChange = (gameSessionId) => {
  cleanData();
  setDataTableFormat(gameSessionId);
  setLevelCompletionTimes(gameSessionId);
  setDataVerbCount();
  setDataPieChartGamesStartedCompleted();

  if (gameSessionId === 'all')
    console.log('All game sessions selected');
  else
    console.log('Selected game session ID:', gameSessionId);
};

watch(selectedGameSession, async (newValue) => {
  loading.value = true;
  handleGameSessionChange(newValue);
  loading.value = false;
});

onMounted(async () => {
  formatGameSessionsForTable();
  console.log('formattedGameSessions:', formattedGameSessions.value);

  if (gameSessionOptions.value.length > 0) {
    let gameSessionSel = gameSessionOptions.value.find(gs => gs.sessionId == gameSessionsStore.selectedGameSessionId);
    if(gameSessionSel){
      selectedGameSession.value = gameSessionSel.sessionId;
    } else {
      selectedGameSession.value = gameSessionOptions.value[0].sessionId;
    }
  }

  await fetchDataFromMongoDB();
  
    // socket.on('newStatement', (updatedData) => { // Recibe record a record, no un array de records
    
    //   if (userType.value === 'teacher') {
    //     let actorFound = false;
    //     if (Array.isArray(originalData.value)) { // Comprueba si originalData es un array o no (sea vacio o con algo), lo hago con originalData porque es el que tiene TODOS los groups
    //       let group = undefined;
    //       group = originalData.value.find(item => item.groupId ===  updatedData.context.contextActivities.parent.id);
  
    //       if (group) {
    //         group.actors.forEach(actor => {
    //           if (actor.sessionKey === updatedData.context.extensions["https://www.jaxpi.com/sessionKey"]) { // Me viene de back deshaseada
    //             // Verifica que updatedData tiene la estructura esperada
    //             if (updatedData && updatedData.actor && updatedData.context && updatedData.object && updatedData.stored && updatedData.timestamp && updatedData.verb) {
    //               actor.statements.push(updatedData);
    //               actorFound = true;
    //               //console.log('Dato añadido al actor:', actor);
    //             } else {
    //               console.warn('updatedData tiene una estructura inesperada', updatedData);
    //             }
    //           }
    //         });
    //         if (!actorFound) { // Tengo que añadir el estudiante en su group por primera vez
    //           console.log("Este estudiante no corresponde a este group");
    //           let actor = {};
    //           actor.name = updatedData.context.extensions["https://www.jaxpi.com/studentName"];
    //           actor.sessionKey = updatedData.context.extensions["https://www.jaxpi.com/sessionKey"];
    //           actor.gameId = updatedData.context.extensions["https://www.jaxpi.com/gameId"];
    //           actor.gameName = updatedData.context.extensions["https://www.jaxpi.com/gameName"];
    //           actor.sessionId = updatedData.context.extensions["https://www.jaxpi.com/sessionId"];
    //           actor.sessionName = updatedData.context.extensions["https://www.jaxpi.com/sessionName"];
    //           actor.statements = [updatedData];
    //           group.actors.push(actor);
    //         } else {
    //           console.log('Datos actualizados en originalData:', originalData.value);
    //         }
    //       } else { // Si en originalData(primer fetch) no tengo ningun group, añado este nuevo group, o si hay groups, añado este group al resto
    //         console.log('No se encontró el group con groupId:', groupId);
    //         let newGroup = {};
    //         newGroup.groupId = updatedData.context.contextActivities.parent.id;
    //         if (groupId.value){
    //           newGroup.groupName = groupsStore.getGroupNameById(groupId);
    //         } else {
    //           newGroup.groupName = groupsStore.getGroupNameById(updatedData.context.contextActivities.parent.id);
    //         }
    //         newGroup.actors = [];
    //         let actor = {};
    //         actor.name = updatedData.context.extensions["https://www.jaxpi.com/studentName"];
    //         actor.sessionKey = updatedData.context.extensions["https://www.jaxpi.com/sessionKey"];
    //         actor.gameId = updatedData.context.extensions["https://www.jaxpi.com/gameId"];
    //         actor.gameName = updatedData.context.extensions["https://www.jaxpi.com/gameName"];
    //         actor.sessionId = updatedData.context.extensions["https://www.jaxpi.com/sessionId"];
    //         actor.sessionName = updatedData.context.extensions["https://www.jaxpi.com/sessionName"];
    //         actor.statements = [updatedData];
  
    //         newGroup.actors.push(actor);
    //         originalData.value.push(newGroup);
    //       }
    //     } else {
    //       console.warn('originalData no está definido o no es un array');
    //     }

    //   }
    // });
});
  
// onUnmounted(() => {
//   // Remove all socket listeners
//   socket.off('message');
//   socket.off('newStatement');
// });

const fetchDataFromMongoDB = async () => {
  try {
      const response = await axios.get('http://localhost:3000/records', {
        withCredentials: true
      });
      if (userType.value === 'teacher') {
        console.log('response.data studentDetails:', response.data);
        originalData.value = response.data;
      
      if (originalData.value.length === 0)
        console.log('No data');
      }
  } catch (error) {
      console.error('Error al obtener los datos de http://localhost:3000/records', error);
  }
};
  
watch(originalData, (newValue) => { // Actualizo filteredData segun originalData
  console.log(newValue);
  filteredDataByGroupId.value = newValue.filter(item => item.groupId === groupId.value);

  // FORMATEAR DATOS PARA CHARTS
  setDataTableFormat(selectedGameSession.value);
  setLevelCompletionTimes(selectedGameSession.value);
  setDataVerbCount();
  setDataPieChartGamesStartedCompleted();
    loading.value = false;
}, { deep: true });

// FORMATEAR DATOS PARA DATATABLE - LAST STATEMENT
function setDataTableFormat(gameSession){ // Recibo gameSessionId (all o sus ids...)
    if (filteredDataByGroupId.value.length > 0) {
      dataTableFormat.value = filteredDataByGroupId.value.flatMap(item => {
        if ( gameSession == 'all'){
          return item.actors.filter(e=> e.name == selectedStudent.value).map(actor => {
            // Ordenar los timestamps dentro de cada actor del más reciente al más antiguo
            let copyStatements = [...actor.statements];
            copyStatements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            // Comprueba si el actor tiene statements, si los tiene devuelve el primer timestamp que es el mas reciente, sino devuelve null
            const lastStatement = copyStatements.length > 0 ? copyStatements[0].timestamp : null;
            return {
              student: actor.name,
              session: actor.sessionName,
              game: actor.gameName,
              numberOfStatements: actor.statements.length,
              lastTimestamp: lastStatement
            };
          });
        } else { // Hemos elegido un gamesessionselect
          return item.actors.filter(e=> e.name == selectedStudent.value && e.sessionId === gameSession).map(actor => {
            let copyStatements = [...actor.statements];
            copyStatements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            const lastStatement = copyStatements.length > 0 ? copyStatements[0].timestamp : null;
            return {
              student: actor.name,
              session: actor.sessionName,
              game: actor.gameName,
              numberOfStatements: actor.statements.length,
              lastTimestamp: lastStatement
            };
          });
        }

      }).sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp)); // Sort by timestamp, from latest to oldest
    }  else {
      cleanData()
    }
}

// FORMATEAR DATOS PARA EL BARCHART - COMPLETION TIME PER LEVEL
function setLevelCompletionTimes(gameSession){ // Recibo gameSessionId (all o sus ids...)
  if (filteredDataByGroupId.value.length > 0) { // Pueden venir varios grupos
    if ( gameSession == 'all'){
      dataGroup.value = filteredDataByGroupId.value[0].actors.filter(e=> e.name == selectedStudent.value).map(actor => { // Proceso todos los actores
        let copyStatements = [...actor.statements]; // Hago una copia para que no salte el watch
        const sortedStatements = sortStatements(copyStatements);  // Por cada actor ordenamos sus statements
        const actorData = calculateForStatements(sortedStatements);
        return {
            actorName: actor.name,
            actorData: actorData
        };
      });
    } else {
      dataGroup.value = filteredDataByGroupId.value[0].actors.filter(e=> e.name == selectedStudent.value && e.sessionId === gameSession).map(actor => { // Proceso todos los actores
        let copyStatements = [...actor.statements]; // Hago una copia para que no salte el watch
        const sortedStatements = sortStatements(copyStatements);  // Por cada actor ordenamos sus statements
        const actorData = calculateForStatements(sortedStatements);
        return {
            actorName: actor.name,
            actorData: actorData
        };
      });
    }
    dataLevelCompletionTimes.value = [];
    dataGroup.value.forEach(actorInfo => {
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
  } else {
      cleanData()
    }
}

//PARA EL BARCHART - COUNTVERBS tiene q ser llamado despues de actualizar dataGroup
function setDataVerbCount(){ // Recibo gameSessionId (all o sus ids...)
  dataVerbCount.value = [];
  dataGroup.value.forEach(actorInfo => {
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
  dataVerbCount.value = dataVerbCount.value.sort((a, b) => b.value - a.value);
}

//PARA EL PIECHART - GAMES STARTED AND COMPLETED
function setDataPieChartGamesStartedCompleted(){ // Recibo gameSessionId (all o sus ids...)
  dataPieChartGamesStartedCompleted.value = [];
  dataGroup.value.forEach(actorInfo => {
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
          let countStarted = { nameObject: 'not completed', value: levels1.length - completeds14.length};
          let countCompleted = { nameObject: 'completed', value: completeds14.length};
          dataPieChartGamesStartedCompleted.value.push(countCompleted); 
          dataPieChartGamesStartedCompleted.value.push(countStarted); 
        }
    }
  });
}

function cleanData(){
  dataTableFormat.value = []; 
  dataLevelCompletionTimes.value = []; 
  dataGroup.value = []; 
  dataVerbCount.value = []; 
  dataPieChartGamesStartedCompleted.value = []; 
}
</script>

<style scoped>
.student-details-container {
  padding:1rem;
}

select {
  width: 100%;
  padding: 10px;
  border: 1px solid #b0eee4;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

 select:focus {
  border-color: #ffff00;
  outline: none;
  box-shadow: 0 0 5px rgba(246, 211, 101, 0.5);
}

.for-pie-student {
  width: 100%;
  place-content: center;
  gap: 22px;
  display: inline-grid;
  text-align: center;
}
</style>