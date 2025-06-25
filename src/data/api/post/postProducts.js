//src/data/api/post/postProducts.js
import axios from 'axios'

const API_URL = 'https://pointofsale-backend-api-fsada3d8gwe3d8f5.canadacentral-01.azurewebsites.net/api'

export const createProduct = async (productData) => {
  try {
    const response = await axios.post(`${API_URL}/Products`, productData)
    return response.data
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error al crear el producto')
    }
    throw new Error('Error de conexión al crear el producto')
  }
}
//nuevo