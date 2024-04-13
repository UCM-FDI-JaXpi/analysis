import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ChartsView from '../views/ChartsView.vue'
import AboutUsView from '../views/AboutUsView.vue'

const routes = [
    { path: '/', name: 'HomeView', component: HomeView },
    { path: '/charts', name: 'ChartsView', component: ChartsView },
    { path: '/about-us', name: 'AboutUsView', component: AboutUsView }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;