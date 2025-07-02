// core/validators/productValidators.js - VALIDACIONES CORREGIDAS

// Validación de nombre de producto (verificar duplicados)
export function validateProductName(name, existingProducts = [], editingProduct = null) {
  if (!name || !name.trim()) {
    return { isValid: false, message: 'El nombre del producto es requerido' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return { isValid: false, message: 'El nombre debe tener al menos 2 caracteres' };
  }

  if (trimmedName.length > 20) {
    return { isValid: false, message: 'El nombre no puede exceder 20 caracteres' };
  }

  // Verificar si solo contiene letras y espacios
  const letterPattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  if (!letterPattern.test(trimmedName)) {
    return { isValid: false, message: 'El nombre solo puede contener letras' };
  }

  // Verificar duplicados (excluir el producto actual si estamos editando)
  const isDuplicate = existingProducts.some(product => {
    if (editingProduct && product.productId === editingProduct.productId) {
      return false; // Excluir el producto actual
    }
    return product.name.toLowerCase().trim() === trimmedName.toLowerCase();
  });

  if (isDuplicate) {
    return { isValid: false, message: 'Ya existe un producto con este nombre' };
  }

  return { isValid: true, message: '' };
}

// Validación de código de producto (verificar duplicados)
export function validateProductCode(code, existingProducts = [], editingProduct = null) {
  if (!code || !code.trim()) {
    return { isValid: false, message: 'El código del producto es requerido' };
  }

  const trimmedCode = code.trim().toUpperCase();

  // Verificar formato del código (debe tener prefijo de categoría + 3 dígitos)
  const codePattern = /^[A-Z]{2,4}\d{3}$/;
  if (!codePattern.test(trimmedCode)) {
    return { isValid: false, message: 'Formato de código inválido' };
  }

  // Verificar duplicados (excluir el producto actual si estamos editando)
  const isDuplicate = existingProducts.some(product => {
    if (editingProduct && product.productId === editingProduct.productId) {
      return false; // Excluir el producto actual
    }
    return product.code.toUpperCase() === trimmedCode;
  });

  if (isDuplicate) {
    return { isValid: false, message: 'Ya existe un producto con este código' };
  }

  return { isValid: true, message: '' };
}

// Validación de precio de compra
export function validatePurchasePrice(price) {
  if (!price && price !== 0) {
    return { isValid: false, message: 'El precio de compra es requerido' };
  }

  const numPrice = parseFloat(price);

  if (isNaN(numPrice)) {
    return { isValid: false, message: 'El precio de compra debe ser un número válido' };
  }

  if (numPrice <= 0) {
    return { isValid: false, message: 'El precio de compra debe ser mayor a 0' };
  }

  if (numPrice > 999000) {
    return { isValid: false, message: 'El precio de compra no puede exceder $999,000' };
  }

  return { isValid: true, message: '' };
}

// Validación de precio de venta (debe ser mayor al precio de compra)
export function validateSellingPrice(sellingPrice, purchasePrice = 0) {
  if (!sellingPrice && sellingPrice !== 0) {
    return { isValid: false, message: 'El precio de venta es requerido' };
  }

  const numSellingPrice = parseFloat(sellingPrice);
  const numPurchasePrice = parseFloat(purchasePrice);

  if (isNaN(numSellingPrice)) {
    return { isValid: false, message: 'El precio de venta debe ser un número válido' };
  }

  if (numSellingPrice <= 0) {
    return { isValid: false, message: 'El precio de venta debe ser mayor a 0' };
  }

  if (numSellingPrice > 999000) {
    return { isValid: false, message: 'El precio de venta no puede exceder $999,000' };
  }

  // VALIDACIÓN CRÍTICA: El precio de venta debe ser mayor al precio de compra
  if (numPurchasePrice > 0 && numSellingPrice <= numPurchasePrice) {
    return { 
      isValid: false, 
      message: `El precio de venta ($${numSellingPrice.toFixed(2)}) debe ser mayor al precio de compra ($${numPurchasePrice.toFixed(2)})` 
    };
  }

  return { isValid: true, message: '' };
}

// Validación de stock (debe ser mayor o igual al stock mínimo)
export function validateStock(stock, minimumStock = 1) {
  if (!stock && stock !== 0) {
    return { isValid: false, message: 'El stock es requerido' };
  }

  const numStock = parseInt(stock);
  const numMinimumStock = parseInt(minimumStock);

  if (isNaN(numStock)) {
    return { isValid: false, message: 'El stock debe ser un número válido' };
  }

  if (numStock < 0) {
    return { isValid: false, message: 'El stock no puede ser negativo' };
  }

  if (numStock > 999) {
    return { isValid: false, message: 'El stock no puede exceder 999 unidades' };
  }

  // VALIDACIÓN CRÍTICA: El stock debe ser mayor o igual al stock mínimo
  if (numMinimumStock > 0 && numStock < numMinimumStock) {
    return { 
      isValid: false, 
      message: `El stock (${numStock}) debe ser mayor o igual al stock mínimo (${numMinimumStock})` 
    };
  }

  return { isValid: true, message: '' };
}

// Validación de stock mínimo
export function validateMinimumStock(minimumStock, currentStock = null) {
  if (!minimumStock && minimumStock !== 0) {
    return { isValid: false, message: 'El stock mínimo es requerido' };
  }

  const numMinimumStock = parseInt(minimumStock);

  if (isNaN(numMinimumStock)) {
    return { isValid: false, message: 'El stock mínimo debe ser un número válido' };
  }

  if (numMinimumStock < 1) {
    return { isValid: false, message: 'El stock mínimo debe ser al menos 1' };
  }

  if (numMinimumStock > 999) {
    return { isValid: false, message: 'El stock mínimo no puede exceder 999 unidades' };
  }

  // VALIDACIÓN CRÍTICA: El stock mínimo no puede ser mayor al stock actual
  if (currentStock !== null && currentStock !== '') {
    const numCurrentStock = parseInt(currentStock);
    if (!isNaN(numCurrentStock) && numMinimumStock > numCurrentStock) {
      return { 
        isValid: false, 
        message: `El stock mínimo (${numMinimumStock}) no puede ser mayor al stock actual (${numCurrentStock})` 
      };
    }
  }

  return { isValid: true, message: '' };
}

// Validación de descripción
export function validateProductDescription(description) {
  if (!description || !description.trim()) {
    return { isValid: false, message: 'La descripción del producto es requerida' };
  }

  const trimmedDescription = description.trim();

  if (trimmedDescription.length < 5) {
    return { isValid: false, message: 'La descripción debe tener al menos 5 caracteres' };
  }

  if (trimmedDescription.length > 50) {
    return { isValid: false, message: 'La descripción no puede exceder 50 caracteres' };
  }

  return { isValid: true, message: '' };
}

// Validación completa del formulario
export function validateProductForm(formData, existingProducts = [], editingProduct = null) {
  const errors = {};
  let isValid = true;

  // Validar código
  const codeValidation = validateProductCode(formData.code, existingProducts, editingProduct);
  if (!codeValidation.isValid) {
    errors.code = codeValidation.message;
    isValid = false;
  }

  // Validar nombre
  const nameValidation = validateProductName(formData.name, existingProducts, editingProduct);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message;
    isValid = false;
  }

  // Validar descripción
  const descriptionValidation = validateProductDescription(formData.description);
  if (!descriptionValidation.isValid) {
    errors.description = descriptionValidation.message;
    isValid = false;
  }

  // Validar categoría
  if (!formData.categoryId) {
    errors.categoryId = 'La categoría es requerida';
    isValid = false;
  }

  // Validar precio de compra
  const purchasePriceValidation = validatePurchasePrice(formData.purchasePrice);
  if (!purchasePriceValidation.isValid) {
    errors.purchasePrice = purchasePriceValidation.message;
    isValid = false;
  }

  // Validar precio de venta (con referencia al precio de compra)
  const sellingPriceValidation = validateSellingPrice(formData.sellingPrice, formData.purchasePrice);
  if (!sellingPriceValidation.isValid) {
    errors.sellingPrice = sellingPriceValidation.message;
    isValid = false;
  }

  // Validar stock mínimo
  const minimumStockValidation = validateMinimumStock(formData.minimumStock, formData.stock);
  if (!minimumStockValidation.isValid) {
    errors.minimumStock = minimumStockValidation.message;
    isValid = false;
  }

  // Validar stock (con referencia al stock mínimo)
  const stockValidation = validateStock(formData.stock, formData.minimumStock);
  if (!stockValidation.isValid) {
    errors.stock = stockValidation.message;
    isValid = false;
  }

  return { isValid, errors };
}

// Mapeo de categorías (esto debe coincidir con tu base de datos)
export const CATEGORY_MAPPINGS = {
  'ELEC': { name: 'Electrónicos', description: 'Productos electrónicos' },
  'ROPA': { name: 'Ropa', description: 'Productos de vestir' },
  'HOGAR': { name: 'Hogar', description: 'Productos para el hogar' },
  'DEP': { name: 'Deportes', description: 'Productos deportivos' },
  'LIB': { name: 'Libros', description: 'Libros y material educativo' },
  'SALUD': { name: 'Salud', description: 'Productos Para la salud' }
};