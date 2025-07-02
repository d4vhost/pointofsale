// core/validators/identificationValidator.js

export function isValidIdentification(identification) {
  if (!identification || typeof identification !== 'string') {
    return {
      isValid: false,
      message: 'El número de identificación es requerido'
    };
  }

  const trimmedId = identification.trim();

  if (trimmedId.length !== 10) {
    return {
      isValid: false,
      message: 'El número de identificación debe tener exactamente 10 dígitos'
    };
  }

  // Solo números
  const numberPattern = /^\d+$/;
  if (!numberPattern.test(trimmedId)) {
    return {
      isValid: false,
      message: 'El número de identificación solo puede contener números'
    };
  }

  // Validación básica de cédula ecuatoriana
  if (!isValidEcuadorianId(trimmedId)) {
    return {
      isValid: false,
      message: 'El número de identificación no es válido'
    };
  }

  return {
    isValid: true,
    message: ''
  };
}

export async function isUniqueIdentification(identification, users, editingUserId = null) {
  if (!identification) {
    return {
      isValid: false,
      message: 'El número de identificación es requerido'
    };
  }

  const trimmedId = identification.trim();

  // Buscar si ya existe la identificación
  const existingUser = users.find(user => {
    // Si estamos editando, excluir el usuario actual
    if (editingUserId && user.userId === editingUserId) {
      return false;
    }
    
    return user.identificationNumber === trimmedId;
  });

  if (existingUser) {
    return {
      isValid: false,
      message: 'Ya existe un usuario con este número de identificación'
    };
  }

  return {
    isValid: true,
    message: ''
  };
}

// Validación básica de cédula ecuatoriana
function isValidEcuadorianId(cedula) {
  if (cedula.length !== 10) return false;
  
  // Los dos primeros dígitos deben estar entre 01 y 24
  const provincia = parseInt(cedula.substring(0, 2));
  if (provincia < 1 || provincia > 24) return false;
  
  // El tercer dígito debe ser menor a 6 (para personas naturales)
  const tercerDigito = parseInt(cedula.charAt(2));
  if (tercerDigito >= 6) return false;
  
  // Algoritmo de validación del dígito verificador
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  
  for (let i = 0; i < 9; i++) {
    let resultado = parseInt(cedula.charAt(i)) * coeficientes[i];
    if (resultado >= 10) {
      resultado = resultado - 9;
    }
    suma += resultado;
  }
  
  const residuo = suma % 10;
  const digitoVerificador = residuo === 0 ? 0 : 10 - residuo;
  
  return digitoVerificador === parseInt(cedula.charAt(9));
}