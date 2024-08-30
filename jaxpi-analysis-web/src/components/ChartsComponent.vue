<template>
    <div class="charts-container">
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
  
      </div>
      <div v-else class="no-data-charts">
        <p>No data available for this class.</p>
      </div>
    </div>
</template>
  
<script setup>
import { ref } from 'vue';
import DataTable from '../components/DataTable.vue';

// const colorPalettes = [['#65DB1C'], ['#6B8CFF']];
const searchQueryTeacher = ref('');
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
  dataTableFormat: Array
});
</script>
  
<style>
#bar-chart1, #bar-chart2, #bar-chart3, #bar-chart4, #bar-chart10,
#pie-chart1,
#line-chart1,
#stacked-bar-chart-interaction-items, #stacked-bar-chart-number-completed-levels {
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