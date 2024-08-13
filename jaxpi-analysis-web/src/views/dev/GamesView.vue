<template>
    <div class="games">
        <h1>Games</h1>
        <GameList />
    </div>
</template>
<script setup>
import GameList from '@/components/dev/GameList.vue';
</script>

<style scoped>
.games {
    padding: 1rem;
}
</style>