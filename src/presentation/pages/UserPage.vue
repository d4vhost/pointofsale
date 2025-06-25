<!-- presentation/pages/UserPage.vue -->
<template>
  <div class="user-page">
    <!-- HEADER -->
    <header class="app-header">
      <div class="header-container">
        <div class="logo-container">
          <div class="logo-placeholder"></div>
          <h1 class="company-name">FactuSys</h1>
        </div>
        <div class="header-actions">
          <button @click="verFacturas" class="view-invoices-button">
            Ver Mis Facturas
          </button>
          <button @click="handleLogout" class="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
    <!-- CONTENIDO CENTRAL -->
    <DefaultLayout>
      <div class="user-content">
        <section class="user-actions">
          <UserInvoiceForm :user-info="userInfo" />
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
import UserInvoiceForm from '../components/forms/UserInvoiceForm.vue'
import { getUserByIdApi } from '../../data/api/get/getUserById.js'

export default {
  name: 'UserPage',
  components: {
    DefaultLayout,
    UserInvoiceForm
  },
  data() {
    return {
      userDataLoaded: false,
      isLoadingUserData: false
    }
  },
  computed: {
    fullName() {
      return `${localStorage.getItem('firstName')} ${localStorage.getItem('lastName')}`
    },
    userInfo() {
      return {
        fullName: this.fullName,
        email: localStorage.getItem('email') || 'No disponible',
        phone: localStorage.getItem('phone') || 'No disponible',
        address: localStorage.getItem('address') || 'No disponible',
        firstName: localStorage.getItem('firstName') || '',
        lastName: localStorage.getItem('lastName') || ''
      }
    }
  },
  async mounted() {
    await this.ensureUserDataLoaded()
  },
  methods: {
    async ensureUserDataLoaded() {
      const userId = localStorage.getItem('userId')
      const phone = localStorage.getItem('phone')
      const address = localStorage.getItem('address')
      
      // Si no tenemos phone o address, cargar datos completos del usuario
      if (userId && (!phone || !address || phone === 'undefined' || address === 'undefined')) {
        console.log('Faltan datos del usuario, cargando desde API...')
        this.isLoadingUserData = true
        
        try {
          const response = await getUserByIdApi(userId)
          const userData = response.data
          
          // Actualizar localStorage con datos completos
          localStorage.setItem('firstName', userData.firstName)
          localStorage.setItem('lastName', userData.lastName)
          localStorage.setItem('email', userData.email)
          localStorage.setItem('phone', userData.phone || '')
          localStorage.setItem('address', userData.address || '')
          
          console.log('✅ Datos del usuario actualizados:', {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            address: userData.address
          })
          
          this.userDataLoaded = true
          this.$forceUpdate() // Forzar actualización del componente
          
        } catch (error) {
          console.error('Error al cargar datos del usuario:', error)
        } finally {
          this.isLoadingUserData = false
        }
      }
    },
    
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
      this.$router.push('/mis-facturas')
    }
  }
}
</script>

<style src="../../assets/styles/user.css"></style>