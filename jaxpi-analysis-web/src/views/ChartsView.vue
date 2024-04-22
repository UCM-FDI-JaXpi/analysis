<template>
  <h1>Charts</h1>
  <div class="tabs">
    <button v-for="(tab, index) in tabs" :key="index" 
              @click="activeTab = index" 
              :class="{ 'active': activeTab === index }">
      {{ tab }}
    </button>
  </div>
  
  <div v-if="activeTab === 0" class="tab-content">
    <StackedBarChart v-if="realChartData.length > 0" :data="realChartData" chartId="stacked-bar-chart1"
                  title="Number of attempts per level REAL" />
    <StackedBarChart :data="attemptsPerLevel" chartId="stacked-bar-chart2" title="Number of attempts per level mongo" />
  </div>

  <div v-if="activeTab === 1" class="tab-content">
    <LineChart :data="dataScoreSessionPlayer" chartId="line-chart1" title="Score progression per session" />
  </div>

  <div v-if="activeTab === 2" class="tab-content">
    <BarChart :data="dataTimeLevelPlayer" chartId="bar-chart1"
              :title="'Playing time per level for ' + jsonDataTimeLevelPlayer.player" />
    <BarChart :data="dataLevelCompletionTimes" chartId="bar-chart2" title="Completion time per level"
              :colorPalette="colorPalettes[0]" />
    <BarChart :data="dataLevelCompletionTimesMongo" chartId="bar-chart3" title="Completion time per level MONGO"
              :colorPalette="colorPalettes[1]" />
    <BarChart :data="dataJson" chartId="bar-chart4" title="Players score" />
  </div>
</template>

<script setup>
import BarChart from '../components/BarChart.vue';
import LineChart from '../components/LineChart.vue';
import StackedBarChart from '../components/StackedBarChart.vue';

import jsonData from '../data/data.json';
import jsonDataTimeLevelPlayer from '../data/time-level-player.json';
import jsonDataExample from '../data/example.json';
import jsonDataRecordsMongo from '../data/recordsMongo.json';
import jsonDataRecordsMongoAttemptsPerLevel from '../data/recordsMongoAttemptsPerLevel.json';
import jsonDataScoreSessionPlayer from '../data/score-session-player.json';

import { calculateLevelCompletionTimes, calculateAttemptsPerLevel } from '../utils/utilities.js';
import { ref, onMounted } from 'vue';
import axios from 'axios';

class JsonObject {
  constructor(data) {
    this.data = data;
  }

  getData() {
    return this.data;
  }
}

const tabs = ref(["Stacked Bar Charts", "Line Charts", "Bar Charts"]);
const activeTab = ref(0); // Define active tab

const props = defineProps({
  socket: Object // Receive the WebSocket connection as a prop
});
const realChartData = ref([]);
const initialData = ref(null);
let timerId = null;

// Data received from server
props.socket.on('message', (msg) => {
  console.log('Message received from server:', msg);
});

props.socket.on('newData', (updatedData) => { // Recibe traza a traza, no un array de trazas
  console.log('Datos actualizados: ', updatedData);

  if (initialData.value) {
    const realInitialData = initialData.value.data.map(proxy => { return proxy }); // Para poder usar concat
    const updatedDataProxy = new Proxy(updatedData, {
      // Define los handlers para el proxy si es necesario
    });
    initialData.value.data = realInitialData.concat(updatedDataProxy);
  
    if(!timerId){ 
      /* La primera traza que recibe, inicializa un temporizador de X segundos,
         y realizamos la funcion una unica vez con todos los datos que teniamos mas los nuevos */
      timerId = setTimeout(() => {
        realChartData.value = calculateAttemptsPerLevel(initialData.value.getData());
        timerId = null;
      }, 10000);
    }
  }
});

// To send data to the server
const hello = 'hello websocket'
props.socket.emit('message', hello);

onMounted(() => {
  fetchDataFromMongoDB();
});

// To load data from MongoDB server using Axios
const fetchDataFromMongoDB = async () => {
  try {
    const response = await axios.get('http://localhost:3000/records', {
      withCredentials: true
    });
    initialData.value = new JsonObject(response.data) // Guardo los eventos que leo la primera vez,que pasa si es vacio?
    realChartData.value = calculateAttemptsPerLevel(initialData.value.getData());
  } catch (error) {
    console.error('Error al obtener los datos:', error);
  }
};

/**************************************************** For BarChart *******************************************************/
const colorPalettes = [['#65DB1C'], ['#6B8CFF']];
function prepareDataForCharts(jsonData) {
  return jsonData.map(entry => ({
    nameObject: entry.name || entry.level || entry.date,
    value: entry.value || entry.time || entry.score
  }));
}
const dataJson = prepareDataForCharts(jsonData) //For data.json - the data in the correct format to paint on the bar chart
const dataTimeLevelPlayer = prepareDataForCharts(jsonDataTimeLevelPlayer.levels) //For time-level-player.json

const dataLevelCompletionTimes = calculateLevelCompletionTimes(jsonDataExample); //For example.json - the data in the correct format to paint on the bar chart
const dataLevelCompletionTimesMongo = calculateLevelCompletionTimes(jsonDataRecordsMongo); //For recordsMongo.json

/*********************************************** For StackedBarChart ****************************************************/
const attemptsPerLevel = calculateAttemptsPerLevel(jsonDataRecordsMongoAttemptsPerLevel); //For recordsMongoAttemptsPerLevel.json

/************************************************** For LineChart *******************************************************/
const dataScoreSessionPlayer = prepareDataForCharts(jsonDataScoreSessionPlayer) //For score-session-player.json - the data in the correct format to paint on the bar chart

</script>

<style>
/* Style for the div app that comes by default */
#app {
  background-color: #bfdbf3;
}

#bar-chart1, #bar-chart2, #bar-chart3, #bar-chart4, #stacked-bar-chart1, #line-chart1, #stacked-bar-chart2 {
  background-color: rgba(255, 255, 255, 0.8);
  margin: 5px; /* Margin between graphics and container */
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
  /*background-color: transparent;*/
}

.tabs button.active {
  background-color: #79c1fd;
}

.tab-content {
  display: grid;
  grid-template-columns: 25% 25% 25% 25%;
  background-color: #79c1fd;
  padding: 10px;
}
</style>