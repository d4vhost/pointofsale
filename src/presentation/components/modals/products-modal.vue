<!--presentation/components/modals/products-modal.vue-->
<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop ref="modalContainer">
      <!-- Header del Modal -->
      <div class="modal-header">
        <h2>{{ showForm ? (editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto') : 'Gestión de Productos' }}</h2>
        <button @click="closeModal" class="close-button">×</button>
      </div>

      <!-- Mensaje de Error Global -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- Botones de Acción -->
      <div v-if="!showForm" class="action-buttons">
        <button @click="showCreateForm" class="btn-primary">
          Crear Producto
        </button>
        <button @click="refreshProducts" class="btn-secondary" :disabled="loading">
          {{ loading ? 'Cargando...' : 'Actualizar' }}
        </button>
      </div>

      <!-- Formulario de Crear/Editar Producto -->
      <div v-if="showForm" class="product-form">
        <form @submit.prevent="saveProduct">
          <!-- Fila 1: Código y Nombre -->
          <div class="form-row">
            <div class="form-group">
              <label>Código: <span class="required">*</span></label>
              <input 
                v-model="productForm.code" 
                type="text" 
                required 
                readonly
                disabled
                placeholder="Se generará automáticamente"
                :class="{ 'error': hasError('code'), 'auto-generated': true }"
              >
              <div v-if="hasError('code')" class="field-error">{{ getError('code') }}</div>
              <div class="field-info" v-if="productForm.code">
                Código: {{ productForm.code }}
              </div>
              <div v-else class="field-hint">Se generará al seleccionar categoría</div>
            </div>
            <div class="form-group">
              <label>Nombre: <span class="required">*</span></label>
              <input 
                v-model="productForm.name" 
                type="text" 
                required 
                placeholder="Nombre del producto"
                :class="{ 'error': hasError('name') }"
                @input="handleNameInput"
                @blur="touchField('name')"
                maxlength="20"
              >
              <div v-if="hasError('name')" class="field-error">{{ getError('name') }}</div>
              <div class="field-hint">Máximo 20 caracteres, solo letras</div>
            </div>
          </div>

          <!-- Fila 2: Descripción y Categoría -->
          <div class="form-row">
            <div class="form-group">
              <label>Descripción: <span class="required">*</span></label>
              <textarea 
                v-model="productForm.description" 
                required 
                placeholder="Descripción del producto"
                rows="2"
                :class="{ 'error': hasError('description') }"
                @input="handleDescriptionInput"
                @blur="touchField('description')"
                maxlength="50"
              ></textarea>
              <div v-if="hasError('description')" class="field-error">{{ getError('description') }}</div>
              <div class="field-hint">Máximo 50 caracteres</div>
            </div>
            <div class="form-group">
              <label>Categoría: <span class="required">*</span></label>
              <select 
                v-model="productForm.categoryId" 
                required
                :class="{ 'error': hasError('categoryId') }"
                @change="handleCategoryChange"
              >
                <option value="">Seleccionar categoría</option>
                <option 
                  v-for="category in categories" 
                  :key="category.categoryId" 
                  :value="category.categoryId"
                >
                  {{ category.name }}
                </option>
              </select>
              <div v-if="hasError('categoryId')" class="field-error">{{ getError('categoryId') }}</div>
            </div>
          </div>

          <!-- Fila 3: Precio de Compra y Precio de Venta -->
          <div class="form-row">
            <div class="form-group">
              <label>Precio de Compra: <span class="required">*</span></label>
              <input 
                v-model="productForm.purchasePrice" 
                type="text"
                required 
                placeholder="0.00"
                :class="{ 'error': hasError('purchasePrice') }"
                @input="handlePurchasePriceInput"
                @blur="touchField('purchasePrice')"
              >
              <div v-if="hasError('purchasePrice')" class="field-error">{{ getError('purchasePrice') }}</div>
              <div class="field-hint">Máximo $999,000</div>
            </div>
            <div class="form-group">
              <label>Precio de Venta: <span class="required">*</span></label>
              <input 
                v-model="productForm.sellingPrice" 
                type="text"
                required 
                placeholder="0.00"
                :class="{ 'error': hasError('sellingPrice') }"
                @input="handleSellingPriceInput"
                @blur="touchField('sellingPrice')"
              >
              <div v-if="hasError('sellingPrice')" class="field-error">{{ getError('sellingPrice') }}</div>
              <div class="field-hint">Debe ser mayor al precio de compra</div>
            </div>
          </div>

          <!-- Fila 4: Stock y Stock Mínimo -->
          <div class="form-row">
            <div class="form-group">
              <label>Stock: <span class="required">*</span></label>
              <input 
                v-model="productForm.stock" 
                type="text"
                required 
                placeholder="0"
                :class="{ 'error': hasError('stock') }"
                @input="handleStockInput"
                @blur="touchField('stock')"
              >
              <div v-if="hasError('stock')" class="field-error">{{ getError('stock') }}</div>
              <div class="field-hint">Debe ser ≥ al stock mínimo</div>
            </div>
            <div class="form-group">
              <label>Stock Mínimo: <span class="required">*</span></label>
              <input 
                v-model="productForm.minimumStock" 
                type="text"
                required 
                placeholder="1"
                :class="{ 'error': hasError('minimumStock') }"
                @input="handleMinimumStockInput"
                @blur="touchField('minimumStock')"
              >
              <div v-if="hasError('minimumStock')" class="field-error">{{ getError('minimumStock') }}</div>
              <div class="field-hint">Mínimo 1, máximo 999</div>
            </div>
          </div>

          <!-- Fila 5: Producto Activo -->
          <div class="form-row">
            <div class="form-group">
              <div class="checkbox-group">
                <input 
                  v-model="productForm.isActive" 
                  type="checkbox" 
                  id="isActive"
                >
                <label for="isActive">Producto Activo</label>
              </div>
            </div>
            <div class="form-group">
              <!-- Espacio vacío para mantener estructura -->
            </div>
          </div>

          <!-- Selector de Imagen con Buscador -->
          <div class="form-row">
            <div class="form-group full-width">
              <label>Imagen del Producto (opcional):</label>
              <div class="image-selector-container">
                <button 
                  type="button" 
                  @click="toggleImageSelector" 
                  class="select-image-btn"
                  :class="{ 'has-selection': productForm.imageUrl }"
                >
                  <span v-if="!productForm.imageUrl">Seleccionar Imagen</span>
                  <span v-else>Cambiar Imagen</span>
                </button>
                
                <!-- Imagen seleccionada -->
                <div v-if="productForm.imageUrl" class="selected-image-container">
                  <div class="selected-image-preview">
                    <img :src="getImageUrl(productForm.imageUrl)" :alt="productForm.imageUrl" />
                    <div class="selected-image-info">
                      <span>{{ productForm.imageUrl }}</span>
                      <button type="button" @click="removeSelectedImage" class="remove-selected-btn">
                        ✕ Remover
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Galería de imágenes con buscador -->
                <div v-if="showImageSelector" class="image-gallery">
                  <div class="gallery-header">
                    <h4>Seleccionar una imagen:</h4>
                    <button type="button" @click="toggleImageSelector" class="close-gallery-btn">✕</button>
                  </div>

                  <!-- Buscador de imágenes -->
                  <div class="image-search">
                    <input 
                      v-model="imageSearchQuery"
                      type="text" 
                      placeholder="Buscar imagen por nombre (ej: GalaxyA54)..."
                      @input="filterImages"
                    >
                  </div>
                  
                  <div v-if="loadingImages" class="loading-images">
                    <p>Cargando imágenes...</p>
                  </div>
                  
                  <div v-else-if="filteredImages.length > 0" class="gallery-content">
                    <!-- Paginación de imágenes (CON SCROLL FIJO) -->
                    <div class="images-pagination">
                      <button 
                        @click="goToImagePage(1)" 
                        :disabled="currentImagePage === 1"
                        class="pagination-btn"
                        type="button"
                      >
                        &#8249;&#8249;
                      </button>
                      <button 
                        @click="goToImagePage(currentImagePage - 1)" 
                        :disabled="currentImagePage === 1"
                        class="pagination-btn"
                        type="button"
                      >
                        &#8249;
                      </button>
                      <span class="pagination-info">
                        Página {{ currentImagePage }} de {{ totalImagePages }} ({{ filteredImages.length }} imágenes)
                      </span>
                      <button 
                        @click="goToImagePage(currentImagePage + 1)" 
                        :disabled="currentImagePage === totalImagePages"
                        class="pagination-btn"
                        type="button"
                      >
                        &#8250;
                      </button>
                      <button 
                        @click="goToImagePage(totalImagePages)" 
                        :disabled="currentImagePage === totalImagePages"
                        class="pagination-btn"
                        type="button"
                      >
                        &#8250;&#8250;
                      </button>
                    </div>
                    
                    <!-- Grid de imágenes paginadas -->
                    <div class="images-grid">
                      <div 
                        v-for="image in paginatedImages" 
                        :key="image.fileName"
                        @click="selectImage(image)"
                        class="image-option"
                        :class="{ 'selected': productForm.imageUrl === image.fileName }"
                      >
                        <img :src="getImageUrl(image.fileName)" :alt="image.name" />
                        <span class="image-name">{{ image.name }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div v-else class="no-images">
                    <p>{{ imageSearchQuery ? 'No se encontraron imágenes que coincidan con la búsqueda' : 'No hay imágenes disponibles en el servidor' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="backToList" class="btn-cancel">
              Cancelar
            </button>
            <button type="submit" class="btn-save" :disabled="formLoading || !isFormValid">
              {{ formLoading ? 'Guardando...' : (editingProduct ? 'Actualizar' : 'Crear') }} Producto
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de Productos -->
      <div v-if="!showForm" class="products-list">
        <!-- Filtros -->
        <div class="filters">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Buscar producto..."
            class="search-input"
          >
          <select v-model="categoryFilter" class="category-filter">
            <option value="">Todas las categorías</option>
            <option 
              v-for="category in categories" 
              :key="category.categoryId" 
              :value="category.name"
            >
              {{ category.name }}
            </option>
          </select>
          <select v-model="statusFilter" class="status-filter">
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        <!-- Estado de Carga -->
        <div v-if="loading" class="loading-state">
          <p>Cargando productos...</p>
        </div>

        <!-- Tabla de Productos -->
        <div v-else-if="products.length > 0" class="table-container">
          <table class="products-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Precio Compra</th>
                <th>Precio Venta</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in paginatedProducts" :key="product.productId">
                <td class="image-cell">
                  <div class="product-image">
                    <img 
                      v-if="product.imageUrl" 
                      :src="getImageUrl(product.imageUrl)" 
                      :alt="product.name"
                      @error="handleImageError"
                    >
                    <div v-else class="no-image">
                      <span>Sin imagen</span>
                    </div>
                  </div>
                </td>
                <td>{{ product.code }}</td>
                <td>{{ product.name }}</td>
                <td>
                  <span class="category-badge">
                    {{ product.category?.name || 'Sin categoría' }}
                  </span>
                </td>
                <td>
                  <span class="stock-badge">
                    {{ product.stock }}
                  </span>
                </td>
                <td>${{ product.purchasePrice.toFixed(2) }}</td>
                <td>${{ product.sellingPrice.toFixed(2) }}</td>
                <td>
                  <span class="status-badge">
                    {{ product.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="actions">
                  <button @click="editProduct(product)" class="btn-edit" title="Editar">
                    Editar
                  </button>
                  <button @click="confirmDeleteProduct(product)" class="btn-delete" title="Eliminar">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Paginación de productos -->
          <div v-if="totalProductPages > 1" class="products-pagination">
            <button 
              @click="goToProductPage(1)" 
              :disabled="currentProductPage === 1"
              class="pagination-btn"
            >
              &#8249;&#8249;
            </button>
            <button 
              @click="goToProductPage(currentProductPage - 1)" 
              :disabled="currentProductPage === 1"
              class="pagination-btn"
            >
              &#8249;
            </button>
            <span class="pagination-info">
              Página {{ currentProductPage }} de {{ totalProductPages }} ({{ filteredProducts.length }} productos)
            </span>
            <button 
              @click="goToProductPage(currentProductPage + 1)" 
              :disabled="currentProductPage === totalProductPages"
              class="pagination-btn"
            >
              &#8250;
            </button>
            <button 
              @click="goToProductPage(totalProductPages)" 
              :disabled="currentProductPage === totalProductPages"
              class="pagination-btn"
            >
              &#8250;&#8250;
            </button>
          </div>
        </div>

        <!-- Mensaje si no hay productos -->
        <div v-else class="empty-state">
          <p>No se encontraron productos</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Script section para products-modal.vue
import { getCategoriesApi } from '../../../data/api/get/getCategories.js';
import { getProductsApi } from '../../../data/api/get/getProducts.js';
import { getAvailableImagesApi } from '../../../data/api/get/getImages.js';
import { createProduct } from '../../../data/api/post/postProducts.js';
import { updateProduct, toggleProductStatus } from '../../../data/api/put/putProducts.js';
import { deleteProduct } from '../../../data/api/delete/deleteProducts.js';
import { useProductValidation } from '../../../core/validators/useProductValidation.js';

export default {
  name: 'ProductsModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      formLoading: false,
      loadingImages: false,
      errorMessage: '',
      showForm: false,
      showImageSelector: false,
      editingProduct: null,
      searchQuery: '',
      categoryFilter: '',
      statusFilter: '',
      imageSearchQuery: '',
      categories: [],
      products: [],
      availableImages: [],
      filteredImages: [],
      // Paginación de imágenes
      currentImagePage: 1,
      imagesPerPage: 8,
      // Paginación de productos
      currentProductPage: 1,
      productsPerPage: 3, // Máximo 3 productos por página
      API_BASE_URL: 'https://pointofsale-backend-api-fsada3d8gwe3d8f5.canadacentral-01.azurewebsites.net',
      productForm: {
        code: '',
        name: '',
        description: '',
        imageUrl: '',
        categoryId: '',
        purchasePrice: '',
        sellingPrice: '',
        stock: '',
        minimumStock: '1',
        isActive: true
      },
      // Inicializar el sistema de validaciones
      validator: null
    }
  },
  computed: {
    filteredProducts() {
      let filtered = this.products;

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(query) ||
          product.code.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        );
      }

      if (this.categoryFilter) {
        filtered = filtered.filter(product => product.category?.name === this.categoryFilter);
      }

      if (this.statusFilter) {
        const isActive = this.statusFilter === 'active';
        filtered = filtered.filter(product => product.isActive === isActive);
      }

      return filtered;
    },

    // Productos paginados
    paginatedProducts() {
      const start = (this.currentProductPage - 1) * this.productsPerPage;
      const end = start + this.productsPerPage;
      return this.filteredProducts.slice(start, end);
    },

    // Total de páginas de productos
    totalProductPages() {
      return Math.ceil(this.filteredProducts.length / this.productsPerPage);
    },
    
    isFormValid() {
      return this.validator ? this.validator.isFormValid() : false;
    },

    // Paginación de imágenes filtradas
    totalImagePages() {
      return Math.ceil(this.filteredImages.length / this.imagesPerPage);
    },

    paginatedImages() {
      const start = (this.currentImagePage - 1) * this.imagesPerPage;
      const end = start + this.imagesPerPage;
      return this.filteredImages.slice(start, end);
    }
  },
  async mounted() {
    // Inicializar el validador
    this.validator = useProductValidation(this.products, this.editingProduct);
    
    if (this.isVisible) {
      await this.loadInitialData();
    }
  },
  watch: {
    isVisible(newVal) {
      if (newVal) {
        this.loadInitialData();
      }
    },

    // Resetear página cuando cambien los filtros
    searchQuery() {
      this.currentProductPage = 1;
    },
    categoryFilter() {
      this.currentProductPage = 1;
    },
    statusFilter() {
      this.currentProductPage = 1;
    }
  },
  methods: {
    // Métodos del validador
    hasError(fieldName) {
      return this.validator ? this.validator.hasError(fieldName) : false;
    },
    
    getError(fieldName) {
      return this.validator ? this.validator.getError(fieldName) : '';
    },
    
    touchField(fieldName) {
      if (this.validator) {
        this.validator.touchField(fieldName);
      }
    },

    // Métodos de paginación para productos
    goToProductPage(page) {
      if (page >= 1 && page <= this.totalProductPages && page !== this.currentProductPage) {
        this.currentProductPage = page;
      }
    },

    resetProductPagination() {
      this.currentProductPage = 1;
    },

    // MÉTODO MEJORADO - Métodos de paginación para imágenes CON SCROLL FIJO
    goToImagePage(page) {
      if (page >= 1 && page <= this.totalImagePages && page !== this.currentImagePage) {
        // Guardar posición actual del scroll
        const scrollPosition = this.$refs.modalContainer.scrollTop;
        
        // Cambiar la página
        this.currentImagePage = page;
        
        // Restaurar la posición del scroll después de que Vue actualice
        this.$nextTick(() => {
          this.$refs.modalContainer.scrollTop = scrollPosition;
        });
      }
    },

    resetImagePagination() {
      this.currentImagePage = 1;
    },

    // Filtrado de imágenes
    filterImages() {
      if (!this.imageSearchQuery.trim()) {
        this.filteredImages = [...this.availableImages];
      } else {
        const query = this.imageSearchQuery.toLowerCase();
        this.filteredImages = this.availableImages.filter(image => 
          image.fileName.toLowerCase().includes(query) ||
          image.name.toLowerCase().includes(query)
        );
      }
      this.resetImagePagination();
    },

    // Manejador de cambio de categoría
    handleCategoryChange() {
      this.touchField('categoryId');
      this.validator.validateField('categoryId', this.productForm.categoryId);
      
      // Generar código automático solo si no estamos editando
      if (!this.editingProduct && this.productForm.categoryId) {
        this.productForm.code = this.validator.generateUniqueProductCode(
          this.productForm.categoryId, 
          this.categories
        );
        this.validator.validateField('code', this.productForm.code);
      }
    },

    // Manejadores de input con validación mejorada
    handleNameInput(event) {
      const filteredName = this.validator.filterLettersOnly(event.target.value);
      this.productForm.name = filteredName.slice(0, 20);
      this.validator.validateField('name', this.productForm.name, this.productForm);
    },

    handleDescriptionInput(event) {
      const filteredDescription = this.validator.filterLettersAndNumbers(event.target.value);
      this.productForm.description = filteredDescription.slice(0, 50);
      this.validator.validateField('description', this.productForm.description);
    },

    handleStockInput(event) {
      const filteredStock = this.validator.filterNumericOnly(event.target.value, false);
      const numValue = Math.min(parseInt(filteredStock) || 0, 999);
      this.productForm.stock = numValue.toString();
      this.validator.validateField('stock', this.productForm.stock, {
        minimumStock: parseInt(this.productForm.minimumStock) || 1
      });
    },

    handlePurchasePriceInput(event) {
      const filteredPrice = this.validator.filterNumericOnly(event.target.value, true);
      const numValue = Math.min(parseFloat(filteredPrice) || 0, 999000);
      this.productForm.purchasePrice = numValue.toString();
      this.validator.validateField('purchasePrice', this.productForm.purchasePrice);
      
      // Re-validar precio de venta si existe
      if (this.productForm.sellingPrice) {
        this.validator.validateField('sellingPrice', this.productForm.sellingPrice, {
          purchasePrice: parseFloat(this.productForm.purchasePrice) || 0
        });
      }
    },

    handleSellingPriceInput(event) {
      const filteredPrice = this.validator.filterNumericOnly(event.target.value, true);
      const numValue = Math.min(parseFloat(filteredPrice) || 0, 999000);
      this.productForm.sellingPrice = numValue.toString();
      this.validator.validateField('sellingPrice', this.productForm.sellingPrice, {
        purchasePrice: parseFloat(this.productForm.purchasePrice) || 0
      });
    },

    handleMinimumStockInput(event) {
      const filteredStock = this.validator.filterNumericOnly(event.target.value, false);
      let value = Math.min(parseInt(filteredStock) || 1, 999);
      if (value < 1) value = 1;
      this.productForm.minimumStock = value.toString();
      this.validator.validateField('minimumStock', this.productForm.minimumStock, {
        stock: parseInt(this.productForm.stock) || 0
      });
    },

    async loadInitialData() {
      await this.loadCategories();
      await this.loadProducts();
      await this.loadAvailableImages();
      
      // Actualizar el validador con los productos cargados
      if (this.validator) {
        this.validator = useProductValidation(this.products, this.editingProduct);
      }
    },

    async loadCategories() {
      try {
        const response = await getCategoriesApi();
        this.categories = response.data;
      } catch (error) {
        this.errorMessage = 'Error al cargar las categorías';
        console.error('Error loading categories:', error);
      }
    },

    async loadProducts() {
      this.loading = true;
      try {
        const response = await getProductsApi();
        this.products = response.data;
        this.errorMessage = '';
        
        // Actualizar el validador con los nuevos productos
        if (this.validator) {
          this.validator = useProductValidation(this.products, this.editingProduct);
        }
      } catch (error) {
        this.errorMessage = 'Error al cargar los productos';
        console.error('Error loading products:', error);
      } finally {
        this.loading = false;
      }
    },

    async loadAvailableImages() {
      this.loadingImages = true;
      try {
        const response = await getAvailableImagesApi();
        this.availableImages = response.data;
        this.filteredImages = [...this.availableImages];
        this.resetImagePagination();
      } catch (error) {
        console.error('Error loading available images:', error);
        this.availableImages = [];
        this.filteredImages = [];
      } finally {
        this.loadingImages = false;
      }
    },

    getImageUrl(fileName) {
      if (!fileName) return '';
      if (fileName.startsWith('http')) return fileName;
      return `${this.API_BASE_URL}/images/${fileName}`;
    },

    toggleImageSelector() {
      this.showImageSelector = !this.showImageSelector;
      if (this.showImageSelector) {
        this.imageSearchQuery = '';
        this.filteredImages = [...this.availableImages];
        this.resetImagePagination();
      }
    },

    selectImage(image) {
      this.productForm.imageUrl = image.fileName;
      this.showImageSelector = false;
    },

    removeSelectedImage() {
      this.productForm.imageUrl = '';
    },

    closeModal() {
      this.$emit('close');
      this.resetForm();
      this.errorMessage = '';
      this.showForm = false;
      this.showImageSelector = false;
      this.imageSearchQuery = '';
      this.resetImagePagination();
      this.resetProductPagination();
      if (this.validator) {
        this.validator.clearErrors();
      }
    },
    
    showCreateForm() {
      this.showForm = true;
      this.editingProduct = null;
      this.resetForm();
      this.errorMessage = '';
      this.showImageSelector = false;
      this.imageSearchQuery = '';
      this.resetImagePagination();
      
      // Limpiar errores del validador
      if (this.validator) {
        this.validator.clearErrors();
      }
    },
    
    editProduct(product) {
      this.showForm = true;
      this.editingProduct = product;
      this.errorMessage = '';
      this.showImageSelector = false;
      this.imageSearchQuery = '';
      this.resetImagePagination();
      
      this.productForm = {
        code: product.code,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl || '',
        categoryId: product.categoryId.toString(),
        purchasePrice: product.purchasePrice.toString(),
        sellingPrice: product.sellingPrice.toString(),
        stock: product.stock.toString(),
        minimumStock: product.minimumStock.toString(),
        isActive: Boolean(product.isActive)
      };
      
      // Actualizar validador para edición
      if (this.validator) {
        this.validator = useProductValidation(this.products, this.editingProduct);
        this.validator.clearErrors();
      }
    },
    
    backToList() {
      this.showForm = false;
      this.editingProduct = null;
      this.errorMessage = '';
      this.showImageSelector = false;
      this.imageSearchQuery = '';
      this.resetImagePagination();
      this.resetProductPagination();
      this.resetForm();
      if (this.validator) {
        this.validator.clearErrors();
      }
    },
    
    resetForm() {
      this.productForm = {
        code: '',
        name: '',
        description: '',
        imageUrl: '',
        categoryId: '',
        purchasePrice: '',
        sellingPrice: '',
        stock: '',
        minimumStock: '1',
        isActive: true 
      };
    },

    handleImageError(event) {
      event.target.style.display = 'none';
      const noImageDiv = event.target.parentNode.querySelector('.no-image');
      if (noImageDiv) {
        noImageDiv.style.display = 'flex';
      }
    },
    
    // Método saveProduct con validaciones integradas
    async saveProduct() {
      this.formLoading = true;
      this.errorMessage = '';

      try {
        // Ejecutar validación completa del formulario
        const validation = this.validator.validateForm(this.productForm);
        
        if (!validation.isValid) {
          // Marcar todos los campos como tocados para mostrar errores
          Object.keys(this.productForm).forEach(field => {
            this.validator.touchField(field);
          });
          
          this.errorMessage = 'Por favor corrija los errores en el formulario';
          return;
        }
        
        // Preparar datos para enviar
        const formData = {
          code: this.productForm.code.trim().toUpperCase(),
          name: this.productForm.name.trim(),
          description: this.productForm.description.trim(),
          imageUrl: this.productForm.imageUrl || null,
          categoryId: parseInt(this.productForm.categoryId),
          purchasePrice: parseFloat(this.productForm.purchasePrice),
          sellingPrice: parseFloat(this.productForm.sellingPrice),
          stock: parseInt(this.productForm.stock),
          minimumStock: parseInt(this.productForm.minimumStock),
          isActive: Boolean(this.productForm.isActive)
        };
        
        if (this.editingProduct) {
          // Actualizar producto existente
          formData.productId = this.editingProduct.productId;
          
          await updateProduct(this.editingProduct.productId, formData);
          alert('Producto actualizado correctamente');
        } else {
          const result = await createProduct(formData);
          console.log('Producto creado:', result);
          alert('Producto creado correctamente');
        }
        
        this.backToList();
        await this.loadProducts(); // Recargar la lista
      } catch (error) {
        let errorMessage = 'Error al guardar el producto';
        if (error.response?.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.error) {
            errorMessage = `${error.response.data.error}: ${error.response.data.innerException || error.response.data.message}`;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.errorMessage = errorMessage;
      } finally {
        this.formLoading = false;
      }
    },
    
    async toggleProductStatus(product) {
      if (confirm(`¿Desea ${product.isActive ? 'desactivar' : 'activar'} el producto ${product.name}?`)) {
        try {
          await toggleProductStatus(product.productId, !product.isActive);
          alert(`Producto ${!product.isActive ? 'activado' : 'desactivado'} correctamente`);
          await this.loadProducts();
        } catch (error) {
          this.errorMessage = error.message || 'Error al cambiar el estado del producto';
          console.error('Error changing product status:', error);
        }
      }
    },
    
    async confirmDeleteProduct(product) {
      if (confirm(`¿Está seguro de eliminar el producto ${product.name}?`)) {
        try {
          await deleteProduct(product.productId);
          alert('Producto eliminado correctamente');
          await this.loadProducts();
          
          // Ajustar página si es necesario
          if (this.paginatedProducts.length === 0 && this.currentProductPage > 1) {
            this.currentProductPage = this.currentProductPage - 1;
          }
        } catch (error) {
          this.errorMessage = error.message || 'Error al eliminar el producto';
          console.error('Error deleting product:', error);
        }
      }
    },
    
    async refreshProducts() {
      await this.loadProducts();
      this.resetProductPagination(); // Resetear a la primera página
    }
  }
}
</script>

<style scoped>
@import '../../../assets/styles/products-modal.css';
</style>