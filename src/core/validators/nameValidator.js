// core/validators/nameValidator.js
export function isValidName(name) {
  // Solo letras (incluye acentos y ñ), espacios y máximo 25 caracteres
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  
  if (!name || name.trim().length === 0) {
    return {
      isValid: false,
      message: 'Este campo es requerido'
    };
  }
  
  if (name.length > 25) {
    return {
      isValid: false,
      message: 'Máximo 25 caracteres permitidos'
    };
  }
  
  if (!nameRegex.test(name)) {
    return {
      isValid: false,
      message: 'Solo se permiten letras y espacios'
    };
  }
  
  return {
    isValid: true,
    message: ''
  };
}