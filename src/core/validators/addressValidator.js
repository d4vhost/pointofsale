// core/validators/addressValidator.js
export function isValidAddress(address) {
  // Letras, números, espacios, punto, coma y guión - mínimo 3 caracteres, máximo 25
  const addressRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,-]+$/;
  
  if (!address || address.trim().length === 0) {
    return {
      isValid: false,
      message: 'La dirección es requerida'
    };
  }
  
  if (address.trim().length < 3) {
    return {
      isValid: false,
      message: 'La dirección debe tener mínimo 3 caracteres'
    };
  }
  
  if (address.length > 25) {
    return {
      isValid: false,
      message: 'Máximo 25 caracteres permitidos'
    };
  }
  
  if (!addressRegex.test(address)) {
    return {
      isValid: false,
      message: 'Solo se permiten letras, números, espacios, puntos, comas y guiones'
    };
  }
  
  return {
    isValid: true,
    message: ''
  };
}