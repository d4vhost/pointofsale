// src/apis/get/getUsers.js
import axios from 'axios';

const API_BASE_URL = 'https://pointofsale-backend-api-fsada3d8gwe3d8f5.canadacentral-01.azurewebsites.net/api';

export const getUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/Users`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw new Error('Error al cargar los usuarios');
  }
};

export const getUser = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/Users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw new Error('Error al cargar el usuario');
  }
};

export default {
  getUsers,
  getUser
};