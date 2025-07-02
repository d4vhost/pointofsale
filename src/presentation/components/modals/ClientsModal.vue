<!-- presentation/components/modals/ClientsModal.vue -->
<template>
  <div class="clients-modal-overlay" @click="handleOverlayClick">
    <div class="clients-modal" @click.stop>
      <!-- Header del modal -->
      <div class="clients-modal-header">
        <h2 class="clients-modal-title">Seleccionar Cliente</h2>
        <button class="clients-modal-close" @click="closeModal">
          ×
        </button>
      </div>

      <!-- Contenido del modal -->
      <div class="clients-modal-content">
        <!-- Buscador -->
        <div class="clients-search-section">
          <div class="clients-search-container">
            <span class="clients-search-icon">🔍</span>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Buscar cliente por nombre, email o teléfono..."
              class="clients-search-input"
              @input="handleSearch"
            />
          </div>
        </div>

        <!-- Estado de carga -->
        <div v-if="loading" class="clients-loading">
          <div class="clients-loading-spinner"></div>
          <p>Cargando clientes...</p>
        </div>

        <!-- Estado de error -->
        <div v-else-if="error" class="clients-error">
          <p>❌ {{ error }}</p>
          <button @click="loadClients" class="retry-button">
            Reintentar
          </button>
        </div>

        <!-- Lista de clientes -->
        <div v-else>
          <!-- Contador de resultados -->
          <div v-if="filteredClients.length > 0" class="clients-count">
            {{ filteredClients.length }} cliente{{ filteredClients.length !== 1 ? 's' : '' }} encontrado{{ filteredClients.length !== 1 ? 's' : '' }}
          </div>

          <!-- Sin resultados -->
          <div v-if="filteredClients.length === 0 && !loading" class="clients-no-results">
            <p>🔍 No se encontraron clientes</p>
            <p v-if="searchQuery">Intenta con otros términos de búsqueda</p>
            <p v-else>No hay clientes registrados en el sistema</p>
          </div>

          <!-- Lista de clientes paginada -->
          <div v-else class="clients-list">
            <div
              v-for="client in paginatedClients"
              :key="client.userId"
              class="client-item"
              @click="selectClient(client)"
            >
              <!-- Avatar del cliente -->
              <div class="client-avatar">
                {{ getClientInitials(client) }}
              </div>

              <!-- Información del cliente -->
              <div class="client-info">
                <div class="client-name">
                  {{ client.firstName }} {{ client.lastName }}
                </div>
                <div class="client-details">
                  <span class="client-detail">
                    <span class="client-detail-icon">📧</span>
                    {{ client.email }}
                  </span>
                  <span class="client-detail" v-if="client.phone">
                    <span class="client-detail-icon">📞</span>
                    {{ client.phone }}
                  </span>
                  <span class="client-detail" v-if="client.address">
                    <span class="client-detail-icon">📍</span>
                    {{ client.address }}
                  </span>
                </div>
                <div class="client-id">
                  ID: {{ client.userId }} | Cédula: {{ client.identificationNumber }}
                </div>
              </div>

              <!-- Indicador de selección -->
              <div class="client-select-indicator">
                →
              </div>
            </div>
          </div>

          <!-- Paginación -->
          <div v-if="totalPages > 1" class="clients-pagination">
            <button 
              @click="goToPage(1)" 
              :disabled="currentPage === 1"
              class="pagination-btn"
            >
              &#8249;&#8249;
            </button>
            <button 
              @click="goToPage(currentPage - 1)" 
              :disabled="currentPage === 1"
              class="pagination-btn"
            >
              &#8249;
            </button>
            <span class="pagination-info">
              Página {{ currentPage }} de {{ totalPages }} ({{ filteredClients.length }} clientes)
            </span>
            <button 
              @click="goToPage(currentPage + 1)" 
              :disabled="currentPage === totalPages"
              class="pagination-btn"
            >
              &#8250;
            </button>
            <button 
              @click="goToPage(totalPages)" 
              :disabled="currentPage === totalPages"
              class="pagination-btn"
            >
              &#8250;&#8250;
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { getClients } from '../../../data/api/get/getClients.js'

export default {
  name: 'ClientsModal',
  emits: ['close', 'select'],
  setup(props, { emit }) {
    const clients = ref([])
    const loading = ref(false)
    const error = ref('')
    const searchQuery = ref('')
    const currentPage = ref(1)
    const itemsPerPage = 3 // Máximo 3 clientes por página

    // Clientes filtrados basados en la búsqueda
    const filteredClients = computed(() => {
      if (!searchQuery.value.trim()) {
        return clients.value
      }

      const query = searchQuery.value.toLowerCase().trim()
      return clients.value.filter(client => {
        const fullName = `${client.firstName} ${client.lastName}`.toLowerCase()
        const email = client.email.toLowerCase()
        const phone = client.phone ? client.phone.toLowerCase() : ''
        const identificationNumber = client.identificationNumber.toLowerCase()
        
        return fullName.includes(query) || 
               email.includes(query) || 
               phone.includes(query) ||
               identificationNumber.includes(query)
      })
    })

    // Clientes paginados (máximo 3 por página)
    const paginatedClients = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredClients.value.slice(start, end)
    })

    // Total de páginas
    const totalPages = computed(() => {
      return Math.ceil(filteredClients.value.length / itemsPerPage)
    })

    // Función para ir a una página específica
    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
        currentPage.value = page
      }
    }

    // Cargar clientes desde la API
    const loadClients = async () => {
      try {
        loading.value = true
        error.value = ''
        
        const clientsData = await getClients()
        clients.value = clientsData.sort((a, b) => {
          // Ordenar por nombre completo
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase()
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase()
          return nameA.localeCompare(nameB)
        })
        
        console.log('Clientes cargados:', clients.value.length)
        
      } catch (err) {
        console.error('Error al cargar clientes:', err)
        error.value = err.message || 'Error al cargar los clientes'
      } finally {
        loading.value = false
      }
    }

    // Obtener iniciales del cliente para el avatar
    const getClientInitials = (client) => {
      const firstInitial = client.firstName?.charAt(0)?.toUpperCase() || ''
      const lastInitial = client.lastName?.charAt(0)?.toUpperCase() || ''
      return firstInitial + lastInitial
    }

    // Manejar búsqueda
    const handleSearch = () => {
      // Resetear a la primera página cuando se busca
      currentPage.value = 1
    }

    // Navegación de páginas
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }

    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }

    // Seleccionar cliente
    const selectClient = (client) => {
      console.log('Cliente seleccionado:', client)
      emit('select', client)
    }

    // Cerrar modal
    const closeModal = () => {
      emit('close')
    }

    // Manejar click en overlay
    const handleOverlayClick = (event) => {
      if (event.target === event.currentTarget) {
        closeModal()
      }
    }

    // Manejar tecla Escape
    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        closeModal()
      }
    }

    // Lifecycle
    onMounted(() => {
      loadClients()
      document.addEventListener('keydown', handleKeydown)
    })

    // Cleanup
    const cleanup = () => {
      document.removeEventListener('keydown', handleKeydown)
    }

    // Vue 3 onBeforeUnmount
    onMounted(() => {
      return cleanup
    })

    return {
      clients,
      filteredClients,
      paginatedClients,
      loading,
      error,
      searchQuery,
      currentPage,
      totalPages,
      loadClients,
      getClientInitials,
      handleSearch,
      goToPage,
      selectClient,
      closeModal,
      handleOverlayClick
    }
  }
}
</script>

<style src="../../../assets/styles/clients-modal.css"></style>