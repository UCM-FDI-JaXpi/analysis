<template>
    <div class="teacher-view">
        <h1 v-if="!teacher">Teacher's view</h1>
        <p v-if="!teacher">Please log in as a teacher to view teacher details.</p>

        <div class="teacher-details" v-if="teacher">
            <h3 class="teacher-name">{{ teacher.name }}</h3>
            <p class="teacher-role">Role: {{ teacher.usr_type }}</p>
            <p class="teacher-email"><strong>Email:</strong> {{ teacher.email }}</p>
            <p class="teacher-institution"><strong>Institution:</strong> {{ teacher.institution }}</p>
        </div>

        <div class="groups" v-if="teacher">
            <h1>Classes</h1>
            <GroupList />
        </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import GroupList from '@/components/GroupList.vue';

const authStore = useAuthStore();

const teacher = computed(() => { // Devuelve todos los datos si usr_type = 'teacher', sino, null
    const teacherData = authStore.userData
    return teacherData && teacherData.usr_type === 'teacher' ? teacherData : null;
});
</script>

<style scoped>
.teacher-view {
    display: flex;
    flex-direction: column;
    padding-top:1rem;
    gap: 2rem;
}

.teacher-details {
    display: flex;
    flex-direction: column;
    background-color: #f9f9f9;
    padding: 1.5rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #ddd; 
    margin: 1rem;
    width: -webkit-fill-available;
    max-width: 800px;
}

.teacher-name {
    font-size: 1.7rem;
    margin: 0;
}

.teacher-role {
    margin-top: 5px;
    font-size: 0.9rem;
    color: #727171;
    font-weight: bold;
}

.teacher-email {
    margin-top: 0px;
    margin-bottom: 10px; /* Reduce el espacio entre Email e Institution */
}

.teacher-institution {
    margin-top: 0px;
    margin-bottom: 10px;
}

.groups {
    padding: 1rem;
}

.groups h1 {
    margin-top:0px;
}
</style>