// src/core/use-cases/loadProducts.js
import { getProductsApi } from '../../data/api/get/getProducts'
import { ProductEntity } from '../entities/productEntity'

export const loadProducts = async () => {
  try {
    const response = await getProductsApi()
    return response.data.map(product => new ProductEntity(product))
  } catch (error) {
    console.error('Error al cargar productos:', error)
    throw error
  }
}