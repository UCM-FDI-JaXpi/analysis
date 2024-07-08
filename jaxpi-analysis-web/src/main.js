import { createApp } from 'vue'
import { createPinia } from 'pinia';
import { useAuthStore } from '@/stores/authStore';
import App from './App.vue'
import router from './router';

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);

const authStore = useAuthStore();
authStore.initializeFromStorage();


app.use(router)
    .mount('#app')
