// core/validators/passwordValidator.js
export function isValidPassword(password) {
  if (!password || password.trim().length === 0) {
    return {
      isValid: false,
      message: 'La contraseña es requerida'
    };
  }
  
  if (password.length > 25) {
    return {
      isValid: false,
      message: 'Máximo 25 caracteres permitidos'
    };
  }
  
  if (password.length < 6) {
    return {
      isValid: false,
      message: 'Mínimo 6 caracteres requeridos'
    };
  }
  
  return {
    isValid: true,
    message: ''
  };
}