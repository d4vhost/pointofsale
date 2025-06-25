// core/validators/productValidators.js

/**
 * Validadores para productos
 */

// Mapeo de códigos de categoría a IDs de categoría
export const CATEGORY_MAPPINGS = {
  'ELEC': { name: 'Electrónicos', categoryId: 1 },
  'ROPA': { name: 'Ropa', categoryId: 2 },
  'HOGAR': { name: 'Hogar', categoryId: 3 },
  'DEP': { name: 'Deportes', categoryId: 4 },
  'LIB': { name: 'Libros', categoryId: 5 },
  'SALUD': { name: 'Salud', categoryId: 6 }
};

// Expresiones regulares para validaciones
const PATTERNS = {
  productCode: /^(ELEC|ROPA|HOGAR|DEP|LIB|SALUD)(0[0-9][1-9]|[1-9][0-9]{2})$/,
  productName: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  productDescription: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/
};

/**
 * Valida el código del producto
 * @param {string} code - Código a validar
 * @param {Array} existingProducts - Lista de productos existentes para verificar duplicados
 * @returns {Object} - Resultado de la validación
 */
export function validateProductCode(code, existingProducts = []) {
  const validation = {
    isValid: true,
    message: '',
    categoryInfo: null
  };

  // Verificar que el código no esté vacío
  if (!code || !code.trim()) {
    validation.isValid = false;
    validation.message = 'El código es requerido';
    return validation;
  }

  const trimmedCode = code.trim().toUpperCase();

  // Verificar formato del código
  if (!PATTERNS.productCode.test(trimmedCode)) {
    validation.isValid = false;
    validation.message = 'Formato de código inválido. Use: ELEC001-999, ROPA001-999, HOGAR001-999, DEP001-999, LIB001-999, SALUD001-999';
    return validation;
  }

  // Extraer prefijo para determinar categoría
  const prefix = trimmedCode.substring(0, trimmedCode.search(/\d/));
  if (CATEGORY_MAPPINGS[prefix]) {
    validation.categoryInfo = CATEGORY_MAPPINGS[prefix];
  }

  // Verificar que el código no esté duplicado
  const isDuplicate = existingProducts.some(product => 
    product.code && product.code.toUpperCase() === trimmedCode
  );

  if (isDuplicate) {
    validation.isValid = false;
    validation.message = `El código ${trimmedCode} ya está registrado`;
    return validation;
  }

  return validation;
}

/**
 * Valida el nombre del producto
 * @param {string} name - Nombre a validar
 * @returns {Object} - Resultado de la validación
 */
export function validateProductName(name) {
  const validation = {
    isValid: true,
    message: ''
  };

  if (!name || !name.trim()) {
    validation.isValid = false;
    validation.message = 'El nombre es requerido';
    return validation;
  }

  const trimmedName = name.trim();

  if (trimmedName.length > 20) {
    validation.isValid = false;
    validation.message = 'El nombre no puede tener más de 20 caracteres';
    return validation;
  }

  if (!PATTERNS.productName.test(trimmedName)) {
    validation.isValid = false;
    validation.message = 'El nombre solo puede contener letras y espacios';
    return validation;
  }

  return validation;
}

/**
 * Valida la descripción del producto
 * @param {string} description - Descripción a validar
 * @returns {Object} - Resultado de la validación
 */
export function validateProductDescription(description) {
  const validation = {
    isValid: true,
    message: ''
  };

  if (!description || !description.trim()) {
    validation.isValid = false;
    validation.message = 'La descripción es requerida';
    return validation;
  }

  const trimmedDescription = description.trim();

  if (trimmedDescription.length > 30) {
    validation.isValid = false;
    validation.message = 'La descripción no puede tener más de 30 caracteres';
    return validation;
  }

  if (!PATTERNS.productDescription.test(trimmedDescription)) {
    validation.isValid = false;
    validation.message = 'La descripción solo puede contener letras, números y espacios';
    return validation;
  }

  return validation;
}

/**
 * Valida el stock del producto
 * @param {number} stock - Stock a validar
 * @returns {Object} - Resultado de la validación
 */
export function validateStock(stock) {
  const validation = {
    isValid: true,
    message: ''
  };

  if (stock === null || stock === undefined || stock === '') {
    validation.isValid = false;
    validation.message = 'El stock es requerido';
    return validation;
  }

  const numStock = Number(stock);

  if (isNaN(numStock) || !Number.isInteger(numStock)) {
    validation.isValid = false;
    validation.message = 'El stock debe ser un número entero';
    return validation;
  }

  if (numStock < 0) {
    validation.isValid = false;
    validation.message = 'El stock no puede ser negativo';
    return validation;
  }

  if (numStock > 999) {
    validation.isValid = false;
    validation.message = 'El stock no puede ser mayor a 999';
    return validation;
  }

  return validation;
}

/**
 * Valida el precio de compra
 * @param {number} price - Precio a validar
 * @returns {Object} - Resultado de la validación
 */
export function validatePurchasePrice(price) {
  const validation = {
    isValid: true,
    message: ''
  };

  if (price === null || price === undefined || price === '') {
    validation.isValid = false;
    validation.message = 'El precio de compra es requerido';
    return validation;
  }

  const numPrice = Number(price);

  if (isNaN(numPrice)) {
    validation.isValid = false;
    validation.message = 'El precio de compra debe ser un número';
    return validation;
  }

  if (numPrice <= 0) {
    validation.isValid = false;
    validation.message = 'El precio de compra debe ser mayor a 0';
    return validation;
  }

  if (numPrice > 999000) {
    validation.isValid = false;
    validation.message = 'El precio de compra no puede ser mayor a $999,000';
    return validation;
  }

  return validation;
}

/**
 * Valida el precio de venta
 * @param {number} price - Precio a validar
 * @returns {Object} - Resultado de la validación
 */
export function validateSellingPrice(price) {
  const validation = {
    isValid: true,
    message: ''
  };

  if (price === null || price === undefined || price === '') {
    validation.isValid = false;
    validation.message = 'El precio de venta es requerido';
    return validation;
  }

  const numPrice = Number(price);

  if (isNaN(numPrice)) {
    validation.isValid = false;
    validation.message = 'El precio de venta debe ser un número';
    return validation;
  }

  if (numPrice <= 0) {
    validation.isValid = false;
    validation.message = 'El precio de venta debe ser mayor a 0';
    return validation;
  }

  if (numPrice > 999000) {
    validation.isValid = false;
    validation.message = 'El precio de venta no puede ser mayor a $999,000';
    return validation;
  }

  return validation;
}

/**
 * Valida el stock mínimo
 * @param {number} minimumStock - Stock mínimo a validar
 * @returns {Object} - Resultado de la validación
 */
export function validateMinimumStock(minimumStock) {
  const validation = {
    isValid: true,
    message: ''
  };

  if (minimumStock === null || minimumStock === undefined || minimumStock === '') {
    validation.isValid = false;
    validation.message = 'El stock mínimo es requerido';
    return validation;
  }

  const numMinStock = Number(minimumStock);

  if (isNaN(numMinStock) || !Number.isInteger(numMinStock)) {
    validation.isValid = false;
    validation.message = 'El stock mínimo debe ser un número entero';
    return validation;
  }

  if (numMinStock < 1) {
    validation.isValid = false;
    validation.message = 'El stock mínimo debe ser al menos 1';
    return validation;
  }

  if (numMinStock > 999) {
    validation.isValid = false;
    validation.message = 'El stock mínimo no puede ser mayor a 999';
    return validation;
  }

  return validation;
}

/**
 * Valida que la categoría corresponda al código
 * @param {string} code - Código del producto
 * @param {number} categoryId - ID de la categoría seleccionada
 * @returns {Object} - Resultado de la validación
 */
export function validateCategoryMatch(code, categoryId) {
  const validation = {
    isValid: true,
    message: ''
  };

  if (!code || !categoryId) {
    return validation;
  }

  const prefix = code.substring(0, code.search(/\d/));
  const expectedCategory = CATEGORY_MAPPINGS[prefix];

  if (expectedCategory && expectedCategory.categoryId !== categoryId) {
    validation.isValid = false;
    validation.message = `La categoría debe ser ${expectedCategory.name} para el código ${prefix}`;
    return validation;
  }

  return validation;
}

/**
 * Valida todo el formulario de producto
 * @param {Object} productForm - Datos del formulario
 * @param {Array} existingProducts - Lista de productos existentes
 * @returns {Object} - Resultado de la validación completa
 */
export function validateProductForm(productForm, existingProducts = []) {
  const validations = {
    isValid: true,
    errors: {},
    categoryInfo: null
  };

  // Validar código
  const codeValidation = validateProductCode(productForm.code, existingProducts);
  if (!codeValidation.isValid) {
    validations.isValid = false;
    validations.errors.code = codeValidation.message;
  } else {
    validations.categoryInfo = codeValidation.categoryInfo;
  }

  // Validar nombre
  const nameValidation = validateProductName(productForm.name);
  if (!nameValidation.isValid) {
    validations.isValid = false;
    validations.errors.name = nameValidation.message;
  }

  // Validar descripción
  const descriptionValidation = validateProductDescription(productForm.description);
  if (!descriptionValidation.isValid) {
    validations.isValid = false;
    validations.errors.description = descriptionValidation.message;
  }

  // Validar stock
  const stockValidation = validateStock(productForm.stock);
  if (!stockValidation.isValid) {
    validations.isValid = false;
    validations.errors.stock = stockValidation.message;
  }

  // Validar precio de compra
  const purchasePriceValidation = validatePurchasePrice(productForm.purchasePrice);
  if (!purchasePriceValidation.isValid) {
    validations.isValid = false;
    validations.errors.purchasePrice = purchasePriceValidation.message;
  }

  // Validar precio de venta
  const sellingPriceValidation = validateSellingPrice(productForm.sellingPrice);
  if (!sellingPriceValidation.isValid) {
    validations.isValid = false;
    validations.errors.sellingPrice = sellingPriceValidation.message;
  }

  // Validar stock mínimo
  const minimumStockValidation = validateMinimumStock(productForm.minimumStock);
  if (!minimumStockValidation.isValid) {
    validations.isValid = false;
    validations.errors.minimumStock = minimumStockValidation.message;
  }

  // Validar concordancia de categoría
  const categoryMatchValidation = validateCategoryMatch(productForm.code, productForm.categoryId);
  if (!categoryMatchValidation.isValid) {
    validations.isValid = false;
    validations.errors.category = categoryMatchValidation.message;
  }

  return validations;
}