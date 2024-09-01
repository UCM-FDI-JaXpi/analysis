<template>
    <h2>Create class</h2>
    <form @submit.prevent="addGroup">
        <label for="groupName">Class name *</label>
        <input type="text" v-model="groupData.groupName" id="groupName" required />

        <label for="generationType">Choose generation method</label>
        <select v-model="generationType" id="generationType">
            <option value="manual">Manual</option>
            <option value="random">Random</option>
        </select>

        <div v-if="generationType === 'random'">
            <label for="numNames" style="margin-bottom:10px;">Number of names (max 50) *</label>
            <input type="number" v-model="numNames" id="numNames" min="1" max="50" required />
        </div>

        <div v-if="generationType === 'manual'">
            <label for="students" style="margin-bottom:10px;">Students (one per line) *</label>
            <textarea v-model="groupData.students" id="students" required @input="adjustHeight"></textarea>
            <small>Maximum 50 students</small>
        </div>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <div class="button-container">
            <button type="submit">Create</button>
            <button type="button" @click="cancelForm">Cancel</button>
        </div>
    </form>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useGroupsStore } from '@/stores/groupsStore';

const emit = defineEmits(['submit', 'cancel']);
const groupsStore = useGroupsStore();

const groupData = ref({
    groupName: '',
    students: '',
});
const generationType = ref('manual');
const numNames = ref(1);
const maxStudents = 50;
const errorMessage = ref('');

watch(generationType, (newType) => {
    if (newType === 'random') {
        groupData.value.students = ''; // Borro lo que haya anterior por si acaso
    }
});
const cleanStudentName = (name) => {
    return name
        .replace(/,/g, ' ')   // Reemplaza comas por espacios
        .replace(/\s+/g, ' ') // Reemplaza múltiples espacios por un solo espacio
        .trim();              // Elimina espacios al principio y al final
};

const validateStudentNames = (students) => {
    return students
        .split('\n')           // Divide en líneas
        .map(cleanStudentName) // Limpia cada nombre
        .filter(s => s);       // Elimina líneas vacías
};

const addGroup = async () => {
    const groupToAdd = { ...groupData.value }; // Crea una copia del objeto groupData
    try {
        let createdGroup;
        if (generationType.value === 'manual') {
           const studentsArray = validateStudentNames(groupData.value.students);
            if (studentsArray.length > maxStudents) {
                errorMessage.value = `You can only have up to ${maxStudents} students.`;
                return;
            }
            createdGroup = await groupsStore.createGroupManual(groupToAdd.groupName, studentsArray);
        } else { // random
            createdGroup = await groupsStore.createGroupRandom(groupToAdd.groupName, numNames.value);
        }
        if(createdGroup){
            console.log('Group created successfully!');
            console.log('Group created: ', createdGroup);
            resetForm();
            emit('submit', createdGroup);
        }else{
            errorMessage.value = 'Failed to create group. Please try again.';
        }
    } catch (error) {
        errorMessage.value = 'An unexpected error occurred.';
        console.error('Error no controlado: ', error);
    }
};

const resetForm = () => {
    groupData.value.groupName = '';
    groupData.value.students = '';
    generationType.value = 'manual';
    numNames.value = 1;
    errorMessage.value = '';
};

const cancelForm = () => {
    resetForm();
    emit('cancel');
};

const adjustHeight = (event) => {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
};
</script>

<style scoped>
h2 {
    margin-top: 0;
    font-size: 1.8rem;
    text-align: center;
}

form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 100%;
}

form label {
    display: block;
    color: #444;
    font-weight: bold;
    font-size: 1rem;
}

form input {
    display: block;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

input, select, textarea {
    display: block;
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    box-sizing: border-box;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

input:focus, select:focus, textarea:focus {
    border-color: #4a90e2;
    outline: none;
    box-shadow: 0 0 5px rgba(74, 144, 226, 0.3);
}

textarea {
    width: 93%;
    height: 100%;
    max-width: 100%;
    min-height: 100px;
    max-height: 170px;
    box-sizing: border-box;
}

small {
    display: block;
    color: gray;
}

.error-message {
    text-align: center;
    color: #ef0000;
    font-size: 0.9rem;
    margin-top: 10px;
}

.button-container {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-top: 7px;
}

form button {
    padding: 10px;
    width: 100%;
    background-color: #1976D2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

form button:hover {
    background-color: #1565C0;
}
</style>