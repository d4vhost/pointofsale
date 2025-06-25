<!-- src/presentation/pages/MyInvoicesPage.vue -->
<template>
  <div class="my-invoices-page">
    <!-- HEADER -->
    <header class="app-header">
      <div class="header-container">
        <div class="logo-container">
          <div class="logo-placeholder"></div>
          <h1 class="company-name">FactuSys</h1>
        </div>
        <div class="header-actions">
          <button @click="goToUserPage" class="home-button">
            Inicio
          </button>
          <button @click="handleLogout" class="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>

    <!-- CONTENIDO CENTRAL -->
    <DefaultLayout>
      <div class="invoices-content">
        <div class="invoices-header">
          <h1>Mis Facturas</h1>
          <p>Aquí puedes ver todas tus facturas registradas</p>
        </div>

        <!-- Filtros -->
        <div class="filters-section">
          <div class="search-filters">
            <input
              v-model="searchQuery"
              placeholder="Buscar por número de factura..."
              class="search-input"
            />
          </div>
        </div>

        <!-- Lista de facturas -->
        <div class="invoices-list">
          <div v-if="isLoading" class="loading">
            Cargando facturas...
          </div>
          
          <div v-else-if="filteredInvoices.length === 0" class="no-invoices">
            <h3>No se encontraron facturas</h3>
            <p>Aún no has registrado ninguna factura o no hay resultados para tu búsqueda.</p>
          </div>
          
          <div v-else class="invoices-grid">
            <div
              v-for="invoice in filteredInvoices"
              :key="invoice.invoiceId"
              class="invoice-card"
              @click="viewInvoiceDetails(invoice.invoiceId)"
            >
              <div class="invoice-card-header">
                <h3>{{ invoice.invoiceNumber }}</h3>
                <span 
                  class="status-badge"
                  :class="getStatusClass(invoice.statusId)"
                >
                  {{ getStatusName(invoice.statusId) }}
                </span>
              </div>
              
              <div class="invoice-card-body">
                <div class="invoice-info">
                  <p><strong>Fecha:</strong> {{ formatDate(invoice.invoiceDate) }}</p>
                  <p><strong>Método de Pago:</strong> {{ invoice.paymentMethod?.name || 'N/A' }}</p>
                  <p><strong>Total:</strong> <span class="amount">${{ invoice.total?.toFixed(2) }}</span></p>
                </div>
              </div>
              
              <div class="invoice-card-footer">
                <div class="view-details">
                  Ver Detalles
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Paginación (opcional) -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            Anterior
          </button>
          
          <span class="page-info">
            Página {{ currentPage }} de {{ totalPages }}
          </span>
          
          <button 
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            Siguiente
          </button>
        </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import { getUserInvoicesApi } from '../../data/api/get/getUserInvoices'
// Importar el CSS externo
import '../../assets/styles/my-invoices.css'

export default {
  name: 'MyInvoicesPage',
  components: {
    DefaultLayout
  },
  setup() {
    const router = useRouter()
    const invoices = ref([])
    const searchQuery = ref('')
    const statusFilter = ref('')
    const isLoading = ref(true)
    const currentPage = ref(1)
    const itemsPerPage = 12

    // Computed properties
    const filteredInvoices = computed(() => {
      let filtered = invoices.value

      // Filtrar por búsqueda
      if (searchQuery.value) {
        filtered = filtered.filter(invoice =>
          invoice.invoiceNumber.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      // Filtrar por estado
      if (statusFilter.value) {
        filtered = filtered.filter(invoice => 
          invoice.statusId === parseInt(statusFilter.value)
        )
      }

      // Paginación
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filtered.slice(start, end)
    })

    const totalPages = computed(() => {
      let filtered = invoices.value

      if (searchQuery.value) {
        filtered = filtered.filter(invoice =>
          invoice.invoiceNumber.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      if (statusFilter.value) {
        filtered = filtered.filter(invoice => 
          invoice.statusId === parseInt(statusFilter.value)
        )
      }

      return Math.ceil(filtered.length / itemsPerPage)
    })

    // Methods
    const fetchInvoices = async () => {
      try {
        isLoading.value = true
        const userId = localStorage.getItem('userId')
        if (!userId) {
          router.push('/')
          return
        }

        const response = await getUserInvoicesApi(userId)
        invoices.value = response.data || []
      } catch (error) {
        alert('Error al cargar las facturas. Por favor, intente nuevamente.')
      } finally {
        isLoading.value = false
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const getStatusName = (statusId) => {
      const statusMap = {
        1: 'Activa',
        2: 'Pagada',
        3: 'Cancelada'
      }
      return statusMap[statusId] || 'Desconocido'
    }

    const getStatusClass = (statusId) => {
      const classMap = {
        1: 'status-active',
        2: 'status-paid',
        3: 'status-cancelled'
      }
      return classMap[statusId] || 'status-unknown'
    }

    const getProductsCount = (invoice) => {
      return invoice.invoiceDetails?.length || 0
    }

    const viewInvoiceDetails = (invoiceId) => {
      if (!invoiceId) {
        alert('Error: ID de factura no válido')
        return
      }

      const targetRoute = `/invoice-details/${invoiceId}`

      router.push(targetRoute)
    }

    const goToUserPage = () => {
      router.push('/user')  
    }

    const handleLogout = () => {
      localStorage.removeItem('firstName')
      localStorage.removeItem('lastName')
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      router.push('/')
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    onMounted(fetchInvoices)

    return {
      invoices,
      searchQuery,
      statusFilter,
      isLoading,
      currentPage,
      filteredInvoices,
      totalPages,
      formatDate,
      getStatusName,
      getStatusClass,
      getProductsCount,
      viewInvoiceDetails,
      goToUserPage,
      handleLogout,
      changePage
    }
  }
}
</script>