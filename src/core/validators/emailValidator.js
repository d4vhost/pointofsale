// core/validators/emailValidator.js
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || email.trim().length === 0) {
    return {
      isValid: false,
      message: 'El email es requerido'
    };
  }
  
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Formato de email inválido'
    };
  }
  
  return {
    isValid: true,
    message: ''
  };
}