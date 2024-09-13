<template>
    <div class="student-view">
        <h1 v-if="!student">Student's view</h1>
        <p v-if="!student">Please log in as a student to view student details.</p>

        <div class="student-details" v-if="student">
            <h3 class="student-name">{{ student.name.slice(0, -6) }}</h3>
            <p class="student-role">Role: {{ student.usr_type }}</p>
        </div>

        <div v-if="student">
            <div class="tabs">
                <button v-for="(tab, index) in tabs" :key="index" @click="activeTab = index"
                    :class="{ 'active': activeTab === index }">
                    {{ tab }}
                </button>
            </div>

            <div v-if="activeTab === 0" class="tab-content-charts">
                <ChartsStudentComponent :groupId="groupId"
                                        :filteredDataByGroupId ="filteredDataByGroupId"
                                        :dataTableFormat="dataTableFormat"
                                        :loading="loading"  />
            </div>

            <div v-if="activeTab === 1" class="tab-content-charts">
                <GameSessionList />
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useGameSessionsStore } from '@/stores/gameSessionsStore.js';
import { useGroupsStore } from '@/stores/groupsStore';
import socket from '@/socket';
import axios from 'axios';
import ChartsStudentComponent from '@/components/student/ChartsStudentComponent.vue';
import GameSessionList from '@/components/teacher/GameSessionList.vue';

const authStore = useAuthStore();
const gameSessionsStore = useGameSessionsStore();
const groupsStore = useGroupsStore();

const userType = computed(() => authStore.userType);
const student = computed(() => { // Devuelve todos los datos si usr_type = 'student', sino, null
    const studentData = authStore.userData
    return studentData && studentData.usr_type === 'student' ? studentData : null;
});

const tabs = ref(["Overview", "Game sessions"]);
const activeTab = ref(0); // Define active tab
const groupId = ref('');
const originalData = ref([]); // Guardo todo lo que me da response.data cuando soy student al montar el componente
const dataTableFormat = ref([]); // De filteredDataByGroupId preparo bien los campos de la tabla y se lo paso a DataTable
const filteredDataByGroupId = ref([]); // Datos del filtrados por groupID de originalData
const loading = ref(true);

onMounted(async () => {
  await fetchDataFromMongoDB();
  await gameSessionsStore.fetchGameSessionsByStudentName(student.value?.name);

  socket.on('newStatement', (updatedData) => { // Recibe record a record, no un array de records
    if (userType.value === 'student') {
      if (originalData.value[0] && (updatedData.context.contextActivities.parent.id == originalData.value[0].groupId) 
          && student.value.session_keys.find( e => e == updatedData.context.extensions["https://www.jaxpi.com/sessionKey"]) ) {
        let actorFound = false;
        if (Array.isArray(originalData.value)) { // Comprueba si originalData es un array o no (sea vacio o con algo), lo hago con originalData porque es el que tiene TODOS los groups
          let group = undefined;
          group = originalData.value[0];

          if (group) {
            group.actors.forEach(actor => {
              if (actor.sessionKey === updatedData.context.extensions["https://www.jaxpi.com/sessionKey"]) {
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
          }
        } else {
          console.warn('originalData no está definido o no es un array');
        }
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
      console.log('response.data:', response.data);
      if (userType.value === 'student') {
        groupId.value = response.data[0].groupId;
        groupsStore.setSelectedGroupId(response.data[0].groupId);
        originalData.value = response.data;
      }
  } catch (error) {
      console.error('Error al obtener los datos de http://localhost:3000/records', error);
  } finally {
    loading.value = false;
  }
};

watch(originalData, (newValue) => { // Actualizo filteredData segun originalData
  if (groupId.value)
    filteredDataByGroupId.value = newValue.filter(item => item.groupId === groupId.value);
  else 
    filteredDataByGroupId.value = newValue;

    loading.value = false;
  // FORMATEAR DATOS PARA TABLE
  if (filteredDataByGroupId.value.length > 0) {
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
  }
}, { deep: true }); // Observa cambios profundos, cambios en propiedades internas del objeto o los elementos del array
</script>

<style scoped>
.student-view {
    padding: 1rem;
    padding-left: 11rem;
    padding-right: 11rem;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

h1 {
    margin-bottom: 0;
}

.student-details {
    display: flex;
    flex-direction: column;
    background-color: #f9f9f9;
    padding: 1.5rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #ddd; 
    margin-bottom: 20px;
    width: -webkit-fill-available;
    max-width: 800px;
}

.student-details > * {
    margin: 0; /* Elimina el margin de todos los elementos dentro de student-details */
}

.student-name {
    font-size: 1.7rem;
}

.student-role {
    font-size: 0.9rem;
    color: #727171; /* Color gris claro para los detalles */
    font-weight: bold;
}

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
    gap: 50px;
    padding: 1rem;
    background-color: #79c1fd;
}
</style>