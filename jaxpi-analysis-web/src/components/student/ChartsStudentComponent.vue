<template>
    <div class="centerItems charts-container" style="min-height: 445px;">      
      <div v-if="dataTableFormat.length > 0 && !loading">
        <div class="centerItems datatable-charts">
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
      <!-- Instructions, only if we haven't played yet -->
      <div class="instructions" v-if="dataTableFormat.length === 0 && !loading">
        <p style="margin:0px; font-size: 1.1rem;"><strong style="color: #FF8800;">Remember:</strong> There are no analytics 
          because you haven't played yet, start playing to see them 🎮</p>
      </div>
      <div v-if="loading" class="no-data-charts">
        Loading...
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
  dataTableFormat: Array,
  loading: Boolean
});

onMounted(() => {
});
</script>
  
<style scoped>
#bar-chart2, #bar-chart3, #bar-chart4, #bar-chart-time-per-attempt, #bar-chart-verb-count,
#pie-chart1,
#line-chart1,
#stacked-bar-chart1 {
  background-color: rgba(255, 255, 255, 0.8);
  min-width: 110px; /* Por si la grafica tiene solo una barra en la grafica para que tenga como min un tamaño a cuando hay mas datos */
}

.instructions {
    background-color: #e7fcff;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    max-width: 900px;
    width: max-content;
}
</style>