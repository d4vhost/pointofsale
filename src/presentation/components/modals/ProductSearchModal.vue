<!-- src/presentation/components/modals/ProductSearchModal.vue -->
<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop ref="modalContainer">
      <div class="modal-header">
        <h3>Buscar Producto</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>
      
      <div class="modal-body">
        <!-- Filtros -->
        <div class="filters">
          <input 
            v-model="searchQuery" 
            placeholder="Buscar por nombre o código..." 
            class="search-input"
          />
          <select v-model="selectedCategory" class="category-select">
            <option value="">Todas las categorías</option>
            <option 
              v-for="category in categories" 
              :key="category.categoryId" 
              :value="category.categoryId"
            >
              {{ category.name }}
            </option>
          </select>
        </div>

        <!-- Lista de productos CON PAGINACIÓN -->
        <div class="products-list">
          <div v-if="isLoading" class="loading">Cargando productos...</div>
          <div v-else-if="filteredProducts.length === 0" class="no-products">
            No se encontraron productos con stock disponible
          </div>
          <div v-else class="products-container">
            <!-- PRODUCTOS PAGINADOS -->
            <div class="products-grid">
              <div 
                v-for="product in paginatedProducts" 
                :key="product.productId"
                class="product-item"
              >
                <div class="product-info">
                  <h4>{{ product.name }}</h4>
                  <p class="product-code">Código: {{ product.code }}</p>
                  <p class="product-description">{{ product.description }}</p>
                  <p class="product-category">Categoría: {{ product.category?.name }}</p>
                  <div class="product-pricing">
                    <span class="price">${{ product.sellingPrice.toFixed(2) }}</span>
                    <span class="stock" :class="{ 'low-stock': product.stock <= 5 }">
                      Stock: {{ product.stock }}
                    </span>
                  </div>
                </div>
                <div class="product-actions">
                  <div class="quantity-controls">
                    <label>Cantidad:</label>
                    <input 
                      type="number"
                      :value="productQuantities[product.productId]"
                      @input="handleQuantityInput($event, product)"
                      @blur="validateQuantity(product)"
                      @keydown="handleKeyDown"
                      class="quantity-input"
                      :class="{ 'error': hasQuantityError(product) }"
                      placeholder="1"
                      maxlength="3"
                    />
                    <div v-if="hasQuantityError(product)" class="quantity-error">
                      Máximo {{ product.stock }}
                    </div>
                  </div>
                  <button 
                    @click="selectProduct(product)"
                    :disabled="!canAddProduct(product)"
                    class="add-btn"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>

            <!-- PAGINACIÓN DE PRODUCTOS -->
            <div class="products-pagination">
              <button 
                @click="goToProductPage(1)" 
                :disabled="currentPage === 1 || filteredProducts.length === 0"
                class="pagination-btn"
                type="button"
              >
                &#8249;&#8249;
              </button>
              <button 
                @click="goToProductPage(currentPage - 1)" 
                :disabled="currentPage === 1 || filteredProducts.length === 0"
                class="pagination-btn"
                type="button"
              >
                &#8249;
              </button>
              <span class="pagination-info">
                <span v-if="filteredProducts.length > 0">
                  Página {{ currentPage }} de {{ totalPages }} ({{ filteredProducts.length }} productos)
                </span>
                <span v-else>
                  Página 1 de 1 (0 productos)
                </span>
              </span>
              <button 
                @click="goToProductPage(currentPage + 1)" 
                :disabled="currentPage === totalPages || filteredProducts.length === 0"
                class="pagination-btn"
                type="button"
              >
                &#8250;
              </button>
              <button 
                @click="goToProductPage(totalPages)" 
                :disabled="currentPage === totalPages || filteredProducts.length === 0"
                class="pagination-btn"
                type="button"
              >
                &#8250;&#8250;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive, watch, nextTick } from 'vue'
import { loadProducts } from '../../../core/use-cases/loadProducts'
import { loadCategories } from '../../../core/use-cases/loadCategories'
// Importar el CSS externo
import '../../../assets/styles/product-search-modal.css'

export default {
  name: 'ProductSearchModal',
  emits: ['close', 'select'],
  setup(_, { emit }) {
    const products = ref([])
    const categories = ref([])
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const isLoading = ref(true)
    const productQuantities = reactive({})
    const quantityErrors = reactive({})
    
    // PAGINACIÓN
    const currentPage = ref(1)
    const productsPerPage = 2 // Máximo 2 productos por página

    // Ref para el contenedor del modal
    const modalContainer = ref(null)

    // Filtrar productos (SOLO CON STOCK > 0)
    const filteredProducts = computed(() => {
      let filtered = products.value

      // PRIMERO: Filtrar solo productos con stock mayor a 0
      filtered = filtered.filter(product => product.stock > 0)

      // Filtrar por búsqueda de texto
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(query) ||
          product.code.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        )
      }

      // Filtrar por categoría
      if (selectedCategory.value) {
        filtered = filtered.filter(product => 
          product.categoryId === selectedCategory.value
        )
      }

      return filtered
    })

    // PRODUCTOS PAGINADOS
    const paginatedProducts = computed(() => {
      const start = (currentPage.value - 1) * productsPerPage
      const end = start + productsPerPage
      return filteredProducts.value.slice(start, end)
    })

    // TOTAL DE PÁGINAS
    const totalPages = computed(() => {
      return Math.ceil(filteredProducts.value.length / productsPerPage)
    })

    // MÉTODOS DE PAGINACIÓN CON SCROLL FIJO
    const goToProductPage = (page) => {
      if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
        // Guardar posición actual del scroll
        const scrollPosition = modalContainer.value?.scrollTop || 0
        
        // Cambiar la página
        currentPage.value = page
        
        // Restaurar la posición del scroll después de que Vue actualice
        nextTick(() => {
          if (modalContainer.value) {
            modalContainer.value.scrollTop = scrollPosition
          }
        })
      }
    }

    const resetPagination = () => {
      currentPage.value = 1
    }

    // Watch para resetear paginación cuando cambien los filtros
    watch([searchQuery, selectedCategory], () => {
      resetPagination()
    })

    // VALIDACIÓN DE CANTIDAD - Solo permitir números
    const handleKeyDown = (event) => {
      // Permitir: backspace, delete, tab, escape, enter
      if ([8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
          // Permitir: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
          (event.keyCode === 65 && event.ctrlKey === true) ||
          (event.keyCode === 67 && event.ctrlKey === true) ||
          (event.keyCode === 86 && event.ctrlKey === true) ||
          (event.keyCode === 88 && event.ctrlKey === true)) {
        return
      }
      
      // Bloquear si no es un número (0-9)
      if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && 
          (event.keyCode < 96 || event.keyCode > 105)) {
        event.preventDefault()
      }
    }

    // MANEJAR INPUT DE CANTIDAD
    const handleQuantityInput = (event, product) => {
      let value = event.target.value
      
      // Filtrar solo números y eliminar caracteres no válidos
      value = value.replace(/[^\d]/g, '')
      
      // No permitir que empiece con 0
      if (value.startsWith('0') && value.length > 1) {
        value = value.substring(1)
      }
      
      // Convertir a número
      let numValue = parseInt(value) || 0
      
      // Si es 0, establecer en 1 (mínimo)
      if (numValue === 0) {
        numValue = 1
      }
      
      // No puede ser mayor al stock
      if (numValue > product.stock) {
        numValue = product.stock
        quantityErrors[product.productId] = true
      } else {
        quantityErrors[product.productId] = false
      }
      
      // Actualizar cantidad
      productQuantities[product.productId] = numValue
      
      // Actualizar el valor del input
      event.target.value = numValue
    }

    // VALIDAR CANTIDAD AL PERDER FOCO
    const validateQuantity = (product) => {
      let quantity = productQuantities[product.productId]
      
      // Asegurar que sea un número válido
      if (!quantity || quantity < 1) {
        quantity = 1
      }
      
      // No puede ser mayor al stock
      if (quantity > product.stock) {
        quantity = product.stock
        quantityErrors[product.productId] = true
      } else {
        quantityErrors[product.productId] = false
      }
      
      productQuantities[product.productId] = quantity
    }

    // VERIFICAR SI HAY ERROR EN LA CANTIDAD
    const hasQuantityError = (product) => {
      return quantityErrors[product.productId] === true
    }

    // VERIFICAR SI SE PUEDE AGREGAR EL PRODUCTO
    const canAddProduct = (product) => {
      const quantity = productQuantities[product.productId] || 1
      return product.stock > 0 && 
             quantity > 0 && 
             quantity <= product.stock &&
             !hasQuantityError(product)
    }

    // Cargar datos
    const loadData = async () => {
      try {
        isLoading.value = true
        const [productsData, categoriesData] = await Promise.all([
          loadProducts(),
          loadCategories()
        ])
        
        products.value = productsData
        categories.value = categoriesData

        // Inicializar cantidades SOLO para productos con stock > 0
        productsData.forEach(product => {
          if (product.stock > 0) {
            productQuantities[product.productId] = 1
            quantityErrors[product.productId] = false
          }
        })
      } catch (error) {
        console.error('Error al cargar datos:', error)
        alert('Error al cargar los datos')
      } finally {
        isLoading.value = false
      }
    }

    // Seleccionar producto CON VALIDACIONES
    const selectProduct = (product) => {
      const quantity = productQuantities[product.productId] || 1
      
      // Validaciones finales
      if (quantity < 1) {
        alert('La cantidad debe ser mayor a 0')
        return
      }
      
      if (quantity > product.stock) {
        alert('La cantidad no puede ser mayor al stock disponible')
        return
      }

      if (product.stock === 0) {
        alert('Este producto no tiene stock disponible')
        return
      }

      const selectedProduct = {
        ...product,
        quantity: quantity,
        subtotal: product.sellingPrice * quantity
      }

      emit('select', selectedProduct)
      closeModal()
    }

    // Cerrar modal
    const closeModal = () => {
      emit('close')
    }

    onMounted(loadData)

    return {
      products,
      categories,
      searchQuery,
      selectedCategory,
      isLoading,
      productQuantities,
      filteredProducts,
      paginatedProducts,
      currentPage,
      totalPages,
      selectProduct,
      closeModal,
      handleQuantityInput,
      handleKeyDown,
      validateQuantity,
      hasQuantityError,
      canAddProduct,
      goToProductPage,
      modalContainer
    }
  }
}
</script>