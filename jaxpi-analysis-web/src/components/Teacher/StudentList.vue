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
import { computed, onMounted, watch } from 'vue';
import { useGroupsStore } from '@/stores/groupsStore';
import BaseTable from '@/components/BaseTable.vue';

const props = defineProps({
    groupId: {
        type: String,
        required: true
    }
});

const groupsStore = useGroupsStore();
// Convertir una lista de nombres a una lista de objetos (formato que espera BaseTable)
const formattedStudents = computed(() => {
    const students = groupsStore.getStudentsByGroupId(props.groupId);
    console.log('Students:', students);
    return students.map(student => ({ name: student }));
});

const fetchGroups = async () => {
    if (groupsStore.groups.length === 0) { // Solo carga si no hay datos
        await groupsStore.fetchGroups();
    }
};

onMounted(() => fetchGroups());

// Observamos los cambios en groupId y llamamos a fetchGroups cuando cambie
watch(() => props.groupId, (newGroupId, oldGroupId) => {
    if (newGroupId !== oldGroupId) {
        fetchGroups();
    }
});
</script>

<style scoped>
</style>