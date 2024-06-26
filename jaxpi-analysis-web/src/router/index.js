import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ChartsView from '../views/ChartsView.vue'
import AboutUsView from '../views/AboutUsView.vue'
import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/LoginView.vue'
import StudentDetailView from '../views/StudentDetailView.vue'

const routes = [
    { path: '/', name: 'HomeView', component: HomeView },
    { path: '/charts', name: 'ChartsView', component: ChartsView },
    { path: '/about-us', name: 'AboutUsView', component: AboutUsView },
    { path: '/register', name: 'RegisterView', component: RegisterView },
    { path: '/login', name: 'LoginView', component: LoginView },
    { path: '/student-detail/:name', name: 'StudentDetailView', component: StudentDetailView }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;