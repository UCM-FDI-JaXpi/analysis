<template>
    <div class="game-details-view" v-if="game">
      <div class="header-container">
        <div class="card-details">
          <div class="header">
              <h1>{{ game.name }}</h1>
              <button @click="showDeleteModal = true" class="delete-button">Delete Game</button>
          </div>
          <div class="game-details" v-if="game">
            <div class="token-container">
              <p><strong>Token:</strong><span class="token-text">{{ game.token }}</span></p>
              <button @click="copyToken(game.token)" class="copy-button">Copy</button>
            </div>
              
              <p><strong>Description: </strong></p>
              <p class="game-description-content">{{ game.description }}</p>

              <p><strong>Users: </strong>{{  activeUsers }}</p>
              <p><strong>Users who have completed the game: </strong> {{ completedGameUsers }}</p>
              <p v-if="dataLastStatement && dataLastStatement.length > 0"><strong>Last played: </strong> {{ dataLastStatement }}</p>
          </div>
        </div>
        <div class="additional-content">
          <h3 class="top3">
            <span class="up"> Top 3</span>
            <span class="down">Most popular objects</span>
            <span>{{ dataObjectCount && dataObjectCount[0] && dataObjectCount[0].value ? '1. ' + dataObjectCount[0].nameObject +' '+dataObjectCount[0].value : ''}}</span>
            <span>{{ dataObjectCount && dataObjectCount[1] && dataObjectCount[1].value ? '2. '+ dataObjectCount[1].nameObject +' '+dataObjectCount[1].value : ''}}</span>
            <span>{{ dataObjectCount && dataObjectCount[2] && dataObjectCount[2].value ? '3. ' + dataObjectCount[2].nameObject +' '+dataObjectCount[2].value : ''}}</span>
            <span v-if="!dataObjectCount || dataObjectCount.length === 0">Not used yet</span>
          </h3>
        </div>
      </div>

      <ChartsDevComponent 
        :originalData="originalData"
        :filteredDataByGroupId ="filteredDataByGroupId"
        :dataLevelCompletionTimes="dataLevelCompletionTimes"
        :dataVerbCount="dataVerbCount"
        :dataBestCompletionTimePerLevelPerGroup="dataBestCompletionTimePerLevelPerGroup"
        :dataPieChartGamesStartedCompleted="dataPieChartGamesStartedCompleted"
        :dataObjectCount="dataObjectCount" />

      <ConfirmModal v-if="showDeleteModal"
        :visible="showDeleteModal"
        title="Confirm deletion"
        message="Are you sure you want to delete this game?<br>This action cannot be undone. Data will be lost."
        @confirm="deleteGame"
        @cancel="hideDeleteModal"
      />
    </div>
    <div v-else>
        <SuccessModal v-if="showSuccessModal"
          :visible="showSuccessModal"
          title="Success!"
          message="Game deleted successfully!"
          @ok="handleSuccessModalOk"
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGamesStore } from '@/stores/gamesStore';
import { useAuthStore } from '@/stores/authStore';

import ConfirmModal from '@/components/modals/ConfirmModal.vue';
import SuccessModal from '@/components/modals/SuccessModal.vue';
import ChartsDevComponent from '@/components/dev/ChartsDevComponent.vue';

import axios from 'axios';
import socket from '@/socket';

import { calculateLevelCompletionTimes } from '../../utils/utilities.js';

const route = useRoute();
const router = useRouter();
const gamesStore = useGamesStore();
const authStore = useAuthStore(); // To use Pinia store (desestructuracion)

const gameId = computed(() => route.params.gameId);
const game = computed(() => gamesStore.getGameById(gameId.value));
const userType = computed(() => authStore.userType);

const showDeleteModal = ref(false);
const showSuccessModal = ref(false);

const originalData = ref([]); // Guardo todo lo que me da response.data cuando soy profesor al montar el componente
const dataLastStatement = ref([]); // De filteredDataByGroupId preparo bien los campos de la tabla y se lo paso a DataTable
const filteredDataByGroupId = ref([]); // Datos del filtrados por groupID de originalData
const dataLevelCompletionTimes = ref([]);
const dataVerbCount = ref([]);
const dataPieChartGamesStartedCompleted = ref([]);
const dataBestCompletionTimePerLevelPerGroup = ref([]);
const activeUsers  = ref(0);
const completedGameUsers = ref(0);
const dataObjectCount = ref([]);

const deleteGame = async () => {
    try {
        await gamesStore.deleteGame(gameId.value);
        showDeleteModal.value = false;
        showSuccessModal.value = true;
    } catch (error) {
        console.error('Failed to delete game:', error);
    }
};

const handleSuccessModalOk = () => {
    showSuccessModal.value = false;
    router.push('/games'); // Navigate to the games list after closing the success modal
};

onMounted(async () => {
  await fetchDataFromMongoDB();

  // EVENTOS DE SOCKET
  // To send data to the server
  const hello = 'hello websocket'
  socket.emit('message', hello);

  // Data received from server
  socket.on('message', (msg) => {
    console.log('Message received from server:', msg);
  });
  
  socket.on('devDataPost', (updatedData) => { // Recibe record a record, no un array de records
    if (userType.value === 'dev') {
      if (Array.isArray(originalData.value)) { // Comprueba si originalData es un array o no (sea vacio o con algo), lo hago con originalData porque es el que tiene TODOS los groups
        let game = undefined;
        game = originalData.value.find(item => item.gameId ===  updatedData.statement.context.extensions["https://www.jaxpi.com/gameId"]);
          console.log(game);
        if (game) {
          let tempo = game.actors.find( e =>  e.sessionKey == updatedData.sessionKey  && e.sessionId == updatedData.sessionId);
          if (tempo){
            tempo.statements.push(updatedData.statement);  
          }
        }
      } else {
        console.warn('originalData no está definido o no es un array');
      }
    }
  });
});
  
onUnmounted(() => {
  // Remove all socket listeners
  socket.off('message');
  socket.off('newStatement');
});

const fetchDataFromMongoDB = async () => {
    try {
        const response = await axios.get('http://localhost:3000/records', {
        withCredentials: true
        });
        if (userType.value === 'dev'){
          originalData.value= response.data;
          console.log('response.data:', response.data);
        }
    } catch (error) {
        console.error('Error al obtener los datos de http://localhost:3000/records', error);
    }
};

const copyToken = (token) => {
    navigator.clipboard.writeText(token)
        .then(() => {
            console.log('Token copied');
        })
        .catch(err => {
            console.error('Failed to copy token:', err);
        });
};
  
watch(originalData, (newValue) => { // Actualizo filteredData segun originalData
    if (gameId.value)
      filteredDataByGroupId.value = newValue.filter(item => item.gameId === gameId.value);
    else 
      filteredDataByGroupId.value = newValue;
  
    if (filteredDataByGroupId.value.length > 0) {
        // Usuarios activos con statements
        const pseudoUsers = [...new Set(filteredDataByGroupId.value[0].actors.map( e => e.sessionKey))]; //['pesudo1','pseudo2',....]
        activeUsers.value = pseudoUsers.length;

        // Users que han terminado el juego (que tienen al menos un completed level 14)
        let counts = 0;
        pseudoUsers.forEach(user => {
            if (filteredDataByGroupId.value[0].actors.filter(e => e.sessionKey == user).map( e => e.statements).flat() // [ statements de todos los gs de user]
            .map(e=>({verb: e.verb.id.substring(e.verb.id.lastIndexOf("/") + 1), obj: e.object.definition.name['en-US']})) // [{verb:'completed',obj:'level 14'}....]
            .find( e => e.verb=='completed' && e.obj =='level 14')){
                counts++;
            }
        });
        completedGameUsers.value = counts;
    }

    // Hallar ultima hora jugada (ultimo statement recibido)
    if (filteredDataByGroupId.value.length > 0) {
      dataLastStatement.value = filteredDataByGroupId.value.flatMap(item => {
        return item.actors.map(actor => {
          // Ordenar los timestamps dentro de cada actor del más reciente al más antiguo
          let copyStatements = [...actor.statements];
          copyStatements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
           // Comprueba si el actor tiene statements, si los tiene devuelve el primer timestamp que es el mas reciente, sino devuelve null
          const lastStatement = copyStatements.length > 0 ? copyStatements[0].timestamp : null;
          return {
            lastTimestamp: lastStatement
          };
        });
      }).sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp)); // Sort by timestamp, from latest to oldest
      dataLastStatement.value = new Date(dataLastStatement.value[0].lastTimestamp).toLocaleString();
    }  else { // Limpia todas las stats var si no hay datos
      dataLastStatement.value = []; 
      dataVerbCount.value = [];
      dataLevelCompletionTimes.value = [];
      dataPieChartGamesStartedCompleted.value = [];
      dataBestCompletionTimePerLevelPerGroup.value = [];
      activeUsers.value = 0;
      completedGameUsers.value = 0;
      dataLastStatement.value = [];
      dataObjectCount.value = [];
    }
  
    // FORMATEAR DATOS PARA EL BARCHART - COMPLETION TIME PER LEVEL
    if (filteredDataByGroupId.value.length > 0) {
        const dataGroup = calculateLevelCompletionTimes(filteredDataByGroupId.value[0]);
        dataLevelCompletionTimes.value = [];
        dataGroup.forEach(actorInfo => {
          const keys = Object.keys(actorInfo.actorData).filter(key => key.includes('level'));
          if (keys) { // [ 'level1','level2', ...]
            keys.forEach(key => {
              if (dataLevelCompletionTimes.value.find(e => e.nameObject == key)) {
                let times = actorInfo.actorData[key];
                let previousData = dataLevelCompletionTimes.value.find(e => e.nameObject == key);
                const averageTime = (times.reduce((sum, num) => sum + num, 0) + previousData.sum) / (times.length + previousData.numElem);
                previousData.completionTime = averageTime;
                previousData.sum = times.reduce((sum, num) => sum + num, 0) + previousData.sum;
                previousData.numElem = times.length + previousData.numElem;
              } else {
                let times = actorInfo.actorData[key];
                if (times.length > 0) {
                  const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
                  let level = { nameObject: key, completionTime: averageTime, sum: times.reduce((sum, num) => sum + num, 0), numElem: times.length };
                  dataLevelCompletionTimes.value.push(level);
                }
              }
            }); 
          }
        });

        // PARA EL BARCHART DEL TAB COMPLETION TIME (el mejor tiempo por nivel del grupo)
        dataBestCompletionTimePerLevelPerGroup.value = [];
        dataGroup.forEach(actorInfo => {
          const keys = Object.keys(actorInfo.actorData).filter(key => key.includes('level') && key != 'level 15' && actorInfo.actorData[key].length > 0); // [ 'level1','level2', ...] menos el level 15 y los levels que no tienen tiempos de completado
          if(keys){
            keys.forEach(key => {
                if (dataBestCompletionTimePerLevelPerGroup.value.find(e => e.nameObject == key)) {
                  let resTempo = dataBestCompletionTimePerLevelPerGroup.value.find(e => e.nameObject == key);
                  let minTime;
                  let times = actorInfo.actorData[key];
                    if (times.length > 0){
                      minTime = Math.min(...times);
                      if ( minTime < resTempo.value){
                        resTempo.value = minTime;
                        resTempo.student = actorInfo.actorName;
                      }
                    }
                } else {
                    let times = actorInfo.actorData[key];
                    let minTime;
                    if (times.length > 0)
                      minTime = Math.min(...times);
                    else 
                      minTime = 0;

                    let level = { nameObject: key, value: minTime, student: actorInfo.actorName};
                    dataBestCompletionTimePerLevelPerGroup.value.push(level);
                }
            });
          }
        }); 
        console.log('dataBestCompletionTimePerLevelPerGroup', dataBestCompletionTimePerLevelPerGroup.value);

        // PARA EL BARCHART - COUNTVERBS 
        dataVerbCount.value = [];
        dataGroup.forEach(actorInfo => {
            const keysVerbs = Object.keys(actorInfo.actorData.verbs);
            if (keysVerbs) { // [ 'started','jumped', ...]
              keysVerbs.forEach(key => {
                if (dataVerbCount.value.find(e => e.nameObject == key)) {
                  let times = actorInfo.actorData.verbs[key];
                  let previousData = dataVerbCount.value.find(e => e.nameObject == key);
                  const sumVerbs = previousData.value + times;
                  previousData.value = sumVerbs;
                } else { // No esta el verb por primera vez
                  let times = actorInfo.actorData.verbs[key];
                  let count = { nameObject: key, value: times};
                  dataVerbCount.value.push(count); 
                }
              }); 
            }
          });
  
        // PARA EL PIECHART
        dataPieChartGamesStartedCompleted.value = [];
        let res = [ {nameObject:'Yes', value:completedGameUsers.value }, {nameObject: 'No',value: activeUsers.value - completedGameUsers.value }];
        dataPieChartGamesStartedCompleted.value = res;

        // PARA EL TOP 3 DE OBJETOS
        let resInteractions = [];
        let objects = [...new Set(dataGroup.flatMap( e => e.actorData.interactions.map( f => f.object)))]; 

        dataGroup.forEach(actorInfo => {
          objects.forEach(element => {
            let interaction = resInteractions.find( e => e.nameObject == element);
            if (interaction){
              let tempo = actorInfo.actorData.interactions.find( e => e.object == element);
              if(tempo){
                interaction.value+=tempo.count
              }
            } else {
              let objInteraction = {nameObject: element, value: 0 };
              let tempo = actorInfo.actorData.interactions.find( e => e.object == element);
              if (tempo){
                objInteraction.value += tempo.count;
              }
              resInteractions.push(objInteraction);
            }
          });
        });
        resInteractions = resInteractions.sort((a, b) => b.value - a.value);
        dataObjectCount.value = resInteractions;
    }

    console.log('dataLevelCompletionTimes:', dataLevelCompletionTimes.value);
    console.log('dataVerbCount:', dataVerbCount.value);
    console.log('dataPieChartGamesStartedCompleted:', dataPieChartGamesStartedCompleted.value);
}, { deep: true }); // Observa cambios profundos, cambios en propiedades internas del objeto o los elementos del array

watch(() => gameId.value, (newGameId, oldGameId) => {
    if (newGameId !== oldGameId) {
      fetchDataFromMongoDB(newGameId);
    }
});

const hideDeleteModal = () => {
  showDeleteModal.value = false;
};

// Observa los cambios en la ruta para cerrar el modal
watch(route, () => {
  hideDeleteModal();
});
</script>

<style scoped>
.game-details-view {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.header-container {
    display: flex;
    align-items: flex-start;
    gap: 50px; /* Espacio entre el contenedor de encabezado y el contenedor adicional */
}

.card-details {
  padding:35px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.delete-button {
    background-color: #d32f2f;
    color: white;
    font-weight: bold;
    font-size: 0.975rem;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    cursor: pointer;
    transition: background-color 0.2s, box-shadow 0.2s;
}

.delete-button:hover {
    background-color: #e16c6c;
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.5);
}

/* Nuevo contenedor vertical a la derecha */
.additional-content {
    width: 200px;
    background-color: #70c4cf;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
}

.top3 {
    display: flex;
    flex-direction: column; /* Apila los elementos dentro del h3 verticalmente */
    margin: 0;
}
.up {
    font-size: 2rem;
    color: #fbff00;
}

.down {
    color: #696969;
    margin-top: -5px;
}
</style>