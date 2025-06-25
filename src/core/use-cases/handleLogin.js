// core/use-cases/handleLogin.js
import { ref } from 'vue'
import { loginApi } from '../../data/api/post/authApi.js'
import { getUserByIdApi } from '../../data/api/get/getUserById.js'
import { getUsers } from '../../data/api/get/getUsers.js'
import { updateUser } from '../../data/api/put/putUsers.js'

export const loginLogic = {
  setup(props, { emit }) {
    const email = ref('')
    const password = ref('')
    const errorMessage = ref('')
    const isLoading = ref(false)
    const isBlocked = ref(false)

    // Función para obtener usuario por email
    const getUserByEmail = async (email) => {
      try {
        const users = await getUsers()
        return users.find(user => user.email === email)
      } catch (error) {
        console.error('Error al buscar usuario:', error)
        return null
      }
    }

    // Función para bloquear usuario
    const blockUser = async (userId) => {
      try {
        // Primero obtenemos los datos actuales del usuario
        const currentUser = await getUserByIdApi(userId)
        const userData = currentUser.data
        
        // Actualizamos solo el campo IsActive a false
        const updatedUserData = {
          ...userData,
          isActive: false,
          updatedAt: new Date().toISOString()
        }
        
        await updateUser(userId, updatedUserData)
        console.log(`Usuario ${userId} bloqueado exitosamente`)
      } catch (error) {
        console.error('Error al bloquear usuario:', error)
      }
    }

    // Función para obtener conteo de intentos fallidos
    const getFailedAttempts = (email) => {
      const key = `failed_attempts_${email}`
      const attempts = localStorage.getItem(key)
      return attempts ? parseInt(attempts) : 0
    }

    // Función para incrementar intentos fallidos
    const incrementFailedAttempts = (email) => {
      const key = `failed_attempts_${email}`
      const currentAttempts = getFailedAttempts(email)
      const newAttempts = currentAttempts + 1
      localStorage.setItem(key, newAttempts.toString())
      return newAttempts
    }

    // Función para resetear intentos fallidos
    const resetFailedAttempts = (email) => {
      const key = `failed_attempts_${email}`
      localStorage.removeItem(key)
    }

    const handleLogin = async () => {
      errorMessage.value = ''
      isLoading.value = true
      isBlocked.value = false
     
      try {
        // Verificar si el usuario existe y está activo antes de intentar login
        const user = await getUserByEmail(email.value)
        
        if (user && !user.isActive) {
          errorMessage.value = 'Tu cuenta está bloqueada. Contacta al administrador.'
          isBlocked.value = true
          isLoading.value = false
          return
        }

        // Verificar intentos fallidos previos
        const currentFailedAttempts = getFailedAttempts(email.value)
        if (currentFailedAttempts >= 3) {
          errorMessage.value = 'Tu cuenta está bloqueada por múltiples intentos fallidos. Contacta al administrador.'
          isBlocked.value = true
          isLoading.value = false
          return
        }

        // Paso 1: Intentar autenticar usuario
        const loginResponse = await loginApi({
          Email: email.value,
          Password: password.value
        })
        const loginData = loginResponse.data
       
        // Si llegamos aquí, el login fue exitoso
        // Resetear intentos fallidos
        resetFailedAttempts(email.value)
       
        // Paso 2: Obtener información completa del usuario
        const userResponse = await getUserByIdApi(loginData.userId)
        const userData = userResponse.data
        
        // Verificar nuevamente si el usuario está activo
        if (!userData.isActive) {
          errorMessage.value = 'Tu cuenta está bloqueada. Contacta al administrador.'
          isBlocked.value = true
          isLoading.value = false
          return
        }

        // Paso 3: Almacenar toda la información en localStorage
        localStorage.setItem('token', loginData.token)
        localStorage.setItem('userId', loginData.userId)
        localStorage.setItem('firstName', userData.firstName)
        localStorage.setItem('lastName', userData.lastName)
        localStorage.setItem('email', userData.email)
        localStorage.setItem('phone', userData.phone || '')
        localStorage.setItem('address', userData.address || '')
        localStorage.setItem('role', loginData.role)
        
        console.log('LOGIN EXITOSO - TOKEN JWT:', loginData.token)
        emit('login-success', loginData.role)
       
      } catch (error) {
        console.error('Error completo en login:', error)
       
        if (error.response?.status === 401) {
          // Incrementar contador de intentos fallidos
          const failedAttempts = incrementFailedAttempts(email.value)
          console.log(`Intento fallido #${failedAttempts} para ${email.value}`)
          
          if (failedAttempts >= 3) {
            // Bloquear usuario después de 3 intentos
            const user = await getUserByEmail(email.value)
            if (user) {
              await blockUser(user.userId)
              errorMessage.value = 'Has superado el número máximo de intentos. Tu cuenta ha sido bloqueada.'
              isBlocked.value = true
            } else {
              errorMessage.value = 'Has superado el número máximo de intentos permitidos.'
            }
          } else {
            const remainingAttempts = 3 - failedAttempts
            errorMessage.value = `Correo o contraseña incorrectos. Te quedan ${remainingAttempts} intentos.`
          }
        } else if (error.response?.data?.message) {
          errorMessage.value = error.response.data.message
        } else {
          errorMessage.value = 'Error al intentar iniciar sesión.'
        }
      } finally {
        isLoading.value = false
      }
    }

    return {
      email,
      password,
      errorMessage,
      isLoading,
      isBlocked,
      handleLogin
    }
  }
}