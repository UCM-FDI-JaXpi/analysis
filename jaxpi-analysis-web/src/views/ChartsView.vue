<template>
  <div class="container">
    <h3 v-if="userType === 'dev' && selectedGame">Game ID: {{ selectedGame.id }}</h3>
    <h3 v-if="userType === 'dev' && selectedGame">Game name: {{ selectedGame.name }}</h3>

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
          @student-selected="handleStudentSelected" />
      </div>
      <div v-else>
        <p>No data available for this table.</p>
      </div>
    </div>

    <div v-if="activeTab === 1" class="tab-content">
      <StackedBarChart v-if="dataAttemptsPerLevelPlayer.length > 0" 
        :data="dataAttemptsPerLevelPlayer"
        chartId="stacked-bar-chart1"
        title="Number of attempts per level REAL" />

      <BarChart v-if="dataVerbCount.length > 0"
        :data="dataVerbCount"
        chartId="bar-chart1"
        title="Verb count" />

      <BarChart v-if="dataLevelCompletionTimes.length > 0"
        :data="dataLevelCompletionTimes"
        chartId="bar-chart2"
        title="Completion time per level MONGO"
        :colorPalette="colorPalettes[1]" /> <!---------------------------------THISSSSS------------------------->
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

import jsonDataTimeLevelPlayer from '../data/time-level-player.json';
import jsonDataScoreSessionPlayer from '../data/score-session-player.json';

import { calculateLevelCompletionTimes, calculateAttemptsPerLevel } from '../utils/utilities.js';

import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useGamesStore } from '@/stores/gamesStore';
import { useStudentStore } from '@/stores/studentStore';
import { useGroupsStore } from '@/stores/groupsStore';

const router = useRouter(); // To navigate from one tab to another
const authStore = useAuthStore(); // To use Pinia store (desestructuracion)
const gamesStore = useGamesStore();
const studentStore = useStudentStore();
const groupsStore = useGroupsStore();

const userType = computed(() => authStore.userType);
const selectedGame = computed(() => gamesStore.getSelectedGame); // Obtener datos del juego seleccionado desde el store con el gameId

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

const originalData = ref([]); // Guardo todo lo que me da response.data cuando soy profesor al montar el componente
const filteredDataByGroupId = ref([]); // datos del filtrados por groupID de originalData
const dataTableFormat = ref([]); // De filteredDataByGroupId preparo bien los campos de la tabla y se lo paso a DataTable
const dataStudentDetails = ref([]); // Guardo studentName y sus statements y se lo paso a StudentDetailsView.vue
// Para el primer barchart
const dataLevelCompletionTimes = ref([]);



const dataAttemptsPerLevelPlayer = ref([]);
let timerId = null;

// Para el recuento de verbos
const verbCount = ref({});
const dataVerbCount = ref([]);

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
  groupId: String // No required
});

// Data received from server
console.log(props)
props.socket.on('message', (msg) => {
  console.log('Message received from server:', msg);
});

props.socket.on('newStatement', (updatedData) => { // Recibe record a record, no un array de records
  console.log('Datos actualizados: ', updatedData);

  const verb = updatedData.verb.display['en-US'];
  verbCount.value[verb] = (verbCount.value[verb] || 0) + 1;

  if (userType.value === 'teacher') {
    let actorFound = false;
    if (Array.isArray(originalData.value)) { // Comprueba si originalData es un array o no (sea vacio o con algo), lo hago con originalData porque es el que tiene TODOS los groups
      const group = originalData.value.find(item => item.groupId ===  props.groupId);
      if (group) {
        group.actors.forEach(actor => {
          if (actor.sessionKey === updatedData.context.extensions["https://www.jaxpi.com/sessionKey"]) { // me viene de back deshaseada
            // Verifica que updatedData tiene la estructura esperada
            if (updatedData && updatedData.actor && updatedData.context && updatedData.object && updatedData.stored && updatedData.timestamp && updatedData.verb) {
              actor.statements.push(updatedData);
              actorFound = true;
              console.log('Dato añadido al actor:', actor);
            } else {
              console.warn('updatedData tiene una estructura inesperada', updatedData);
            }
          }
        });
        if (!actorFound) {
          console.log("Este estudiante no corresponde a este group");
        } else {
          console.log('Datos actualizados en originalData:', originalData.value);
        }
      } else { // Si en originalData(primer fetch) no tengo ningun group, añado este nuevo group, o si hay groups, añado este group al resto
        console.log('No se encontró el group con groupId:', props.groupId);
        let newGroup = {};
        newGroup.groupId = updatedData.context.contextActivities.parent.id;
        newGroup.groupName = groupsStore.getGroupNameById(props.groupId);
        newGroup.actors = [];
        let actor = {};
        actor.name = updatedData.context.extensions["https://www.jaxpi.com/studentName"];
        actor.sessionKey = updatedData.context.extensions["https://www.jaxpi.com/sessionKey"];
        actor.gameId = updatedData.context.extensions["https://www.jaxpi.com/gameId"];
        actor.gameName = updatedData.context.extensions["https://www.jaxpi.com/gameName"];
        actor.sessionId = updatedData.context.extensions["https://www.jaxpi.com/sessionId"];
        actor.sessionName = updatedData.context.extensions["https://www.jaxpi.com/sessionName"];
        actor.statements = [updatedData];

        newGroup.actors.push(actor);
        originalData.value.push(newGroup);
      }
    } else {
      console.warn('originalData no está definido o no es un array');
    }
  
    if(!timerId){ 
      /* La primera traza que recibe, inicializa un temporizador de X segundos,
         y realizamos la funcion una unica vez con todos los datos que teniamos mas los nuevos */
      timerId = setTimeout(() => {
        //dataAttemptsPerLevelPlayer.value = calculateAttemptsPerLevel(filteredDataByGroupId.value);

        //const verbChartDataArray = Object.entries(verbCount.value).map(([name, value]) => ({ name, value }));
        //dataVerbCount.value = prepareDataForCharts(verbChartDataArray);

        timerId = null;
      }, 10000);
    }
  }
});

// To send data to the server
const hello = 'hello websocket'
props.socket.emit('message', hello);

onMounted(async () => {
  await fetchDataFromMongoDB();
});

// To load data from MongoDB server using Axios
const fetchDataFromMongoDB = async () => {
  try {
    const response = await axios.get('http://localhost:3000/records', {
      withCredentials: true
    });

    if (userType.value === 'student') {
      console.log('Im student')
      originalData.value = new JsonObject(response.data)
      originalData.value.data.forEach(entry => {
          const verb = entry.verb.display['en-US'];
          verbCount.value[verb] = (verbCount.value[verb] || 0) + 1;
      });

      // Convertir el objeto contador de verbos en un array de objetos con la estructura adecuada y prepararlos para enviar al componente
      const verbChartDataArray = Object.entries(verbCount.value).map(([name, value]) => ({ name, value }));
      dataVerbCount.value = prepareDataForCharts(verbChartDataArray); // esto se podria quitar ya que arriba lo pondria en formato estandar

      dataAttemptsPerLevelPlayer.value = calculateAttemptsPerLevel(originalData.value.getData());

    } else if (userType.value === 'teacher') {
      console.log('Im teacher');
      console.log('response.data:', response.data);
      
      originalData.value = response.data;
      filteredDataByGroupId.value = response.data; // Le asigno toda la info de todos los groups, luego filtro por groupId si existe

      if (props.groupId) { // Filtrar por groupId si existe
        filteredDataByGroupId.value = filteredDataByGroupId.value.filter(item => item.groupId === props.groupId);
      }
      console.log('filteredDataByGroupId: ', filteredDataByGroupId.value);

      if (filteredDataByGroupId.value.length === 0) {
        console.log('No data found for teacher.');
      } else {
        dataLevelCompletionTimes.value = calculateLevelCompletionTimes(filteredDataByGroupId.value);
      }

    } else if (userType.value === 'dev'){
      console.log('Im dev');
      console.log('response.data:', response.data);
    }
  } catch (error) {
    console.error('Error al obtener los datos de http://localhost:3000/records', error);
  }
};

watch(originalData, (newValue) => { // Actualizo filteredData segun originalData
  if (props.groupId)
    filteredDataByGroupId.value = newValue.filter(item => item.groupId === props.groupId);
  else 
    filteredDataByGroupId.value = newValue;

  console.log('filteredDataByGroupId changed:', filteredDataByGroupId.value);
  if (filteredDataByGroupId.value.length > 0) {
    dataTableFormat.value = filteredDataByGroupId.value.flatMap(item => {
      return item.actors.map(actor => {
        // Ordenar los timestamps dentro de cada actor del más reciente al más antiguo
        actor.statements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
         // Comprueba si el actor tiene statements, si los tiene devuelve el primer timestamp que es el mas reciente, sino devuelve null
        const lastStatement = actor.statements.length > 0 ? actor.statements[0].timestamp : null;
        return {
          student: actor.name,
          session: actor.sessionName + " (" + actor.sessionId + ")",
          game: actor.gameName,
          numberOfStatements: actor.statements.length,
          lastTimestamp: lastStatement
        };
      });
    }).sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp)); // Sort by timestamp, from latest to oldest
    console.log('DataTableFormat updated:', dataTableFormat.value);
  }  else {
    dataTableFormat.value = []; // Limpia la tabla si no hay datos
  }
}, { deep: true }); // Observa cambios profundos, cambios en propiedades internas del objeto o los elementos del array

// Observamos los cambios en groupId y llamamos a fetchDataFromMongoDB cuando cambie
watch(() => props.groupId, (newGroupId, oldGroupId) => {
    if (newGroupId !== oldGroupId) {
      fetchDataFromMongoDB(newGroupId);
    }
});

const filterdataStudentDetails = (studentName) => { // En dataStudentDetails: studentName y sus statements
  dataStudentDetails.value = filteredDataByGroupId.value.flatMap(item => item.actors)
                                                 .find(actor => actor.name === studentName);
};

function handleStudentSelected(studentName) { // When you click on a row in the table selecting a student
  filterdataStudentDetails(studentName);
  const selectedStudentData = dataStudentDetails.value;
  console.log(selectedStudentData)
  groupsStore.setSelectedGroupId(props.groupId); // Seteo el group seleccionado
  studentStore.setSelectedStudent(selectedStudentData); // Seteo el name del estudiante y sus statements
  router.push({ name: 'StudentDetailsView', params: { name: studentName} }) // Go to StudentDetailsView using useRouter
}

/**************************************************** For BarChart *******************************************************/
const colorPalettes = [['#65DB1C'], ['#6B8CFF']];
function prepareDataForCharts(jsonData) {
  return jsonData.map(entry => ({
    nameObject: entry.name || entry.level || entry.date,
    value: entry.value || entry.time || entry.score
  }));
}
const dataTimeLevelPlayer = prepareDataForCharts(jsonDataTimeLevelPlayer.levels) //For time-level-player.json
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
  min-width: 415px; /* Por si la grafica tiene solo una barra en la grafica para que tenga como min un tamaño a cuando hay mas datos */
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