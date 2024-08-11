<template>
    <div v-if="userType === 'teacher'" class="sidebar"> <!--Ni Dev ni Student tienen sidebar-->
        <div class="menu-item" @click="toggleTeacherGroupsSubmenu">
            Groups
            <span>{{ isTeacherGroupsSubmenuOpen ? '-' : '+' }}</span>
        </div>
        <div v-if="isTeacherGroupsSubmenuOpen" class="submenu">
            <router-link 
                v-for="group in groups"
                :key="group.id" 
                :to="`/group-details/${group.id}`"
                :class="['submenu-link', { active: isActiveRoute(`/group-details/${group.id}`) }]">
                {{ group.name }}
            </router-link>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useGroupsStore } from '@/stores/groupsStore';
import { useRoute } from 'vue-router';

const authStore = useAuthStore();
const groupsStore = useGroupsStore();
const route = useRoute();

const userType = computed(() => authStore.userType);
const groups = computed(() => groupsStore.groups);
const isTeacherGroupsSubmenuOpen = ref(false);

const toggleTeacherGroupsSubmenu = () => {
    isTeacherGroupsSubmenuOpen.value = !isTeacherGroupsSubmenuOpen.value;
};

const isActiveRoute = (path) => { // Para comprobar si estamos en la misma ruta que la opcion seleccionada para pintarla
    return route.path === path;
};
</script>

<style scoped>
.sidebar {
    width: 200px;
    background-color: #f5f5f5;;
    padding: 15px;
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.menu-link {
    margin: 7px 0;
    text-decoration: none;
    color: #333;
}

.menu-item { /* To menu options that have submenus */
    margin: 10px 0;
    cursor: pointer;
    color: #333;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    padding: 10px;
    border-radius: 5px;
    transition: background-color 0.2s ease;
}

.menu-item:hover {
    background-color: #e0e0e0;
}

.submenu {
    padding-left: 20px;
}

.submenu-link {
    display: block;
    padding: 8px;
    text-decoration: none;
    color: #555;
    border-radius: 5px;
    transition: background-color 0.2s ease, color 0.2s ease;
}

.submenu-link.active,
.submenu-link:hover {
    font-weight: bold;
    color: #ffff;
    background-color: #007bff;
}
</style>