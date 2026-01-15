import { createRouter, createWebHistory } from 'vue-router'
import { useAppStore } from '../stores/app'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('../views/SignUpPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('../views/PasswordResetPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/MainDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/stat',
    name: 'stat',
    component: () => import('../views/StatPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/goal',
    name: 'goal',
    component: () => import('../views/GoalPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/AccountSettingsPage.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const store = useAppStore()

  if (to.meta.requiresAuth && !store.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && store.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
