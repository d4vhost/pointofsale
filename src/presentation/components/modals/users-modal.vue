<!--presentation/components/modals/users-modal.vue-->
<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <!-- Header del Modal -->
      <div class="modal-header">
        <h2>{{ showForm ? (editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario') : 'Gestión de Usuarios' }}</h2>
        <button @click="closeModal" class="close-button">×</button>
      </div>

      <!-- Body del Modal (reemplaza modal-content) -->
      <div class="modal-body">
        
        <!-- Mensaje de Error Global -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- Botones de Acción -->
        <div class="action-buttons">
          <button v-if="!showForm" @click="showCreateForm" class="btn-primary">
            Crear Usuario
          </button>
          <button v-if="!showForm" @click="refreshUsers" class="btn-secondary" :disabled="loading">
            {{ loading ? 'Cargando...' : 'Actualizar' }}
          </button>
        </div>

        <!-- Formulario de Crear/Editar Usuario -->
        <div v-if="showForm" class="user-form">
          <form @submit.prevent="saveUser">
            <div class="form-row">
              <div class="form-group">
                <label>Nombre:</label>
                <input 
                  v-model="userForm.firstName" 
                  type="text" 
                  required 
                  placeholder="Nombre del usuario"
                  maxlength="25"
                  @input="validateField('firstName')"
                  @keypress="onlyLetters"
                  :class="{ 'error': fieldErrors.firstName }"
                >
                <span v-if="fieldErrors.firstName" class="field-error">{{ fieldErrors.firstName }}</span>
              </div>
              <div class="form-group">
                <label>Apellido:</label>
                <input 
                  v-model="userForm.lastName" 
                  type="text" 
                  required 
                  placeholder="Apellido del usuario"
                  maxlength="25"
                  @input="validateField('lastName')"
                  @keypress="onlyLetters"
                  :class="{ 'error': fieldErrors.lastName }"
                >
                <span v-if="fieldErrors.lastName" class="field-error">{{ fieldErrors.lastName }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Número de Identificación:</label>
                <input 
                  v-model="userForm.identificationNumber" 
                  type="text" 
                  required 
                  placeholder="123456789"
                  maxlength="10"
                  @input="validateField('identificationNumber')"
                  @keypress="onlyNumbers"
                  :class="{ 'error': fieldErrors.identificationNumber }"
                >
                <span v-if="fieldErrors.identificationNumber" class="field-error">{{ fieldErrors.identificationNumber }}</span>
              </div>
              <div class="form-group">
                <label>Teléfono:</label>
                <input 
                  v-model="userForm.phone" 
                  type="tel" 
                  required 
                  placeholder="0987654321"
                  maxlength="10"
                  @input="validateField('phone')"
                  @keypress="onlyNumbers"
                  :class="{ 'error': fieldErrors.phone }"
                >
                <span v-if="fieldErrors.phone" class="field-error">{{ fieldErrors.phone }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Email:</label>
                <input 
                  v-model="userForm.email" 
                  type="email" 
                  required 
                  placeholder="correo@ejemplo.com"
                  @input="validateField('email')"
                  :class="{ 'error': fieldErrors.email }"
                >
                <span v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</span>
              </div>
              <div class="form-group">
                <label>Rol:</label>
                <select v-model="userForm.roleId" required>
                  <option value="">Seleccionar rol</option>
                  <option v-for="role in roles" :key="role.roleId" :value="role.roleId">
                    {{ role.roleName }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Dirección:</label>
                <input 
                  v-model="userForm.address" 
                  type="text" 
                  required 
                  placeholder="Calle, Ciudad"
                  maxlength="25"
                  @input="validateField('address')"
                  :class="{ 'error': fieldErrors.address }"
                >
                <span v-if="fieldErrors.address" class="field-error">{{ fieldErrors.address }}</span>
              </div>
              <div class="form-group">
                <label>Contraseña:</label>
                <input 
                  v-model="userForm.password" 
                  type="password" 
                  required 
                  placeholder="Contraseña segura"
                  maxlength="25"
                  @input="validateField('password')"
                  :class="{ 'error': fieldErrors.password }"
                >
                <span v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</span>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" @click="backToList" class="btn-cancel">
                Cancelar
              </button>
              <button type="submit" class="btn-save" :disabled="formLoading || !isFormValid">
                {{ formLoading ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear') }} Usuario
              </button>
            </div>
          </form>
        </div>

        <!-- Lista de Usuarios -->
        <div v-if="!showForm" class="users-list">
          <!-- Filtros -->
          <div class="filters">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Buscar usuario..."
              class="search-input"
            >
            <select v-model="roleFilter" class="role-filter">
              <option value="">Todos los roles</option>
              <option v-for="role in roles" :key="role.roleId" :value="role.roleName">
                {{ role.roleName }}
              </option>
            </select>
          </div>

          <!-- Estado de Carga -->
          <div v-if="loading" class="loading-state">
            <p>Cargando usuarios...</p>
          </div>

          <!-- Tabla de Usuarios -->
          <div v-else-if="users.length > 0" class="table-container">
            <table class="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.userId">
                  <td>{{ user.userId }}</td>
                  <td>{{ user.firstName }} {{ user.lastName }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.phone }}</td>
                  <td>
                    <span :class="['role-badge', user.role?.roleName?.toLowerCase()]">
                      {{ user.role?.roleName }}
                    </span>
                  </td>
                  <td>
                    <span :class="['status-badge', user.isActive ? 'active' : 'inactive']">
                      {{ user.isActive ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="actions">
                    <button @click="editUser(user)" class="btn-edit" title="Editar">
                      Editar
                    </button>
                    <button @click="deleteUser(user)" class="btn-delete" title="Eliminar">
                      Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mensaje si no hay usuarios -->
          <div v-else class="empty-state">
            <p>No se encontraron usuarios</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Script section para users-modal.vue
import { getRoles } from '../../../data/api/get/getRol.js';
import { getUsers } from '../../../data/api/get/getUsers.js';
import { createUser } from '../../../data/api/post/postUsers.js';
import { updateUser, toggleUserStatus } from '../../../data/api/put/putUsers.js';
import { deleteUser } from '../../../data/api/delete/deleteUsers.js';

// Importar validadores
import { isValidName } from '../../../core/validators/nameValidator.js';
import { isValidIdentification } from '../../../core/validators/identificationValidator.js';
import { isValidPhone } from '../../../core/validators/phoneValidator.js';
import { isValidEmail } from '../../../core/validators/emailValidator.js';
import { isValidAddress } from '../../../core/validators/addressValidator.js';
import { isValidPassword } from '../../../core/validators/passwordValidator.js';

export default {
  name: 'UsersModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      formLoading: false,
      errorMessage: '',
      showForm: false,
      editingUser: null,
      searchQuery: '',
      roleFilter: '',
      roles: [],
      users: [],
      userForm: {
        firstName: '',
        lastName: '',
        identificationNumber: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        roleId: ''
      },
      fieldErrors: {
        firstName: '',
        lastName: '',
        identificationNumber: '',
        email: '',
        phone: '',
        address: '',
        password: ''
      }
    }
  },
  computed: {
    filteredUsers() {
      let filtered = this.users;

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(user => 
          user.firstName.toLowerCase().includes(query) ||
          user.lastName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.identificationNumber.includes(query)
        );
      }

      if (this.roleFilter) {
        filtered = filtered.filter(user => user.role?.roleName === this.roleFilter);
      }

      return filtered;
    },
    isFormValid() {
      // Verificar que no hay errores en los campos
      const hasErrors = Object.values(this.fieldErrors).some(error => error !== '');
      
      // Verificar que todos los campos requeridos están llenos
      const requiredFields = ['firstName', 'lastName', 'identificationNumber', 'email', 'phone', 'address', 'password', 'roleId'];
      const allFieldsFilled = requiredFields.every(field => this.userForm[field] && this.userForm[field].toString().trim() !== '');
      
      return !hasErrors && allFieldsFilled;
    }
  },
  async mounted() {
    if (this.isVisible) {
      await this.loadInitialData();
    }
  },
  watch: {
    isVisible(newVal) {
      if (newVal) {
        this.loadInitialData();
      }
    }
  },
  methods: {
    // Validaciones de entrada
    onlyLetters(event) {
      const char = String.fromCharCode(event.which);
      if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(char)) {
        event.preventDefault();
      }
    },
    
    onlyNumbers(event) {
      const char = String.fromCharCode(event.which);
      if (!/[0-9]/.test(char)) {
        event.preventDefault();
      }
    },
    
    // Validar campos individuales
    validateField(fieldName) {
      let validation;
      
      switch (fieldName) {
        case 'firstName':
        case 'lastName':
          validation = isValidName(this.userForm[fieldName]);
          break;
        case 'identificationNumber':
          validation = isValidIdentification(this.userForm[fieldName]);
          break;
        case 'phone':
          validation = isValidPhone(this.userForm[fieldName]);
          break;
        case 'email':
          validation = isValidEmail(this.userForm[fieldName]);
          break;
        case 'address':
          validation = isValidAddress(this.userForm[fieldName]);
          break;
        case 'password':
          validation = isValidPassword(this.userForm[fieldName]);
          break;
        default:
          validation = { isValid: true, message: '' };
      }
      
      this.fieldErrors[fieldName] = validation.isValid ? '' : validation.message;
    },
    
    // Validar todo el formulario
    validateForm() {
      const fields = ['firstName', 'lastName', 'identificationNumber', 'phone', 'email', 'address', 'password'];
      fields.forEach(field => this.validateField(field));
      
      return this.isFormValid;
    },

    async loadInitialData() {
      await this.loadRoles();
      await this.loadUsers();
    },

    async loadRoles() {
      try {
        this.roles = await getRoles();
      } catch (error) {
        this.errorMessage = 'Error al cargar los roles';
        console.error('Error loading roles:', error);
      }
    },

    async loadUsers() {
      this.loading = true;
      try {
        this.users = await getUsers();
        this.errorMessage = '';
      } catch (error) {
        this.errorMessage = 'Error al cargar los usuarios';
        console.error('Error loading users:', error);
      } finally {
        this.loading = false;
      }
    },

    closeModal() {
      this.$emit('close');
      this.resetForm();
      this.resetErrors();
      this.errorMessage = '';
      this.showForm = false;
    },
    
    showCreateForm() {
      this.showForm = true;
      this.editingUser = null;
      this.resetForm();
      this.resetErrors();
      this.errorMessage = '';
    },
    
    editUser(user) {
      this.showForm = true;
      this.editingUser = user;
      this.resetErrors();
      this.errorMessage = '';
      this.userForm = {
        firstName: user.firstName,
        lastName: user.lastName,
        identificationNumber: user.identificationNumber,
        email: user.email,
        phone: user.phone,
        address: user.address,
        password: user.password || '',
        roleId: user.roleId
      };
    },
    
    backToList() {
      this.showForm = false;
      this.editingUser = null;
      this.errorMessage = '';
      this.resetForm();
      this.resetErrors();
    },
    
    resetForm() {
      this.userForm = {
        firstName: '',
        lastName: '',
        identificationNumber: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        roleId: ''
      };
    },
    
    resetErrors() {
      this.fieldErrors = {
        firstName: '',
        lastName: '',
        identificationNumber: '',
        email: '',
        phone: '',
        address: '',
        password: ''
      };
    },
    
    async saveUser() {
      this.formLoading = true;
      this.errorMessage = '';

      try {
        // Validar formulario completo antes de enviar
        if (!this.validateForm()) {
          throw new Error('Por favor corrige los errores en el formulario');
        }
        
        // Convertir roleId a número si es string
        const formData = {
          ...this.userForm,
          roleId: parseInt(this.userForm.roleId)
        };
        
        if (this.editingUser) {
          formData.userId = this.editingUser.userId;
        }
        
        if (this.editingUser) {
          // Actualizar usuario existente
          await updateUser(this.editingUser.userId, formData);
          alert('Usuario actualizado correctamente');
        } else {
          // Crear nuevo usuario
          await createUser(formData, this.roles);
          alert('Usuario creado correctamente');
        }
        
        this.backToList();
        await this.loadUsers(); // Recargar la lista
      } catch (error) {
        this.errorMessage = error.message || 'Error al guardar el usuario';
        console.error('Error saving user:', error);
      } finally {
        this.formLoading = false;
      }
    },
    
    async toggleUserStatus(user) {
      if (confirm(`¿Desea ${user.isActive ? 'desactivar' : 'activar'} al usuario ${user.firstName} ${user.lastName}?`)) {
        try {
          await toggleUserStatus(user.userId, !user.isActive);
          alert(`Usuario ${!user.isActive ? 'activado' : 'desactivado'} correctamente`);
          await this.loadUsers(); // Recargar la lista
        } catch (error) {
          this.errorMessage = error.message || 'Error al cambiar el estado del usuario';
          console.error('Error changing user status:', error);
        }
      }
    },
    
// Método actualizado para el deleteUser en users-modal.vue
async deleteUser(user) {
  // Confirmar con información más detallada
  const confirmMessage = `¿Está seguro de eliminar PERMANENTEMENTE al usuario ${user.firstName} ${user.lastName}?\n\n` +
    `⚠️ ADVERTENCIA: Esta acción:\n` +
    `• Eliminará el usuario de forma permanente\n` +
    `• Eliminará todas las facturas donde este usuario sea el cliente\n` +
    `• Eliminará todos los detalles de esas facturas\n` +
    `• Esta acción NO se puede deshacer\n\n` +
    `¿Desea continuar?`;
  
  if (confirm(confirmMessage)) {
    try {
      this.errorMessage = '';
      
      // Mostrar indicador de carga
      const loadingMessage = 'Eliminando usuario y datos relacionados...';
      console.log(loadingMessage);
      
      const result = await deleteUser(user.userId);
      
      // Mostrar información detallada del resultado
      let successMessage = `Usuario "${user.firstName} ${user.lastName}" eliminado correctamente.`;
      
      if (result.customerInvoicesDeleted > 0) {
        successMessage += `\n• Facturas eliminadas: ${result.customerInvoicesDeleted}`;
      }
      
      if (result.createdInvoicesUpdated > 0) {
        successMessage += `\n• Facturas actualizadas (creadas por este usuario): ${result.createdInvoicesUpdated}`;
      }
      
      alert(successMessage);
      
      // Recargar la lista de usuarios
      await this.loadUsers();
      
    } catch (error) {
      this.errorMessage = error.message || 'Error al eliminar el usuario';
      console.error('Error deleting user:', error);
      
      // Mostrar error específico
      alert(`Error al eliminar el usuario: ${this.errorMessage}`);
    }
  }
},

  // Método adicional para desactivación lógica (opcional)
  async deactivateUser(user) {
    if (confirm(`¿Desea desactivar al usuario ${user.firstName} ${user.lastName}?\n\nEl usuario no será eliminado, solo desactivado.`)) {
      try {
        await deactivateUser(user.userId);
        alert(`Usuario "${user.firstName} ${user.lastName}" desactivado correctamente`);
        await this.loadUsers();
      } catch (error) {
        this.errorMessage = error.message || 'Error al desactivar el usuario';
        console.error('Error deactivating user:', error);
      }
    }
  },

  // Método adicional para reactivación (opcional)
  async activateUser(user) {
    if (confirm(`¿Desea reactivar al usuario ${user.firstName} ${user.lastName}?`)) {
      try {
        await activateUser(user.userId);
        alert(`Usuario "${user.firstName} ${user.lastName}" reactivado correctamente`);
        await this.loadUsers();
      } catch (error) {
        this.errorMessage = error.message || 'Error al reactivar el usuario';
        console.error('Error activating user:', error);
      }
    }
  },
    
    async refreshUsers() {
      await this.loadUsers();
    }
  }
}
</script>

<style src="../../../assets/styles/users-modal.css"></style>

<style scoped>
.field-error {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.form-group input.error,
.form-group select.error {
  border-color: #e74c3c;
  box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
}

.btn-save:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}
</style>