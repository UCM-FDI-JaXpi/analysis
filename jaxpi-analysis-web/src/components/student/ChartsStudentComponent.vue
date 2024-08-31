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
        <p>No data available for this student.</p>
      </div>
    </div>
</template>
  
<script setup>
import { ref, onMounted } from 'vue';
import DataTable from '@/components/DataTable.vue';

const searchQueryTeacher = ref('');

// const colorPalettes = [['#65DB1C'], ['#6B8CFF']];
const tableColumnsTeacher = ['session', 'game', 'numberOfStatements', 'lastTimestamp']
const dataTableColumnTitlesTeacher = {
  session: 'Session',
  game: 'Game',
  numberOfStatements: 'Number of statements',
  lastTimestamp: 'Last statement received'
};

// eslint-disable-next-line
const props = defineProps({
  groupId: String,
  filteredDataByGroupId: Array,
  dataTableFormat: Array
});

onMounted(() => {
});
</script>
  
<style scoped>
#bar-chart1, #bar-chart2, #bar-chart3, #bar-chart4, #bar-chart10,
#pie-chart1,
#line-chart1,
#stacked-bar-chart1 {
  background-color: rgba(255, 255, 255, 0.8);
  min-width: 110px; /* Por si la grafica tiene solo una barra en la grafica para que tenga como min un tamaño a cuando hay mas datos */
}
</style>