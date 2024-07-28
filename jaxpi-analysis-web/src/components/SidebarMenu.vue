<template>
    <div v-if="userType === 'teacher'" class="sidebar"> <!--Ni Dev ni Student tienen sidebar-->
        <template v-if="userType === 'teacher'">
            <router-link to="/teacher/sessions" class="menu-link">Sessions</router-link>
            <div>
                <div class="menu-item" @click="toggleTeacherGroupsSubmenu">
                    Groups
                    <span>{{ isTeacherGroupsSubmenuOpen ? '-' : '+' }}</span>
                </div>
                <div v-if="isTeacherGroupsSubmenuOpen" class="submenu">
                    <router-link to="/teacher/groups/groupA" class="submenu-link">A</router-link>
                    <router-link to="/teacher/groups/groupB" class="submenu-link">B</router-link>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const userType = computed(() => authStore.userType);
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