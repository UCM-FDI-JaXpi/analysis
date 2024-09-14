<template>
    <div class="group-details-view">
      <div v-if="!group">There are no details to show.</div>

      <div v-else>
        <div v-if="!loading" class="card-details">
          <h1>{{ group.name }}</h1>
          <p><strong>Total students: </strong>{{ group.students.length }}</p>
          <p><strong>Active students: </strong>{{ activeUsers }}</p>
          <p><strong>No active students: </strong>{{ group.students.length - activeUsers }}</p>
          <button @click="navigateToCreateGameSession">Create game session</button>
        </div>
        <div v-else class="card-details">
          <h1>{{ group.name }}</h1>
          <p><strong>Total students: </strong>0</p>
          <p><strong>Active students: </strong>0</p>
          <p><strong>No active students: </strong>0</p>
          <button @click="navigateToCreateGameSession">Create game session</button>
        </div>

        <div class="tabs-container">
          <div class="tabs">
              <button v-for="(tab, index) in tabs" :key="index" @click="activeTab = index"
                  :class="{ 'active': activeTab === index }">
                  {{ tab }}
              </button>
          </div>
        </div>

        <div class="tab-content">
          <div v-if="activeTab === 0">
              <GameSessionList />
          </div>

          <div v-if="activeTab === 1">
              <StudentList :groupId="group.id"
                            :dataStudentList = "dataTableFormat"
                            :filteredDataByGroupId ="filteredDataByGroupId"/>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import socket from '@/socket';
import { useGroupsStore } from '@/stores/groupsStore';
import { useAuthStore } from '@/stores/authStore';
import { useGameSessionsStore } from '@/stores/gameSessionsStore';

import GameSessionList from '@/components/teacher/GameSessionList.vue';
import StudentList from '@/components/teacher/StudentList.vue';

const route = useRoute();
const router = useRouter();
const groupsStore = useGroupsStore();
const authStore = useAuthStore(); // To use Pinia store (desestructuracion)
const gameSessionsStore = useGameSessionsStore();

const groupId = computed(() => route.params.groupId);
const group = computed(() => groupsStore.getGroupById(groupId.value));
const userType = computed(() => authStore.userType);

const tabs = ref(["Game sessions", "Students"]);
const activeTab = ref(0); // Define active tab

const originalData = ref([]); // Guardo todo lo que me da response.data cuando soy profesor al montar el componente
const dataTableFormat = ref([]); // De filteredDataByGroupId preparo bien los campos de la tabla y se lo paso a DataTable
const filteredDataByGroupId = ref([]); // Datos del filtrados por groupID de originalData
const activeUsers  = ref(0);
const loading = ref(true);

onMounted(async () => {
  gameSessionsStore.loading = true;
  groupsStore.setSelectedGroupId(groupId.value);
  await fetchDataFromMongoDB();
  fetchGameSessions(groupId.value); // Al cambiar a esta vista y montarla, llamo a los gamesessions del group dado

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

const navigateToCreateGameSession = () => {
    router.push('/create-game-session');
};

const fetchGameSessions = async (groupId) => {
  if (groupId) // Si tengo groupdId, cogo sus gamesessions sino, limpio gamesessions []
    await gameSessionsStore.fetchGameSessions(groupId);
  else
    gameSessionsStore.$reset();
};

const fetchDataFromMongoDB = async () => {
    try {
        const response = await axios.get('http://localhost:3000/records', {
        withCredentials: true
        });

        if (userType.value === 'teacher') {
          console.log('response.data:', response.data);
          originalData.value = response.data;
          if (originalData.value.length === 0)
              console.log('No data for teacher');
        } else {
          console.log('Unknown user type');
          console.log('response.data:', response.data);
        }
        loading.value = false;
    } catch (error) {
        console.error('Error al obtener los datos de http://localhost:3000/records', error);
    }
};
  
watch(originalData, (newValue) => { // Actualizo filteredData segun originalData
    if (groupId.value)
      filteredDataByGroupId.value = newValue.filter(item => item.groupId === groupId.value);
    else 
      filteredDataByGroupId.value = newValue;
  
    // FORMATEAR DATOS PARA TABLE
    if (filteredDataByGroupId.value.length > 0) {
      ///////////////////////////////////////////////////////////////////////////////////////////// CALCULAR USUARIOS ACTIVOS DEL GRUPO
      let dataTempo = filteredDataByGroupId.value[0].actors.map( e => e.name);
      activeUsers.value = [...new Set(dataTempo)].length;
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
            session: actor.sessionName,
            game: actor.gameName,
            numberOfStatements: actor.statements.length,
            lastTimestamp: lastStatement
          };
        });
      }).sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp)); // Sort by timestamp, from latest to oldest
    }  else { // Limpia todas las stats var si no hay datos
      dataTableFormat.value = [];
      activeUsers.value = 0;
    }
}, { deep: true }); // Observa cambios profundos, cambios en propiedades internas del objeto o los elementos del array

watch(() => groupId.value, (newGroupId, oldGroupId) => {
    if (newGroupId !== oldGroupId) {
      loading.value = true;
      fetchDataFromMongoDB(newGroupId);
      fetchGameSessions(newGroupId);
      groupsStore.setSelectedGroupId(groupId.value);
    }
});
</script>

<style scoped>
.group-details-view {
    padding: 1rem;
}

.group-details-general-charts {
    padding: 1rem;
}

.card-details {
    position: relative;
}

.card-details button {
    position: absolute;
    top: 30px;
    right: 20px;
    padding: 10px;
    font-size: 0.975rem;
    color: white;
    font-weight: bold;
    background-color: #3eaf2a;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s, box-shadow 0.2s;
}

.card-details button:hover {
    background-color: #43bd2dbd;
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.5);
}

.tabs {
    display: flex;
    border-bottom: 2px solid #ddd;
    max-width: 1300px;
}

.tabs button {
    padding: 10px 20px;
    margin-right: 2px;
    cursor: pointer;
    border: none;
    background-color: #f0f0f0;
    border-radius: 5px 5px 0 0;
    transition: background-color 0.2s, color 0.2s;
}

.tabs button.active {
    background-color: #79c1fd;
    color: white;
}

.tab-content {
    padding: 2rem;
    background-color: #a8d8ff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    max-width: 1300px;
    box-sizing: border-box;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    min-height: 477px;
}
</style>