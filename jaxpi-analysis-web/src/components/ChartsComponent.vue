<template>
    <div class="charts-container">
      <div class="tabs">
        <button v-for="(tab, index) in tabs" :key="index" 
                  @click="activeTab = index" 
                  :class="{ 'active': activeTab === index }">
          {{ tab }}
        </button>
      </div>
      
      <div v-if="activeTab === 0" class="tab-content">
        <div v-if="dataTableFormat.length > 0" class="search-table">
          <FilterChartsComponent :data="arrayStudents" @selectElem="handleFilterNameStudent"/>
          <LineChart
            :data="dataStatementsByTimestamp"
            chartId="line-chart1"
            title="Statements by timestamp" />




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
          <p>No data available for this table.</p>
        </div>
      </div>
  
      <div v-if="activeTab === 1" class="tab-content">
        <BarChart v-if="dataLevelCompletionTimes.length > 0"
          :data="dataLevelCompletionTimes"
          chartId="bar-chart2"
          title="Completion time per level"
          :colorPalette="colorPalettes[1]" />
        
        <BarChart v-if="dataVerbCount.length > 0" 
          :data="dataVerbCount"
          chartId="bar-chart1"
          title="Verb count" /> 
  
        <PieChart v-if="dataPieChartGamesStartedCompleted.length > 0" 
          :data="dataPieChartGamesStartedCompleted"
          chartId="pie-chart1"
          title="Games started and completed" />
  
        <StackedBarChart v-if="dataAttemptsPerLevelPlayer.length > 0" 
          :data="dataAttemptsPerLevelPlayer"
          chartId="stacked-bar-chart1"
          title="Number of attempts per level REAL" />
      </div>
  
      <div v-if="activeTab === 2" class="tab-content">
        
      </div>
  
      <div v-if="activeTab === 3" class="tab-content">
        <!-- <BarChart :data=""
          chartId="bar-chart3"
          :title="'Playing time per level for ' + .player" /> -->
      </div>
    </div>
</template>
  
<script setup>
import { ref, computed, watch } from 'vue';
import { useGroupsStore } from '@/stores/groupsStore';

import BarChart from '../components/BarChart.vue';
import LineChart from '../components/LineChart.vue';
import StackedBarChart from '../components/StackedBarChart.vue';
import DataTable from '../components/DataTable.vue';
import PieChart from '@/components/PieChart.vue';
import FilterChartsComponent from '@/components/FilterChartsComponent.vue';

import { sortStatements } from '../utils/utilities.js';

const groupsStore = useGroupsStore();

const groupId = computed(() => groupsStore.selectedGroupId);
const arrayStudents = computed(() => groupsStore.getStudentsByGroupId(groupId.value).map(e => ({id:e, name:e})));

const tabs = ref(["Table", "Charts", "Line Charts", "Bar Charts"]);
const activeTab = ref(0);
const searchQueryTeacher = ref('');
const dataStatementsByTimestamp = ref([]);

const colorPalettes = [['#65DB1C'], ['#6B8CFF']];
const tableColumnsTeacher = ['student','session', 'game', 'numberOfStatements', 'lastTimestamp']
const dataTableColumnTitlesTeacher = {
  student: 'Students',
  session: 'Session',
  game: 'Game',
  numberOfStatements: 'Number of statements',
  lastTimestamp: 'Last statement send'
};

// eslint-disable-next-line
const props = defineProps({
  filteredDataByGroupId: Array,
  dataTableFormat: Array,
  dataLevelCompletionTimes: Array,
  verbCount: Object,
  dataVerbCount: Array,
  dataPieChartGamesStartedCompleted: Array,
  dataAttemptsPerLevelPlayer: Array,
});

const handleFilterNameStudent = async (data) => {
  let tempo = props.filteredDataByGroupId[0]?.actors /////////////////////////////////////////////APAÑO
    .filter(e => e.name === data)
    .flatMap(f => f.statements);

  if (!tempo.length) {
    // Si no hay datos, limpiar el array y salir
    dataStatementsByTimestamp.value = [];
    return;
  }

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
  // showCreateGroupForm.value = false;
  // createdGroup.value = groupData;
  // //llamada al back
  // // si todo ha ido bien
  // showConfirmationCreatedGroup.value = true;
  // //si ha ido mal
  // //showErrorCreatedGameSession.value = true;
};

watch(() => groupId.value, (newGroupId, oldGroupId) => {
  if (newGroupId !== oldGroupId) {
    dataStatementsByTimestamp.value = [];
  }
});

// function prepareDataForCharts(jsonData) {
//   return jsonData.map(entry => ({
//     nameObject: entry.name || entry.level || entry.date,
//     value: entry.value || entry.time || entry.score
//   }));
// }
</script>
  
<style>
  /* Style for the div app that comes by default */
#app {
  background-color: #bfdbf3;
}
  
#bar-chart1, #bar-chart2, #bar-chart3, #pie-chart1, #stacked-bar-chart1, #line-chart1 {
  background-color: rgba(255, 255, 255, 0.8);
  min-width: 510px; /* Por si la grafica tiene solo una barra en la grafica para que tenga como min un tamaño a cuando hay mas datos */
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
  gap: 50px; /* Espacio entre los elementos */
  padding: 10px;
  background-color: #79c1fd;
}

.search-table select {
  margin-bottom: 10px; /* Agrega espacio entre el select y el form */
}

.search-table form {
  margin-bottom: 10px; /* Agrega espacio entre el form y la tabla */
}
.filters {
  flex: 0 0 18%;
  overflow-y: auto;
}
</style>