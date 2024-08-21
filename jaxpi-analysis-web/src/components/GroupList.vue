<template>
    <div class="group-list">
        <div v-if="groups.length === 0" class="no-groups-message">
            <p>There are no groups.</p>
        </div>

        <div v-else class="card-container">
            <div v-for="group in groups" :key="group.id" class="card">
                <div class="group-info">
                    <h2>{{ group.name }}</h2>
                    <p v-if="group.students">{{ group.students.length }} 
                        {{ group.students.length === 1 ? 'student' : 'students' }}</p>
                </div>
                <div class="card-actions">
                    <router-link :to="{ name: 'GroupDetailsView', params: { groupId: group.id } }"
                                 class="details-button"
                                 @click="selectGroup(group.id)">
                        View Details
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
import { computed } from 'vue';
import { useGroupsStore } from '@/stores/groupsStore';

const groupsStore = useGroupsStore();
const groups = computed(() => groupsStore.groups);

const selectGroup = (groupId) => {
  groupsStore.setSelectedGroupId(groupId);
};
</script>

<style scoped>
.group-list {
    padding: 20px;
}

.no-groups-message {
    text-align: center;
    color: #666;
    font-size: 1.125rem;
}

.card-container {
    display: flex;
    flex-direction: column; /* Apila los elementos verticalmente */
    gap: 10px;
}

.card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    max-width: 600px;
    min-width: min-content;
    overflow: hidden;
    box-sizing: border-box;
}

.group-info {
    flex-grow: 1; /* Permite que esta sección crezca y tome el espacio disponible */
    margin-right: 10px; /* Espacio entre la información del grupo y el botón */
}

.group-info h2 {
    margin: 0;
    font-size: 1.25rem;
}

.group-info p {
    margin: 4px 0 0;
    color: #666;
}

.card-actions {
    flex-shrink: 0; /* Para que el div del botón no se reduzca */
}

.details-button {
    display: inline-block;
    padding: 8px 12px;
    background-color: #1976D2;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.24s ease;
    white-space: nowrap; /* Evita que el texto se divida en varias líneas */
}

.details-button:hover {
    background-color: #0479ffaf;
}
</style>
