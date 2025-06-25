// src/data/api/get/getUserById.js
import axios from 'axios'
export const getUserByIdApi = (id) => {
  return axios.get(`https://pointofsale-backend-api-fsada3d8gwe3d8f5.canadacentral-01.azurewebsites.net/api/users/${id}`)
}