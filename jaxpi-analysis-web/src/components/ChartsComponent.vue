<template>
    <div class="container">
      <div class="tabs">
        <button v-for="(tab, index) in tabs" :key="index" 
                  @click="activeTab = index" 
                  :class="{ 'active': activeTab === index }">
          {{ tab }}
        </button>
      </div>
      
      <div v-if="activeTab === 0" class="tab-content">
        <div v-if="dataTableFormat.length > 0" class="search-table">
          <h2>Last statements received</h2>
          <form id="search">
            Search <input name="query-teacher" v-model="searchQueryTeacher">
          </form>
          <DataTable
            :data="dataTableFormat" 
            :columns="tableColumnsTeacher"
            :columnTitles="dataTableColumnTitlesTeacher"
            :filter-key="searchQueryTeacher"
            />
            <!-- @student-selected="handleStudentSelected" -->
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
          :colorPalette="colorPalettes[1]" /> <!---------------------------------THISSSSS------------------------->
        
        <BarChart v-if="dataVerbCount.length > 0" 
          :data="dataVerbCount"
          chartId="bar-chart1"
          title="Verb count" /> <!---------------------------------THISSSSS------------------------->
  
        <PieChart v-if="dataPieChartGamesStartedCompleted.length > 0" 
          :data="dataPieChartGamesStartedCompleted"
          chartId="pie-chart1"
          title="Games started and completed" /> <!---------------------------------THISSSSS------------------------->
  
        <StackedBarChart v-if="dataAttemptsPerLevelPlayer.length > 0" 
          :data="dataAttemptsPerLevelPlayer"
          chartId="stacked-bar-chart1"
          title="Number of attempts per level REAL" />
      </div>
  
      <div v-if="activeTab === 2" class="tab-content">
        <LineChart
          :data="dataScoreSessionPlayer"
          chartId="line-chart1"
          title="Score progression per session" />
      </div>
  
      <div v-if="activeTab === 3" class="tab-content">
        <BarChart :data="dataTimeLevelPlayer"
          chartId="bar-chart3"
          :title="'Playing time per level for ' + jsonDataTimeLevelPlayer.player" />
      </div>
    </div>
  </template>
  
  <script setup>
  import BarChart from '../components/BarChart.vue';
  import LineChart from '../components/LineChart.vue';
  import StackedBarChart from '../components/StackedBarChart.vue';
  import DataTable from '../components/DataTable.vue';
  import PieChart from '@/components/PieChart.vue'
  
  import jsonDataTimeLevelPlayer from '../data/time-level-player.json';
  import jsonDataScoreSessionPlayer from '../data/score-session-player.json';
  
  import { ref } from 'vue';
  // import { useRouter } from 'vue-router';
  // import { useGamesStore } from '@/stores/gamesStore';
  // import { useStudentStore } from '@/stores/studentStore';
  // import { useGroupsStore } from '@/stores/groupsStore';
  
  // const router = useRouter(); // To navigate from one tab to another
  // const gamesStore = useGamesStore();
  // const studentStore = useStudentStore();
  // const groupsStore = useGroupsStore();
  
  // const selectedGame = computed(() => gamesStore.getSelectedGame); // Obtener datos del juego seleccionado desde el store con el gameId
  
  const tabs = ref(["Table", "Charts", "Line Charts", "Bar Charts"]);
  const activeTab = ref(0);
  
  const tableColumnsTeacher = ['student','session', 'game', 'numberOfStatements', 'lastTimestamp']
  const dataTableColumnTitlesTeacher = {
    student: 'Students',
    session: 'Session',
    game: 'Game',
    numberOfStatements: 'Number of statements',
    lastTimestamp: 'Last statement send'
  };
  const searchQueryTeacher = ref('')
  //let timerId = null;
  
  // eslint-disable-next-line
  const props = defineProps({
    filteredDataByGroupId: Array,
    dataTableFormat: Array,
    dataStudentDetails: Array,
    dataLevelCompletionTimes: Array,
    verbCount: Object,
    dataVerbCount: Array,
    dataPieChartGamesStartedCompleted: Array,
    dataAttemptsPerLevelPlayer: Array,
  });
  
  
//   const filterdataStudentDetails = (studentName) => { // En dataStudentDetails: studentName y sus statements
//     dataStudentDetails.value = filteredDataByGroupId.value.flatMap(item => item.actors)
//                                                    .find(actor => actor.name === studentName);
//   };
  
  // function handleStudentSelected(studentName) { // When you click on a row in the table selecting a student
  //   filterdataStudentDetails(studentName);
  //   const selectedStudentData = dataStudentDetails.value;
  //   console.log(selectedStudentData)
  //   groupsStore.setSelectedGroupId(props.groupId); // Seteo el group seleccionado
  //   studentStore.setSelectedStudent(selectedStudentData); // Seteo el name del estudiante y sus statements
  //   router.push({ name: 'StudentDetailsView', params: { name: studentName} }) // Go to StudentDetailsView using useRouter
  // }
  
  /**************************************************** For BarChart *******************************************************/
  const colorPalettes = [['#65DB1C'], ['#6B8CFF']];
  function prepareDataForCharts(jsonData) {
    return jsonData.map(entry => ({
      nameObject: entry.name || entry.level || entry.date,
      value: entry.value || entry.time || entry.score
    }));
  }
  const dataTimeLevelPlayer = prepareDataForCharts(jsonDataTimeLevelPlayer.levels) //For time-level-player.json
  const dataScoreSessionPlayer = prepareDataForCharts(jsonDataScoreSessionPlayer) //For score-session-player.json - the data in the correct format
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
  </style>