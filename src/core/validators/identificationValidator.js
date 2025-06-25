// core/validators/identificationValidator.js
export function isValidIdentification(identification) {
  // Solo números y máximo 10 caracteres
  const idRegex = /^\d+$/;
  
  if (!identification || identification.trim().length === 0) {
    return {
      isValid: false,
      message: 'El número de identificación es requerido'
    };
  }
  
  if (identification.length > 10) {
    return {
      isValid: false,
      message: 'Máximo 10 números permitidos'
    };
  }
  
  if (!idRegex.test(identification)) {
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