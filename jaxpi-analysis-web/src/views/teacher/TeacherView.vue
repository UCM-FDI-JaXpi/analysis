<template>
    <div class="teacher-view">
        <h1 v-if="!teacher" style="margin-bottom: 0;">Teacher's View</h1>
        <p v-if="!teacher">Please log in as a teacher to view teacher details.</p>

        <div class="teacher-details" v-if="teacher">
            <h3 class="teacher-name">{{ teacher.name }}</h3>
            <p class="teacher-role">Role: {{ teacher.usr_type }}</p>
            <p class="teacher-email"><strong>Email:</strong> {{ teacher.email }}</p>
            <p class="teacher-institution"><strong>Institution:</strong> {{ teacher.institution }}</p>
        </div>

        <!-- Instructions, only if we don´t have any classes -->
        <div class="instructions" v-if="teacher && groupsCount === 0">
            <h2>Getting Started</h2>
            <p>To start viewing your student's analytics, follow these steps:</p>
            <ol>
            <li><strong>Create a class:</strong> Click the "Create Class" button in your sidebar 
                and include at least one student.</li>
            <li><strong>Create Game Sessions:</strong> Once your class is created, go to the 
                class details and click the "Create game session" button.</li>
            <li><strong>Get session keys:</strong> When you create a game session, session keys
                 are generated for each student. These keys allow you to monitor student interactions
                  in that session.</li>
                <li><strong>Give session keys to your students:</strong> Provide session keys to each student so they can play the game
                     and access the app.</li>
                <li><strong>View your students' analytics:</strong> Once students start playing, you'll be able
                     to view their analytics.</li>
            </ol>
            <p style="margin-bottom: 0;">If you need more help, please <router-link to="/about-us">contact us</router-link>.</p>
        </div>

        <div class="groups" v-if="teacher && groupsCount > 0">
            <h1>Classes</h1>
            <GroupList />
        </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useGroupsStore } from '@/stores/groupsStore';
import GroupList from '@/components/GroupList.vue';

const authStore = useAuthStore();
const groupsStore = useGroupsStore();

const teacher = computed(() => {
    const teacherData = authStore.userData
    return teacherData && teacherData.usr_type === 'teacher' ? teacherData : null;
});
const groupsCount = computed(() => groupsStore.groups.length);
</script>

<style scoped>
.teacher-view {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 20px;
}

.teacher-details {
    display: flex;
    flex-direction: column;
    background-color: #f9f9f9;
    padding: 1.5rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #ddd; 
    margin-bottom: 20px;
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
    margin-bottom: 10px;
}

.teacher-institution {
    margin-top: 0px;
    margin-bottom: 10px;
}

.groups h1 {
    margin-top:0px;
}

.instructions {
    background-color: #e7fcff;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    max-width: 900px;
}

.instructions h2 {
    margin-top: 0;
}

.instructions ol {
    padding-left: 20px;
}

.instructions p, .instructions li {
    line-height: 1.6;
}
</style>