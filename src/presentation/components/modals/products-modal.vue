<!--presentation/components/modals/products-modal.vue-->
<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
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
          <div class="form-row">
            <div class="form-group">
              <label>Código: <span class="required">*</span></label>
              <input 
                v-model="productForm.code" 
                type="text" 
                required 
                placeholder="ELEC001, ROPA001, etc."
                :class="{ 'error': hasError('code') }"
                @input="handleCodeInput"
                @blur="touchField('code')"
                maxlength="8"
              >
              <div v-if="hasError('code')" class="field-error">{{ getError('code') }}</div>
              <div class="field-hint">Formatos válidos: ELEC001-999, ROPA001-999, HOGAR001-999, DEP001-999, LIB001-999, SALUD001-999</div>
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

          <div class="form-row">
            <div class="form-group full-width">
              <label>Descripción: <span class="required">*</span></label>
              <textarea 
                v-model="productForm.description" 
                required 
                placeholder="Descripción del producto"
                rows="2"
                :class="{ 'error': hasError('description') }"
                @input="handleDescriptionInput"
                @blur="touchField('description')"
                maxlength="30"
              ></textarea>
              <div v-if="hasError('description')" class="field-error">{{ getError('description') }}</div>
              <div class="field-hint">Máximo 30 caracteres, letras y números</div>
            </div>
          </div>

          <!-- Selector de Imagen del Backend -->
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

                <!-- Galería de imágenes (mostrar/ocultar) -->
                <div v-if="showImageSelector" class="image-gallery">
                  <div class="gallery-header">
                    <h4>Seleccionar una imagen:</h4>
                    <button type="button" @click="toggleImageSelector" class="close-gallery-btn">✕</button>
                  </div>
                  <div v-if="loadingImages" class="loading-images">
                    <p>Cargando imágenes...</p>
                  </div>
                  <div v-else-if="availableImages.length > 0" class="images-grid">
                    <div 
                      v-for="image in availableImages" 
                      :key="image.fileName"
                      @click="selectImage(image)"
                      class="image-option"
                      :class="{ 'selected': productForm.imageUrl === image.fileName }"
                    >
                      <img :src="getImageUrl(image.fileName)" :alt="image.name" />
                      <span class="image-name">{{ image.name }}</span>
                    </div>
                  </div>
                  <div v-else class="no-images">
                    <p>No hay imágenes disponibles en el servidor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Categoría: <span class="required">*</span></label>
              <select 
                v-model="productForm.categoryId" 
                required
                :disabled="true"
                :class="{ 'error': hasError('category'), 'auto-selected': autoSelectedCategory }"
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
              <div v-if="hasError('category')" class="field-error">{{ getError('category') }}</div>
              <div v-if="autoSelectedCategory" class="field-info">Categoría seleccionada automáticamente según el código</div>
            </div>
            <div class="form-group">
              <label>Stock: <span class="required">*</span></label>
              <input 
                v-model="productForm.stock" 
                type="number" 
                required 
                min="0"
                max="999"
                placeholder="0"
                :class="{ 'error': hasError('stock') }"
                @input="handleStockInput"
                @blur="touchField('stock')"
              >
              <div v-if="hasError('stock')" class="field-error">{{ getError('stock') }}</div>
              <div class="field-hint">Máximo 999, solo números positivos</div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Precio de Compra: <span class="required">*</span></label>
              <input 
                v-model="productForm.purchasePrice" 
                type="number" 
                step="0.01"
                required 
                min="0.01"
                max="999000"
                placeholder="0.00"
                :class="{ 'error': hasError('purchasePrice') }"
                @input="handlePurchasePriceInput"
                @blur="touchField('purchasePrice')"
              >
              <div v-if="hasError('purchasePrice')" class="field-error">{{ getError('purchasePrice') }}</div>
              <div class="field-hint">Máximo $999,000, solo números positivos</div>
            </div>
            <div class="form-group">
              <label>Precio de Venta: <span class="required">*</span></label>
              <input 
                v-model="productForm.sellingPrice" 
                type="number" 
                step="0.01"
                required 
                min="0.01"
                max="999000"
                placeholder="0.00"
                :class="{ 'error': hasError('sellingPrice') }"
                @input="handleSellingPriceInput"
                @blur="touchField('sellingPrice')"
              >
              <div v-if="hasError('sellingPrice')" class="field-error">{{ getError('sellingPrice') }}</div>
              <div class="field-hint">Máximo $999,000, solo números positivos</div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Stock Mínimo: <span class="required">*</span></label>
              <input 
                v-model="productForm.minimumStock" 
                type="number" 
                required 
                min="1"
                max="999"
                placeholder="1"
                :class="{ 'error': hasError('minimumStock') }"
                @input="handleMinimumStockInput"
                @blur="touchField('minimumStock')"
              >
              <div v-if="hasError('minimumStock')" class="field-error">{{ getError('minimumStock') }}</div>
              <div class="field-hint">Mínimo 1, máximo 999</div>
            </div>
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
              <tr v-for="product in filteredProducts" :key="product.productId">
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
                  <span :class="['stock-badge', product.stock <= product.minimumStock ? 'low-stock' : 'normal-stock']">
                    {{ product.stock }}
                  </span>
                </td>
                <td>${{ product.purchasePrice.toFixed(2) }}</td>
                <td>${{ product.sellingPrice.toFixed(2) }}</td>
                <td>
                  <span :class="['status-badge', product.isActive ? 'active' : 'inactive']">
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
      categories: [],
      products: [],
      availableImages: [],
      autoSelectedCategory: false,
      API_BASE_URL: 'https://pointofsale-backend-api-fsada3d8gwe3d8f5.canadacentral-01.azurewebsites.net',
      productForm: {
        code: '',
        name: '',
        description: '',
        imageUrl: '',
        categoryId: '',
        purchasePrice: 0,
        sellingPrice: 0,
        stock: 0,
        minimumStock: 1,
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
    
    isFormValid() {
      return this.validator ? this.validator.isFormValid() : false;
    }
  },
  async mounted() {
    // Inicializar el validador
    this.validator = useProductValidation(this.products);
    
    if (this.isVisible) {
      await this.loadInitialData();
    }
  },
  watch: {
    isVisible(newVal) {
      if (newVal) {
        this.loadInitialData();
      }
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

    // Manejadores de input con validación
    handleCodeInput(event) {
      const formattedCode = this.validator.formatProductCode(event.target.value);
      this.productForm.code = formattedCode;
      
      // Validar el código
      this.validator.validateField('code', formattedCode);
      
      // Auto-seleccionar categoría basada en el código
      const categoryInfo = this.validator.getCategoryFromCode(formattedCode);
      if (categoryInfo) {
        this.productForm.categoryId = categoryInfo.categoryId;
        this.autoSelectedCategory = true;
      } else {
        this.productForm.categoryId = '';
        this.autoSelectedCategory = false;
      }
    },

    handleNameInput(event) {
      const filteredName = this.validator.filterLettersOnly(event.target.value);
      this.productForm.name = filteredName.slice(0, 20); // Limitar a 20 caracteres
      this.validator.validateField('name', this.productForm.name);
    },

    handleDescriptionInput(event) {
      const filteredDescription = this.validator.filterLettersAndNumbers(event.target.value);
      this.productForm.description = filteredDescription.slice(0, 30); // Limitar a 30 caracteres
      this.validator.validateField('description', this.productForm.description);
    },

    handleStockInput(event) {
      const formattedStock = this.validator.formatNumericInput(event.target.value, 999, true);
      this.productForm.stock = formattedStock;
      this.validator.validateField('stock', this.productForm.stock);
    },

    handlePurchasePriceInput(event) {
      const formattedPrice = this.validator.formatNumericInput(event.target.value, 999000, false);
      this.productForm.purchasePrice = formattedPrice;
      this.validator.validateField('purchasePrice', this.productForm.purchasePrice);
    },

    handleSellingPriceInput(event) {
      const formattedPrice = this.validator.formatNumericInput(event.target.value, 999000, false);
      this.productForm.sellingPrice = formattedPrice;
      this.validator.validateField('sellingPrice', this.productForm.sellingPrice);
    },

    handleMinimumStockInput(event) {
      let value = this.validator.formatNumericInput(event.target.value, 999, true);
      if (value < 1) value = 1; // Asegurar que sea al menos 1
      this.productForm.minimumStock = value;
      this.validator.validateField('minimumStock', this.productForm.minimumStock);
    },

    async loadInitialData() {
      await this.loadCategories();
      await this.loadProducts();
      await this.loadAvailableImages();
      
      // Actualizar el validador con los productos cargados
      if (this.validator) {
        this.validator = useProductValidation(this.products);
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
          this.validator = useProductValidation(this.products);
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
      } catch (error) {
        console.error('Error loading available images:', error);
        this.availableImages = [];
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
      this.autoSelectedCategory = false;
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
      this.autoSelectedCategory = false;
      if (this.validator) {
        this.validator.clearErrors();
      }
    },
    
    editProduct(product) {
      this.showForm = true;
      this.editingProduct = product;
      this.errorMessage = '';
      this.showImageSelector = false;
      this.autoSelectedCategory = false;
      
      this.productForm = {
        code: product.code,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl || '',
        categoryId: product.categoryId,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        stock: product.stock,
        minimumStock: product.minimumStock,
        isActive: Boolean(product.isActive)
      };
      
      if (this.validator) {
        this.validator.clearErrors();
      }
    },
    
    backToList() {
      this.showForm = false;
      this.editingProduct = null;
      this.errorMessage = '';
      this.showImageSelector = false;
      this.autoSelectedCategory = false;
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
        purchasePrice: 0,
        sellingPrice: 0,
        stock: 0,
        minimumStock: 1,
        isActive: true 
      };
      this.autoSelectedCategory = false;
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
        } catch (error) {
          this.errorMessage = error.message || 'Error al eliminar el producto';
          console.error('Error deleting product:', error);
        }
      }
    },
    
    async refreshProducts() {
      await this.loadProducts();
    }
  }
}
</script>

<style scoped>
@import '../../../assets/styles/products-modal.css';

/* Estilos adicionales para validaciones */
.field-error {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.field-hint {
  color: #6c757d;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.field-info {
  color: #28a745;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.required {
  color: #e74c3c;
}

.error {
  border-color: #e74c3c !important;
  box-shadow: 0 0 0 0.2rem rgba(231, 76, 60, 0.25) !important;
}

.auto-selected {
  background-color: #e8f5e8;
  border-color: #28a745;
}

.form-group input:disabled,
.form-group select:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>