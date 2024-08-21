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
                :cellClasses="computedCellClasses"
                @student-selected="handleStudentSelected" />
        </div>
    </div>
</template>

<script setup>
import { onMounted, watch, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGroupsStore } from '@/stores/groupsStore';
import { useStudentStore } from '@/stores/studentStore';

import BaseTable from '@/components/BaseTable.vue';

const router = useRouter(); // To navigate from one tab to another
const studentStore = useStudentStore();
const groupsStore = useGroupsStore();

const formattedStudents = ref([]);

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

// To apply colors to the times in the BaseTable
const computedCellClasses = computed(() => {
    return formattedStudents.value.map(student => {
        const lastInteraction = student.lastInteraction;
        let classes = {};

        if (lastInteraction === 'Never') {
            classes['lastInteraction'] = 'never-connected';
        } else if (lastInteraction.includes('More than 1 month ago') || lastInteraction.includes('week') || lastInteraction.includes('day')) {
            classes['lastInteraction'] = 'long-time-ago';
        } else if (lastInteraction.includes('hour') || lastInteraction.includes('minute') || lastInteraction.includes('second')) {
            classes['lastInteraction'] = 'recent-activity';
        }
        return classes;
    });
});

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

function handleStudentSelected(studentName) { // When you click on a row in the table selecting a student
    groupsStore.setSelectedGroupId(props.groupId); // Seteo el group seleccionado
    studentStore.setSelectedStudent(studentName.name); // Seteo el name del estudiante
    router.push({ name: 'StudentDetailsView', params: { name: studentName.name} }) // Go to StudentDetailsView using useRouter
}

// Show how long ago was the last move of a student
function formatTimestamp(timestamp) {
    const now = new Date();
    const timeDiff = now - new Date(timestamp);

    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 7));

    if (seconds < 60) {
        return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    } else if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (days < 7) {
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (weeks < 4) {
        return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    } else {
        return 'More than 1 month ago';
    }
}
</script>

<style>
.never-connected {
    color: red;
}

.long-time-ago {
    color: #e19200;
}

.recent-activity {
    color: #25CC64;
}
</style>