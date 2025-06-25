// src/core/use-cases/loadPaymentMethods.js
import { getPaymentMethodsApi } from '../../data/api/get/getPaymentMethods'
import { PaymentMethodEntity } from '../entities/paymentMethodEntity'

export const loadPaymentMethods = async () => {
  try {
    const response = await getPaymentMethodsApi()
    return response.data.map(method => new PaymentMethodEntity(method))
  } catch (error) {
    console.error('Error al cargar métodos de pago:', error)
    throw error
  }
}