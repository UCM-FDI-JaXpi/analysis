<template>
    <div class="create-group-view">
        <CreateGroupForm @submit="handleGroupCreated" @cancel="handleCancel" />
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useRouteStore } from '@/stores/routeStore';
import CreateGroupForm from '@/components/teacher/CreateGroupForm.vue';

const router = useRouter();
const routeStore = useRouteStore();

const handleGroupCreated = (groupData) => {
    router.push(`/group-details/${groupData.id}`); // Redirige a la pagina de groupDetails del nuevo group creado
};

const handleCancel = () => {
    router.push(routeStore.getOriginalRoute()); // Redirige a la ruta original si se cancela
};
</script>

<style scoped>
.create-group-view {
    padding: 1rem;
}
</style>