<template>
    <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePaginationStore } from '../stores/paginationStore';

const paginationStore = usePaginationStore();

const props = defineProps({
    totalItems: Number,
    itemsPerPage: {
        type: Number,
        default: 5,
    }
});

const emit = defineEmits(['page-changed']);

const currentPage = computed(() => paginationStore.currentPage);
const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage));

function nextPage() {
    if (paginationStore.currentPage < totalPages.value) {
        paginationStore.setPage(paginationStore.currentPage + 1);
        emit('page-changed', paginationStore.currentPage);
    }
}

function prevPage() {
    if (paginationStore.currentPage > 1) {
        paginationStore.setPage(paginationStore.currentPage - 1);
        emit('page-changed', paginationStore.currentPage);
    }
}
</script>

<style>
.pagination {
    margin-top: 10px;
    text-align: center;
}

.pagination button {
    padding: 5px 10px;
    margin: 0 5px;
    background-color: #3fa8ee;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
}

.pagination button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}
</style>