<template>
    <div class="student-game-session-key-by-student" v-if="session">
      <div class="card-details">
        <h1>{{ session.sessionName }}</h1>
        <p><strong>Game: </strong>{{ session.gameName }}</p>
        <p><strong>Created on: </strong>{{ new Date(session.createdAt).toLocaleDateString() }}</p>
        <p><strong>Your key: </strong>{{ session.key }}</p>
      </div>

      <div class="tabs-charts">
        <button v-for="(tab, index) in tabs" :key="index" 
                  @click="activeTab = index" 
                  :class="{ 'active': activeTab === index }">
          {{ tab }}
        </button>
      </div>

      <div v-if="activeTab === 0" class="tab-content-charts">
        <div class="centerItems" v-if="isStatements">
          <div class="marginBottom90">
            <PieChart v-if="dataPieChartGamesStartedCompleted.length > 0" 
              :data="dataPieChartGamesStartedCompleted"
              chartId="pie-chart1"
              title="Games started and completed" />
          </div>

          <div class="chart-container-linechart marginBottom90">
              <LineChart
                :data="dataStatementsByTimestamp"
                chartId="line-chart1"
                title="Statements by timestamp" />
          </div>

          <!-- Filtro y gráfico (BarChart) -->
          <div class="chart-container-barchart marginBottom90">
            <div v-if="arrayLevelsPerStudent.length > 0" class="filter-container">
              <FilterChartsComponent 
                :data="arrayLevelsPerStudent"
                title="Filter by level"
                @selectElem="handleFilterLevel"/>
            </div>
            <div>
              <BarChart
                :data="dataAttemptTimesForStudentLevel"
                chartId="bar-chart10"
                title="Time per Attempt (Student per Level)" />
            </div>
          </div>











        </div>
        <div v-if="!isStatements" class="no-data-charts">
          No data for this student.
        </div>
      </div>

      <div v-if="activeTab === 1" class="tab-content-charts">
        <div class="marginBottom90">
          <BarChart v-if="dataBestCompletionTimePerLevelPerGroup.length > 0"
            :data="dataBestCompletionTimePerLevelPerGroup"
            chartId="bar-chart4"
            title="Your best completion time per level" 
            :customTooltip="true"/>
        </div>

        <div class="marginBottom90" style="align-self: center; width: 600px;">
          <BarChart v-if="dataLevelCompletionTimes.length > 0"
            :data="dataLevelCompletionTimes"
            chartId="bar-chart2"
            title="Completion time per level" />
        </div>
      </div>

      <div v-if="activeTab === 2" class="tab-content-charts">
        <div class="marginBottom90" style="align-self: center; width: 600px;">
          <BarChart v-if="dataVerbCount.length > 0" 
            :data="dataVerbCount"
            chartId="bar-chart1"
            title="Verb count" /> 
        </div>
      </div>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { computed, ref, watch, onMounted } from 'vue';
import { useGameSessionsStore } from '@/stores/gameSessionsStore';
import { useAuthStore } from '@/stores/authStore';
import { useGroupsStore } from '@/stores/groupsStore.js';

import { sortStatements, calculateForStatements, calculateLevelCompletionTimes } from '../../utils/utilities.js';

import axios from 'axios';
// import socket from '@/socket';
import BarChart from '@/components/BarChart.vue';
import PieChart from '@/components/PieChart.vue';
import LineChart from '@/components/LineChart.vue';
import FilterChartsComponent from '@/components/FilterChartsComponent.vue';

const route = useRoute();
const authStore = useAuthStore(); // To use Pinia store (desestructuracion)
const gameSessionsStore = useGameSessionsStore();
const groupsStore = useGroupsStore();

const userType = computed(() => authStore.userType);
const studentName = authStore.userData.name;
const session = computed(() => {
    const gameSessionId = route.params.gameSessionId;
    return gameSessionsStore.getGameSessionById(gameSessionId);
});

const tabs = ref(["Overview", "Completion Times", "Verb count"]);
const activeTab = ref(0);

const originalData = ref([]); // Guardo todo lo que me da response.data
const dataTableFormat = ref([]); // De filteredDataByGroupId preparo bien los campos de la tabla y se lo paso a DataTable
const filteredDataByGroupId = ref([]); // Datos del filtrados por groupID de originalData
const dataLevelCompletionTimes = ref([]);
const dataBestCompletionTimePerLevelPerGroup = ref([]);
const dataGroup = ref([]);
const dataVerbCount = ref([]);
const dataPieChartGamesStartedCompleted = ref([]);
const isStatements = ref(false);
const dataStatementsByTimestamp = ref([]);
const dataAttemptTimesForStudentLevel = ref([]);
const arrayLevelsPerStudent = ref([]);// Para el filtro
const name = ref([]);



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
    setBestCompletionTimePerLevel();
    setDataVerbCount();
    setDataPieChartGamesStartedCompleted();
    getDataStatementsByTimestamp(studentName);
    getArrayLevelsPerStudent(studentName)
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
// PARA BARCHART DEL TAB COMPLETION TIME (el mejor tiempo por nivel de la game session)
function setBestCompletionTimePerLevel (){
  dataBestCompletionTimePerLevelPerGroup.value = [];
  dataGroup.value.forEach(actorInfo => {
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

//PARA LINECHART - STATEMENTS BY TIMESTAMP
function getDataStatementsByTimestamp(studentName) {
    if ( filteredDataByGroupId.value.length == 0 ||  filteredDataByGroupId.value[0].groupId != groupsStore.selectedGroupId){
    dataStatementsByTimestamp.value = [];
    return;
  }
  let tempo = filteredDataByGroupId.value[0]?.actors
    .filter(e => e.name === studentName && e.sessionId == session.value.sessionId)
    .flatMap(f => f.statements);
  sortStatements(tempo);

  let res = [];
  tempo.forEach(statement => {
    let val = res.find( e => e.nameObject == new Date(statement.timestamp).toLocaleDateString())
    if (val){
      val.value++;
    } else {
      let obj = {
        nameObject: new Date(statement.timestamp).toLocaleDateString(),
        originalTimestamp: new Date(statement.timestamp),
        value: 1
      };
      res.push(obj);
    }
  });

  if (res.length > 0 ) {
    // Poner las fechas en las que no hubo statements a value = 0
    let minDate = res[0].originalTimestamp;
    let maxDate = res[res.length - 1].originalTimestamp;
    let resta = maxDate - minDate;

    const diffDays = Math.ceil(resta / (1000 * 60 * 60 * 24)); // Convertir milisegundos a días

    let dateInitial = new Date(minDate); // 08/12/2024
    let copyArray = [];

    for (let i = 0; i <= diffDays; i++) {
      if (res.find( e=> e.nameObject == dateInitial.toLocaleDateString())){
        copyArray.push(res.find( e => e.nameObject == dateInitial.toLocaleDateString()));
      } else {
        let obj = { // No le pongo el campo timestamp porque realmente en esa fecha no hubo statements, es para dibuarlo en el chart
            nameObject: dateInitial.toLocaleDateString(),
            value: 0
          };
          copyArray.push(obj);
      }
      dateInitial.setDate(dateInitial.getDate() + 1);
    }

    // Quitar si existe un dia mas que la fecha actual, para que se muestre consistente
    let today = new Date();
    today = today.getDate();
    const [day, month, year] = copyArray[copyArray.length-1].nameObject.split('/').map(Number);
    let date = new Date(year, month - 1, day); // Los meses en js son 0-indexados, por eso restamos 1
    date = date.getDate();
    if (date - today > 0) {
      copyArray.pop();
    }
    dataStatementsByTimestamp.value = copyArray; // Array con todos los dias entre el primer statement y el ultimo, con su nº de statements
  } else {
    dataStatementsByTimestamp.value = [];
  }
}

function getArrayLevelsPerStudent(studentName) {
  name.value = studentName;
  arrayLevelsPerStudent.value = [];
  dataAttemptTimesForStudentLevel.value = [];

  if (filteredDataByGroupId.value.length == 0 || filteredDataByGroupId.value[0].groupId != groupsStore.selectedGroupId){
    dataAttemptTimesForStudentLevel.value = [];
    return;
  }

  dataGroup.value = calculateLevelCompletionTimes(filteredDataByGroupId.value[0]);
  let resLevels = [];
  dataGroup.value.filter( e => e.actorName == studentName && e.sessionId == session.value.sessionId).forEach(actorInfo => {
      const keys = Object.keys(actorInfo.actorData).filter(key => key.includes('level') && key != 'level 15' && actorInfo.actorData[key].length > 0); // [ 'level1','level2', ...] menos el level 15 y los levels que no tienen tiempos de completado
      if(keys){
        resLevels.push(keys);
      }
    }); 

  resLevels = [...new Set(resLevels.flat())];

  console.log(resLevels);
  let res = [];
  resLevels.forEach(level => {
    let obj = {
        id: level+'//'+studentName,
        name: level,
      };
      res.push(obj);
    }); 
  arrayLevelsPerStudent.value = res;
}

const handleFilterLevel = async (levelData) => { // 'level1//ana xyz'
  let finalData =[];
  let level = levelData.split('//')[0];
  let studentName = levelData.split('//')[1];
  let resTempo = [];
  dataGroup.value.filter( e => e.actorName == studentName && e.sessionId == session.value.sessionId).forEach(actorInfo => {
    if(actorInfo.actorData[level]){
      resTempo.push(actorInfo.actorData[level]);
    }
  }); 
  resTempo = resTempo.flat();
  let cont = 0;
  resTempo.forEach(attemp => {
      let obj = {
        nameObject: 'Attempt ' + cont,
        value: attemp,
      };
      cont++;
      finalData.push(obj);
  });
  dataAttemptTimesForStudentLevel.value = finalData;
};

function cleanData(){
    dataTableFormat.value = []; 
    dataLevelCompletionTimes.value = []; 
    dataGroup.value = []; 
    dataVerbCount.value = []; 
    dataPieChartGamesStartedCompleted.value = []; 
}
</script>

<style scoped>
.student-game-session-key-by-student {
    padding: 1rem;
    display: flex;
    flex-direction: column;
}
</style>