import axios from 'axios'

const API_URL = 'https://pointofsale-backend-api-fsada3d8gwe3d8f5.canadacentral-01.azurewebsites.net/api/auth'

export const loginApi = (credentials) => {
  return axios.post(`${API_URL}/login`, credentials)
}
