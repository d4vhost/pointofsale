<!-- src/presentation/components/modals/ProductSearchModal.vue -->
<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
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

        <!-- Lista de productos -->
        <div class="products-list">
          <div v-if="isLoading" class="loading">Cargando productos...</div>
          <div v-else-if="filteredProducts.length === 0" class="no-products">
            No se encontraron productos
          </div>
          <div v-else>
            <div 
              v-for="product in filteredProducts" 
              :key="product.productId"
              class="product-item"
              :data-out-of-stock="product.stock === 0"
            >
              <div class="product-info">
                <h4>{{ product.name }}</h4>
                <p class="product-code">Código: {{ product.code }}</p>
                <p class="product-description">{{ product.description }}</p>
                <p class="product-category">Categoría: {{ product.category?.name }}</p>
                <div class="product-pricing">
                  <span class="price">${{ product.sellingPrice.toFixed(2) }}</span>
                  <span class="stock">Stock: {{ product.stock }}</span>
                </div>
              </div>
              <div class="product-actions">
                <div class="quantity-controls">
                  <label>Cantidad:</label>
                  <input 
                    type="number" 
                    min="1" 
                    :max="product.stock"
                    v-model.number="productQuantities[product.productId]"
                    class="quantity-input"
                    :disabled="product.stock === 0"
                  />
                </div>
                <button 
                  @click="selectProduct(product)"
                  :disabled="product.stock === 0"
                  class="add-btn"
                >
                  {{ product.stock === 0 ? 'Sin Stock' : 'Agregar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'
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

    // Filtrar productos
    const filteredProducts = computed(() => {
      let filtered = products.value

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

        // Inicializar cantidades
        productsData.forEach(product => {
          productQuantities[product.productId] = 1
        })
      } catch (error) {
        console.error('Error al cargar datos:', error)
        alert('Error al cargar los datos')
      } finally {
        isLoading.value = false
      }
    }

    // Seleccionar producto
    const selectProduct = (product) => {
      const quantity = productQuantities[product.productId] || 1
      
      if (quantity > product.stock) {
        alert('La cantidad no puede ser mayor al stock disponible')
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
      selectProduct,
      closeModal
    }
  }
}
</script>