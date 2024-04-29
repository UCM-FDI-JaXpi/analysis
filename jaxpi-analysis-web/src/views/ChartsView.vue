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
    <StackedBarChart v-if="dataAttemptsPerLevelPlayer.length > 0" :data="dataAttemptsPerLevelPlayer" chartId="stacked-bar-chart1"
                  title="Number of attempts per level REAL" />
    <BarChart v-if="dataVerbCount.length > 0" :data="dataVerbCount" chartId="bar-chart1" title="Verb count" />
    <BarChart :data="dataLevelCompletionTimesMongoPlayer" chartId="bar-chart2" title="Completion time per level MONGO"
              :colorPalette="colorPalettes[1]" />
    <div  v-if="dataTable.length > 0" class="search-table">
      <form id="search">
        Search <input name="query" v-model="searchQuery">
      </form>
      <DataTable
        :data="dataTable"
        :columns="tableColumns"
        :columnTitles="dataTableColumnTitles"
        :filter-key="searchQuery"/>
    </div>
  </div>

  <div v-if="activeTab === 1" class="tab-content">
    <LineChart :data="dataScoreSessionPlayer" chartId="line-chart1" title="Score progression per session" />
  </div>

  <div v-if="activeTab === 2" class="tab-content">
    <BarChart :data="dataTimeLevelPlayer" chartId="bar-chart3"
              :title="'Playing time per level for ' + jsonDataTimeLevelPlayer.player" />
  </div>
</template>

<script setup>
import BarChart from '../components/BarChart.vue';
import LineChart from '../components/LineChart.vue';
import StackedBarChart from '../components/StackedBarChart.vue';
import DataTable from '../components/DataTable.vue';

import jsonDataTimeLevelPlayer from '../data/time-level-player.json';
import jsonDataRecordsMongo from '../data/recordsMongo.json';
import jsonDataScoreSessionPlayer from '../data/score-session-player.json';

import { calculateLevelCompletionTimes, calculateAttemptsPerLevel } from '../utils/utilities.js';
import { ref, onMounted } from 'vue';
import axios from 'axios';

const searchQuery = ref('')
const tableColumns = ['users', 'numberOfStatements', 'lastTimestamp']
const dataTableColumnTitles = {
  users: 'Users',
  numberOfStatements: 'Number of statements',
  lastTimestamp: 'Last statement send'
};
const dataTable = ref([]);
/*  = [
  { users: 'Chuck Norris', numberOfStatements: Infinity },
  { users: 'Bruce Lee', numberOfStatements: 9000 },
  { users: 'Jackie Chan', numberOfStatements: 7000 },
  { users: 'Jet Li', numberOfStatements: 8000 }
] */
const dataTableNoFiltered = ref([]);

class JsonObject {
  constructor(data) {
    this.data = data;
  }

  getData() {
    return this.data;
  }
}

const props = defineProps({
  socket: Object, // Receive the WebSocket connection as a prop
  userData: Object
});
const dataAttemptsPerLevelPlayer = ref([]);
const initialData = ref(null);
let timerId = null;

const tabs = ref(["Relevant Charts", "Line Charts", "Bar Charts"]);
const activeTab = ref(0); // Define active tab

// Para el recuento de verbos
const verbCount = ref({});
const dataVerbCount = ref([]);

// Data received from server
props.socket.on('message', (msg) => {
  console.log('Message received from server:', msg);
});

props.socket.on('newData', (updatedData) => { // Recibe traza a traza, no un array de trazas
  console.log('Datos actualizados: ', updatedData);

  const verb = updatedData.verb.display['en-us'];
  verbCount.value[verb] = (verbCount.value[verb] || 0) + 1;

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
        dataAttemptsPerLevelPlayer.value = calculateAttemptsPerLevel(initialData.value.getData());

        const verbChartDataArray = Object.entries(verbCount.value).map(([name, value]) => ({ name, value }));
        dataVerbCount.value = prepareDataForCharts(verbChartDataArray);

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
    const userType = props.userData.user.usr_type;

    if (userType === 'student') {
      console.log('Im student')
      initialData.value = new JsonObject(response.data)
      initialData.value.data.forEach(entry => {
          const verb = entry.verb.display['en-us'];
          verbCount.value[verb] = (verbCount.value[verb] || 0) + 1;
      });

      // Convertir el objeto contador de verbos en un array de objetos con la estructura adecuada y prepararlos para enviar al componente
      const verbChartDataArray = Object.entries(verbCount.value).map(([name, value]) => ({ name, value }));
      dataVerbCount.value = prepareDataForCharts(verbChartDataArray); // esto se podria quitar ya que arriba lo pondria en formato estandar

      dataAttemptsPerLevelPlayer.value = calculateAttemptsPerLevel(initialData.value.getData());

    } else if (userType === 'teacher') {
      console.log('Im teacher')
      console.log(response.data)
      
      // For DataTable
      dataTableNoFiltered.value = response.data.map(item => {
        const actors = item.actors.map(actor => {
          // Para cada actor, nos quedamos con 'studentName' y con algunos campos del array 'statements'
          return {
            studentName: actor.studentName,
            statements: actor.statements.map(statement => ({
              verb: statement.verb,
              timestamp: statement.timestamp
            }))
          };
        });
        // Devolvemos lo mismo que nos dio el back pero solo con los campos necesarios 
        return {
            actors: actors,
            _id: item._id
          };
      });
      console.log(dataTableNoFiltered.value)

      dataTable.value = dataTableNoFiltered.value.flatMap(item => {
        return item.actors.map(actor => { 
          //Comprueba si el actor tiene statements, si los tiene devuelve el ultimo timestamp (en ppio estan ordenados por timestamp en el back), sino devuelve null
          const lastStatement = actor.statements.length > 0 ? actor.statements[actor.statements.length - 1].timestamp : null;
          return {
            users: actor.studentName,
            numberOfStatements: actor.statements.length,
            lastTimestamp: lastStatement
          };
        });
      }).sort((a, b) => { // Sort by timestamp, from latest to oldest
          return new Date(b.lastTimestamp) - new Date(a.lastTimestamp);
      });
      console.log(dataTable.value)

    } else if (userType === 'dev'){
      console.log('Im dev')
    }
  } catch (error) {
    console.error('Error al obtener los datos de http://localhost:3000/records', error);
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
const dataTimeLevelPlayer = prepareDataForCharts(jsonDataTimeLevelPlayer.levels) //For time-level-player.json
const dataLevelCompletionTimesMongoPlayer = calculateLevelCompletionTimes(jsonDataRecordsMongo); //For recordsMongo.json

/************************************************** For LineChart *******************************************************/
const dataScoreSessionPlayer = prepareDataForCharts(jsonDataScoreSessionPlayer) //For score-session-player.json - the data in the correct format
</script>

<style>
/* Style for the div app that comes by default */
#app {
  background-color: #bfdbf3;
}

#bar-chart1, #bar-chart2, #bar-chart3, #stacked-bar-chart1, #line-chart1 {
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