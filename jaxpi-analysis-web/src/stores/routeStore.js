import { defineStore } from 'pinia';

export const useRouteStore = defineStore('route', {
    state: () => ({
        originalRoute: null,
    }),
    actions: {
        setOriginalRoute(route) {
            this.originalRoute = route;
        },
        getOriginalRoute() {
            return this.originalRoute || '/'; // Valor por defecto
        },
    },
});