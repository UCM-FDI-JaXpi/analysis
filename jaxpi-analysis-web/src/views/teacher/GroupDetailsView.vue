<template>
    <div class="group-details" v-if="group">
        <h1>Details of {{ group.name }}</h1>
        <div class="tabs">
            <button v-for="(tab, index) in tabs" :key="index" @click="activeTab = index"
                :class="{ 'active': activeTab === index }">
                {{ tab }}
            </button>
        </div>

        <div v-if="activeTab === 0" class="tab-content">
            <ChartsView :groupId="group.id"/>
        </div>

        <div v-if="activeTab === 1" class="tab-content">
            <GameSessionList :groupId="group.id" />
        </div>

        <div v-if="activeTab === 2" class="tab-content">
            <StudentList :groupId="group.id"/>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useGroupsStore } from '@/stores/groupsStore';
import ChartsView from '../ChartsView.vue';
import GameSessionList from '@/components/teacher/GameSessionList.vue';
import StudentList from '@/components/teacher/StudentList.vue';

const route = useRoute();
const groupsStore = useGroupsStore();
const groupId = computed(() => route.params.groupId);
const group = computed(() => groupsStore.getGroupById(groupId.value));

const tabs = ref(["Charts", "Game sessions", "Students"]);
const activeTab = ref(0); // Define active tab
</script>

<style scoped>
.group-details {
    padding: 10px;
}
/* Add styling for tabs */
.tabs {
    display: flex;
}

.tabs button {
    padding: 10px 20px;
    margin-right: 1px;
    cursor: pointer;
    border: none;
}

.tabs button.active {
    background-color: #79c1fd;
}

.tab-content {
    display: flex;
    flex-wrap: wrap; /* Permite que los elementos se muevan a la siguiente fila cuando no quepan */
    gap: 50px; /* Espacio entre los elementos */
    padding: 10px;
    background-color: #79c1fd;
}
</style>