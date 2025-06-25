//src/data/api/delete/deleteProducts.js
import axios from 'axios'

const API_URL = 'https://pointofsale-backend-api-fsada3d8gwe3d8f5.canadacentral-01.azurewebsites.net/api'

export const deleteProduct = async (productId) => {
  try {
    const response = await axios.delete(`${API_URL}/Products/${productId}`)
    return response.data
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error al eliminar el producto')
    }
    throw new Error('Error de conexión al eliminar el producto')
  }
}