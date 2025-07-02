// core/validators/useProductValidation.js

import {
  validateProductCode,
  validateProductName,
  validateProductDescription,
  validateStock,
  validatePurchasePrice,
  validateSellingPrice,
  validateMinimumStock,
  validateProductForm,
  CATEGORY_MAPPINGS
} from './productValidators.js';

export function useProductValidation(existingProducts = [], editingProduct = null) {
  // Estados de validación
  const fieldErrors = {};
  const fieldTouched = {};

  // Función para marcar un campo como tocado
  const touchField = (fieldName) => {
    fieldTouched[fieldName] = true;
  };

  // Función para limpiar errores
  const clearErrors = () => {
    Object.keys(fieldErrors).forEach(key => delete fieldErrors[key]);
    Object.keys(fieldTouched).forEach(key => delete fieldTouched[key]);
  };

  // Función para validar un campo específico
  const validateField = (fieldName, value, formData = {}) => {
    let validation = { isValid: true, message: '' };

    switch (fieldName) {
      case 'code':
        validation = validateProductCode(value, existingProducts, editingProduct);
        break;
      case 'name':
        validation = validateProductName(value, existingProducts, editingProduct);
        break;
      case 'description':
        validation = validateProductDescription(value);
        break;
      case 'stock':
        validation = validateStock(value, formData.minimumStock || 1);
        break;
      case 'purchasePrice':
        validation = validatePurchasePrice(value);
        break;
      case 'sellingPrice':
        validation = validateSellingPrice(value, formData.purchasePrice || 0);
        break;
      case 'minimumStock':
        validation = validateMinimumStock(value, formData.stock);
        break;
    }

    if (!validation.isValid) {
      fieldErrors[fieldName] = validation.message;
    } else {
      delete fieldErrors[fieldName];
    }

    return validation;
  };

  // Función para obtener información de categoría basada en el código
  const getCategoryFromCode = (code) => {
    if (!code) return null;
    
    const trimmedCode = code.trim().toUpperCase();
    const prefix = trimmedCode.substring(0, trimmedCode.search(/\d/));
    
    return CATEGORY_MAPPINGS[prefix] || null;
  };

  // Función para generar código único de producto
  const generateUniqueProductCode = (categoryId, categories = []) => {
    if (!categoryId || !categories.length) return '';
    
    const category = categories.find(cat => cat.categoryId === parseInt(categoryId));
    if (!category) return '';
    
    // Obtener el prefijo de la categoría desde CATEGORY_MAPPINGS
    const categoryPrefix = Object.keys(CATEGORY_MAPPINGS).find(
      prefix => CATEGORY_MAPPINGS[prefix].name === category.name
    );
    
    if (!categoryPrefix) return '';
    
    // Buscar el siguiente número disponible
    const existingCodes = existingProducts
      .filter(product => product.code.startsWith(categoryPrefix))
      .map(product => {
        const numericPart = product.code.substring(categoryPrefix.length);
        return parseInt(numericPart) || 0;
      })
      .sort((a, b) => a - b);
    
    let nextNumber = 1;
    for (const num of existingCodes) {
      if (num === nextNumber) {
        nextNumber++;
      } else {
        break;
      }
    }
    
    // Asegurar que no exceda 999
    if (nextNumber > 999) nextNumber = 999;
    
    return `${categoryPrefix}${nextNumber.toString().padStart(3, '0')}`;
  };

  // Función para validar todo el formulario
  const validateForm = (formData) => {
    const validation = validateProductForm(formData, existingProducts, editingProduct);
    Object.keys(fieldErrors).forEach(key => delete fieldErrors[key]);
    Object.assign(fieldErrors, validation.errors);
    return validation;
  };

  // Función para verificar si un campo tiene error
  const hasError = (fieldName) => {
    return fieldTouched[fieldName] && fieldErrors[fieldName];
  };

  // Función para obtener el mensaje de error de un campo
  const getError = (fieldName) => {
    return hasError(fieldName) ? fieldErrors[fieldName] : '';
  };

  // Función para formatear números con restricciones
  const formatNumericInput = (value, max, isInteger = false) => {
    if (!value && value !== 0) return '';
    
    let numValue = Number(value);
    if (isNaN(numValue)) return '';
    
    if (numValue < 0) numValue = 0;
    if (numValue > max) numValue = max;
    
    return isInteger ? Math.floor(numValue) : numValue;
  };

  // Función para filtrar solo letras
  const filterLettersOnly = (value) => {
    if (!value) return '';
    return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
  };

  // Función para filtrar letras y números
  const filterLettersAndNumbers = (value) => {
    if (!value) return '';
    return value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '');
  };

  // Función para filtrar solo números (enteros y decimales)
  const filterNumericOnly = (value, allowDecimals = true) => {
    if (!value) return '';
    
    if (allowDecimals) {
      // Permitir números decimales
      const regex = /^\d*\.?\d*$/;
      return regex.test(value) ? value : value.slice(0, -1);
    } else {
      // Solo enteros
      return value.replace(/[^0-9]/g, '');
    }
  };

  // Función para formatear código de producto
  const formatProductCode = (value) => {
    if (!value) return '';
    
    // Convertir a mayúsculas y remover caracteres no válidos
    let formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Verificar si empieza con un prefijo válido
    const validPrefixes = Object.keys(CATEGORY_MAPPINGS);
    let matchedPrefix = '';
    
    for (const prefix of validPrefixes) {
      if (formatted.startsWith(prefix)) {
        matchedPrefix = prefix;
        break;
      }
    }
    
    if (matchedPrefix) {
      // Extraer la parte numérica
      const numericPart = formatted.substring(matchedPrefix.length);
      
      // Validar que la parte numérica sea válida (001-999)
      if (numericPart.length <= 3) {
        let numValue = parseInt(numericPart) || 0;
        if (numValue > 999) numValue = 999;
        if (numValue < 1 && numericPart.length === 3) numValue = 1;
        
        // Formatear con ceros a la izquierda si es necesario
        if (numericPart.length > 0) {
          const paddedNum = numValue.toString().padStart(3, '0');
          formatted = matchedPrefix + paddedNum;
        } else {
          formatted = matchedPrefix;
        }
      }
    }
    
    return formatted;
  };

  // Función para verificar si el formulario es válido
  const isFormValid = () => {
    return Object.keys(fieldErrors).length === 0;
  };

  // Función para verificar si un código ya existe
  const isCodeExists = (code) => {
    if (!code || !existingProducts) return false;
    
    return existingProducts.some(product => {
      // Si estamos editando, excluir el producto actual
      if (editingProduct && product.productId === editingProduct.productId) {
        return false;
      }
      return product.code.toUpperCase() === code.toUpperCase();
    });
  };

  // Función para verificar si un nombre ya existe
  const isNameExists = (name) => {
    if (!name || !existingProducts) return false;
    
    return existingProducts.some(product => {
      // Si estamos editando, excluir el producto actual
      if (editingProduct && product.productId === editingProduct.productId) {
        return false;
      }
      return product.name.toLowerCase() === name.toLowerCase();
    });
  };

  return {
    // Estados
    fieldErrors,
    fieldTouched,
    
    // Funciones de validación
    validateField,
    validateForm,
    touchField,
    clearErrors,
    hasError,
    getError,
    
    // Funciones de utilidad
    getCategoryFromCode,
    generateUniqueProductCode,
    formatNumericInput,
    filterLettersOnly,
    filterLettersAndNumbers,
    filterNumericOnly,
    formatProductCode,
    isFormValid,
    isCodeExists,
    isNameExists
  };
}