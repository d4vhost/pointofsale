// src/core/entities/paymentMethodEntity.js
export class PaymentMethodEntity {
  constructor({ paymentMethodId, name, description, isActive }) {
    this.paymentMethodId = paymentMethodId
    this.name = name
    this.description = description
    this.isActive = isActive
  }
}