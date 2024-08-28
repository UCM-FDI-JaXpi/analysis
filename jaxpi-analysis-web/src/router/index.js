import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
// import { useRouteStore } from '@/stores/routeStore'
import HomeView from '@/views/HomeView.vue'
import SelectRoleView from '@/views/SelectRoleView.vue'
import StudentLoginView from '@/views/student/StudentLoginView.vue'
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
import StudentDetailsView from '@/views/student/StudentDetailsView.vue'
import DevView from '@/views/dev/DevView.vue'
import GamesView from '@/views/dev/GamesView.vue'
import GameDetailsView from '@/views/dev/GameDetailsView.vue'
import CreateGroupView from '@/views/teacher/CreateGroupView.vue'
import CreateGameSessionView from '@/views/teacher/CreateGameSessionView.vue'
import StudentGameSessionDetailsView from '@/views/teacher/StudentGameSessionDetailsView.vue'
import CreateGameView from '@/views/dev/CreateGameView.vue'
import GameSessionDetailsByStudentView from '@/views/student/GameSessionDetailsByStudentView.vue'

const routes = [
    { path: '/', name: 'HomeView', component: HomeView },
    { path: '/login', name: 'LoginView', component: LoginView },
    { path: '/select-role', name: 'SelectRoleView', component: SelectRoleView },
    { path: '/student-login', name: 'StudentLoginView', component: StudentLoginView },
    { path: '/charts', name: 'ChartsView', component: ChartsView },
    { path: '/about-us', name: 'AboutUsView', component: AboutUsView },
    { path: '/register', name: 'RegisterView', component: RegisterView },
    { path: '/:pathMatch(.*)*', name: 'NotFoundView', component: NotFoundView }, // For undefined routes

    


    
    { path: '/teacher', name: 'TeacherView', component: TeacherView }, /*************** Teacher **************/
    { path: '/groups', name: 'GroupsView', component: GroupsView },
    { path: '/group-details/:groupId?', name: 'GroupDetailsView', component: GroupDetailsView },
    { path: '/group-details/:groupId/student-gamesessionkey/:gameSessionId', name: 'StudentGameSessionKeyView', component: StudentGameSessionKeyView },
    { path: '/student-game-session-details', name: 'StudentGameSessionDetailsView', component: StudentGameSessionDetailsView },
    { path: '/student-detail/:name/:groupId?', name: 'StudentDetailsView', component: StudentDetailsView},

    { path: '/create-group', name: 'CreateGroupView', component: CreateGroupView },
    { path: '/create-game-session', name: 'CreateGameSessionView', component: CreateGameSessionView },




    
    { path: '/student', name: 'StudentView', component: StudentView }, /*************** Student **************/
    { path: '/game-session-details-student/:gameSessionId', name: 'GameSessionDetailsByStudentView', component: GameSessionDetailsByStudentView},





    { path: '/dev', name: 'DevView', component: DevView }, /*************** Dev **************/
    { path: '/games', name: 'GamesView', component: GamesView },
    { path: '/game-details/:gameId', name: 'GameDetailsView', component: GameDetailsView},
    { path: '/create-game', name: 'CreateGameView', component: CreateGameView }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Guard global de navegacion en Vue Router
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    if ((to.path === '/select-role' || to.path === '/login' || to.path === '/student-login' ||
        to.path === '/register') && authStore.isAuthenticated) {
      authStore.logout(); // Desconecta al usuario
      next('/'); // Redirige a la página principal
    } else {
      next();
    }
  });
  
// // Sincroniza la ruta con el store
// router.afterEach((to) => {
//     const routeStore = useRouteStore();
//     routeStore.setOriginalRoute(to.fullPath);
// });

export default router;