<!-- src/presentation/pages/InvoiceDetailsPage.vue -->
<template>
  <div class="invoice-details-page">
    <!-- HEADER -->
    <header class="app-header">
      <div class="header-container">
        <div class="logo-container">
          <div class="logo-placeholder"></div>
          <h1 class="company-name">FactuSys</h1>
        </div>
        <div class="header-actions">
          <button @click="goBack" class="back-button">
            ← Volver
          </button>
          <button @click="handleLogout" class="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>

    <!-- CONTENIDO CENTRAL -->
    <DefaultLayout>
      <div class="invoice-details-content">
        <div v-if="isLoading" class="loading">
          Cargando detalles de la factura...
        </div>
        
        <div v-else-if="invoice" class="invoice-container">
          <!-- DOCUMENTO DE FACTURA -->
          <div id="invoice-document" class="invoice-document">
            
            <!-- ENCABEZADO DE LA FACTURA -->
            <div class="invoice-header-section">
              <div class="company-section">
                <h1 class="company-name-invoice">FACTUSYS</h1>
                <div class="company-info">
                  <div>Sistema de Facturación</div>
                  <div>Ambato, Tungurahua, Ecuador</div>
                  <div>Tel: (03) 2XX-XXXX</div>
                  <div>Email: info@factusys.com</div>
                </div>
              </div>
              
              <div class="invoice-number-section">
                <h2 class="invoice-title">FACTURA</h2>
                <div class="invoice-number">{{ invoice.invoiceNumber }}</div>
                <div class="invoice-date">
                  <strong>Fecha:</strong> {{ formatDate(invoice.invoiceDate) }}
                </div>
                <div class="invoice-date">
                  <strong>Estado:</strong> {{ invoice.status?.statusName || 'Activa' }}
                </div>
              </div>
            </div>

            <!-- INFORMACIÓN DEL CLIENTE -->
            <div class="customer-section">
              <h3 class="section-title">Facturar A:</h3>
              <div class="customer-details">
                <div class="customer-info-item">
                  <span class="customer-label">Nombre:</span>
                  <span class="customer-value">{{ invoice.customer?.firstName }} {{ invoice.customer?.lastName }}</span>
                </div>
                <div class="customer-info-item">
                  <span class="customer-label">Email:</span>
                  <span class="customer-value">{{ invoice.customer?.email }}</span>
                </div>
                <div class="customer-info-item" v-if="invoice.customer?.phone">
                  <span class="customer-label">Teléfono:</span>
                  <span class="customer-value">{{ invoice.customer?.phone }}</span>
                </div>
                <div class="customer-info-item">
                  <span class="customer-label">Dirección:</span>
                  <span class="customer-value">{{ invoice.customer?.address || 'No disponible' }}</span>
                </div>
              </div>
            </div>

            <!-- TABLA DE PRODUCTOS -->
            <div class="products-section">
              <h3 class="section-title">Detalle de Productos</h3>
              <table class="products-table">
                <thead>
                  <tr>
                    <th style="width: 30%;">Descripción</th>
                    <th style="width: 15%;" class="text-center">Código</th>
                    <th style="width: 10%;" class="text-center">Cant.</th>
                    <th style="width: 15%;" class="text-right">Precio Unit.</th>
                    <th style="width: 15%;" class="text-right">Descuento</th>
                    <th style="width: 15%;" class="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="detail in invoice.invoiceDetails" :key="detail.invoiceDetailId">
                    <td>
                      <div class="product-name">{{ detail.product?.name }}</div>
                    </td>
                    <td class="text-center">
                      <div class="product-code">{{ detail.product?.code }}</div>
                    </td>
                    <td class="text-center">{{ detail.quantity }}</td>
                    <td class="text-right">${{ formatCurrency(detail.unitPrice) }}</td>
                    <td class="text-right">${{ formatCurrency(detail.discount) }}</td>
                    <td class="text-right">${{ formatCurrency(detail.subtotal) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- TOTALES -->
            <div class="totals-section">
              <div class="totals-container">
                <div class="totals-row">
                  <span class="totals-label">Subtotal:</span>
                  <span class="totals-amount">${{ formatCurrency(invoice.subtotal) }}</span>
                </div>
                <div class="totals-row" v-if="invoice.taxAmount > 0">
                  <span class="totals-label">Impuestos ({{ invoice.taxRate }}%):</span>
                  <span class="totals-amount">${{ formatCurrency(invoice.taxAmount) }}</span>
                </div>
                <div class="totals-row total-final">
                  <span class="totals-label">TOTAL:</span>
                  <span class="totals-amount">${{ formatCurrency(invoice.total) }}</span>
                </div>
              </div>
            </div>

            <!-- INFORMACIÓN ADICIONAL -->
            <div class="additional-info">
              <div class="payment-method">
                <strong>Método de Pago:</strong> {{ invoice.paymentMethod?.name || 'N/A' }}
              </div>
              
              <div v-if="invoice.notes" class="notes-section">
                <h4 class="section-title">Observaciones:</h4>
                <div class="notes-content">{{ invoice.notes }}</div>
              </div>

              <div class="notes-section">
                <div class="notes-content">
                  <strong>Gracias por su compra!</strong><br>
                  Para cualquier consulta, no dude en contactarnos.
                </div>
              </div>
            </div>
          </div>

          <!-- ACCIONES -->
          <div class="invoice-actions">
            <button @click="printInvoice" class="action-button print-button">
              🖨️ Imprimir Factura
            </button>
            <button @click="downloadPDF" class="action-button download-button" :disabled="isDownloading">
              {{ isDownloading ? '📄 Generando...' : '📄 Descargar PDF' }}
            </button>
          </div>
        </div>

        <div v-else class="error-message">
          <h2>Error</h2>
          <p>No se pudo cargar la información de la factura.</p>
          <p v-if="errorMessage" class="error-details">{{ errorMessage }}</p>
          <button @click="goBack" class="back-button">
            Volver
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import axios from 'axios'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import '@/assets/styles/invoice-details.css'

export default {
  name: 'InvoiceDetailsPage',
  components: {
    DefaultLayout
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const invoice = ref(null)
    const isLoading = ref(true)
    const isDownloading = ref(false)
    const errorMessage = ref('')

    // Cargar detalles de la factura
    const loadInvoiceDetails = async () => {
      try {
        isLoading.value = true
        const invoiceId = route.params.id
        if (!invoiceId) {
          errorMessage.value = 'ID de factura no proporcionado'
          return
        }

        const apiUrl = `https://pointofsale-backend-api-fsada3d8gwe3d8f5.canadacentral-01.azurewebsites.net/api/invoices/${invoiceId}`
        const response = await axios.get(apiUrl)
        invoice.value = response.data
        
      } catch (error) {
        if (error.response) {
          errorMessage.value = `Error ${error.response.status}: ${error.response.data?.message || 'Error del servidor'}`
        } else if (error.request) {
          errorMessage.value = 'No se pudo conectar con el servidor'
        } else {
          errorMessage.value = error.message
        }
      } finally {
        isLoading.value = false
      }
    }

    // Formatear fecha
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }

    // Formatear moneda
    const formatCurrency = (amount) => {
      if (amount === null || amount === undefined) return '0.00'
      return parseFloat(amount).toFixed(2)
    }

    // Navegar hacia atrás
    const goBack = () => {
      router.push('/mis-facturas') 
    }

    // Logout
    const handleLogout = () => {
      localStorage.removeItem('firstName')
      localStorage.removeItem('lastName')
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('role')
      router.push('/')
    }

    // Imprimir factura
    const printInvoice = () => {
      window.print()
    }

    // Descargar PDF
    const downloadPDF = async () => {
      if (!invoice.value) return
      
      try {
        isDownloading.value = true
        
        // Obtener el elemento del documento de la factura
        const element = document.getElementById('invoice-document')
        if (!element) {
          throw new Error('No se pudo encontrar el elemento de la factura')
        }

        // Configurar opciones para html2canvas
        const canvas = await html2canvas(element, {
          scale: 2, // Mejor calidad
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: element.scrollWidth,
          height: element.scrollHeight
        })

        // Crear PDF con jsPDF
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        })

        // Calcular dimensiones para ajustar al PDF
        const imgWidth = 210 // Ancho A4 en mm
        const pageHeight = 295 // Alto A4 en mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        let heightLeft = imgHeight

        let position = 0

        // Agregar la primera página
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight

        // Agregar páginas adicionales si es necesario
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight
          pdf.addPage()
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
          heightLeft -= pageHeight
        }

        // Descargar el PDF
        const fileName = `Factura_${invoice.value.invoiceNumber}.pdf`
        pdf.save(fileName)
        
      } catch (error) {
        console.error('Error al generar PDF:', error)
        alert('Error al generar el PDF. Por favor, intente nuevamente.')
      } finally {
        isDownloading.value = false
      }
    }

    // Ejecutar cuando el componente se monta
    onMounted(() => {
      loadInvoiceDetails()
    })

    return {
      invoice,
      isLoading,
      isDownloading,
      errorMessage,
      formatDate,
      formatCurrency,
      goBack,
      handleLogout,
      printInvoice,
      downloadPDF
    }
  }
}
</script>