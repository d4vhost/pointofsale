// core/validators/emailValidator.js

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      message: 'El email es requerido'
    };
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length === 0) {
    return {
      isValid: false,
      message: 'El email es requerido'
    };
  }

  // Patrón básico para validación de email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmedEmail)) {
    return {
      isValid: false,
      message: 'El formato del email no es válido'
    };
  }

  // Validaciones adicionales
  if (trimmedEmail.length > 254) {
    return {
      isValid: false,
      message: 'El email es demasiado largo'
    };
  }

  // Verificar que no tenga caracteres especiales problemáticos
  const invalidCharsPattern = /[<>()[\]\\,;:\s@"]/;
  const localPart = trimmedEmail.split('@')[0];
  
  if (localPart.includes('..')) {
    return {
      isValid: false,
      message: 'El email no puede contener puntos consecutivos'
    };
  }

  return {
    isValid: true,
    message: ''
  };
}

export async function isUniqueEmail(email, users, editingUserId = null) {
  if (!email) {
    return {
      isValid: false,
      message: 'El email es requerido'
    };
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Buscar si ya existe el email
  const existingUser = users.find(user => {
    // Si estamos editando, excluir el usuario actual
    if (editingUserId && user.userId === editingUserId) {
      return false;
    }
    
    return user.email.toLowerCase() === trimmedEmail;
  });

  if (existingUser) {
    return {
      isValid: false,
      message: 'Ya existe un usuario con este email'
    };
  }

  return {
    isValid: true,
    message: ''
  };
}