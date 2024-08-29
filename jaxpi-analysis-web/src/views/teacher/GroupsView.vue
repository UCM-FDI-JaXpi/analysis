<template>
    <div class="groups">
        <h1>Classes</h1>
        <GroupList />
    </div>
</template>

<script setup>
import GroupList from '@/components/GroupList.vue';
</script>

<style scoped>
.groups h1 {
    margin-top: 0px;
}

.groups {
    padding: 1rem;
}
</style>