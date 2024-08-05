import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ChartsView from '@/views/ChartsView.vue'
import AboutUsView from '@/views/AboutUsView.vue'
import RegisterView from '@/views/RegisterView.vue'
import LoginView from '@/views/LoginView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import TeacherView from '@/views/teacher/TeacherView.vue'
import GroupsView from '@/views/teacher/GroupsView.vue'
import GroupDetailsView from '@/views/teacher/GroupDetailsView.vue'
import StudentGameSessionKeyView from '@/views/teacher/StudentGameSessionKeyView.vue'
import StudentView from '@/views/student/StudentView.vue'
import StudentDetailView from '@/views/student/StudentDetailView.vue'
import DevView from '@/views/dev/DevView.vue'
import GamesView from '@/views/dev/GamesView.vue'
import GameDetailsView from '@/views/dev/GameDetailsView.vue'

const routes = [
    { path: '/', name: 'HomeView', component: HomeView },
    { path: '/charts/:groupId?', name: 'ChartsView', component: ChartsView, props: route => ({ groupId: route.params.groupId }) },
    { path: '/about-us', name: 'AboutUsView', component: AboutUsView },
    { path: '/register', name: 'RegisterView', component: RegisterView },
    { path: '/login', name: 'LoginView', component: LoginView },
    { path: '/:pathMatch(.*)*', name: 'NotFoundView', component: NotFoundView }, // For undefined routes
    { path: '/teacher', name: 'TeacherView', component: TeacherView }, /*************** Teacher **************/
    { path: '/groups', name: 'GroupsView', component: GroupsView },
    { path: '/group-details/:groupId', name: 'GroupDetailsView', component: GroupDetailsView },
    { path: '/student-gamesessionkey/:gameSessionId', name: 'StudentGameSessionKeyView', component: StudentGameSessionKeyView },
    { path: '/student', name: 'StudentView', component: StudentView }, /*************** Student **************/
    { path: '/student-detail/:name', name: 'StudentDetailView', component: StudentDetailView},
    { path: '/dev', name: 'DevView', component: DevView }, /*************** Dev **************/
    { path: '/games', name: 'GamesView', component: GamesView },
    { path: '/game-details/:gameId', name: 'GameDetailsView', component: GameDetailsView}
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;