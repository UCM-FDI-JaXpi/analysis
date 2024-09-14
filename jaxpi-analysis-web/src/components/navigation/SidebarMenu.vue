<template>
    <div v-if="userType === 'teacher'" class="sidebar">
        <div class="menu-item create-menu-item" @click="navigateToCreateGroup">
            Create class
        </div>

        <!-- Existing class menu -->
        <div class="menu-item" @click="toggleTeacherGroupsSubmenu">
            Classes
            <span>{{ isTeacherGroupsSubmenuOpen ? '-' : '+' }}</span>
        </div>
        <div v-if="isTeacherGroupsSubmenuOpen" class="submenu">
            <router-link 
                v-for="group in groups"
                :key="group.id" 
                :to="`/group-details/${group.id}`"
                :class="['submenu-link', { active: isActiveRoute(`/group-details/${group.id}`) }]"
                @click="selectGroup(group.id)">
                {{ group.name }}
            </router-link>
        </div>
    </div>

    <div v-if="userType === 'dev'" class="sidebar">
        <!-- Add game-->
        <div class="menu-item create-menu-item" @click="navigateToCreateGame">
            Add game
        </div>

        <!-- Existing games menu -->
        <div class="menu-item" @click="toggleDevGamesSubmenu">
            Games
            <span>{{ isDevGamesSubmenuOpen ? '-' : '+' }}</span>
        </div>
        <div v-if="isDevGamesSubmenuOpen" class="submenu">
            <router-link 
                v-for="game in games"
                :key="game.id" 
                :to="`/game-details/${game.id}`"
                :class="['submenu-link', { active: isActiveRoute(`/game-details/${game.id}`) }]"
                @click="selectGame(game.id)">
                {{ game.name }}
            </router-link>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { useRoute, useRouter  } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useGroupsStore } from '@/stores/groupsStore';
import { useGamesStore } from '@/stores/gamesStore';

const authStore = useAuthStore();
const groupsStore = useGroupsStore();
const gamesStore = useGamesStore();
const router = useRouter();
const route = useRoute();

const userType = computed(() => authStore.userType);
const groups = computed(() => groupsStore.groups);
const games = computed(() => gamesStore.games);

const isTeacherGroupsSubmenuOpen = ref(false);
const isDevGamesSubmenuOpen = ref(false);

const selectedGroupId = computed(() => groupsStore.selectedGroupId);
const selectedGameId = computed(() => gamesStore.selectedGameId);

watch(() => selectedGroupId.value, () => updateSidebarState2());
watch(() => selectedGameId.value, () => updateSidebarState2());

const updateSidebarState2 = () => {
    isTeacherGroupsSubmenuOpen.value = !!selectedGroupId.value;
    isDevGamesSubmenuOpen.value = !!selectedGameId.value;
};

onMounted(() => {
    updateSidebarState(route.path);
});

// Observa cambios en la ruta
watch(() => route.path, (newPath) => {
    updateSidebarState(newPath);
});

// Función para actualizar el estado del sidebar según la ruta
const updateSidebarState = (path) => {
    if (path.startsWith('/game-details')) {
        isDevGamesSubmenuOpen.value = true;
        isTeacherGroupsSubmenuOpen.value = false;
    } else if (path.startsWith('/group-details')) {
        isTeacherGroupsSubmenuOpen.value = true;
        isDevGamesSubmenuOpen.value = false;
    } else {
        isDevGamesSubmenuOpen.value = false;
        isTeacherGroupsSubmenuOpen.value = false;
    }
};

const selectGroup = (groupId) => {
  groupsStore.setSelectedGroupId(groupId);
};

const selectGame = (gameId) => {
  gamesStore.setSelectedGameId(gameId);
};

const toggleTeacherGroupsSubmenu = () => {
    isTeacherGroupsSubmenuOpen.value = !isTeacherGroupsSubmenuOpen.value;
};

const toggleDevGamesSubmenu = () => {
    isDevGamesSubmenuOpen.value = !isDevGamesSubmenuOpen.value;
};

const isActiveRoute = (path) => { // Para comprobar si estamos en la misma ruta que la opcion seleccionada para pintarla
    return route.path.startsWith(path) || route.path.includes(path);
};

const navigateToCreateGroup = () => {
    router.push('/create-group');
};

const navigateToCreateGame = () => {
    router.push('/create-game');
};
</script>

<style scoped>
.sidebar {
    width: 200px;
    min-width: 200px;
    background-color: #F9F9F9;;
    padding: 15px;
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
    cursor: pointer;    
}

.submenu-link.active,
.submenu-link:hover {
    font-weight: bold;
    color: #ffff;
    background-color: #007bff;
}

.create-menu-item {
    background-color: #3eaf2a;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    justify-content: center;
    align-items: center;
    padding: 12px;
}

.create-menu-item:hover {
    background-color: #43bd2dbd;
    transform: scale(1.01);
}

.create.active,
.create:hover {
    background-color: #56c642;
}
</style>