<template>
    <h2>Create class</h2>
    <form @submit.prevent="addClass">
        <label for="className">Class name:</label>
        <input type="text" v-model="classData.className" id="className" required />

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
            <textarea v-model="classData.students" id="students"></textarea>
        </div>

        <button type="submit">Create</button>
        <button type="button" @click="cancelForm">Cancel</button>
    </form>
</template>

<script setup>
import { ref, watch } from 'vue';

const emit = defineEmits(['submit', 'cancel']);

const classData = ref({
    className: '',
    students: '',
});
const generationType = ref('manual');
const numNames = ref(1);

watch(generationType, (newType) => {
    if (newType === 'random') {
        classData.value.students = ''; // Borro lo que haya anterior por si acaso
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

const addClass = () => {
    const classToAdd = { ...classData.value }; // Crea una copia del objeto classData
    if (generationType.value === 'random')
        classToAdd.students = generateRandomNames(numNames.value);

    resetForm();
    emit('submit', classToAdd);
};

const resetForm = () => {
    classData.value.className = '';
    classData.value.students = '';
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