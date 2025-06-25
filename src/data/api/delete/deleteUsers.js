// src/apis/delete/deleteUsers.js
import axios from 'axios';

const API_BASE_URL = 'https://pointofsale-backend-api-fsada3d8gwe3d8f5.canadacentral-01.azurewebsites.net/api';

export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/Users/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    return response.data;
  } catch (error) {
    let errorMessage = 'Error al eliminar el usuario';
    
    console.error('Error details:', error);
    
    if (error.response) {
      // Error del servidor (400, 500, etc.)
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response.data?.innerError) {
        errorMessage = `${error.response.data.error || 'Error'}: ${error.response.data.innerError}`;
      } else if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data) {
        errorMessage = JSON.stringify(error.response.data);
      } else {
        errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
      }
    } else if (error.request) {
      // Error de red o timeout
      errorMessage = 'Error de conexión. Verifique su conexión a internet.';
    } else {
      // Error en la configuración de la request
      errorMessage = error.message || 'Error desconocido';
    }
   
    throw new Error(errorMessage);
  }
};

// Método adicional para eliminación lógica (desactivar)
export const deactivateUser = async (userId) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/Users/${userId}/deactivate`, {}, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    return response.data;
  } catch (error) {
    let errorMessage = 'Error al desactivar el usuario';
   
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }
   
    throw new Error(errorMessage);
  }
};

// Método adicional para reactivar usuario
export const activateUser = async (userId) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/Users/${userId}/activate`, {}, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    return response.data;
  } catch (error) {
    let errorMessage = 'Error al activar el usuario';
   
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }
   
    throw new Error(errorMessage);
  }
};

export default {
  deleteUser,
  deactivateUser,
  activateUser
};