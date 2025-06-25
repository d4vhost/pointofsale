// src/apis/get/getRol.js
import axios from 'axios';

const API_BASE_URL = 'https://pointofsale-backend-api-fsada3d8gwe3d8f5.canadacentral-01.azurewebsites.net/api';

export const getRoles = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/RolesApi`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener roles:', error);
    throw new Error('Error al cargar los roles');
  }
};

export default {
  getRoles
};