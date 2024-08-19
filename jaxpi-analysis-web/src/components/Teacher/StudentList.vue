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
            />
        </div>
    </div>
</template>

<script setup>
import { onMounted, watch, ref } from 'vue';
import { useGroupsStore } from '@/stores/groupsStore';
import BaseTable from '@/components/BaseTable.vue';

const props = defineProps({
    groupId: {
        type: String,
        required: true
    },
    dataStudentList: {
        type: Array,
        required: true
    },
});

const groupsStore = useGroupsStore();
const formattedStudents = ref([]);

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
</script>

<style scoped>
</style>