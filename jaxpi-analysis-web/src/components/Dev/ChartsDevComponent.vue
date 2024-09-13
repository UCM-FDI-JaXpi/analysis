<template>
    <div class="charts-container">
      <div class="tabs">
        <button v-for="(tab, index) in tabs" :key="index" 
                  @click="activeTab = index" 
                  :class="{ 'active': activeTab === index }">
          {{ tab }}
        </button>
      </div>
      
      <div v-if="activeTab === 0" class="tab-content-charts centerItems" style="min-height: 445px;"> <!------------------------------------OVERVIEW TAB-->
        <div class="centerItems" v-if="dataPieChartGamesStartedCompleted.length > 0 || dataObjectCount.length > 0">
          <div class="marginBottom90">
            <PieChart v-if="dataPieChartGamesStartedCompleted.length > 0" 
              :data="dataPieChartGamesStartedCompleted"
              chartId="pie-chart-completed-game"
              title="Completed the game" />
          </div>
          <div class="marginBottom90">
            <BarChart v-if="dataObjectCount.length > 0"
              :data="dataObjectCount"
              chartId="bar-chart-interactions-items"
              title="Interactions of items" />
          </div>
        </div>
        <div v-else class="no-data-charts">
          <p>No data available.</p>
        </div>
      </div>
  
      <div v-if="activeTab === 1" class="tab-content-charts centerItems" style="min-height: 445px;"> <!------------------------------------COMPLETION TIMES TAB-->
        <div class="centerItems" v-if="dataBestCompletionTimePerLevelPerGroup.length > 0 || dataLevelCompletionTimes.length > 0">
          <div class="marginBottom90">
            <BarChart v-if="dataBestCompletionTimePerLevelPerGroup.length > 0"
              :data="dataBestCompletionTimePerLevelPerGroup"
              chartId="bar-chart4"
              title="Best completion time per level" />
          </div>
          <div class="marginBottom90">
            <BarChart v-if="dataLevelCompletionTimes.length > 0"
              :data="dataLevelCompletionTimes"
              chartId="bar-chart2"
              title="Completion time per level"
              :colorPalette="colorPalettes[1]" />
          </div>
        </div>
        <div v-else class="no-data-charts">
          <p>No data available.</p>
        </div>
      </div>
      <div v-if="activeTab === 2" class="tab-content-charts centerItems" style="min-height: 445px;"> <!-------------------------------------VERB COUNTS TAB-->
        <div v-if="dataVerbCount.length > 0" class="marginBottom90">
          <BarChart v-if="dataVerbCount.length > 0" 
            :data="dataVerbCount"
            chartId="bar-chart-verb-count"
            title="Verb count" /> 
        </div>
        <div v-else class="no-data-charts">
          <p>No data available.</p>
        </div>
      </div>
    </div>
</template>
  
<script setup>
import { ref, computed, watch } from 'vue';
import { useGroupsStore } from '@/stores/groupsStore';
import BarChart from '@/components/BarChart.vue';
import PieChart from '@/components/PieChart.vue';

import { calculateLevelCompletionTimes, sortStatements } from '@/utils/utilities.js';

const groupsStore = useGroupsStore();

const groupId = computed(() => groupsStore.selectedGroupId);
const arrayLevelsPerStudent = ref([]);// Para el segundo los filtro

const tabs = ref(["Overview", "Completion Times", "Verb counts"]);
const activeTab = ref(0);
const dataStatementsByTimestamp = ref([]);
const dataAttemptTimesForStudentLevel  = ref([]);
const dataGroup  = ref([]);
const name  = ref([]);
const dataFirstFilter  = ref([]);

const colorPalettes = [['#65DB1C'], ['#6B8CFF']];

// eslint-disable-next-line
const props = defineProps({
  filteredDataByGroupId: Array,
  dataLevelCompletionTimes: Array,
  verbCount: Object,
  dataVerbCount: Array,
  dataPieChartGamesStartedCompleted: Array,
  dataBestCompletionTimePerLevelPerGroup: Array,
  dataAttemptTimesForStudentLevel : Array,
  dataObjectCount: Array
});

watch(() => props.filteredDataByGroupId,(newProps, oldProps) => {
  if (newProps !== oldProps) {
    handleFilterNameStudentBarChart(name.value);
    handleFilterNameStudent(dataFirstFilter.value);
  }
});

const handleFilterNameStudent = async (data) => {
  dataFirstFilter.value = data;

  if ( props.filteredDataByGroupId.length == 0 ||  props.filteredDataByGroupId[0].groupId != groupId.value){
    dataStatementsByTimestamp.value = [];
    return;
  }
  let tempo = props.filteredDataByGroupId[0]?.actors /////////////////////////////////////////////
    .filter(e => e.name === data)
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

const handleFilterNameStudentBarChart = async (studentName) => { // Recibo el studentName de Filter
  name.value = studentName;
  arrayLevelsPerStudent.value = [];
  dataAttemptTimesForStudentLevel.value = [];

  if (props.filteredDataByGroupId.length == 0 ||  props.filteredDataByGroupId[0].groupId != groupId.value){
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
};

watch(() => groupId.value, (newGroupId, oldGroupId) => {
  if (newGroupId !== oldGroupId) {
    dataStatementsByTimestamp.value = [];
    dataAttemptTimesForStudentLevel.value = [];
  }
});
</script>
  
<style>
#bar-chart2, #bar-chart3, #bar-chart4, #bar-chart-time-per-attempt, #bar-chart-interactions-items, #bar-chart-verb-count,
#line-chart1,
#pie-chart-completed-game {
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
</style>