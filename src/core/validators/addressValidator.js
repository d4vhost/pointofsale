// core/validators/addressValidator.js

export function isValidAddress(address) {
  if (!address || typeof address !== 'string') {
    return {
      isValid: false,
      message: 'La dirección es requerida'
    };
  }

  const trimmedAddress = address.trim();

  if (trimmedAddress.length < 5) {
    return {
      isValid: false,
      message: 'La dirección debe tener al menos 5 caracteres'
    };
  }

  if (trimmedAddress.length > 100) {
    return {
      isValid: false,
      message: 'La dirección no puede tener más de 100 caracteres'
    };
  }

  // Permitir letras, números, espacios y algunos caracteres especiales comunes en direcciones
  const addressPattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\.,#\-\/]+$/;
  if (!addressPattern.test(trimmedAddress)) {
    return {
      isValid: false,
      message: 'La dirección contiene caracteres no válidos'
    };
  }

  return {
    isValid: true,
    message: ''
  };
}