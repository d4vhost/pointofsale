<!-- presentation/pages/EmployeePage.vue -->
<template>
  <div class="employee-page">
    <!-- HEADER -->
    <header class="app-header">
      <div class="header-container">
        <div class="logo-container">
          <div class="logo-placeholder"></div>
          <h1 class="company-name">FactuSys</h1>
        </div>
        <div class="header-actions">
          <button @click="verFacturas" class="view-invoices-button">
            Ver Facturas
          </button>
          <button @click="handleLogout" class="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
    
    <!-- CONTENIDO CENTRAL -->
    <DefaultLayout>
      <div class="employee-content">
        <section class="employee-actions">
          <EmployeeInvoiceForm />
        </section>
      </div>
    </DefaultLayout>
    
    <!-- FOOTER -->
    <footer class="app-footer">
      <div class="copyright">
        © 2025 FactuSys. Todos los derechos reservados.
      </div>
    </footer>
  </div>
</template>

<script>
import DefaultLayout from '../layouts/DefaultLayout.vue'
import EmployeeInvoiceForm from '../components/forms/EmployeeInvoiceForm.vue'

export default {
  name: 'EmployeePage',
  components: {
    DefaultLayout,
    EmployeeInvoiceForm
  },
  data() {
    return {
      employeeDataLoaded: false,
      isLoadingEmployeeData: false
    }
  },
  computed: {
    fullName() {
      return `${localStorage.getItem('firstName')} ${localStorage.getItem('lastName')}`
    }
  },
  async mounted() {
    // Verificar que el usuario tenga rol de empleado
    const userRole = localStorage.getItem('role')
    if (userRole !== 'Empleado') {
      this.$router.push('/')
      return
    }
  },
  methods: {
    handleLogout() {
      // Limpiar todos los datos del localStorage
      const keysToRemove = [
        'firstName', 'lastName', 'token', 'email', 
        'phone', 'address', 'userId', 'role'
      ]
      
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      this.$router.push('/')
    },
    
    verFacturas() {
      this.$router.push('/todas-facturas') // Ruta para ver todas las facturas (empleados)
    }
  }
}
</script>

<style src="../../assets/styles/user.css"></style>