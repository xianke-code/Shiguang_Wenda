import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Quiz from '../views/Quiz.vue'
import Result from '../views/Result.vue'
import History from '../views/History.vue'
import Leaderboard from '../views/Leaderboard.vue'
import Profile from '../views/Profile.vue'
import Favorites from '../views/Favorites.vue'
import WrongList from '../views/WrongList.vue'
import SubmitQuestion from '../views/SubmitQuestion.vue'
import Admin from '../views/Admin.vue'
import Ranked from '../views/Ranked.vue'
import Duel from '../views/Duel.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/quiz', component: Quiz, meta: { requiresAuth: true } },
  { path: '/result', component: Result, meta: { requiresAuth: true } },
  { path: '/history', component: History, meta: { requiresAuth: true } },
  { path: '/leaderboard', component: Leaderboard },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/favorites', component: Favorites, meta: { requiresAuth: true } },
  { path: '/wrong-list', component: WrongList, meta: { requiresAuth: true } },
  { path: '/submit', component: SubmitQuestion, meta: { requiresAuth: true } },
  { path: '/admin', component: Admin, meta: { requiresAuth: true } },
  { path: '/ranked', component: Ranked, meta: { requiresAuth: true } },
  { path: '/duel', component: Duel, meta: { requiresAuth: true } }
]

const router = createRouter({ history: createWebHistory(), routes })
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) next('/login')
  else next()
})
export default router