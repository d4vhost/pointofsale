//presentation/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../pages/LoginPage.vue'
import AdminPage from '../pages/AdminPage.vue'
import UserPage from '../pages/UserPage.vue'
import MyInvoicesPage from '../pages/MyInvoicesPage.vue'
import InvoiceDetailsPage from '../pages/InvoiceDetailsPage.vue' 

const routes = [
  { path: '/', component: LoginPage },
  {
    path: '/admin',
    component: AdminPage,
    meta: { requiresAuth: true, role: 'Administrador' }
  },
  {
    path: '/user',
    component: UserPage,
    meta: { requiresAuth: true, role: 'Cliente' }
  },
  {
    path: '/mis-facturas',
    component: MyInvoicesPage,
    meta: { requiresAuth: true, role: 'Cliente' }
  },
  // 👈 AGREGAR ESTA RUTA
  {
    path: '/invoice-details/:id',
    name: 'InvoiceDetails',
    component: InvoiceDetailsPage,
    meta: { requiresAuth: true, role: 'Cliente' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ✅ Guardia global para proteger rutas
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  
  if (to.meta.requiresAuth) {
    if (!token) {
      return next('/')
    }
    if (to.meta.role && to.meta.role !== role) {
      return next('/')
    }
  }
  next()
})

export default router