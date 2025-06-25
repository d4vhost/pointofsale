// src/core/use-cases/loadUserData.js
import { getUserByIdApi } from '../../data/api/get/getUserById'

export const loadUserData = async (userId) => {
  const response = await getUserByIdApi(userId)
  return response.data
}
