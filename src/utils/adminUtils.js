// src/utils/adminUtils.js
import { updateUser } from '../apis/put/putUsers.js'
import { getUserByIdApi } from '../data/api/get/getUserById.js'

/**
 * Desbloquear un usuario cambiando su estado IsActive a true
 * @param {number} userId - ID del usuario a desbloquear
 * @returns {Promise<boolean>} - True si se desbloqueó exitosamente
 */
export const unblockUser = async (userId) => {
  try {
    // Obtener datos actuales del usuario
    const currentUser = await getUserByIdApi(userId)
    const userData = currentUser.data
    
    // Actualizar solo el campo IsActive a true
    const updatedUserData = {
      ...userData,
      isActive: true,
      updatedAt: new Date().toISOString()
    }
    
    await updateUser(userId, updatedUserData)
    console.log(`Usuario ${userId} desbloqueado exitosamente`)
    return true
  } catch (error) {
    console.error('Error al desbloquear usuario:', error)
    return false
  }
}

/**
 * Limpiar intentos fallidos de un usuario específico
 * @param {string} email - Email del usuario
 */
export const clearFailedAttempts = (email) => {
  const key = `failed_attempts_${email}`
  localStorage.removeItem(key)
  console.log(`Intentos fallidos limpiados para: ${email}`)
}

/**
 * Limpiar todos los intentos fallidos almacenados
 */
export const clearAllFailedAttempts = () => {
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith('failed_attempts_')) {
      localStorage.removeItem(key)
    }
  })
  console.log('Todos los intentos fallidos han sido limpiados')
}

/**
 * Obtener información de intentos fallidos de un usuario
 * @param {string} email - Email del usuario
 * @returns {number} - Número de intentos fallidos
 */
export const getFailedAttemptsInfo = (email) => {
  const key = `failed_attempts_${email}`
  const attempts = localStorage.getItem(key)
  return attempts ? parseInt(attempts) : 0
}

/**
 * Verificar si un usuario está cerca del límite de intentos
 * @param {string} email - Email del usuario
 * @returns {object} - Información sobre el estado de intentos
 */
export const checkUserAttemptStatus = (email) => {
  const attempts = getFailedAttemptsInfo(email)
  return {
    attempts,
    isNearLimit: attempts >= 2,
    isBlocked: attempts >= 3,
    remainingAttempts: Math.max(0, 3 - attempts)
  }
}

/**
 * Función para que administradores puedan desbloquear usuarios y limpiar intentos
 * @param {string} email - Email del usuario
 * @param {number} userId - ID del usuario
 * @returns {Promise<boolean>} - True si la operación fue exitosa
 */
export const adminUnblockUser = async (email, userId) => {
  try {
    // Limpiar intentos fallidos
    clearFailedAttempts(email)
    
    // Desbloquear usuario en la base de datos
    const success = await unblockUser(userId)
    
    if (success) {
      console.log(`Usuario ${email} ha sido desbloqueado completamente`)
      return true
    }
    return false
  } catch (error) {
    console.error('Error en adminUnblockUser:', error)
    return false
  }
}

export default {
  unblockUser,
  clearFailedAttempts,
  clearAllFailedAttempts,
  getFailedAttemptsInfo,
  checkUserAttemptStatus,
  adminUnblockUser
}