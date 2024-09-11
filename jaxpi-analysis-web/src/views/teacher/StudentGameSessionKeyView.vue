<template>
    <div class="student-game-session-key" v-if="session">
      <div class="card-details">
        <h1>{{ session.sessionName }}</h1>
        <p><strong>Game: </strong>{{ session.gameName }}</p>
        <p><strong>Group: </strong>{{ groupName }}</p>
        <p><strong>Created on: </strong>{{ new Date(session.createdAt).toLocaleDateString() }}</p>
      </div>

      <div class="tabs-charts">
        <button v-for="(tab, index) in tabs" :key="index" 
                  @click="activeTab = index" 
                  :class="{ 'active': activeTab === index }">
          {{ tab }}
        </button>
      </div>

      <div v-if="activeTab === 0" class="tab-content-charts">
        <div class="centerItems" v-if="dataTableFormat.length > 0">
          <div v-if="dataTableFormat.length > 0" class="centerItems marginBottom90">
                  <h2>Last statements received</h2>
                  <form id="search">
                      Search <input name="query-teacher" v-model="searchQueryTeacher">
                  </form>
                  <DataTable
                      :data="dataTableFormat" 
                      :columns="tableColumnsTeacher"
                      :columnTitles="dataTableColumnTitlesTeacher"
                      :filter-key="searchQueryTeacher"
                      @student-selected="handleStudentSelected"/>
          </div>
          
          <!-- Primer filtro y chart (LineChart) -->
          <div class="chart-container-linechart marginBottom90">
            <div class="filter-container">
              <FilterChartsComponent 
                :data="arrayStudents"
                title="Filter by student"
                @selectElem="handleFilterNameStudent"/>
            </div>
            <div>
              <LineChart
                :data="dataStatementsByTimestamp"
                chartId="line-chart1"
                title="Statements by timestamp" />
            </div>
          </div>

          <!-- Segundo filtro y gráfico (BarChart) -->
          <div class="chart-container-barchart marginBottom90">
            <div class="filter-container">
              <FilterChartsComponent 
                :data="arrayStudents"
                title="Filter by student"
                @selectElem="handleFilterNameStudentBarChart"/>
                <!-- Filtro del filtro que se mostrará al seleccionar un student -->
                <div v-if="arrayLevelsPerStudent.length > 0">
                  <FilterChartsComponent 
                    :data="arrayLevelsPerStudent"
                    title="Filter by level"
                    :hasMargin="true"
                    @selectElem="handleFilterLevel"/>
                </div>
            </div>
            <div>
              <BarChart
                :data="dataAttemptTimesForStudentLevel "
                chartId="bar-chart10"
                title="Time per attempt (Student per level)" />
            </div>
          </div>

          <div class="marginBottom90">
            <PieChart v-if="dataPieChartGamesStartedCompleted.length > 0" 
                :data="dataPieChartGamesStartedCompleted"
                chartId="pie-chart1"
                title="Games started and completed" />
          </div>

          <div class="marginBottom90" style="align-self: center; width: 600px;" v-if="isStatements">
            <StackedBarChart v-if="dataObjectCount.length > 0"
                  :data="dataObjectCount"
                  chartId="stacked-bar-chart-interaction-items"
                  title="Interaction of items" />
          </div>

          <div class="marginBottom90" style="align-self: center; width: 900px;" v-if="isStatements">
            <StackedBarChart v-if="dataCompletedLevelsCount.length > 0"
                  :data="dataCompletedLevelsCount"
                  chartId="stacked-bar-chart-number-completed-levels"
                  title="Number of completed levels by student" />
          </div>
        </div>
        <div v-else class="no-data-charts">
            No data for these students.
        </div>
      </div>

      <div v-if="activeTab === 1" class="tab-content-charts">
        <div class="centerItems" v-if="dataTableFormat.length > 0">
          <div class="marginBottom90">
            <BarChart v-if="dataBestCompletionTimePerLevel.length > 0"
              :data="dataBestCompletionTimePerLevel"
              chartId="bar-chart4"
              title="Best completion time per level" 
              :customTooltip="true"/>
          </div>
          <div class="marginBottom90" >
            <BarChart v-if="dataLevelCompletionTimes.length > 0"
              :data="dataLevelCompletionTimes"
              chartId="bar-chart2"
              title="Completion time per level" />
          </div>
        </div>
        <div v-else class="no-data-charts">
            No data for these students.
        </div>
      </div>

      <div v-if="activeTab === 2" class="tab-content-charts">
        <div class="centerItems" v-if="dataTableFormat.length > 0">
          <div class="marginBottom90" >
            <BarChart v-if="dataVerbCount.length > 0" 
              :data="dataVerbCount"
              chartId="bar-chart-verb-count"
              title="Verb count" /> 
          </div>
        </div>
        <div v-else class="no-data-charts">
            No data for these students.
        </div>
      </div>
    </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useGroupsStore } from '@/stores/groupsStore';
import { useGameSessionsStore } from '@/stores/gameSessionsStore';
import { useAuthStore } from '@/stores/authStore';
import { useStudentStore } from '@/stores/studentStore';

import { sortStatements, calculateForStatements, calculateLevelCompletionTimes } from '../../utils/utilities.js';

import axios from 'axios';
import socket from '@/socket';
import DataTable from '@/components/DataTable.vue';
import BarChart from '@/components/BarChart.vue';
import PieChart from '@/components/PieChart.vue';
import StackedBarChart from '@/components/StackedBarChart.vue';
import FilterChartsComponent from '@/components/FilterChartsComponent.vue';
import LineChart from '@/components/LineChart.vue';

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
const tableColumnsTeacher = ['studentOriginal','key', 'numberOfStatements', 'lastTimestamp', 'view']
const dataTableColumnTitlesTeacher = {
    studentOriginal: 'Student',
    key: 'Key',
    numberOfStatements: 'Number of statements',
    lastTimestamp: 'Last statement received',
    view:''
};

const tabs = ref(["Overview", "Completion Times", "Verb count"]);
const activeTab = ref(0);

const arrayStudents = computed(() => groupsStore.getStudentsByGroupId(groupId.value).map(e => ({id:e, name:e.slice(0, -6)}))); // Para los filtros
const dataStatementsByTimestamp = ref([]);
const dataFirstFilter  = ref([]);

const arrayLevelsPerStudent = ref([]);// Para el segundo los filtro
const dataAttemptTimesForStudentLevel  = ref([]);
const name  = ref([]);
const dataBestCompletionTimePerLevel = ref([]);

onMounted(async () => {
    if (gameSessionsStore.gameSessions.length === 0) { // Si los datos de gameSessions no están cargados, los cargo
        await gameSessionsStore.fetchGameSessions();
    }
    await fetchDataFromMongoDB();

    socket.on('newStatement', (updatedData) => { // Recibe record a record, no un array de records
    if (userType.value === 'teacher' && updatedData.context.extensions["https://www.jaxpi.com/sessionId"] === session.value.sessionId) {
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

const handleFilterNameStudent = async (data) => { //datagroup no esta filtrada por la session
  dataFirstFilter.value = data;

  if ( filteredDataByGroupId.value.length == 0 ||  filteredDataByGroupId.value[0].groupId != groupId.value){
    dataStatementsByTimestamp.value = [];
    return;
  }
  let tempo = filteredDataByGroupId.value[0]?.actors /////////////////////////////////////////////
    .filter(e => e.name === data && e.sessionId == session.value.sessionId)
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
};

const handleFilterNameStudentBarChart = async (studentName) => { // Recibo el studentName de Filter, datagroup no esta filtrada por la session
  name.value = studentName;
  arrayLevelsPerStudent.value = [];
  dataAttemptTimesForStudentLevel.value = [];

  if (filteredDataByGroupId.value.length == 0 || filteredDataByGroupId.value[0].groupId != groupId.value){
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
};

const handleFilterLevel = async (levelData) => { // 'level1//ana xyz', datagroup no esta filtrada por la session
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
  setBestCompletionTimePerLevel();
  handleFilterNameStudentBarChart(name.value);
  handleFilterNameStudent(dataFirstFilter.value);
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
              studentOriginal: actor.name.slice(0,-6),
              numberOfStatements: actor.statements.length,
              lastTimestamp: lastStatement,
              view: true
            };
          });
      }).sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp)); // Sort by timestamp, from latest to oldest

      session.value.students.forEach(student => {
        let reg = dataTableFormat.value.find( e => e.student=== student.name);
        if(reg){
          reg.key=student.key;
          reg.view = true;
        } else {
          let obj = {
              student: student.name,
              studentOriginal: student.name.slice(0,-6),
              numberOfStatements: 0,
              lastTimestamp: null,
              key: student.key,
              view: false
            };
            dataTableFormat.value.push(obj); 
        }
        
      });
    }  else {
      cleanData()
    }
}

// MEJOR TIEMPO POR NIVEL DE LA GAME SESSION
function setBestCompletionTimePerLevel (){
  dataBestCompletionTimePerLevel.value = [];
        dataGroup.value.forEach(actorInfo => {
          const keys = Object.keys(actorInfo.actorData).filter(key => key.includes('level') && key != 'level 15' && actorInfo.actorData[key].length > 0); // [ 'level1','level2', ...] menos el level 15 y los levels que no tienen tiempos de completado
          if(keys){
            keys.forEach(key => {
                if (dataBestCompletionTimePerLevel.value.find(e => e.nameObject == key)) {
                  let resTempo = dataBestCompletionTimePerLevel.value.find(e => e.nameObject == key);
                  let minTime;
                  let times = actorInfo.actorData[key];
                    if (times.length > 0){
                      minTime = Math.min(...times);
                      if ( minTime < resTempo.value){
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
                    dataBestCompletionTimePerLevel.value.push(level);
                }
            });
          }
        }); 
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
      let objInteraction = {nameObject : actorInfo.actorName.slice(0, -6), interactions: objects};
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
        nameObject: actorInfo.actorName.slice(0, -6),
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
  groupsStore.setSelectedGroupId(groupId.value); // Seteo el group seleccionado
  studentStore.setSelectedStudent(student.student); // Seteo el name del estudiante
  router.push({ name: 'StudentDetailsView', params: { name: student.student} })// Go to StudentGameSessionDetailsView using useRouter
}
</script>

<style scoped>
.student-game-session-key {
    padding: 1rem;
    display: flex;
    flex-direction: column;
}
</style>