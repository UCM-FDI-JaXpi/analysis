<template>
    <div class="student-game-session-key" v-if="session">
      <div class="card-details">
        <h1>{{ session.sessionName }}</h1>
        <p><strong>Game: </strong>{{ session.gameName }}</p>
        <p><strong>Created on: </strong>{{ new Date(session.createdAt).toLocaleDateString() }}</p>
        <p><strong>Your key: </strong>{{ session.key }}</p>
      </div>

      <div class="blueCard centerItems" v-if="isStatements">
        <div class="marginBottom90" style="align-self: center; width: 600px;">
          <BarChart v-if="dataLevelCompletionTimes.length > 0"
            :data="dataLevelCompletionTimes"
            chartId="bar-chart2"
            title="Completion time per level" />
        </div>
        <div class="marginBottom90" style="align-self: center; width: 600px;">
          <BarChart v-if="dataVerbCount.length > 0" 
            :data="dataVerbCount"
            chartId="bar-chart1"
            title="Verb count" /> 
        </div>
        <div class="marginBottom90">
          <PieChart v-if="dataPieChartGamesStartedCompleted.length > 0" 
            :data="dataPieChartGamesStartedCompleted"
            chartId="pie-chart1"
            title="Games started and completed" />
        </div>
      </div>
      <div v-if="!isStatements" class="blueCard no-data-charts">
          No data for this student.
      </div>
    </div>
</template>
<script setup>
import { useRoute } from 'vue-router';
import { computed, ref, watch, onMounted } from 'vue';
import { useGameSessionsStore } from '@/stores/gameSessionsStore';
import { useAuthStore } from '@/stores/authStore';

import { sortStatements, calculateForStatements } from '../../utils/utilities.js';

import axios from 'axios';
// import socket from '@/socket';
import BarChart from '@/components/BarChart.vue';
import PieChart from '@/components/PieChart.vue';

const route = useRoute();

// const groupsStore = useGroupsStore();
const authStore = useAuthStore(); // To use Pinia store (desestructuracion)
const gameSessionsStore = useGameSessionsStore();

// const groupId = computed(() => groupsStore.selectedGroupId); 
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

const isStatements = ref(false);

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
      if (userType.value === 'student') {
        console.log('response.data by student by gamesession:', response.data);
        originalData.value = response.data;
      
      if (originalData.value.length === 0)
        console.log('No data');
      }
    } catch (error) {
        console.error('Error al obtener los datos de http://localhost:3000/records', error);
    }
};
  
watch(originalData, (newValue) => { // Actualizo filteredData segun originalData
    filteredDataByGroupId.value = newValue;
    // FORMATEAR DATOS PARA CHARTS
    setLevelCompletionTimes();
    setDataVerbCount();
    setDataPieChartGamesStartedCompleted();
}, { deep: true });

// FORMATEAR DATOS PARA EL PRIMER BARCHART - COMPLETION TIME PER LEVEL
function setLevelCompletionTimes(){
  if (filteredDataByGroupId.value.length > 0) {
      dataGroup.value = filteredDataByGroupId.value[0].actors.filter(e=>e.sessionId === session.value.sessionId).map(actor => { // Proceso todos los actores
        let copyStatements = [...actor.statements]; // Hago una copia para que no salte el watch
        isStatements.value = true;
        const sortedStatements = sortStatements(copyStatements);  // Por cada actor ordenamos sus statements
        const actorData = calculateForStatements(sortedStatements);
        return {
            actorName: actor.name,
            actorData: actorData
        };
      });
    
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
</script>

<style scoped>
.student-game-session-key {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.no-data-message {
    text-align: center;
    color: #666;
    font-size: 1.125rem;
}
</style>