<template>
    <div class="student-game-session-key" v-if="session">
      <div class="card-details">
        <h1>{{ session.sessionName }}</h1>
        <p><strong>Game: </strong>{{ session.gameName }}</p>
        <p><strong>Group: </strong>{{ groupName }}</p>
        <p><strong>Created on: </strong>{{ new Date(session.createdAt).toLocaleDateString() }}</p>
      </div>

      <div class="blueCard centerItems">
        <div class="marginBottom90" style="display: flex; gap:15%;">
          <div>
            <h2 style="text-align: center;">Students</h2>
            <BaseTable 
                :headers="['Name', 'Key','']"
                :rows="session.students"
                :rowKeys="['name', 'key','view']"
                @student-selected="handleStudentSelected" />
          </div>  
          <div>
            <PieChart v-if="dataPieChartGamesStartedCompleted.length > 0" 
                :data="dataPieChartGamesStartedCompleted"
                chartId="pie-chart1"
                title="Games started and completed" />
          </div>
        </div>

        <div class="marginBottom90"  style="align-self: center; width: 600px;" v-if="isStatements">
          <StackedBarChart v-if="dataObjectCount.length > 0"
                :data="dataObjectCount"
                chartId="stacked-bar-chart2"
                title="Interaction of items" />
        </div>

        <div class="marginBottom90"  style="align-self: center; width: 900px;" v-if="isStatements">
          <StackedBarChart v-if="dataCompletedLevelsCount.length > 0"
                :data="dataCompletedLevelsCount"
                chartId="stacked-bar-chart1"
                title="Number of completed levels by student" />
        </div>

        <div  v-if="dataTableFormat.length > 0" class="centerItems marginBottom90">
                <h2>Last statements received</h2>
                <form id="search">
                    Search <input name="query-teacher" v-model="searchQueryTeacher">
                </form>
                <DataTable
                    :data="dataTableFormat" 
                    :columns="tableColumnsTeacher"
                    :columnTitles="dataTableColumnTitlesTeacher"
                    :filter-key="searchQueryTeacher"/>
        </div>
        <div v-else>
            No data for this student.
        </div>

        <div class="marginBottom90" >
          <BarChart v-if="dataLevelCompletionTimes.length > 0"
                :data="dataLevelCompletionTimes"
                chartId="bar-chart2"
                title="Completion time per level" />
        </div>

        <div class="marginBottom90" >
          <BarChart v-if="dataVerbCount.length > 0" 
                :data="dataVerbCount"
                chartId="bar-chart1"
                title="Verb count" /> 
        </div>
      </div>
 
    </div>
</template>
<script setup>
import { useRoute, useRouter } from 'vue-router';
import { computed, ref, watch, onMounted } from 'vue';
import { useGroupsStore } from '@/stores/groupsStore';
import { useGameSessionsStore } from '@/stores/gameSessionsStore';
import { useAuthStore } from '@/stores/authStore';
import { useStudentStore } from '@/stores/studentStore';

import { sortStatements, calculateForStatements } from '../../utils/utilities.js';

import axios from 'axios';
// import socket from '@/socket';
import BaseTable from '@/components/BaseTable.vue';
import DataTable from '@/components/DataTable.vue';
import BarChart from '@/components/BarChart.vue';
import PieChart from '@/components/PieChart.vue';
import StackedBarChart from '@/components/StackedBarChart.vue';

const route = useRoute();
const router = useRouter(); // To navigate from one tab to another

const groupsStore = useGroupsStore();
const authStore = useAuthStore(); // To use Pinia store (desestructuracion)
const studentStore = useStudentStore();
const gameSessionsStore = useGameSessionsStore();

const groupId = computed(() => groupsStore.selectedGroupId); 
const groupName = computed(() => groupsStore.getGroupNameById(groupId.value));
const userType = computed(() => authStore.userType);
const session = computed(() => {
    const gameSessionId = route.params.gameSessionId;
    return gameSessionsStore.getGameSessionById(gameSessionId);
});

const originalData = ref([]); // Guardo todo lo que me da response.data
const dataTableFormat = ref([]); // De filteredDataByGroupId preparo bien los campos de la tabla y se lo paso a DataTable
const filteredDataByGroupId = ref([]); // Datos del filtrados por groupID de originalData
const dataLevelCompletionTimes = ref([]);
const dataGroup = ref([]);
const dataVerbCount = ref([]);
const dataPieChartGamesStartedCompleted = ref([]);

const dataCompletedLevelsCount = ref([]);
const dataObjectCount = ref([]);

const isStatements = ref('false');
const searchQueryTeacher = ref('')
const tableColumnsTeacher = ['student', 'numberOfStatements', 'lastTimestamp']
const dataTableColumnTitlesTeacher = {
    student: 'Students',
    numberOfStatements: 'Number of statements',
    lastTimestamp: 'Last statement send'
};

onMounted(async () => {
    if (gameSessionsStore.gameSessions.length === 0) { // Si los datos de gameSessions no están cargados, los cargo
        await gameSessionsStore.fetchGameSessions();
    }
    await fetchDataFromMongoDB();
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
  setDataTableFormat();
  setLevelCompletionTimes();
  setDataVerbCount();
  setDataPieChartGamesStartedCompleted();
}, { deep: true });

// FORMATEAR DATOS PARA DATATABLE - LAST STATEMENT
function setDataTableFormat(){
    if (filteredDataByGroupId.value.length > 0) {
      dataTableFormat.value = filteredDataByGroupId.value.flatMap(item => {
          return item.actors.filter(e=> e.sessionId === session.value.sessionId).map(actor => {
            let copyStatements = [...actor.statements];
            isStatements.value = copyStatements.length > 0;
            copyStatements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            const lastStatement = copyStatements.length > 0 ? copyStatements[0].timestamp : null;
            return {
              student: actor.name,
              numberOfStatements: actor.statements.length,
              lastTimestamp: lastStatement
            };
          });
      }).sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp)); // Sort by timestamp, from latest to oldest
    }  else {
      cleanData()
    }
}

// FORMATEAR DATOS PARA EL PRIMER BARCHART - COMPLETION TIME PER LEVEL
function setLevelCompletionTimes(){
  if (filteredDataByGroupId.value.length > 0) { // Pueden venir varios grupos
    
    dataGroup.value = filteredDataByGroupId.value[0].actors.filter(e => e.sessionId === session.value.sessionId).map(actor => { // Proceso todos los actores
      let copyStatements = [...actor.statements]; // Hago una copia para que no salte el watch
      const sortedStatements = sortStatements(copyStatements);  // Por cada actor ordenamos sus statements
      const actorData = calculateForStatements(sortedStatements);
      return {
          actorName: actor.name,
          actorData: actorData
      };
    });
    
    dataLevelCompletionTimes.value = [];
    let res = []
    let resInteractions = [];

    let objects = [...new Set(dataGroup.value.flatMap( e => e.actorData.interactions.map( f => f.object)))]; 
    dataGroup.value.forEach(actorInfo => {
      let objInteraction = {nameObject : actorInfo.actorName, interactions: objects};
      let info = [];
      objects.forEach(element => {
        let interaction = actorInfo.actorData.interactions.find( e => e.object == element);
        if  (interaction){
          info.push(interaction.count);
        } else {
          info.push(0);
        }
        
      });
      objInteraction.value = info;
      resInteractions.push(objInteraction);
      ///////////////////////////////////////////////////////////////
      let obj = {
        nameObject: actorInfo.actorName,
        value: actorInfo.actorData.countCompletedLevel  //[]
      };
      res.push(obj);
      /////////////////////////////////////////////////////////
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
    dataCompletedLevelsCount.value = res;
    dataObjectCount.value = resInteractions;
  } else {
      cleanData()
    }
}

//PARA EL SEGUNDO BARCHART - COUNTVERBS tiene q ser llamado despues de actualizar dataGroup
function setDataVerbCount(){
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
}

//PARA EL PRIMER PIECHART - GAMES STARTED AND COMPLETED
function setDataPieChartGamesStartedCompleted(){
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
          let countStarted = { nameObject: 'started', value: levels1.length - completeds14.length};
          let countCompleted = { nameObject: 'completed', value: completeds14.length};
          dataPieChartGamesStartedCompleted.value.push(countStarted); 
          dataPieChartGamesStartedCompleted.value.push(countCompleted); 
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

function handleStudentSelected(student) { // When you click on a row in the table selecting a student
    studentStore.setSelectedStudent(student.name); // Seteo el name del estudiante
    router.push({ name: 'StudentGameSessionDetailsView' }) // Go to StudentGameSessionDetailsView using useRouter
}
</script>

<style scoped>
/* .blueCard {
  background-color: #A8D8FF;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    display: flex;
    flex-direction: column;
    border: 1px solid #ddd;
    margin-bottom: 20px;
    max-width: 1300px;
} */

.student-game-session-key {
    padding: 1rem;
    display: flex;
    flex-direction: column;
}
/* 
.student-game-session-key-details {
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 62%;
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd; 
  margin-bottom: 20px;
}

.student-game-session-key-details h1 {
  margin-top: 10px;
}

.student-game-session-key-details p {
  margin-top: 0px;
  margin-bottom: 10px; 
}

.student-game-session-key-details p strong {
  color: #3498db;
} */
</style>