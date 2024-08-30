<template>
    <div class="charts-container">      
      <!-- <div v-if="activeTab === 0" class="tab-content-charts"> ----------------------------------OVERVIEW TAB -->
        <div class="centerItems" v-if="dataTableFormat.length > 0">
          
          <div class="datatable-charts">
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

          <!-- Primer chart (LineChart) -->
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

          <div style="margin-top: 90px;">
            <PieChart v-if="dataPieChartGamesStartedCompleted.length > 0" 
              :data="dataPieChartGamesStartedCompleted"
              chartId="pie-chart1"
              title="Games started and completed" />
          </div>
        </div>
        <div v-else class="no-data-charts">
          <p>No data available for this student.</p>
        </div>
      <!-- </div> -->
  
      <!-- <div v-if="activeTab === 1" class="tab-content-charts "> ----------------------------------COMPLETION TIMES TAB -->
        <div class="centerItems"  v-if="dataTableFormat.length > 0">
          <div class="marginBottom90">
            <BarChart v-if="dataBestCompletionTimePerLevelPerGroup.length > 0"
              :data="dataBestCompletionTimePerLevelPerGroup"
              chartId="bar-chart4"
              title="Your best completion time per level" 
              :customTooltip="true"/>
          </div>
          <div>
            <BarChart v-if="dataLevelCompletionTimes.length > 0"
              :data="dataLevelCompletionTimes"
              chartId="bar-chart2"
              title="Your average completion time per level"
              :colorPalette="colorPalettes[1]" />
          </div>
        </div>
        <div v-else class="no-data-charts">
          <p>No data available for this student.</p>
        </div>
      <!-- </div> -->

      <!-- <div v-if="activeTab === 2" class="tab-content.charts centerItems"> -----------------------------------VERB COUNTS TAB -->
        <div v-if="dataTableFormat.length > 0">
          <BarChart v-if="dataVerbCount.length > 0" 
            :data="dataVerbCount"
            chartId="bar-chart1"
            title="Verb count" /> 
        </div>
        <div v-else class="no-data-charts">
          <p>No data available for this student.</p>
        </div>
      <!-- </div> -->
    </div>
</template>
  
<script setup>
import { ref, watch, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore'
import BarChart from '@/components/BarChart.vue';
import LineChart from '@/components/LineChart.vue';
import DataTable from '@/components/DataTable.vue';
import PieChart from '@/components/PieChart.vue';
import FilterChartsComponent from '@/components/FilterChartsComponent.vue';

import { calculateLevelCompletionTimes, sortStatements } from '@/utils/utilities.js';

const authStore = useAuthStore();
const studentName = authStore.userData.name;

const searchQueryTeacher = ref('');
const dataStatementsByTimestamp = ref([]);
const dataAttemptTimesForStudentLevel  = ref([]);
const dataGroup = ref([]);
const name = ref([]);
const arrayLevelsPerStudent = ref([]);// Para el filtro

const colorPalettes = [['#65DB1C'], ['#6B8CFF']];
const tableColumnsTeacher = ['student','session', 'game', 'numberOfStatements', 'lastTimestamp']
const dataTableColumnTitlesTeacher = {
  student: 'Students',
  session: 'Session',
  game: 'Game',
  numberOfStatements: 'Number of statements',
  lastTimestamp: 'Last statement received'
};

// eslint-disable-next-line
const props = defineProps({
  groupId: String,
  filteredDataByGroupId: Array,
  dataTableFormat: Array,
  dataLevelCompletionTimes: Array,
  dataVerbCount: Array,
  dataPieChartGamesStartedCompleted: Array,
  dataBestCompletionTimePerLevelPerGroup: Array,
  dataAttemptTimesForStudentLevel: Array
});

onMounted(() => {
  getDataStatementsByTimestamp(studentName);
  getArrayLevelsPerStudent(studentName);
});

watch(() => props.filteredDataByGroupId,(newProps, oldProps) => {
  if (newProps !== oldProps) {
    getDataStatementsByTimestamp(studentName);
    getArrayLevelsPerStudent(studentName);
  }
});

function getDataStatementsByTimestamp(studentName) {
    if ( props.filteredDataByGroupId.length == 0 ||  props.filteredDataByGroupId[0].groupId != props.groupId){
    dataStatementsByTimestamp.value = [];
    return;
  }
  let tempo = props.filteredDataByGroupId[0]?.actors
    .filter(e => e.name === studentName)
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

  if (props.filteredDataByGroupId.length == 0 ||  props.filteredDataByGroupId[0].groupId != props.groupId){
    dataAttemptTimesForStudentLevel.value = [];
    return;
  }

  dataGroup.value = calculateLevelCompletionTimes(props.filteredDataByGroupId[0]);
  let resLevels = [];
  dataGroup.value.filter( e => e.actorName == studentName).forEach(actorInfo => {
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
  dataGroup.value.filter( e => e.actorName == studentName).forEach(actorInfo => {
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
</script>
  
<style scoped>
#bar-chart1, #bar-chart2, #bar-chart3, #bar-chart4, #bar-chart10,
#pie-chart1,
#line-chart1,
#stacked-bar-chart1 {
  background-color: rgba(255, 255, 255, 0.8);
  min-width: 110px; /* Por si la grafica tiene solo una barra en la grafica para que tenga como min un tamaño a cuando hay mas datos */
}

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

form#search {
  margin-bottom: 1rem;
}
</style>