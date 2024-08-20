<template>
    <div class="create-game-session-view">
        <CreateGameSessionForm @submit="handleGameSessionCreated" @cancel="handleCancel" />
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useRouteStore } from '@/stores/routeStore';
import CreateGameSessionForm from '@/components/teacher/CreateGameSessionForm.vue';

const router = useRouter();
const routeStore = useRouteStore();

const handleGameSessionCreated = () => {
    router.push(routeStore.getOriginalRoute()); // Redirige a la ruta original
};

const handleCancel = () => {
    router.push(routeStore.getOriginalRoute()); // Redirige a la ruta original si se cancela
};
</script>

<style scoped>
.create-game-session-view {
    padding: 1rem;
}
</style>