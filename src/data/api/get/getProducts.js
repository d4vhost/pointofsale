//src/data/api/get/getProducts.js
import axios from 'axios'
const API_URL = 'https://pointofsale-backend-api-fsada3d8gwe3d8f5.canadacentral-01.azurewebsites.net/api'

export const getProductsApi = () => {
  return axios.get(`${API_URL}/Products`)
}
