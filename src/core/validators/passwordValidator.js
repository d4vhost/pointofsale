// core/validators/passwordValidator.js

export function isValidPassword(password) {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      message: 'La contraseña es requerida'
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      message: 'La contraseña debe tener al menos 6 caracteres'
    };
  }

  if (password.length > 15) {
    return {
      isValid: false,
      message: 'La contraseña no puede tener más de 15 caracteres'
    };
  }

  // Verificar si es una contraseña segura
  const securityCheck = isSecurePassword(password);
  if (!securityCheck.isSecure) {
    return {
      isValid: false,
      message: securityCheck.message,
      suggestion: 'Utiliza el generador de contraseñas para crear una contraseña segura'
    };
  }

  return {
    isValid: true,
    message: 'Contraseña segura'
  };
}

export function isSecurePassword(password) {
  const checks = {
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    minLength: password.length >= 6
  };

  const failedChecks = [];
  
  if (!checks.hasUpperCase) failedChecks.push('una letra mayúscula');
  if (!checks.hasLowerCase) failedChecks.push('una letra minúscula');
  if (!checks.hasNumbers) failedChecks.push('un número');
  if (!checks.hasSpecialChars) failedChecks.push('un carácter especial (!@#$%^&*()_+-=[]{}etc.)');

  if (failedChecks.length > 0) {
    return {
      isSecure: false,
      message: `La contraseña debe contener al menos: ${failedChecks.join(', ')}`
    };
  }

  return {
    isSecure: true,
    message: 'Contraseña segura'
  };
}

export function generateSecurePassword(length = 12) {
  // Asegurar que la longitud esté entre 6 y 15
  length = Math.max(6, Math.min(15, length));

  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+-=[]{}';

  // Asegurar que tenga al menos uno de cada tipo
  let password = '';
  password += getRandomChar(uppercase);
  password += getRandomChar(lowercase);
  password += getRandomChar(numbers);
  password += getRandomChar(specialChars);

  // Llenar el resto con caracteres aleatorios
  const allChars = lowercase + uppercase + numbers + specialChars;
  for (let i = 4; i < length; i++) {
    password += getRandomChar(allChars);
  }

  // Mezclar la contraseña para que no tenga un patrón predecible
  return shuffleString(password);
}

function getRandomChar(string) {
  return string.charAt(Math.floor(Math.random() * string.length));
}

function shuffleString(string) {
  const array = string.split('');
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join('');
}

export function getPasswordStrength(password) {
  if (!password) return { strength: 'none', score: 0, color: '#e74c3c' };

  let score = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    specialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    longEnough: password.length >= 12
  };

  // Calcular puntuación
  Object.values(checks).forEach(check => {
    if (check) score++;
  });

  // Determinar nivel de seguridad
  if (score <= 2) {
    return { strength: 'Débil', score, color: '#e74c3c' };
  } else if (score <= 4) {
    return { strength: 'Media', score, color: '#f39c12' };
  } else {
    return { strength: 'Fuerte', score, color: '#27ae60' };
  }
}