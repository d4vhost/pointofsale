//src/data/api/put/putProducts.js
import axios from 'axios'

const API_URL = 'https://pointofsale-backend-api-fsada3d8gwe3d8f5.canadacentral-01.azurewebsites.net/api'

export const updateProduct = async (productId, productData) => {
  try {
    const response = await axios.put(`${API_URL}/Products/${productId}`, productData)
    return response.data
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error al actualizar el producto')
    }
    throw new Error('Error de conexión al actualizar el producto')
  }
}

export const toggleProductStatus = async (productId, isActive) => {
  try {
    const response = await axios.put(`${API_URL}/Products/${productId}/status`, { isActive })
    return response.data
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error al cambiar el estado del producto')
    }
    throw new Error('Error de conexión al cambiar el estado del producto')
  }
}