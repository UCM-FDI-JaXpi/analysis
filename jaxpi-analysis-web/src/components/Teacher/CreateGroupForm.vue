<template>
    <h2>Create group</h2>
    <form @submit.prevent="addGroup">
        <label for="groupName">Group name:</label>
        <input type="text" v-model="groupData.groupName" id="groupName" required />

        <label for="generationType">Choose generation method:</label>
        <select v-model="generationType" id="generationType">
            <option value="manual">Manual</option>
            <option value="random">Random</option>
        </select>

        <div v-if="generationType === 'random'">
            <label for="numNames">Number of names:</label>
            <input type="number" v-model="numNames" id="numNames" min="1" />
        </div>

        <div v-if="generationType === 'manual'">
            <label for="students">Students (one per line):</label>
            <textarea v-model="groupData.students" id="students"></textarea>
        </div>

        <button type="submit">Create</button>
        <button type="button" @click="cancelForm">Cancel</button>
    </form>
</template>

<script setup>
import { ref, watch } from 'vue';

const emit = defineEmits(['submit', 'cancel']);

const groupData = ref({
    groupName: '',
    students: '',
});
const generationType = ref('manual');
const numNames = ref(1);

watch(generationType, (newType) => {
    if (newType === 'random') {
        groupData.value.students = ''; // Borro lo que haya anterior por si acaso
    }
});

const generateRandomNames = (count) => {
    let names = '';
    const namePrefix = 'Student';

    for (let i = 1; i <= count; i++) {
        if (i > 1) {
            names += '\n'; // Añadimos un salto de línea antes de cada nombre, excepto el primero
        }
        names += `${namePrefix} ${i}`;
    }
    return names;
};

const addGroup = () => {
    const groupToAdd = { ...groupData.value }; // Crea una copia del objeto groupData
    if (generationType.value === 'random')
        groupToAdd.students = generateRandomNames(numNames.value);

    resetForm();
    emit('submit', groupToAdd);
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
</style>