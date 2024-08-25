<template>
    <div class="game-details-view" v-if="game">
        <div class="header">
            <h1>Game details for {{ game.name }}</h1>
            <button @click="showDeleteModal = true" class="delete-button">Delete Game</button>
        </div>
        <div class="game-details" v-if="game">
            <p><strong>Game id: </strong> {{ game.id }}</p>
            <p><strong>Users: </strong>{{  activeUsers }}</p>
            <p><strong>Users who have completed the game: </strong> {{ completedGameUsers }}</p>
        </div>
        <div class="tabs">
            <button v-for="(tab, index) in tabs" :key="index" @click="activeTab = index"
                :class="{ 'active': activeTab === index }">
                {{ tab }}
            </button>
        </div>

        <div v-if="activeTab === 0" class="tab-content">
            <ChartsDevComponent 
            :originalData="originalData"
            :filteredDataByGroupId ="filteredDataByGroupId"
            :dataTableFormat="dataTableFormat"
            :dataLevelCompletionTimes="dataLevelCompletionTimes"
            :dataVerbCount="dataVerbCount"
            :dataPieChartGamesStartedCompleted="dataPieChartGamesStartedCompleted" />
        </div>

        <ConfirmModal
          :visible="showDeleteModal"
          title="Confirm deletion"
          message="Are you sure you want to delete this game?<br>This action cannot be undone. Data will be lost."
          @confirm="deleteGame"
          @cancel="showDeleteModal = false"
        />
    </div>
    <div v-else>
        <SuccessModal
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
import { useGroupsStore } from '@/stores/groupsStore';
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
const groupsStore = useGroupsStore();
const authStore = useAuthStore(); // To use Pinia store (desestructuracion)

const gameId = computed(() => route.params.gameId);
const game = computed(() => gamesStore.getGameById(gameId.value));
const groupId = computed(() => route.params.groupId);
const userType = computed(() => authStore.userType);

const tabs = ref(["Charts"]);
const activeTab = ref(0);
const showDeleteModal = ref(false);
const showSuccessModal = ref(false);

const originalData = ref([]); // Guardo todo lo que me da response.data cuando soy profesor al montar el componente
const dataTableFormat = ref([]); // De filteredDataByGroupId preparo bien los campos de la tabla y se lo paso a DataTable
const filteredDataByGroupId = ref([]); // Datos del filtrados por groupID de originalData
const dataLevelCompletionTimes = ref([]);
const dataVerbCount = ref([]);
const dataPieChartGamesStartedCompleted = ref([]);
const dataBestCompletionTimePerLevelPerGroup = ref([]);
const activeUsers  = ref(0);
const completedGameUsers = ref(0);

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
  // const hello = 'hello websocket'
  // socket.emit('message', hello);

  // Data received from server
  // console.log(props)
  // socket.on('message', (msg) => {
  //   console.log('Message received from server:', msg);
  // });
  
  socket.on('newStatement', (updatedData) => { // Recibe record a record, no un array de records
    if (userType.value === 'teacher') {
      let actorFound = false;
      if (Array.isArray(originalData.value)) { // Comprueba si originalData es un array o no (sea vacio o con algo), lo hago con originalData porque es el que tiene TODOS los groups
        let group = undefined;
        group = originalData.value.find(item => item.groupId ===  updatedData.context.contextActivities.parent.id);

        if (group) {
          group.actors.forEach(actor => {
            if (actor.sessionKey === updatedData.context.extensions["https://www.jaxpi.com/sessionKey"]) { // Me viene de back deshaseada
              // Verifica que updatedData tiene la estructura esperada
              if (updatedData && updatedData.actor && updatedData.context && updatedData.object && updatedData.stored && updatedData.timestamp && updatedData.verb) {
                actor.statements.push(updatedData);
                actorFound = true;
                //console.log('Dato añadido al actor:', actor);
              } else {
                console.warn('updatedData tiene una estructura inesperada', updatedData);
              }
            }
          });
          if (!actorFound) { // Tengo que añadir el estudiante en su group por primera vez
            console.log("Este estudiante no corresponde a este group");
            let actor = {};
            actor.name = updatedData.context.extensions["https://www.jaxpi.com/studentName"];
            actor.sessionKey = updatedData.context.extensions["https://www.jaxpi.com/sessionKey"];
            actor.gameId = updatedData.context.extensions["https://www.jaxpi.com/gameId"];
            actor.gameName = updatedData.context.extensions["https://www.jaxpi.com/gameName"];
            actor.sessionId = updatedData.context.extensions["https://www.jaxpi.com/sessionId"];
            actor.sessionName = updatedData.context.extensions["https://www.jaxpi.com/sessionName"];
            actor.statements = [updatedData];
            group.actors.push(actor);
          } else {
            console.log('Datos actualizados en originalData:', originalData.value);
          }
        } else { // Si en originalData(primer fetch) no tengo ningun group, añado este nuevo group, o si hay groups, añado este group al resto
          console.log('No se encontró el group con groupId:', groupId);
          let newGroup = {};
          newGroup.groupId = updatedData.context.contextActivities.parent.id;
          if (groupId.value){
            newGroup.groupName = groupsStore.getGroupNameById(groupId);
          } else {
            newGroup.groupName = groupsStore.getGroupNameById(updatedData.context.contextActivities.parent.id);
          }
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
    // FORMATEAR DATOS PARA TABLE
    if (filteredDataByGroupId.value.length > 0) {
      ///////////////////////////////////////////////////////////////////////////////////////////// CALCULAR USUARIOS ACTIVOS DEL GRUPO
    //   let dataTempo = filteredDataByGroupId.value[0].actors.map( e => e.name);
    //   activeUsers.value = [...new Set(dataTempo)].length;
      /////////////////////////////////////////////////////////////////////////////////////////////
      dataTableFormat.value = filteredDataByGroupId.value.flatMap(item => {
        return item.actors.map(actor => {
          // Ordenar los timestamps dentro de cada actor del más reciente al más antiguo
          let copyStatements = [...actor.statements];
          copyStatements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
           // Comprueba si el actor tiene statements, si los tiene devuelve el primer timestamp que es el mas reciente, sino devuelve null
          const lastStatement = copyStatements.length > 0 ? copyStatements[0].timestamp : null;
          return {
            student: actor.name,
            session: actor.sessionName + " (" + actor.sessionId + ")",
            game: actor.gameName,
            numberOfStatements: actor.statements.length,
            lastTimestamp: lastStatement
          };
        });
      }).sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp)); // Sort by timestamp, from latest to oldest
    }  else { // Limpia todas las stats var si no hay datos
      dataTableFormat.value = []; 
      dataVerbCount.value = [];
      dataLevelCompletionTimes.value = [];
      dataPieChartGamesStartedCompleted.value = [];
      dataBestCompletionTimePerLevelPerGroup.value = [];
      activeUsers.value = 0;
      completedGameUsers.value = 0;
    }
  
    // FORMATEAR DATOS PARA EL PRIMER BARCHART - COMPLETION TIME PER LEVEL
    if (filteredDataByGroupId.value.length > 0) { // Pueden venir varios grupos
      if (groupId.value) {
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

        // PARA PRIMER BARCHART DEL TAB COMPLETION TIME (el mejor tiempo por nivel del grupo)
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
                      if ( minTime < resTempo.value || resTempo.value === 0){
                        resTempo.value = minTime;
                        resTempo.student = actorInfo.actorName;
                      }
                    }
                } else {
                    let times = actorInfo.actorData[key];
                    let minTime;
                    if (times.length > 0)
                      minTime = Math.min(...times);
                    else minTime = 0;
                    let level = { nameObject: key, value: minTime, student: actorInfo.actorName};
                    dataBestCompletionTimePerLevelPerGroup.value.push(level);
                }
            });
          }
        }); 
        console.log('dataBestCompletionTimePerLevelPerGroup', dataBestCompletionTimePerLevelPerGroup.value);

        // PARA EL SEGUNDO BARCHART - COUNTVERBS 
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
  
        // PARA EL PRIMER PIECHART - GAMES STARTED AND COMPLETED
        dataPieChartGamesStartedCompleted.value = [];
        dataGroup.forEach(actorInfo => {
            // actorInfo.actorData.starteds = > [{"level": "level 1"},{"level": "level 2"}]
            let levels1 = actorInfo.actorData.starteds.filter( start => start.level == 'level 1')
            let completeds14 = actorInfo.actorData.completeds.filter( completed => completed.level == 'level 14')
            if (levels1.length == 0 && completeds14.length == 0) { // No pinto el piechart si no hay datos
              dataPieChartGamesStartedCompleted.value = [];
            } else {
              if (dataPieChartGamesStartedCompleted.value.find(e => e.nameObject == 'started')) {
                  let previousData = dataPieChartGamesStartedCompleted.value.find(e => e.nameObject == 'started');
                  const sumStarted = previousData.value + (levels1.length - completeds14.length);  // No completados 
                  previousData.value = sumStarted;
                  previousData = dataPieChartGamesStartedCompleted.value.find(e => e.nameObject == 'completed');
                  const sumCompleted = previousData.value + completeds14.length;
                  previousData.value = sumCompleted;
                } else { // No hay datos aun 
                  let countStarted = { nameObject: 'started', value: levels1.length - completeds14.length};
                  let countCompleted = { nameObject: 'completed', value: completeds14.length};
                  dataPieChartGamesStartedCompleted.value.push(countStarted); 
                  dataPieChartGamesStartedCompleted.value.push(countCompleted); 
                }
            }
          });
      }
      // else 
      // bucle for para cada grupo
      console.log('dataLevelCompletionTimes:', dataLevelCompletionTimes.value);
      console.log('dataVerbCount:', dataVerbCount.value);
      console.log('dataPieChartGamesStartedCompleted:', dataPieChartGamesStartedCompleted.value);
    }
}, { deep: true }); // Observa cambios profundos, cambios en propiedades internas del objeto o los elementos del array

watch(() => gameId.value, (newGameId, oldGameId) => {
    if (newGameId !== oldGameId) {
      fetchDataFromMongoDB(newGameId);
    }
});
</script>

<style scoped>
.game-details-view {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    background-color: #f9f9f9;

}
.game-details > p {
    margin-top: 0; /* Elimina el margin de todos los elementos dentro de teacher-details */
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.delete-button {
    background-color: #d32f2f;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    cursor: pointer;
    transition: background-color 0.24s ease;
}

.delete-button:hover {
    background-color: #b71c1c;
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

h1 {
    font-size: 2rem;
    margin: 0;
}
</style>