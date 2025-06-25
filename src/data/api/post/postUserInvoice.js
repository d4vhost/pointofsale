// src/data/api/post/postUserInvoice.js
import axios from 'axios'

export const postUserInvoiceApi = async (data) => {
  try {
    console.log('Datos recibidos para crear factura:', data)
   
    // Validaciones básicas
    if (!data.userId || !data.paymentMethodId || !data.invoiceDetails || data.invoiceDetails.length === 0) {
      throw new Error('Datos incompletos para crear la factura')
    }

    // Generar número de factura único (timestamp + userId)
    const generateInvoiceNumber = () => {
      const timestamp = Date.now().toString().slice(-6) // Últimos 6 dígitos del timestamp
      const userId = data.userId.toString().padStart(3, '0') // Usuario con 3 dígitos
      return `INV-${userId}-${timestamp}`
    }

    // Enviar exactamente lo que el backend espera según tu controller
    const invoiceData = {
      userId: parseInt(data.userId),
      createdByUserId: parseInt(data.userId), // ✅ CAMPO REQUERIDO según tu backend
      invoiceNumber: data.invoiceNumber || generateInvoiceNumber(), // ✅ CAMPO REQUERIDO
      paymentMethodId: parseInt(data.paymentMethodId),
      statusId: data.statusId || 1, // Pendiente por defecto
      taxRate: parseFloat(data.taxRate || 12.0),
      notes: data.notes || "Compra de productos",
      // ✅ CRÍTICO: El backend espera 'invoiceDetails', no 'products'
      invoiceDetails: data.invoiceDetails.map(detail => ({
        productId: parseInt(detail.productId),
        quantity: parseInt(detail.quantity),
        unitPrice: parseFloat(detail.unitPrice),
        discount: parseFloat(detail.discount || 0)
        // NO enviar subtotal - el backend lo calcula automáticamente
        // NO enviar createdAt - el backend lo asigna automáticamente
      }))
    }

    console.log('Datos finales enviados al backend:', JSON.stringify(invoiceData, null, 2))

    // Realizar la petición HTTP
    const response = await axios.post(`https://pointofsale-backend-api-fsada3d8gwe3d8f5.canadacentral-01.azurewebsites.net/api/invoices`, invoiceData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      timeout: 15000 // 15 segundos de timeout
    })

    console.log('✅ Respuesta exitosa del servidor:', response.data)
    return response.data

  } catch (error) {
    console.error('❌ Error en postUserInvoiceApi:', error)
   
    if (error.response) {
      console.error('Response Error Data:', error.response.data)
      console.error('Response Status:', error.response.status)
     
      // Mostrar errores de validación específicos si existen
      if (error.response.data?.errors) {
        console.error('Validation Errors:', error.response.data.errors)
        const validationErrors = Object.entries(error.response.data.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n')
        throw new Error(`Errores de validación:\n${validationErrors}`)
      }
     
      // Crear mensaje de error más específico basado en la respuesta del servidor
      let errorMessage = 'Error del servidor: '
     
      if (error.response.data?.error) {
        errorMessage += error.response.data.error
      } else if (error.response.data?.message) {
        errorMessage += error.response.data.message
      } else if (error.response.data?.title) {
        errorMessage += error.response.data.title
      } else {
        errorMessage += `Status ${error.response.status}`
      }
     
      if (error.response.data?.innerException) {
        errorMessage += ` (${error.response.data.innerException})`
      }
     
      throw new Error(errorMessage)
    } else if (error.request) {
      console.error('Request Error:', error.request)
      throw new Error('No se pudo conectar con el servidor. Verifique la conexión.')
    } else {
      console.error('Setup Error:', error.message)
      throw error
    }
  }
}