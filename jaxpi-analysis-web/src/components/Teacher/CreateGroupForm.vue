<template>
    <h2>Create group</h2>
    <form @submit.prevent="addGroup">
        <label for="groupName">Group name *</label>
        <input type="text" v-model="groupData.groupName" id="groupName" required />

        <label for="generationType">Choose generation method</label>
        <select v-model="generationType" id="generationType">
            <option value="manual">Manual</option>
            <option value="random">Random</option>
        </select>

        <div v-if="generationType === 'random'">
            <label for="numNames">Number of names (max 100) *</label>
            <input type="number" v-model="numNames" id="numNames" min="1" max="100" required />
        </div>

        <div v-if="generationType === 'manual'">
            <label for="students">Students (one per line) *</label>
            <textarea v-model="groupData.students" id="students" required></textarea>
            <small>Maximum 100 students</small>
        </div>

        <button type="submit">Create</button>
        <button type="button" @click="cancelForm">Cancel</button>
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
const maxStudents = 100;

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
                alert(`You can only have up to ${maxStudents} students.`);
                return;
            }
            createdGroup = await groupsStore.createGroupManual(groupToAdd.groupName, studentsArray);
        } else { // random
            createdGroup = await groupsStore.createGroupRandom(groupToAdd.groupName, numNames.value);
        }
        if(createdGroup){
            console.log('Group created successfully!');
            console.log(createdGroup);
            resetForm();
            emit('submit', createdGroup);
        }else{
            //aqui seteariamos para mostrar mensaje de error ya 
            //que queremos mostrar el mensaje, y que el form siga abierto
        }
    } catch (error) {
        console.error('Error no controlado: ', error);
    }
};

const resetForm = () => {
    groupData.value.groupName = '';
    groupData.value.students = '';
    generationType.value = 'manual';
    numNames.value = 1;
};

const cancelForm = () => {
    resetForm();
    emit('cancel');
};
</script>

<style scoped>
form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

textarea {
    width: 100%;
    height: 100px;
}

small {
    color: gray;
}
</style>