<!-- presentation/components/forms/EmployeeInvoiceForm.vue -->
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

        <!-- INFORMACIÓN DEL CLIENTE A FACTURAR -->
        <div class="customer-section">
          <h3 class="section-title">Cliente a Facturar</h3>
          
          <!-- Información del cliente (siempre visible) -->
          <div class="selected-customer-info">
            <div class="customer-details">
              <div class="customer-info-item">
                <span class="customer-label">Nombre:</span>
                <span class="customer-value">{{ selectedCustomer ? selectedCustomer.fullName : '-' }}</span>
              </div>
              <div class="customer-info-item">
                <span class="customer-label">Email:</span>
                <span class="customer-value">{{ selectedCustomer ? selectedCustomer.email : '-' }}</span>
              </div>
              <div class="customer-info-item">
                <span class="customer-label">Teléfono:</span>
                <span class="customer-value">{{ selectedCustomer ? (selectedCustomer.phone || 'No disponible') : '-' }}</span>
              </div>
              <div class="customer-info-item">
                <span class="customer-label">Dirección:</span>
                <span class="customer-value">{{ selectedCustomer ? (selectedCustomer.address || 'No disponible') : '-' }}</span>
              </div>
            </div>
            
            <!-- Acciones del cliente -->
            <div class="customer-actions">
              <button 
                v-if="selectedCustomer" 
                type="button" 
                @click="changeCustomer" 
                class="btn-change-customer"
              >
                Cambiar Cliente
              </button>
              <button 
                v-else 
                type="button" 
                @click="openCustomerModal" 
                class="btn-select-customer"
              >
                <span class="btn-icon">👤</span>
                Seleccionar Cliente
              </button>
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
        <div class="products-section">
          <h3 class="section-title">Productos</h3>
          
          <!-- Mensaje de productos no disponibles -->
          <div v-if="unavailableProducts.length > 0" class="unavailable-products-alert">
            <div class="alert alert-warning">
              <strong>⚠️ Productos no disponibles:</strong>
              <ul>
                <li v-for="product in unavailableProducts" :key="product.productId">
                  {{ product.name }} (Código: {{ product.code }}) - Producto eliminado de la base de datos
                </li>
              </ul>
              <p>Estos productos han sido removidos de su factura automáticamente.</p>
            </div>
          </div>

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
              <!-- Productos seleccionados -->
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
              
              <!-- Fila placeholder cuando no hay productos -->
              <tr v-if="selectedProducts.length === 0" class="empty-row">
                <td class="empty-cell">-</td>
                <td class="text-center empty-cell">-</td>
                <td class="text-right empty-cell">-</td>
                <td class="text-center empty-cell">-</td>
                <td class="text-right empty-cell">-</td>
                <td class="text-center empty-cell">-</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- MENSAJE SIN PRODUCTOS (opcional, más sutil) -->
        <div v-if="selectedProducts.length === 0" class="no-products-hint">
          <p class="hint-text">Haga clic en "Agregar Producto" para comenzar a crear la factura</p>
        </div>

        <!-- TOTALES -->
        <div class="totals-section">
          <div class="totals-container">
            <div class="totals-row">
              <span class="totals-label">Subtotal:</span>
              <span class="totals-amount">{{ selectedProducts.length > 0 ? '$' + subtotalAmount.toFixed(2) : '-' }}</span>
            </div>
            <div class="totals-row">
              <span class="totals-label">IVA ({{ taxRate }}%):</span>
              <span class="totals-amount">{{ selectedProducts.length > 0 ? '$' + taxAmount.toFixed(2) : '-' }}</span>
            </div>
            <div class="totals-row total-final">
              <span class="totals-label">TOTAL:</span>
              <span class="totals-amount">{{ selectedProducts.length > 0 ? '$' + totalAmount.toFixed(2) : '-' }}</span>
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
            :disabled="selectedProducts.length === 0 || isSubmitting || !invoiceForm.paymentMethodId || hasQuantityErrors || !selectedCustomer" 
            class="action-button save-button"
          >
            <span class="btn-icon">💾</span>
            {{ isSubmitting ? 'Procesando transacción...' : 'Guardar Factura' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de productos -->
    <ProductSearchModal v-if="showProductModal" @close="closeProductModal" @select="handleProductSelect" />
    
    <!-- Modal de clientes -->
    <ClientsModal v-if="showCustomerModal" @close="closeCustomerModal" @select="handleCustomerSelect" />
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'
import { postUserInvoiceApi } from '../../../data/api/post/postUserInvoice'
import { loadPaymentMethods } from '../../../core/use-cases/loadPaymentMethods'
import { beginTransaction } from '../../../data/api/transaction/beginTransaction'
import { commitTransaction } from '../../../data/api/transaction/commitTransaction'
import { rollbackTransaction } from '../../../data/api/transaction/rollbackTransaction'
import ProductSearchModal from '../modals/ProductSearchModal.vue'
import ClientsModal from '../modals/ClientsModal.vue'

export default {
  name: 'EmployeeInvoiceForm',
  components: { ProductSearchModal, ClientsModal },
  emits: ['open-modal', 'invoice-created'],
  setup(props, { emit }) {
    const selectedProducts = ref([])
    const selectedCustomer = ref(null)
    const paymentMethods = ref([])
    const validationErrors = ref({})
    const isSubmitting = ref(false)
    const showProductModal = ref(false)
    const showCustomerModal = ref(false)
    const unavailableProducts = ref([]) // Productos que no están disponibles
    
    // Configuración de impuestos
    const taxRate = ref(12) // IVA del 12%
    
    const invoiceForm = reactive({
      paymentMethodId: ''
    })

    // Generar número de factura único (ahora basado en el empleado)
    const invoiceNumber = computed(() => {
      const employeeId = localStorage.getItem('userId') || '001'
      const timestamp = Date.now().toString().slice(-6)
      const employeeIdPadded = employeeId.toString().padStart(3, '0')
      return `EMP-${employeeIdPadded}-${timestamp}`
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

    // Funciones para modal de productos
    const openProductModal = () => { 
      if (!selectedCustomer.value) {
        alert('Debe seleccionar un cliente primero')
        return
      }
      showProductModal.value = true
      emit('open-modal')
    }
    const closeProductModal = () => { showProductModal.value = false }
    const handleProductSelect = (product) => { addProduct(product); closeProductModal() }

    // Funciones para modal de clientes
    const openCustomerModal = () => {
      showCustomerModal.value = true
      emit('open-modal')
    }

    const closeCustomerModal = () => {
      showCustomerModal.value = false
    }

    const handleCustomerSelect = (customer) => {
      selectedCustomer.value = {
        userId: customer.userId,
        fullName: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        phone: customer.phone,
        address: customer.address
      }
      closeCustomerModal()
    }

    const changeCustomer = () => {
      selectedCustomer.value = null
      selectedProducts.value = []
      unavailableProducts.value = []
      invoiceForm.paymentMethodId = ''
    }

    // Funciones de validación de productos
    const preventInvalidInput = (event) => {
      if (['e', 'E', '+', '-', '.'].includes(event.key)) {
        event.preventDefault()
      }
    }

    const validateAndUpdateQuantity = (product, event) => {
      let value = parseInt(event.target.value)
      
      product.quantityError = null
      
      if (isNaN(value) || value === '') {
        product.quantity = 1
        updateSubtotal(product)
        return
      }
      
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

    // Función para verificar la disponibilidad de productos
    const verifyProductAvailability = async (products) => {
      const availableProducts = []
      const unavailable = []

      for (const product of products) {
        try {
          // Hacer una petición para verificar si el producto existe
          const response = await fetch(`https://pointofsale-backend-api-fsada3d8gwe3d8f5.canadacentral-01.azurewebsites.net/api/Products/${product.productId}`)
          
          if (response.ok) {
            const productData = await response.json()
            // Verificar si el producto tiene stock suficiente
            if (productData.stock >= product.quantity) {
              availableProducts.push(product)
            } else {
              unavailable.push({
                ...product,
                reason: `Stock insuficiente. Disponible: ${productData.stock}, Solicitado: ${product.quantity}`
              })
            }
          } else if (response.status === 404) {
            unavailable.push({
              ...product,
              reason: 'Producto no encontrado en la base de datos'
            })
          } else {
            throw new Error(`Error al verificar producto: ${response.status}`)
          }
        } catch (error) {
          console.error(`Error al verificar producto ${product.productId}:`, error)
          unavailable.push({
            ...product,
            reason: 'Error al verificar disponibilidad'
          })
        }
      }

      return { availableProducts, unavailable }
    }

    const handleSubmit = async () => {
      let transactionId = null
      
      try {
        isSubmitting.value = true
        clearValidationErrors()

        if (!selectedCustomer.value) {
          alert('Debe seleccionar un cliente primero')
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

        if (hasQuantityErrors.value) {
          alert('Corrija los errores de cantidad antes de continuar')
          return
        }

        // Limpiar productos no disponibles anteriores
        unavailableProducts.value = []

        console.log('Iniciando transacción...')
        
        // 1. Iniciar transacción
        transactionId = await beginTransaction()
        console.log('Transacción iniciada:', transactionId)

        try {
          // 2. Verificar disponibilidad de productos
          console.log('Verificando disponibilidad de productos...')
          const { availableProducts, unavailable } = await verifyProductAvailability(selectedProducts.value)

          if (unavailable.length > 0) {
            console.log('Productos no disponibles encontrados:', unavailable)
            
            // Actualizar la lista de productos no disponibles para mostrar al usuario
            unavailableProducts.value = unavailable
            
            // Remover productos no disponibles de la lista seleccionada
            selectedProducts.value = availableProducts
            
            // Hacer rollback de la transacción
            console.log('Haciendo rollback por productos no disponibles...')
            await rollbackTransaction(transactionId)
            
            // Mostrar mensaje personalizado
            const productNames = unavailable.map(p => `${p.name} (${p.code})`).join(', ')
            alert(`❌ Los siguientes productos no están disponibles y han sido removidos de la factura:\n\n${productNames}\n\nPor favor, revise su selección y vuelva a intentar.`)
            
            return
          }

          // 3. Si todos los productos están disponibles, proceder con la creación de la factura
          console.log('Todos los productos están disponibles, procesando factura...')
          
          // Preparar datos para el backend
          const invoiceData = {
            userId: parseInt(selectedCustomer.value.userId),
            paymentMethodId: parseInt(invoiceForm.paymentMethodId),
            statusId: 1,
            taxRate: taxRate.value,
            notes: `Factura creada por empleado: ${localStorage.getItem('firstName')} ${localStorage.getItem('lastName')}`,
            invoiceNumber: invoiceNumber.value,
            invoiceDetails: selectedProducts.value.map(product => ({
              productId: product.productId,
              quantity: product.quantity,
              unitPrice: product.sellingPrice,
              discount: 0
            }))
          }

          console.log("Datos enviados al backend:", invoiceData)

          // 4. Guardar la factura
          const savedInvoice = await postUserInvoiceApi(invoiceData)
          
          // 5. Confirmar transacción
          console.log('Confirmando transacción...')
          await commitTransaction(transactionId)
          console.log('Transacción confirmada exitosamente')

          alert("✅ Factura registrada correctamente")

          // Limpiar formulario
          selectedProducts.value = []
          invoiceForm.paymentMethodId = ''
          selectedCustomer.value = null
          unavailableProducts.value = []

          // Redirigir a los detalles de la factura
          if (savedInvoice && savedInvoice.invoiceId) {
            window.location.href = `/invoice-details/${savedInvoice.invoiceId}`
          }

        } catch (innerError) {
          // Error durante el procesamiento de la factura
          console.error("Error durante el procesamiento:", innerError)
          
          if (transactionId) {
            console.log('Haciendo rollback por error en procesamiento...')
            await rollbackTransaction(transactionId)
            console.log('Rollback completado')
          }
          
          throw innerError
        }

      } catch (error) {
        console.error("Error general en handleSubmit:", error)
        
        // Intentar rollback si hay una transacción activa
        if (transactionId) {
          try {
            console.log('Haciendo rollback por error general...')
            await rollbackTransaction(transactionId)
            console.log('Rollback completado')
          } catch (rollbackError) {
            console.error('Error en rollback:', rollbackError)
          }
        }
        
        // Mostrar mensaje de error más específico
        if (error.message.includes('not found')) {
          alert(`❌ Error: Uno o más productos han sido eliminados de la base de datos. Por favor, revise su selección.`)
        } else {
          alert(`❌ Error: ${error.message || "No se pudo guardar la factura"}`)
        }
      } finally {
        isSubmitting.value = false
      }
    }

    onMounted(() => {
      loadPaymentMethodsData()
    })

    return {
      selectedProducts,
      selectedCustomer,
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
      showCustomerModal,
      unavailableProducts,
      openProductModal,
      closeProductModal,
      handleProductSelect,
      openCustomerModal,
      closeCustomerModal,
      handleCustomerSelect,
      changeCustomer,
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
/* Estilos existentes */
.selected-customer-info {
  padding: 20px;
  background-color: transparent;
}

.customer-actions {
  margin-top: 15px;
  text-align: right;
}

.btn-select-customer {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-select-customer:hover {
  background-color: #0056b3;
}

.btn-change-customer {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-change-customer:hover {
  background-color: #545b62;
}

.btn-icon {
  margin-right: 8px;
}

.totals-container {
  padding: 20px;
  background-color: transparent;
}

.empty-row {
  font-style: italic;
}

.empty-cell {
  color: #6c757d;
  padding: 20px 8px;
  font-size: 16px;
}

.no-products-hint {
  text-align: center;
  margin-top: 10px;
  margin-bottom: 20px;
}

.hint-text {
  color: #6c757d;
  font-style: italic;
  font-size: 14px;
  margin: 0;
}

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

/* Nuevos estilos para productos no disponibles */
.unavailable-products-alert {
  margin-bottom: 20px;
}

.alert {
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.alert-warning {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
}

.alert strong {
  display: block;
  margin-bottom: 8px;
}

.alert ul {
  margin: 8px 0;
  padding-left: 20px;
}

.alert li {
  margin-bottom: 4px;
}

.alert p {
  margin: 8px 0 0 0;
  font-style: italic;
}
</style>