// presentation/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../pages/LoginPage.vue'
import AdminPage from '../pages/AdminPage.vue'
import EmployeePage from '../pages/EmployeePage.vue'
import MyInvoicesPage from '../pages/MyInvoicesPage.vue'
import AllInvoicesPage from '../pages/AllInvoicesPage.vue'
import InvoiceDetailsPage from '../pages/InvoiceDetailsPage.vue'

const routes = [
  { path: '/', component: LoginPage },
  {
    path: '/admin',
    component: AdminPage,
    meta: { requiresAuth: true, role: 'Administrador' }
  },
  // ✅ Ruta principal para empleados (facturación)
  {
    path: '/employee',
    component: EmployeePage,
    meta: { requiresAuth: true, role: 'Empleado' }
  },
  // Ruta para ver facturas de clientes
  {
    path: '/client-invoices',
    component: MyInvoicesPage,
    meta: { requiresAuth: true, role: 'Cliente' }
  },
  // Ruta para que empleados vean todas las facturas
  {
    path: '/todas-facturas',
    component: AllInvoicesPage,
    meta: { requiresAuth: true, role: 'Empleado' }
  },
  {
    path: '/invoice-details/:id',
    name: 'InvoiceDetails',
    component: InvoiceDetailsPage,
    meta: { requiresAuth: true, roles: ['Cliente', 'Empleado', 'Administrador'] } // Múltiples roles pueden ver detalles
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ✅ Guardia global actualizada para manejar múltiples roles
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
 
  if (to.meta.requiresAuth) {
    if (!token) {
      return next('/')
    }
    
    // Verificar roles múltiples o rol único
    if (to.meta.roles) {
      // Si la ruta acepta múltiples roles
      if (!to.meta.roles.includes(role)) {
        return next('/')
      }
    } else if (to.meta.role && to.meta.role !== role) {
      // Si la ruta acepta un solo rol
      return next('/')
    }
  }
  next()
})

export default router