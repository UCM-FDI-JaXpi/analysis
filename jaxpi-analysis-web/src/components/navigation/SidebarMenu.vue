<template>
    <div v-if="userType === 'teacher'" class="sidebar"> <!--Ni Dev ni Student tienen sidebar-->
        <div class="menu-item" @click="toggleTeacherGroupsSubmenu">
            Groups
            <span>{{ isTeacherGroupsSubmenuOpen ? '-' : '+' }}</span>
        </div>
        <div v-if="isTeacherGroupsSubmenuOpen" class="submenu">
            <router-link v-for="group in groups" :key="group.id" :to="`/group-details/${group.id}`"  class="submenu-link">
                {{ group.name }}
            </router-link>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useGroupsStore } from '@/stores/groupsStore';

const authStore = useAuthStore();
const groupsStore = useGroupsStore();

const userType = computed(() => authStore.userType);
const groups = computed(() => groupsStore.groups);
const isTeacherGroupsSubmenuOpen = ref(false);

const toggleTeacherGroupsSubmenu = () => {
    isTeacherGroupsSubmenuOpen.value = !isTeacherGroupsSubmenuOpen.value;
};
</script>

<style scoped>
.sidebar {
    width: 200px;
    background-color: #ffcc31;
    padding: 10px;
    display: flex;
    flex-direction: column;
}

.menu-link {
    margin: 7px 0;
    text-decoration: none;
    color: #333;
}

.menu-item { /* To menu options that have submenus */
    margin: 7px 0;
    cursor: pointer;
    color: #333;
    display: flex;
    justify-content: space-between;
}

.submenu {
    padding-left: 20px;
}

.submenu-link {
    display: block;
    margin: 5px 0;
    text-decoration: none;
    color: #333;
}
</style>