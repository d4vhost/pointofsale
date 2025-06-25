// src/apis/post/postUsers.js - VERSIÓN CORREGIDA FINAL
import axios from 'axios';

const API_BASE_URL = 'https://pointofsale-backend-api-fsada3d8gwe3d8f5.canadacentral-01.azurewebsites.net/api';

export const createUser = async (userData, roles = []) => {
  try {
    const selectedRole = roles.find(role => role.roleId === userData.roleId);
    console.log('Rol seleccionado:', selectedRole);

    const userDataToSend = {
      firstName: userData.firstName?.trim(),
      lastName: userData.lastName?.trim(),
      identificationNumber: userData.identificationNumber?.trim(),
      email: userData.email?.trim(),
      phone: userData.phone?.trim() || null,
      address: userData.address?.trim() || null,
      password: userData.password,
      roleId: parseInt(userData.roleId), // Asegurar que sea número
      isActive: true, // EXPLÍCITAMENTE establecer como true
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
   
    // Validaciones del lado del cliente
    if (!userDataToSend.firstName) {
      throw new Error('El nombre es requerido');
    }
    if (!userDataToSend.lastName) {
      throw new Error('El apellido es requerido');
    }
    if (!userDataToSend.email) {
      throw new Error('El email es requerido');
    }
    if (!userDataToSend.identificationNumber) {
      throw new Error('El número de identificación es requerido');
    }
    if (!userDataToSend.roleId || isNaN(userDataToSend.roleId)) {
      throw new Error('Debe seleccionar un rol válido');
    }
    if (!userDataToSend.password) {
      throw new Error('La contraseña es requerida');
    }
   
    console.log('Datos finales a enviar:', userDataToSend);
   
    const response = await axios.post(`${API_BASE_URL}/Users`, userDataToSend, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000 // 10 segundos de timeout
    });
   
    console.log('Respuesta del servidor:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('Error completo:', error);
    console.error('Respuesta del error:', error.response);
   
    // Extraer mensaje específico del error
    let errorMessage = 'Error al crear el usuario';
   
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.details) {
      errorMessage = error.response.data.details;
    } else if (error.response?.data?.errors) {
      // Manejar errores de validación del ModelState
      const validationErrors = error.response.data.errors;
      const errorMessages = [];
     
      for (const field in validationErrors) {
        errorMessages.push(`${field}: ${validationErrors[field].join(', ')}`);
      }
     
      errorMessage = errorMessages.join('\n');
    } else if (error.response?.status === 400) {
      errorMessage = error.response?.data || 'Datos inválidos. Verifique que todos los campos estén correctos y que el email no esté en uso.';
    } else if (error.response?.status === 500) {
      errorMessage = 'Error interno del servidor. Verifique que todos los datos sean válidos.';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Error de conexión: El servidor tardó demasiado en responder.';
    } else if (error.message) {
      errorMessage = error.message;
    }
   
    throw new Error(errorMessage);
  }
};

export default {
  createUser
};