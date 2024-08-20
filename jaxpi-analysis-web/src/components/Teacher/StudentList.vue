<template>
    <div class="student-list">
        <div v-if="formattedStudents.length === 0" class="no-data">
            <p>No students available.</p>
        </div>
        <div v-else class="table-container">
            <BaseTable 
                :headers="['Name', 'Last interaction']"
                :rows="formattedStudents"
                :rowKeys="['name', 'lastInteraction']"
                @student-selected="handleStudentSelected"
            />
        </div>
    </div>
</template>

<script setup>
import { onMounted, watch, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGroupsStore } from '@/stores/groupsStore';
import { useStudentStore } from '@/stores/studentStore';

import BaseTable from '@/components/BaseTable.vue';

const router = useRouter(); // To navigate from one tab to another
const studentStore = useStudentStore();

const props = defineProps({
    groupId: {
        type: String,
        required: true
    },
    dataStudentList: {
        type: Array,
        required: true
    },
    filteredDataByGroupId: {
        type: Array,
        required: true
    },
});

const groupsStore = useGroupsStore();
const formattedStudents = ref([]);
// const dataStudentDetails = ref([]); // Guardo studentName y sus statements y se lo paso a StudentDetailsView.vue

// Convertir una lista de nombres a una lista de objetos (formato que espera BaseTable)
const getFormattedStudents = () => {
    const students = groupsStore.getStudentsByGroupId(props.groupId);
    console.log('Students:', students);
    if (props.dataStudentList.length == 0){
        return students.map(student => ({ name: student, lastInteraction: 'Never' }));
    } else {
        let res = [];
        students.forEach(student => {
            let info = props.dataStudentList.find( e => e.student == student);
            let tempo;
            if (info) {
                tempo = {
                    name: info.student,
                    lastInteraction: formatTimestamp(info.lastTimestamp)
                };
            } else {
                tempo = {
                    name: student,
                    lastInteraction: 'Never'
                };
            }
            res.push(tempo);
        });
        return res;
    }
};

const fetchGroups = async () => {
    if (groupsStore.groups.length === 0) { // Solo carga si no hay datos
        await groupsStore.fetchGroups();
    }
};

onMounted(() => {
    fetchGroups();
    formattedStudents.value = getFormattedStudents();
    console.log('formattedStudents:', formattedStudents.value);
});

// Observamos los cambios en groupId y llamamos a fetchGroups cuando cambie
watch(() => props.groupId, (newGroupId, oldGroupId) => {
    if (newGroupId !== oldGroupId) {
        fetchGroups();
    }
});

watch(() => props.dataStudentList, (newGroupId, oldGroupId) => {
    if (newGroupId !== oldGroupId) {
        formattedStudents.value = getFormattedStudents();
    }
});

// To format the timestamp in a readable format
function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
}

// const filterdataStudentDetails = (studentName) => { // En dataStudentDetails: studentName y sus statements
//     dataStudentDetails.value = props.filteredDataByGroupId.flatMap(item => item.actors)
//                                                    .filter(actor => actor.name === studentName.name);
// };
  
function handleStudentSelected(studentName) { // When you click on a row in the table selecting a student
    // filterdataStudentDetails(studentName);
    // const selectedStudentData = dataStudentDetails.value;
    // console.log(selectedStudentData)
    groupsStore.setSelectedGroupId(props.groupId); // Seteo el group seleccionado


    // if(dataStudentDetails.value.length === 0)
    studentStore.setSelectedStudent(studentName.name); // Seteo el name del estudiante

    router.push({ name: 'StudentDetailsView', params: { name: studentName.name} }) // Go to StudentDetailsView using useRouter
}
</script>

<style scoped>
</style>