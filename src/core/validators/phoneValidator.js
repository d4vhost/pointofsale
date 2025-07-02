// core/validators/phoneValidator.js

export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return {
      isValid: false,
      message: 'El teléfono es requerido'
    };
  }

  const trimmedPhone = phone.trim();

  if (trimmedPhone.length !== 10) {
    return {
      isValid: false,
      message: 'El teléfono debe tener exactamente 10 dígitos'
    };
  }

  // Solo números
  const numberPattern = /^\d+$/;
  if (!numberPattern.test(trimmedPhone)) {
    return {
      isValid: false,
      message: 'El teléfono solo puede contener números'
    };
  }

  // Validación para números ecuatorianos
  if (!isValidEcuadorianPhone(trimmedPhone)) {
    return {
      isValid: false,
      message: 'Formato de teléfono ecuatoriano no válido'
    };
  }

  return {
    isValid: true,
    message: ''
  };
}

function isValidEcuadorianPhone(phone) {
  // Teléfonos celulares: empiezan con 09
  if (phone.startsWith('09')) {
    return true;
  }
  
  // Teléfonos fijos: empiezan con 02-07 seguido de números
  const fixedPhonePattern = /^0[2-7]\d{7}$/;
  if (fixedPhonePattern.test(phone)) {
    return true;
  }

  return false;
}