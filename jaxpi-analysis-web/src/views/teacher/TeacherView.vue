<template>
    <div class="teacher-view">
        <h1>Teacher's view</h1>
        <div class="teacher-details" v-if="teacher">
            <h3>Teacher details</h3>
            <p><strong>Name:</strong> {{ teacher.name }}</p>
            <p><strong>Email:</strong> {{ teacher.email }}</p>
            <p><strong>Institution:</strong> {{ teacher.institution }}</p>  
            <router-link to="/charts">View Charts</router-link>
        </div>
        <div class="buttons" v-if="teacher && !showConfirmationCreatedGameSession && !showConfirmationCreatedGroup" >
            <button v-if="!showCreateGroupForm && !showCreateGameSessionForm" @click="showCreateGroupForm = true">Create group</button>
            <button v-if="!showCreateGroupForm && !showCreateGameSessionForm" @click="showCreateGameSessionForm = true">Create game session</button>
        </div>

        <!-- Formulario para crear clase -->
        <div v-if="showCreateGroupForm" class="form-container">
            <CreateGroupForm @cancel="showCreateGroupForm = false" @submit="handleCreateGroup" />
        </div>

        <!-- Formulario para crear sesión -->
        <div v-if="showCreateGameSessionForm" class="form-container">
            <CreateGameSessionForm @cancel="showCreateGameSessionForm = false" @submit="handleCreateGameSession" />
        </div>

        <!-- Mensaje de información de sesión creada -->
        <div v-if="showConfirmationCreatedGameSession" class="confirmation">
            <h3>Game session created</h3>
            <p><strong>Game session name:</strong> {{ createdGameSession.sessionName }}</p>
            <p><strong>Game:</strong> {{ gameName }}</p>
            <p><strong>Group:</strong> {{ groupName }}</p>
            <p><strong>Students and keys:</strong></p>
            <ul>
                <li v-for="student in createdGameSession.students" :key="student.key">
                        {{ student.name }} - {{ student.key }}</li>
            </ul>
            <div class="buttons">
               <button @click="showConfirmationCreatedGameSession = false">OK</button>
               <button @click="exportDataToCSV">Export CSV</button>
            </div>
        </div>

        <!-- Mensaje de información de sesión creada -->
        <div v-if="showConfirmationCreatedGroup" class="confirmation">
            <h3>Group Created</h3>
            <p><strong>Institution:</strong> {{ createdGroup.institution }}</p>
            <p><strong>Group name:</strong> {{ createdGroup.name }}</p>
            <p><strong>Teacher:</strong> {{ createdGroup.teacher }}</p>
            <p><strong>Students:</strong></p>
            <ul>
                <li v-for="student in createdGroup.students" :key="student">
                        {{ student }}</li>
            </ul>
            <button @click="showConfirmationCreatedGroup = false">OK</button>
        </div>

        <p v-if="!teacher">Please log in as a teacher to view teacher details.</p>
    </div>

  <div class="filter-container">
    <div class="button-group">
      <button 
        v-for="category in categories" 
        :key="category"
        :class="{'active': selectedCategory === category}" 
        @click="selectCategory(category)">
        {{ category }}
      </button>
      <button 
        :class="{'active': selectedCategory === ''}" 
        @click="selectCategory('')">
        All Categories
      </button>
    </div>

    <div class="items-list">
      <div v-for="item in filteredItems" :key="item.id" class="item-card">
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>



import { computed, ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useGamesStore } from '@/stores/gamesStore';
import { useGroupsStore } from '@/stores/groupsStore';

import CreateGroupForm from '@/components/teacher/CreateGroupForm.vue';
import CreateGameSessionForm from '@/components/teacher/CreateGameSessionForm.vue';

const authStore = useAuthStore();
const gamesStore = useGamesStore();
const groupsStore = useGroupsStore();

const showCreateGroupForm = ref(false);
const showCreateGameSessionForm = ref(false);
const showConfirmationCreatedGroup = ref(false);
const showConfirmationCreatedGameSession = ref(false);
const createdGroup = ref({});
const createdGameSession = ref({});







// Data para el ejemplo (puedes obtener esto de una API)
const categories = ref(['Technology', 'Science', 'Health', 'Education']);
const items = ref([
  { id: 1, title: 'Tech Article 1', description: 'Description of tech article 1', category: 'Technology' },
  { id: 2, title: 'Science Article 1', description: 'Description of science article 1', category: 'Science' },
  { id: 3, title: 'Health Article 1', description: 'Description of health article 1', category: 'Health' },
  { id: 4, title: 'Education Article 1', description: 'Description of education article 1', category: 'Education' },
  { id: 5, title: 'Tech Article 2', description: 'Description of tech article 2', category: 'Technology' },
]);

// Estado reactivo
const selectedCategory = ref('');

// Propiedad computada para filtrar los elementos según la categoría seleccionada
const filteredItems = computed(() => {
  if (selectedCategory.value === '') {
    return items.value; // Si no se selecciona ninguna categoría, mostrar todos los elementos
  }
  return items.value.filter(item => item.category === selectedCategory.value);
});

// Método para manejar la selección de categoría
const selectCategory = (category) => {
  selectedCategory.value = category;
};

const teacher = computed(() => { // Devuelve todos los datos si usr_type = 'teacher', sino, null
    const teacherData = authStore.userData
    return teacherData && teacherData.usr_type === 'teacher' ? teacherData : null;
});
const gameName = computed(() => {
    return createdGameSession.value.gameId ? gamesStore.getGameNameById(createdGameSession.value.gameId) : 'No game selected';
});
const groupName = computed(() => {
    return createdGameSession.value.gameId ? groupsStore.getGroupNameById(createdGameSession.value.groupId) : 'No group selected';
});

const handleCreateGroup = async (groupData) => {
    showCreateGroupForm.value = false;
    createdGroup.value = groupData;
    //llamada al back
    // si todo ha ido bien
    showConfirmationCreatedGroup.value = true;
    //si ha ido mal
    //showErrorCreatedGameSession.value = true;
};

const handleCreateGameSession = async (sessionData) => {
    showCreateGameSessionForm.value = false;
    createdGameSession.value = sessionData;
    console.log(createdGameSession.value);
    //llamada al back
    // si todo ha ido bien
    showConfirmationCreatedGameSession.value = true;
    //si ha ido mal
    //showErrorCreatedGameSession.value = true;
};

const exportDataToCSV = () => {
    const students = createdGameSession.value.students;
    let csvContent = "Name,Key\n";
    students.forEach(student => {
        csvContent += `${student.name},${student.key}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); // Tipo MIME y codificacion de caracteres utf-8
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob); // Crea una URL temporal que apunta al Blob
    link.setAttribute("href", url);
    link.setAttribute("download", "students_keys.csv"); // Nombre del archivo a descargar
    document.body.appendChild(link); // Añadimos temporalmente link al documento

    link.click(); // Simulamos un click para desencadenar la descarga
    document.body.removeChild(link); // Eliminamos link del documento
};

onMounted(async () => {
  await gamesStore.fetchAllGames();
});
</script>

<style scoped>
.teacher-view {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.teacher-details {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.teacher-details > * {
    margin: 0; /* Elimina el margin de todos los elementos dentro de teacher-details */
}

.buttons {
    display: flex;
    gap: 10px;
}

.confirmation {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #f9f9f9;
}

.confirmation > * {
    margin: 0; /* Elimina el margin de todos los elementos dentro de teacher-details */
}

.confirmation button {
    align-self: flex-start;
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    background-color: #1976D2;
    color: white;
    cursor: pointer;
}

.confirmation button:hover {
    background-color: #0056b3;
}

h1 {
    margin-bottom: 0;
}
.filter-container {
  margin: 20px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.button-group button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background-color: #1976D2;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.button-group button.active {
  background-color: #0056a3;
}

.button-group button:hover {
  background-color: #0056a3;
}

.items-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.item-card {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  width: 100%;
  max-width: 300px;
}

.item-card h3 {
  margin: 0 0 10px;
}

.item-card p {
  margin: 0;
}
</style>