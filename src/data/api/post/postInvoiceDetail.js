// src/data/api/post/postInvoiceDetail.js

export async function postInvoiceDetailApi(details) {
  try {
    const response = await fetch('https://pointofsale-backend-api-fsada3d8gwe3d8f5.canadacentral-01.azurewebsites.net/api/InvoiceDetails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(details)
    })

    if (!response.ok) {
      throw new Error('Error al guardar detalles de la factura')
    }

    return await response.json()
  } catch (error) {
    console.error('Error en postInvoiceDetailApi:', error)
    throw error
  }
}
