// src/core/entities/categoryEntity.js
export class CategoryEntity {
  constructor({ categoryId, name, description, isActive }) {
    this.categoryId = categoryId
    this.name = name
    this.description = description
    this.isActive = isActive
  }
}