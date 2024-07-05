<template>
  <div class="container">
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
      <div v-if="dataTableFilteredTeacher.length > 0" class="search-table">
        <h2>Last statements received</h2>
        <select v-model="selectedClassTeacher" id="class-options-teacher">
          <option disabled value="">Please select a class</option>
          <option v-for="classData in classOptionsTeacher" :key="classData" :value="classData">{{ classData }}</option>
        </select>
        <form id="search">
          Search <input name="query-teacher" v-model="searchQueryTeacher">
        </form>
        <DataTable :data="dataTableFilteredTeacher"
                  :columns="tableColumnsTeacher"
                  :columnTitles="dataTableColumnTitlesTeacher"
                  :filter-key="searchQueryTeacher"
                  @student-selected="handleStudentSelected"/>
      </div>
    </div>

    <div v-if="activeTab === 1" class="tab-content">
      <LineChart :data="dataScoreSessionPlayer" chartId="line-chart1" title="Score progression per session" />
    </div>

    <div v-if="activeTab === 2" class="tab-content">
      <BarChart :data="dataTimeLevelPlayer" chartId="bar-chart3"
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
import jsonDataRecordsMongo from '../data/recordsMongo.json';
import jsonDataScoreSessionPlayer from '../data/score-session-player.json';

import { calculateLevelCompletionTimes, calculateAttemptsPerLevel } from '../utils/utilities.js';

import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { updateSelectedStudent } from '../store/studentStore'

const router = useRouter();
const searchQueryTeacher = ref('')
const tableColumnsTeacher = ['student', 'numberOfStatements', 'lastTimestamp']
const dataTableColumnTitlesTeacher = {
  student: 'Students',
  numberOfStatements: 'Number of statements',
  lastTimestamp: 'Last statement send'
};
const allData = ref([]); // Guardo todo lo que me da response.data cuando soy profesor
const dataTableNoFilteredTeacher = ref([]); // Guardo solo algunos campos de response.data, para no pasarle todo
const dataTableFilteredTeacher = ref([]); // De dataTableNoFilteredTeacher me quedo solo con la selectedClassTeacher y se lo paso a DataTable
const dataFilteredStudentDetail = ref([]); // Guardo studentName y sus statements, luego junto a selectedClassTeacher se lo paso a StudentDetailView.vue

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

// For select-dropdown
const selectedClassTeacher = ref('');
const classOptionsTeacher = ref([]);

// Data received from server
props.socket.on('message', (msg) => {
  console.log('Message received from server:', msg);
});

props.socket.on('newData', (updatedData) => { // Recibe traza a traza, no un array de trazas
  console.log('Datos actualizados: ', updatedData);

  const verb = updatedData.verb.display['en-US'];
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
          const verb = entry.verb.display['en-US'];
          verbCount.value[verb] = (verbCount.value[verb] || 0) + 1;
      });

      // Convertir el objeto contador de verbos en un array de objetos con la estructura adecuada y prepararlos para enviar al componente
      const verbChartDataArray = Object.entries(verbCount.value).map(([name, value]) => ({ name, value }));
      dataVerbCount.value = prepareDataForCharts(verbChartDataArray); // esto se podria quitar ya que arriba lo pondria en formato estandar

      dataAttemptsPerLevelPlayer.value = calculateAttemptsPerLevel(initialData.value.getData());

    } else if (userType === 'teacher') {
      console.log('Im teacher')
      allData.value = response.data;


      classOptionsTeacher.value = response.data.map(classData => classData._id); // Save the ids of the different classes of a teacher
      classOptionsTeacher.value.sort(); // Sort by alphabetical order

      if (classOptionsTeacher.value.length > 0 && !selectedClassTeacher.value) { // Set the first class by default
        selectedClassTeacher.value = classOptionsTeacher.value[0];
      }

      // For DataTable
      dataTableNoFilteredTeacher.value = response.data.map(item => {
        const actors = item.actors.map(actor => {
            // Ordenar los timestamps dentro de cada actor del más reciente al más antiguo
            actor.statements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            const statements = actor.statements.map(statement => ({
                verb: statement.verb,
                timestamp: statement.timestamp
            }));
            return { // Para cada actor, nos quedamos con 'studentName' y con algunos campos del array 'statements' 
              studentName: actor.studentName,
              statements };
        });
        return { // Devolvemos lo mismo que nos dio el back pero solo con los campos necesarios 
          _id: item._id,
          actors};
      });
      console.log(dataTableNoFilteredTeacher.value)
      // Filtrar los datos para la clase seleccionada
      filterDataTable(selectedClassTeacher.value);
      console.log(dataTableFilteredTeacher.value)

    } else if (userType === 'dev'){
      console.log('Im dev')
    }
  } catch (error) {
    console.error('Error al obtener los datos de http://localhost:3000/records', error);
  }
};

const filterDataTable = (selectedClassTeacher) => {
  dataTableFilteredTeacher.value = dataTableNoFilteredTeacher.value.filter(item => item._id === selectedClassTeacher)
    .flatMap(item => item.actors.map(actor => {
      const lastStatement = actor.statements.length > 0 ? actor.statements[0].timestamp : null;
      return {
        student: actor.studentName,
        numberOfStatements: actor.statements.length,
        lastTimestamp: lastStatement
      };
    }))
    .sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp));
};

// Lógica para manejar cambios en la clase seleccionada
watch(selectedClassTeacher, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    filterDataTable(newValue);
  }
});

const filterDataStudentDetail = (selectedClassTeacher, studentName) => { // En dataFilteredStudentDetail: studentName y sus statements
  dataFilteredStudentDetail.value = allData.value.filter(item => item._id === selectedClassTeacher)
    .flatMap(item => item.actors)
    .find(actor => actor.studentName === studentName);
    console.log(dataFilteredStudentDetail.value)
};


function handleStudentSelected(studentName) {
  filterDataStudentDetail(selectedClassTeacher.value, studentName)
  const selectedStudentData = {
    studentData: dataFilteredStudentDetail.value,
    selectedClass: selectedClassTeacher.value
  };
  console.log(selectedStudentData)
  updateSelectedStudent(selectedStudentData) // Le paso tanto la selectedClassTeacher como el nombre del estudiante y sus statements / a studentStore.js
  router.push({ name: 'StudentDetailView', params: { name: studentName} })
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