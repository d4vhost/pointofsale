// src/core/entities/userEntity.js
export class UserEntity {
  constructor({ userId, firstName, lastName, email, phone, address, role }) {
    this.userId = userId
    this.firstName = firstName
    this.lastName = lastName
    this.email = email
    this.phone = phone
    this.address = address
    this.role = role
  }
}