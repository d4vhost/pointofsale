// core/validators/phoneValidator.js
export function isValidPhone(phone) {
  // Solo números y exactamente 10 caracteres
  const phoneRegex = /^\d{10}$/;
  
  if (!phone || phone.trim().length === 0) {
    return {
      isValid: false,
      message: 'El teléfono es requerido'
    };
  }
  
  if (phone.length !== 10) {
    return {
      isValid: false,
      message: 'El teléfono debe tener exactamente 10 números'
    };
  }
  
  if (!phoneRegex.test(phone)) {
    return {
      isValid: false,
      message: 'Solo se permiten números'
    };
  }
  
  return {
    isValid: true,
    message: ''
  };
}