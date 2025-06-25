// src/core/entities/productEntity.js
export class ProductEntity {
  constructor({ productId, code, name, description, categoryId, purchasePrice, sellingPrice, stock, minimumStock, category }) {
    this.productId = productId
    this.code = code
    this.name = name
    this.description = description
    this.categoryId = categoryId
    this.purchasePrice = purchasePrice
    this.sellingPrice = sellingPrice
    this.stock = stock
    this.minimumStock = minimumStock
    this.category = category
  }
}