import { defineStore } from 'pinia';

export const usePaginationStore = defineStore('pagination', {
    state: () => ({
        currentPage: 1,
    }),
    actions: {
        setPage(page) {
            this.currentPage = page;
        },
    },
});