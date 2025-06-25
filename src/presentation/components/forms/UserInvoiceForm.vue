<!--pesentation/components/forms/UserInvoiceForm.vue-->
<template>
  <div class="invoice-form">
    <div class="invoice-container">
      <div class="invoice-document">
        <!-- ENCABEZADO DE LA FACTURA -->
        <div class="invoice-header-section">
          <div class="company-section">
            <h1 class="company-name-invoice">FactuSys</h1>
              <div class="company-info">
                <div>Sistema de Facturación</div>
                <div>Ambato, Tungurahua, Ecuador</div>
                <div>Tel: (03) 2XX-XXXX</div>
                <div>Email: info@factusys.com</div>
              </div>
          </div>
          <div class="invoice-number-section">
            <h2 class="invoice-title">FACTURA</h2>
            <div class="invoice-number">{{ invoiceNumber }}</div>
            <div class="invoice-date">{{ currentDate }}</div>
          </div>
        </div>

        <!-- INFORMACIÓN DEL CLIENTE -->
        <div class="customer-section">
          <h3 class="section-title">Información del Cliente</h3>
          <div class="customer-details">
            <div class="customer-info-item">
              <span class="customer-label">Nombre:</span>
              <span class="customer-value">{{ userInfo.fullName || 'Cargando...' }}</span>
            </div>
            <div class="customer-info-item">
              <span class="customer-label">Email:</span>
              <span class="customer-value">{{ userInfo.email || 'Cargando...' }}</span>
            </div>
            <div class="customer-info-item">
              <span class="customer-label">Teléfono:</span>
              <span class="customer-value">{{ userInfo.phone || 'No disponible' }}</span>
            </div>
            <div class="customer-info-item">
              <span class="customer-label">Dirección:</span>
              <span class="customer-value">{{ userInfo.address || 'No disponible' }}</span>
            </div>
          </div>
        </div>

        <!-- CONFIGURACIÓN DE LA FACTURA -->
        <div class="configuration-section">
          <h3 class="section-title">Configuración de Factura</h3>
          <div class="config-item">
            <label for="paymentMethod" class="config-label">Método de Pago:</label>
            <select 
              id="paymentMethod" 
              v-model="invoiceForm.paymentMethodId" 
              class="payment-method-select" 
              required
            >
              <option value="">Seleccionar método</option>
              <option v-for="method in paymentMethods" :key="method.paymentMethodId" :value="method.paymentMethodId">
                {{ method.name }}
              </option>
            </select>
          </div>
          <div class="config-item">
            <button type="button" @click="openProductModal" class="btn-add-product">
              <span class="btn-icon">+</span>
              Agregar Producto
            </button>
          </div>
        </div>

        <!-- PRODUCTOS SELECCIONADOS -->
        <div class="products-section" v-if="selectedProducts.length > 0">
          <h3 class="section-title">Productos</h3>
          <table class="products-table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th class="text-center">Código</th>
                <th class="text-right">Precio Unit.</th>
                <th class="text-center">Cantidad</th>
                <th class="text-right">Subtotal</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(product, index) in selectedProducts" :key="`${product.productId}-${index}`">
                <td>
                  <div class="product-name">{{ product.name }}</div>
                  <div class="stock-info">Stock disponible: {{ product.stock }}</div>
                </td>
                <td class="text-center">
                  <span class="product-code">{{ product.code }}</span>
                </td>
                <td class="text-right">${{ product.sellingPrice.toFixed(2) }}</td>
                <td class="text-center">
                  <input 
                    type="number" 
                    min="1" 
                    :max="product.stock" 
                    v-model.number="product.quantity" 
                    @input="validateAndUpdateQuantity(product, $event)" 
                    @blur="validateQuantityOnBlur(product)"
                    @keydown="preventInvalidInput"
                    class="quantity-input"
                    :class="{ 'quantity-error': product.quantityError }"
                  />
                  <div v-if="product.quantityError" class="quantity-error-message">
                    {{ product.quantityError }}
                  </div>
                </td>
                <td class="text-right">${{ product.subtotal.toFixed(2) }}</td>
                <td class="text-center">
                  <button type="button" @click="removeProduct(index)" class="btn-remove">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- MENSAJE SIN PRODUCTOS -->
        <div v-else class="no-products-section">
          <div class="no-products-message">
            <h3>No hay productos agregados</h3>
            <p>Haga clic en "Agregar Producto" para comenzar a crear su factura</p>
          </div>
        </div>

        <!-- TOTALES -->
        <div class="totals-section" v-if="selectedProducts.length > 0">
          <div class="totals-container">
            <div class="totals-row">
              <span class="totals-label">Subtotal:</span>
              <span class="totals-amount">${{ subtotalAmount.toFixed(2) }}</span>
            </div>
            <div class="totals-row">
              <span class="totals-label">IVA ({{ taxRate }}%):</span>
              <span class="totals-amount">${{ taxAmount.toFixed(2) }}</span>
            </div>
            <div class="totals-row total-final">
              <span class="totals-label">TOTAL:</span>
              <span class="totals-amount">${{ totalAmount.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- ERRORES DE VALIDACIÓN -->
        <div v-if="Object.keys(validationErrors).length > 0" class="validation-errors">
          <h4>Errores de validación:</h4>
          <ul>
            <li v-for="(error, field) in validationErrors" :key="field" class="error">{{ error }}</li>
          </ul>
        </div>

        <!-- ACCIONES -->
        <div class="invoice-actions">
          <button 
            type="button"
            @click="handleSubmit"
            :disabled="selectedProducts.length === 0 || isSubmitting || !invoiceForm.paymentMethodId || hasQuantityErrors" 
            class="action-button save-button"
          >
            <span class="btn-icon">💾</span>
            {{ isSubmitting ? 'Guardando...' : 'Guardar Factura' }}
          </button>
        </div>
      </div>
    </div>

    <ProductSearchModal v-if="showProductModal" @close="closeProductModal" @select="handleProductSelect" />
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'
import { postUserInvoiceApi } from '../../../data/api/post/postUserInvoice'
import { loadPaymentMethods } from '../../../core/use-cases/loadPaymentMethods'
import ProductSearchModal from '../modals/ProductSearchModal.vue'

export default {
  name: 'UserInvoiceForm',
  components: { ProductSearchModal },
  props: {
    userInfo: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['open-modal', 'invoice-created'],
  setup(props, { emit }) {
    const selectedProducts = ref([])
    const paymentMethods = ref([])
    const validationErrors = ref({})
    const isSubmitting = ref(false)
    const showProductModal = ref(false)
    
    // Configuración de impuestos
    const taxRate = ref(12) // IVA del 12%
    
    const invoiceForm = reactive({
      paymentMethodId: ''
    })

    // Generar número de factura único
    const invoiceNumber = computed(() => {
      const userId = localStorage.getItem('userId') || '001'
      const timestamp = Date.now().toString().slice(-6)
      const userIdPadded = userId.toString().padStart(3, '0')
      return `INV-${userIdPadded}-${timestamp}`
    })

    // Fecha actual formateada
    const currentDate = computed(() => {
      const now = new Date()
      return now.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    })

    // Cálculos de totales
    const subtotalAmount = computed(() => 
      selectedProducts.value.reduce((total, p) => total + (p.subtotal || 0), 0)
    )

    const taxAmount = computed(() => 
      subtotalAmount.value * (taxRate.value / 100)
    )

    const totalAmount = computed(() => 
      subtotalAmount.value + taxAmount.value
    )

    // Verificar si hay errores de cantidad
    const hasQuantityErrors = computed(() => 
      selectedProducts.value.some(product => product.quantityError)
    )

    const loadPaymentMethodsData = async () => {
      try {
        paymentMethods.value = await loadPaymentMethods()
      } catch (error) {
        console.error('Error al cargar métodos de pago:', error)
      }
    }

    const openProductModal = () => { showProductModal.value = true; emit('open-modal') }
    const closeProductModal = () => { showProductModal.value = false }

    const handleProductSelect = (product) => { addProduct(product); closeProductModal() }

    // Prevenir entrada de caracteres inválidos
    const preventInvalidInput = (event) => {
      // Prevenir entrada de 'e', 'E', '+', '-', '.'
      if (['e', 'E', '+', '-', '.'].includes(event.key)) {
        event.preventDefault()
      }
    }

    // Validar cantidad durante la escritura
    const validateAndUpdateQuantity = (product, event) => {
      let value = parseInt(event.target.value)
      
      // Limpiar error previo
      product.quantityError = null
      
      // Si el valor está vacío o es NaN, establecer en 1
      if (isNaN(value) || value === '') {
        product.quantity = 1
        updateSubtotal(product)
        return
      }
      
      // Validar rango
      if (value < 1) {
        product.quantity = 1
        product.quantityError = 'La cantidad mínima es 1'
      } else if (value > product.stock) {
        product.quantity = product.stock
        product.quantityError = `Cantidad máxima disponible: ${product.stock}`
      } else {
        product.quantity = value
      }
      
      updateSubtotal(product)
    }

    // Validar cantidad cuando el campo pierde el foco
    const validateQuantityOnBlur = (product) => {
      if (!product.quantity || product.quantity < 1) {
        product.quantity = 1
        product.quantityError = null
        updateSubtotal(product)
      } else if (product.quantity > product.stock) {
        product.quantity = product.stock
        product.quantityError = null
        updateSubtotal(product)
      } else {
        product.quantityError = null
      }
    }

    const addProduct = (product) => {
      const existingIndex = selectedProducts.value.findIndex(p => p.productId === product.productId)
      if (existingIndex >= 0) {
        const existing = selectedProducts.value[existingIndex]
        const newQty = existing.quantity + (product.quantity || 1)
        if (newQty <= product.stock) {
          existing.quantity = newQty
          existing.quantityError = null
          updateSubtotal(existing)
        } else {
          existing.quantity = product.stock
          existing.quantityError = 'Se alcanzó el stock máximo disponible'
          updateSubtotal(existing)
        }
      } else {
        const newProduct = { 
          ...product, 
          quantity: Math.min(product.quantity || 1, product.stock),
          quantityError: null
        }
        updateSubtotal(newProduct)
        selectedProducts.value.push(newProduct)
      }
      clearValidationErrors()
    }

    const updateSubtotal = (product) => { 
      product.subtotal = product.sellingPrice * product.quantity 
    }
    
    const removeProduct = (index) => selectedProducts.value.splice(index, 1)
    const clearValidationErrors = () => { validationErrors.value = {} }

    const handleSubmit = async () => {
      try {
        isSubmitting.value = true
        clearValidationErrors()

        const userId = localStorage.getItem('userId')
        if (!userId) {
          alert('Debe iniciar sesión primero')
          return
        }

        if (!invoiceForm.paymentMethodId) {
          alert('Seleccione un método de pago')
          return
        }

        if (selectedProducts.value.length === 0) {
          alert('Agregue al menos un producto')
          return
        }

        // Verificar errores de cantidad
        if (hasQuantityErrors.value) {
          alert('Corrija los errores de cantidad antes de continuar')
          return
        }

        // Validar stock una vez más antes de enviar
        for (const product of selectedProducts.value) {
          if (product.quantity > product.stock || product.quantity < 1) {
            alert(`Cantidad inválida para: ${product.name}`)
            return
          }
        }

        // Preparar datos para el backend
        const invoiceData = {
          userId: parseInt(userId),
          paymentMethodId: parseInt(invoiceForm.paymentMethodId),
          statusId: 1, // Pendiente por defecto
          taxRate: taxRate.value,
          notes: "Compra de productos",
          invoiceNumber: invoiceNumber.value,
          invoiceDetails: selectedProducts.value.map(product => ({
            productId: product.productId,
            quantity: product.quantity,
            unitPrice: product.sellingPrice,
            discount: 0
          }))
        }

        console.log("Datos enviados al backend:", invoiceData)

        const savedInvoice = await postUserInvoiceApi(invoiceData)

        alert("Factura registrada correctamente")

        // Limpiar formulario
        selectedProducts.value = []
        invoiceForm.paymentMethodId = ''

        // Redirigir a los detalles de la factura
        if (savedInvoice && savedInvoice.invoiceId) {
          window.location.href = `/invoice-details/${savedInvoice.invoiceId}`
        }

      } catch (error) {
        console.error("Error al guardar factura:", error)
        alert(`Error: ${error.message || "No se pudo guardar la factura"}`)
      } finally {
        isSubmitting.value = false
      }
    }

    onMounted(() => {
      loadPaymentMethodsData()
    })

    return {
      selectedProducts,
      paymentMethods,
      validationErrors,
      isSubmitting,
      invoiceForm,
      invoiceNumber,
      currentDate,
      taxRate,
      subtotalAmount,
      taxAmount,
      totalAmount,
      hasQuantityErrors,
      showProductModal,
      openProductModal,
      closeProductModal,
      handleProductSelect,
      preventInvalidInput,
      validateAndUpdateQuantity,
      validateQuantityOnBlur,
      updateSubtotal,
      removeProduct,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.stock-info {
  font-size: 0.85em;
  color: #666;
  font-style: italic;
}

.quantity-input.quantity-error {
  border-color: #dc3545;
  background-color: #fff5f5;
}

.quantity-error-message {
  color: #dc3545;
  font-size: 0.75em;
  margin-top: 2px;
}

.quantity-input {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.quantity-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}
</style>