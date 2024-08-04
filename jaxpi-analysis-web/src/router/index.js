import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ChartsView from '@/views/ChartsView.vue'
import GroupsView from '@/views/GroupsView.vue'
import GroupDetailsView from '@/views/GroupDetailsView.vue'
import AboutUsView from '@/views/AboutUsView.vue'
import RegisterView from '@/views/RegisterView.vue'
import LoginView from '@/views/LoginView.vue'
import StudentDetailView from '@/views/StudentDetailView.vue'
import TeacherView from '@/views/TeacherView.vue'
import StudentView from '@/views/StudentView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import DevView from '@/views/DevView.vue'

const routes = [
    { path: '/', name: 'HomeView', component: HomeView },
    { path: '/charts/:groupId?', name: 'ChartsView', component: ChartsView, props: route => ({ groupId: route.params.groupId }) },
    { path: '/groups', name: 'GroupsView', component: GroupsView },
    { path: '/group-details/:groupId', name: 'GroupDetailsView', component: GroupDetailsView },
    { path: '/about-us', name: 'AboutUsView', component: AboutUsView },
    { path: '/register', name: 'RegisterView', component: RegisterView },
    { path: '/login', name: 'LoginView', component: LoginView },
    { path: '/student-detail/:name', name: 'StudentDetailView', component: StudentDetailView},
    { path: '/teacher', name: 'TeacherView', component: TeacherView },
    { path: '/student', name: 'StudentView', component: StudentView },
    { path: '/dev', name: 'DevView', component: DevView },
    { path: '/:pathMatch(.*)*', name: 'NotFoundView', component: NotFoundView }, // For undefined routes
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;