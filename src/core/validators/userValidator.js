// src/core/validators/userValidator.js
export const validateInvoiceForm = (form) => {
  const errors = {}
  if (!form.customerId) errors.customerId = 'Debe ingresar el cliente'
  if (!form.products || form.products.length === 0) errors.products = 'Debe agregar productos'
  return errors
}