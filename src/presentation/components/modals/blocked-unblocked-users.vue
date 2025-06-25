<!--presentation/components/modals/blocked-unblocked-users.vue-->
<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <!-- Header del Modal -->
      <div class="modal-header">
        <h2>Usuarios Bloqueados</h2>
        <button @click="closeModal" class="close-button">×</button>
      </div>

      <!-- Mensaje de Error Global -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- Mensaje de Éxito -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <!-- Botones de Acción -->
      <div class="action-buttons">
        <button @click="refreshUsers" class="btn-secondary" :disabled="loading">
          {{ loading ? 'Cargando...' : 'Actualizar Lista' }}
        </button>
        <div class="status-info">
          <span class="info-text blocked">Usuarios bloqueados: {{ blockedUsers.length }}</span>
        </div>
      </div>

      <!-- Lista de Usuarios -->
      <div class="users-list">
        <!-- Filtros -->
        <div class="filters" v-if="blockedUsers.length > 0">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Buscar usuario por nombre o email..."
            class="search-input"
          >
        </div>

        <!-- Estado de Carga -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Cargando usuarios bloqueados...</p>
        </div>

        <!-- Tabla de Usuarios Bloqueados -->
        <div v-else-if="filteredBlockedUsers.length > 0" class="table-container">
          <table class="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Cédula</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredBlockedUsers" :key="user.userId" class="blocked-row">
                <td>
                  <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
                </td>
                <td>
                  <span class="identification-number">{{ user.identificationNumber || 'N/A' }}</span>
                </td>
                <td>
                  <span class="user-email">{{ user.email }}</span>
                </td>
                <td>
                  <span class="user-phone">{{ user.phone || 'N/A' }}</span>
                </td>
                <td>
                  <span :class="['role-badge', getRoleClass(user.role?.roleName)]">
                    {{ user.role?.roleName || 'Sin rol' }}
                  </span>
                </td>
                <td class="actions">
                  <button 
                    @click="unblockUser(user)" 
                    class="btn-unblock"
                    :disabled="processingUser === user.userId"
                  >
                    <span v-if="processingUser === user.userId" class="processing">Desbloqueando...</span>
                    <span v-else>Desbloquear</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mensaje si no hay usuarios bloqueados -->
        <div v-else-if="!loading" class="empty-state">
          <div class="empty-icon">
            <i class="icon-check-circle"></i>
          </div>
          <p>No hay usuarios bloqueados</p>
          <small>Todos los usuarios están activos actualmente</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getUsers } from '../../../data/api/get/getUsers.js';
import { updateUser } from '../../../data/api/put/putUsers.js'; // Cambiar esta importación
import { getUserByIdApi } from '../../../data/api/get/getUserById.js'; // Agregar esta importación

export default {
  name: 'BlockedUnblockedUsersModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      processingUser: null,
      errorMessage: '',
      successMessage: '',
      searchQuery: '',
      allUsers: []
    }
  },
  computed: {
    // Solo usuarios bloqueados (IsActive = false)
    blockedUsers() {
      return this.allUsers.filter(user => !user.isActive);
    },
    
    // Usuarios bloqueados filtrados por búsqueda
    filteredBlockedUsers() {
      if (!this.searchQuery) {
        return this.blockedUsers;
      }

      const query = this.searchQuery.toLowerCase();
      return this.blockedUsers.filter(user => 
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.identificationNumber && user.identificationNumber.includes(query))
      );
    }
  },
  mounted() {
    if (this.isVisible) {
      this.loadUsers();
    }
  },
  watch: {
    isVisible(newVal) {
      if (newVal) {
        this.loadUsers();
        this.clearMessages();
      }
    }
  },
  methods: {
    async loadUsers() {
      this.loading = true;
      this.errorMessage = '';
      
      try {
        const response = await getUsers();
        this.allUsers = response || [];
        console.log('Usuarios cargados:', this.allUsers.length);
        console.log('Usuarios bloqueados:', this.blockedUsers.length);
      } catch (error) {
        this.errorMessage = error.message || 'Error al cargar los usuarios';
        console.error('Error loading users:', error);
        this.allUsers = [];
      } finally {
        this.loading = false;
      }
    },

    async unblockUser(user) {
      if (confirm(`¿Está seguro de desbloquear al usuario ${user.firstName} ${user.lastName}?`)) {
        this.processingUser = user.userId;
        this.errorMessage = '';
        this.successMessage = '';
        
        try {
          // Paso 1: Obtener los datos actuales del usuario
          const currentUserResponse = await getUserByIdApi(user.userId);
          const currentUserData = currentUserResponse.data;
          
          // Paso 2: Actualizar solo el campo isActive a true
          const updatedUserData = {
            ...currentUserData,
            isActive: true,
            updatedAt: new Date().toISOString()
          };
          
          // Paso 3: Hacer el PUT completo con todos los datos
          await updateUser(user.userId, updatedUserData);
          
          // Paso 4: Actualizar el estado localmente
          const userIndex = this.allUsers.findIndex(u => u.userId === user.userId);
          if (userIndex !== -1) {
            this.allUsers[userIndex].isActive = true;
            this.allUsers[userIndex].updatedAt = new Date().toISOString();
          }
          
          this.successMessage = `Usuario ${user.firstName} ${user.lastName} desbloqueado correctamente`;
          
          // Limpiar mensaje de éxito después de 3 segundos
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
          
        } catch (error) {
          this.errorMessage = `Error al desbloquear el usuario: ${error.message}`;
          console.error('Error unblocking user:', error);
        } finally {
          this.processingUser = null;
        }
      }
    },

    closeModal() {
      this.$emit('close');
      this.clearMessages();
      this.searchQuery = '';
    },

    async refreshUsers() {
      await this.loadUsers();
      this.successMessage = 'Lista de usuarios actualizada';
      setTimeout(() => {
        this.successMessage = '';
      }, 2000);
    },

    clearMessages() {
      this.errorMessage = '';
      this.successMessage = '';
    },

    formatDate(dateString) {
      if (!dateString) return 'No especificado';
      try {
        return new Date(dateString).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch {
        return 'Fecha inválida';
      }
    },

    getRoleClass(roleName) {
      if (!roleName) return '';
      return roleName.toLowerCase().replace(/\s+/g, '-');
    }
  }
}
</script>
<style src="../../../assets/styles/blocked-unblocked-users.css"></style>