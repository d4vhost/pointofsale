
// src/core/use-cases/loadCategories.js
import { getCategoriesApi } from '../../data/api/get/getCategories'
import { CategoryEntity } from '../entities/categoryEntity'

export const loadCategories = async () => {
  try {
    const response = await getCategoriesApi()
    return response.data.map(category => new CategoryEntity(category))
  } catch (error) {
    console.error('Error al cargar categorías:', error)
    throw error
  }
}