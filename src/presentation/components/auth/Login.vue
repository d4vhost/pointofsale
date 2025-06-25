<template>
  <div class="login-page">
    <!-- HEADER -->
    <header class="app-header">
      <div class="header-container">
        <div class="logo-container">
          <div class="logo-placeholder"></div>
          <h1 class="company-name">FactuSys</h1>
        </div>
        <div class="header-actions">
          <span class="header-info">Sistema de Facturación</span>
        </div>
      </div>
    </header>
    
    <!-- CONTENIDO CENTRAL -->
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2>Bienvenido</h2>
          <p>Por favor, inicia sesión para continuar</p>
        </div>
        
        <form @submit.prevent="handleLogin">
          <!-- Email -->
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <div class="input-with-icon">
              <i class="user-icon"></i>
              <input
                v-model="email"
                @input="clearBlockedState"
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
          </div>
          
          <!-- Password -->
          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="input-with-icon">
              <i class="password-icon"></i>
              <input
                v-model="password"
                @input="clearBlockedState"
                id="password"
                type="password"
                placeholder="********"
                required
              />
            </div>
          </div>
          
          <!-- Recordarme y recuperar -->
          <div class="form-options">
            <div class="remember-me">
              <input type="checkbox" id="rememberMe" v-model="rememberMe" />
              <label for="rememberMe">Recordarme</label>
            </div>
          </div>
          
          <!-- Error Message -->
          <div v-if="errorMessage" :class="['error-message', { 'blocked-message': isBlocked }]">
            <i class="warning-icon" v-if="isBlocked"></i>
            {{ errorMessage }}
          </div>
          
          <!-- Botón de login -->
          <button 
            type="submit" 
            class="login-button" 
            :disabled="isLoading || isBlocked"
            :class="{ 'blocked': isBlocked }"
          >
            <span v-if="isBlocked">
              <i class="lock-icon"></i>
              Cuenta Bloqueada
            </span>
            <span v-else>
              {{ isLoading ? 'Cargando...' : 'Iniciar sesión' }}
              <span class="arrow-icon" v-if="!isLoading"></span>
            </span>
          </button>
          
          <!-- Mensaje de ayuda para cuenta bloqueada -->
          <div v-if="isBlocked" class="help-message">
            <p>Esta cuenta se encuentra bloqueada. Puedes intentar con otra cuenta o contactar al administrador del sistema.</p>
          </div>
        </form>
      </div>
    </div>
    
    <!-- FOOTER -->
    <footer class="app-footer">
      <div class="copyright">
        © 2025 FactuSys. Todos los derechos reservados.
      </div>
    </footer>
  </div>
</template>

<script>
import { ref } from 'vue'
import { loginLogic } from '../../../core/use-cases/handleLogin'

export default {
  name: 'Login',
  setup(props, context) {
    const rememberMe = ref(false)
    const loginSetup = loginLogic.setup(props, context)
    
    // Función para limpiar el estado de bloqueo cuando el usuario escribe
    const clearBlockedState = () => {
      if (loginSetup.isBlocked && loginSetup.isBlocked.value) {
        loginSetup.isBlocked.value = false
        loginSetup.errorMessage.value = ''
      }
    }
    
    return {
      ...loginSetup,
      rememberMe,
      clearBlockedState
    }
  }
}
</script>

<style scoped>
/* Estilos adicionales para el sistema de bloqueo */
.error-message {
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  font-size: 14px;
}

.error-message.blocked-message {
  background-color: #fef3c7;
  border-color: #f59e0b;
  color: #92400e;
  font-weight: 600;
}

.login-button.blocked {
  background-color: #6b7280;
  cursor: not-allowed;
  opacity: 0.6;
}

.login-button.blocked:hover {
  background-color: #6b7280;
}

.help-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #f3f4f6;
  border-radius: 4px;
  text-align: center;
}

.help-message p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
}

.warning-icon::before {
  content: "⚠️";
  margin-right: 5px;
}

.lock-icon::before {
  content: "🔒";
  margin-right: 5px;
}

/* Estilos removidos para campos deshabilitados ya que ahora siempre están habilitados */
</style>