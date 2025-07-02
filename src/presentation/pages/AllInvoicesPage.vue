<!-- src/presentation/pages/AllInvoicesPage.vue -->
<template>
  <div class="all-invoices-page">
    <!-- HEADER -->
    <header class="app-header">
      <div class="header-container">
        <div class="logo-container">
          <div class="logo-placeholder"></div>
          <h1 class="company-name">FactuSys</h1>
        </div>
        <div class="header-actions">
          <button @click="goToEmployeePage" class="home-button">
            Crear Factura
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
          <h1>Todas las Facturas</h1>
          <p>Gestión de facturas de todos los clientes</p>
        </div>

        <!-- Filtros -->
        <div class="filters-section">
          <div class="search-filters">
            <input
              v-model="searchQuery"
              placeholder="Buscar por número de factura o cliente..."
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
            <p>No hay facturas registradas en el sistema o no hay resultados para tu búsqueda.</p>
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
                  <p><strong>Cliente:</strong> {{ getCustomerName(invoice) }}</p>
                  <p><strong>Fecha:</strong> {{ formatDate(invoice.invoiceDate) }}</p>
                  <p><strong>Método de Pago:</strong> {{ invoice.paymentMethod?.name || 'N/A' }}</p>
                  <p><strong>Total:</strong> <span class="amount">${{ formatCurrency(invoice.total) }}</span></p>
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

        <!-- Paginación -->
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
import { getInvoicesApi } from '../../data/api/get/getInvoices'
// Importar el CSS externo
import '../../assets/styles/my-invoices.css'

export default {
  name: 'AllInvoicesPage',
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

    // Verificar que el usuario sea empleado
    const checkEmployeeAccess = () => {
      const userRole = localStorage.getItem('role')
      if (userRole !== 'Empleado') {
        router.push('/')
        return false
      }
      return true
    }

    // Computed properties
    const filteredInvoices = computed(() => {
      let filtered = invoices.value

      // Filtrar por búsqueda (número de factura o nombre del cliente)
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(invoice => {
          const invoiceNumber = invoice.invoiceNumber?.toLowerCase() || ''
          const customerName = getCustomerName(invoice).toLowerCase()
          return invoiceNumber.includes(query) || customerName.includes(query)
        })
      }

      // Ordenar por fecha más reciente
      filtered.sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate))

      // Paginación
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filtered.slice(start, end)
    })

    const totalPages = computed(() => {
      let filtered = invoices.value

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(invoice => {
          const invoiceNumber = invoice.invoiceNumber?.toLowerCase() || ''
          const customerName = getCustomerName(invoice).toLowerCase()
          return invoiceNumber.includes(query) || customerName.includes(query)
        })
      }

      return Math.ceil(filtered.length / itemsPerPage)
    })

    // Methods
    const fetchAllInvoices = async () => {
      try {
        isLoading.value = true
        
        const response = await getInvoicesApi()
        invoices.value = response.data || []
        
        console.log('Facturas cargadas:', invoices.value.length)
        
      } catch (error) {
        console.error('Error al cargar facturas:', error)
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

    const formatCurrency = (amount) => {
      if (amount === null || amount === undefined) return '0.00'
      return parseFloat(amount).toFixed(2)
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

    const getCustomerName = (invoice) => {
      if (invoice.customer) {
        return `${invoice.customer.firstName || ''} ${invoice.customer.lastName || ''}`.trim()
      }
      return 'Cliente no disponible'
    }

    const getProductsCount = (invoice) => {
      return invoice.invoiceDetails?.length || 0
    }

    const viewInvoiceDetails = (invoiceId) => {
      if (!invoiceId) {
        alert('Error: ID de factura no válido')
        return
      }

      router.push(`/invoice-details/${invoiceId}`)
    }

    const goToEmployeePage = () => {
      router.push('/employee')
    }

    const handleLogout = () => {
      const keysToRemove = [
        'firstName', 'lastName', 'token', 'email', 
        'phone', 'address', 'userId', 'role'
      ]
      
      keysToRemove.forEach(key => localStorage.removeItem(key))
      router.push('/')
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    onMounted(async () => {
      if (checkEmployeeAccess()) {
        await fetchAllInvoices()
      }
    })

    return {
      invoices,
      searchQuery,
      isLoading,
      currentPage,
      filteredInvoices,
      totalPages,
      formatDate,
      formatCurrency,
      getStatusName,
      getStatusClass,
      getCustomerName,
      getProductsCount,
      viewInvoiceDetails,
      goToEmployeePage,
      handleLogout,
      changePage
    }
  }
}
</script>

<style scoped>
.statistics-section {
  margin-top: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-label {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #495057;
}

.search-filters {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .search-filters {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>