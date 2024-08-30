<template>
    <div class="charts-container">
      <div class="tabs-charts">
        <button v-for="(tab, index) in tabs" :key="index" 
                  @click="activeTab = index" 
                  :class="{ 'active': activeTab === index }">
          {{ tab }}
        </button>
      </div>
      
      <div v-if="activeTab === 0" class="tab-content-charts"> <!------------------------------------OVERVIEW TAB-->
        <div class="centerItems" v-if="dataTableFormat.length > 0">
          <div class="datatable-charts">
            <h2 >Last statements received</h2>
            <form id="search">
              Search <input name="query-teacher" v-model="searchQueryTeacher">
            </form>
            <DataTable
              :data="dataTableFormat" 
              :columns="tableColumnsTeacher"
              :columnTitles="dataTableColumnTitlesTeacher"
              :filter-key="searchQueryTeacher"/>
          </div>

          <div style="margin-top: 90px;">
            <PieChart v-if="dataPieChartGamesStartedCompleted.length > 0" 
              :data="dataPieChartGamesStartedCompleted"
              chartId="pie-chart1"
              title="Games started and completed" />
          </div>
        </div>
        <div v-else class="no-data-charts">
          <p>No data available for this class.</p>
        </div>
      </div>
  

      <div v-if="activeTab === 1" class="tab-content-charts "> <!------------------------------------COMPLETION TIMES TAB-->
        <div class="centerItems" v-if="dataTableFormat.length > 0">
          <div class="marginBottom90">
            <BarChart v-if="dataBestCompletionTimePerLevelPerGroup.length > 0"
              :data="dataBestCompletionTimePerLevelPerGroup"
              chartId="bar-chart4"
              title="Best completion time per level per this class" 
              :customTooltip="true"/>
          </div>
          <div>
            <BarChart v-if="dataLevelCompletionTimes.length > 0"
              :data="dataLevelCompletionTimes"
              chartId="bar-chart2"
              title="Completion time per level"
              :colorPalette="colorPalettes[1]" />
          </div>
        </div>
        <div v-else class="no-data-charts">
          <p>No data available for this class.</p>
        </div>
      </div>
      

      <div v-if="activeTab === 2" class="tab-content-charts centerItems"> <!-------------------------------------VERB COUNT TAB-->
        <div v-if="dataTableFormat.length > 0">
          <BarChart v-if="dataVerbCount.length > 0" 
          :data="dataVerbCount"
          chartId="bar-chart1"
          title="Verb count" /> 
        </div>
        <div v-else class="no-data-charts">
          <p>No data available for this class.</p>
        </div>
      </div>
    </div>
</template>
  
<script setup>
import { ref } from 'vue';
import BarChart from '../components/BarChart.vue';
import DataTable from '../components/DataTable.vue';
import PieChart from '@/components/PieChart.vue';

const tabs = ref(["Overview", "Completion Times", "Verb count"]);
const activeTab = ref(0);
const searchQueryTeacher = ref('');

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
  dataTableFormat: Array,
  dataLevelCompletionTimes: Array,
  dataVerbCount: Array,
  dataPieChartGamesStartedCompleted: Array,
  dataBestCompletionTimePerLevelPerGroup: Array,
});
</script>
  
<style>
#bar-chart1, #bar-chart2, #bar-chart3, #bar-chart4, #bar-chart10, #pie-chart1, #line-chart1, #stacked-bar-chart2 {
  background-color: rgba(255, 255, 255, 0.8);
  min-width: 110px; /* Por si la grafica tiene solo una barra en la grafica para que tenga como min un tamaño a cuando hay mas datos */
}

.charts-container{
  padding: 10px;
}

.tabs-charts {
  display: flex;
}

.tabs-charts button {
  padding: 10px 20px;
  margin-right: 2px;
  cursor: pointer;
  border: none;
  background-color: #f0f0f0;
  border-radius: 5px 5px 0 0;
  transition: background-color 0.2s, color 0.2s;
}

.tabs-charts button.active {
  background-color: #79C1FD;
  color: white;
}

.tab-content-charts {
  padding: 20px;
  background-color: #79C1FDBA;
}

.marginBottom90{
  margin-bottom: 90px;
}

.datatable-charts{
  display: contents;
}

form#search {
  margin-bottom: 1rem;
}

.centerItems {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>