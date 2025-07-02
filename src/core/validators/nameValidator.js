// core/validators/nameValidator.js

export function isValidName(name) {
  if (!name || typeof name !== 'string') {
    return {
      isValid: false,
      message: 'El nombre es requerido'
    };
  }

  const trimmedName = name.trim();
  
  if (trimmedName.length < 2) {
    return {
      isValid: false,
      message: 'El nombre debe tener al menos 2 caracteres'
    };
  }

  if (trimmedName.length > 25) {
    return {
      isValid: false,
      message: 'El nombre no puede tener más de 25 caracteres'
    };
  }

  // Solo letras, espacios y acentos
  const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  if (!namePattern.test(trimmedName)) {
    return {
      isValid: false,
      message: 'El nombre solo puede contener letras y espacios'
    };
  }

  return {
    isValid: true,
    message: ''
  };
}

export async function isUniqueNameCombination(firstName, lastName, users, editingUserId = null) {
  if (!firstName || !lastName) {
    return {
      isValid: false,
      message: 'Nombre y apellido son requeridos'
    };
  }

  const normalizedFirstName = firstName.trim().toLowerCase();
  const normalizedLastName = lastName.trim().toLowerCase();

  // Buscar si ya existe la combinación nombre + apellido
  const existingUser = users.find(user => {
    // Si estamos editando, excluir el usuario actual
    if (editingUserId && user.userId === editingUserId) {
      return false;
    }
    
    return user.firstName.toLowerCase() === normalizedFirstName && 
           user.lastName.toLowerCase() === normalizedLastName;
  });

  if (existingUser) {
    return {
      isValid: false,
      message: 'Ya existe un usuario con este nombre y apellido'
    };
  }

  return {
    isValid: true,
    message: ''
  };
}