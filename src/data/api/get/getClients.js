// src/data/api/get/getClients.js
import axios from 'axios';

const API_BASE_URL = 'https://pointofsale-backend-api-fsada3d8gwe3d8f5.canadacentral-01.azurewebsites.net/api';

export const getClients = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/Users`);
    // Filtrar solo usuarios con roleId = 2 (Clientes) y que estén activos
    const clients = response.data.filter(user => 
      user.roleId === 2 && user.isActive === true
    );
    return clients;
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    throw new Error('Error al cargar los clientes');
  }
};

export const getClient = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/Users/${userId}`);
    // Verificar que el usuario sea un cliente
    if (response.data.roleId !== 2) {
      throw new Error('El usuario no es un cliente');
    }
    return response.data;
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    throw new Error('Error al cargar el cliente');
  }
};

export default {
  getClients,
  getClient
};