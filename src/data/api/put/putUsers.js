// src/apis/put/putUsers.js
import axios from 'axios';

const API_BASE_URL = 'https://pointofsale-backend-api-fsada3d8gwe3d8f5.canadacentral-01.azurewebsites.net/api';

export const updateUser = async (userId, userData) => {
  try {    
    const response = await axios.put(`${API_BASE_URL}/Users/${userId}`, userData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    
    let errorMessage = 'Error al actualizar el usuario';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.errors) {
      const validationErrors = error.response.data.errors;
      const errorMessages = [];
      
      for (const field in validationErrors) {
        errorMessages.push(`${field}: ${validationErrors[field].join(', ')}`);
      }
      
      errorMessage = errorMessages.join('\n');
    } else if (error.response?.data) {
      errorMessage = JSON.stringify(error.response.data);
    }
    
    throw new Error(errorMessage);
  }
};

export const toggleUserStatus = async (userId, isActive) => {
  try {    
    const response = await axios.patch(`${API_BASE_URL}/Users/${userId}/status`, {
      isActive: isActive
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {    
    let errorMessage = 'Error al cambiar el estado del usuario';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data) {
      errorMessage = JSON.stringify(error.response.data);
    }
    
    throw new Error(errorMessage);
  }
};

export default {
  updateUser,
  toggleUserStatus
};