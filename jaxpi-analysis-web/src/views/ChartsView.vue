<template>
  <h1>Charts</h1>
  <div class="chart-container">
    <BarChart :data="dataJson" chartId="bar-chart1" title="Players score" />
    <BarChart :data="dataTimeLevelPlayer" chartId="bar-chart2"
      :title="'Playing time per level for ' + jsonDataTimeLevelPlayer.player" />
    <BarChart :data="dataLevelCompletionTimes" chartId="bar-chart3" title="Completion time per level"
      :colorPalette="colorPalettes[0]" />
    <BarChart :data="dataLevelCompletionTimesMongo" chartId="bar-chart4" title="Completion time per level MONGO"
      :colorPalette="colorPalettes[1]" />
    <StackedBarChart :data="attemptsPerLevel" chartId="stacked-bar-chart1" title="Number of attempts per level mongo" />
    <LineChart :data="dataScoreSessionPlayer" chartId="line-chart1" title="Score progression per session" />
    <StackedBarChart v-if="realChartData.length > 0" :data="realChartData" chartId="stacked-bar-chart2"
      title="Number of attempts per level REAL" />
  </div>
</template>

<script setup>
import BarChart from '../components/BarChart.vue';
import StackedBarChart from '../components/StackedBarChart.vue';
import LineChart from '../components/LineChart.vue';

import jsonData from '../data/data.json';
import jsonDataTimeLevelPlayer from '../data/time-level-player.json';
import jsonDataExample from '../data/example.json';
import jsonDataRecordsMongo from '../data/recordsMongo.json';
import jsonDataRecordsMongoAttemptsPerLevel from '../data/recordsMongoAttemptsPerLevel.json';
import jsonDataScoreSessionPlayer from '../data/score-session-player.json';

import { calculateLevelCompletionTimes, calculateAttemptsPerLevel } from '../utils/utilities.js';
import axios from 'axios';
import { ref, onMounted } from 'vue';

class JsonObject {
  constructor(data) {
    this.data = data;
  }

  getData() {
    return this.data;
  }
}

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

props.socket.on('newData', (updatedData) => {
  console.log('Datos actualizados: ', updatedData);

  if (initialData.value) {
    initialData.value = initialData.value.concat(updatedData);
    console.log(initialData.value);

    // Si hay un temporizador en curso, cancela su ejecución para evitar redundancias
    if (timerId) {
      console.log(timerId + "timer")
      clearTimeout(timerId);
    }

    // Configura un temporizador para calcular las métricas después de un cierto tiempo
    timerId = setTimeout(() => {
      realChartData.value = calculateAttemptsPerLevel(initialData.value.getData());
      initialData.value = new JsonObject([]); // Restablece la lista de eventos para comenzar a acumular nuevos eventos
      timerId = null; // Restablece el temporizador a null
    }, 3000);
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

    // Ordenar por nameObject para pasarselo ordenado al componente StackedBarChart
    realChartData.value = realChartData.value.sort((a, b) => {
      if (a.nameObject < b.nameObject)
        return -1;
      if (a.nameObject > b.nameObject)
        return 1;
      return 0;
    });
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

.chart-container {
  display: grid;
  grid-template-columns: 25% 25% 25% 25%;
  background-color: #79c1fd;
  padding: 10px;
}

#bar-chart1,
#bar-chart2,
#bar-chart3,
#bar-chart4,
#stacked-bar-chart1,
#line-chart1,
#stacked-bar-chart2 {
  background-color: rgba(255, 255, 255, 0.8);
  margin: 5px;
  /* Margin between graphics and container */
}
</style>