// src/data/api/get/getUserInvoices.js
import axios from 'axios'

const API_URL = 'https://pointofsale-backend-api-fsada3d8gwe3d8f5.canadacentral-01.azurewebsites.net/api/invoices'

export const getUserInvoicesApi = (userId) => {
  return axios.get(`${API_URL}/user/${userId}`)
}
