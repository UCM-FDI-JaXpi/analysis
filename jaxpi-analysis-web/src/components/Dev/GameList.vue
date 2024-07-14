<template>
    <div class="game-list">
        <ul>
            <li v-for="game in games" :key="game.id" @click="selectGame(game)">
                {{ game.name }} - Token: {{ game.token }}
            </li>
        </ul>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// eslint-disable-next-line
const props = defineProps({
    games: Array
})

const emits = defineEmits(['selectGame'])

const selectGame = (game) => {
    emits('selectGame', game)
}
</script>

<style scoped>

</style>