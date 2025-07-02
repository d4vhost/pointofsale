<!--presentation/components/modals/users-modal.vue-->
<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <!-- Header del Modal -->
      <div class="modal-header">
        <h2>{{ showForm ? (editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario') : 'Gestión de Usuarios' }}</h2>
        <button @click="closeModal" class="close-button">×</button>
      </div>

      <!-- Body del Modal -->
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
                  placeholder="1234567890"
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
                  maxlength="100"
                  @input="validateField('address')"
                  :class="{ 'error': fieldErrors.address }"
                >
                <span v-if="fieldErrors.address" class="field-error">{{ fieldErrors.address }}</span>
              </div>
              <div class="form-group">
                <label>Contraseña:</label>
                <div class="password-container">
                  <input 
                    v-model="userForm.password" 
                    type="password" 
                    required 
                    placeholder="Contraseña segura (6-15 caracteres)"
                    maxlength="15"
                    @input="validateField('password')"
                    :class="{ 'error': fieldErrors.password }"
                  >
                  <button 
                    type="button" 
                    @click="generatePassword" 
                    class="btn-generate-password"
                    title="Generar contraseña segura"
                  >
                    🔐
                  </button>
                </div>
                <div v-if="passwordStrength.strength" class="password-strength" :style="{ color: passwordStrength.color }">
                  Seguridad: {{ passwordStrength.strength }}
                </div>
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
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in paginatedUsers" :key="user.userId">
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

            <!-- Paginación -->
            <div class="pagination" v-if="totalPages > 1">
              <button 
                @click="goToPage(1)" 
                :disabled="currentPage === 1"
                class="pagination-btn"
              >
                &#8249;&#8249;
              </button>
              <button 
                @click="goToPage(currentPage - 1)" 
                :disabled="currentPage === 1"
                class="pagination-btn"
              >
                &#8249;
              </button>
              <span class="pagination-info">
                Página {{ currentPage }} de {{ totalPages }} ({{ filteredUsers.length }} usuarios)
              </span>
              <button 
                @click="goToPage(currentPage + 1)" 
                :disabled="currentPage === totalPages"
                class="pagination-btn"
              >
                &#8250;
              </button>
              <button 
                @click="goToPage(totalPages)" 
                :disabled="currentPage === totalPages"
                class="pagination-btn"
              >
                &#8250;&#8250;
              </button>
            </div>
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

// Importar validadores actualizados
import { isValidName, isUniqueNameCombination } from '../../../core/validators/nameValidator.js';
import { isValidIdentification, isUniqueIdentification } from '../../../core/validators/identificationValidator.js';
import { isValidPhone } from '../../../core/validators/phoneValidator.js';
import { isValidEmail, isUniqueEmail } from '../../../core/validators/emailValidator.js';
import { isValidAddress } from '../../../core/validators/addressValidator.js';
import { isValidPassword, generateSecurePassword, getPasswordStrength } from '../../../core/validators/passwordValidator.js';

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
      // Paginación - Cambiado a 2 usuarios por página
      currentPage: 1,
      itemsPerPage: 2,
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
      },
      passwordStrength: { strength: '', score: 0, color: '' }
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

    // Paginación
    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    },

    paginatedUsers() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredUsers.slice(start, end);
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

  watch: {
    isVisible(newVal) {
      if (newVal) {
        this.loadInitialData();
      }
    },

    searchQuery() {
      this.currentPage = 1; // Resetear a la primera página cuando se busca
    },

    roleFilter() {
      this.currentPage = 1; // Resetear a la primera página cuando se filtra
    }
  },

  async mounted() {
    if (this.isVisible) {
      await this.loadInitialData();
    }
  },

  methods: {
    // Paginación
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

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

    // Generar contraseña segura
    generatePassword() {
      const newPassword = generateSecurePassword(12);
      this.userForm.password = newPassword;
      this.validateField('password');
      
      // Mostrar la contraseña generada
      alert(`Contraseña generada: ${newPassword}\n\n¡Asegúrate de guardarla en un lugar seguro!`);
    },
    
    // Validar campos individuales con validaciones mejoradas
    async validateField(fieldName) {
      let validation;
      
      switch (fieldName) {
        case 'firstName':
        case 'lastName':
          validation = isValidName(this.userForm[fieldName]);
          
          // Si es válido el formato, verificar unicidad
          if (validation.isValid && this.userForm.firstName && this.userForm.lastName) {
            const uniqueCheck = await isUniqueNameCombination(
              this.userForm.firstName, 
              this.userForm.lastName, 
              this.users,
              this.editingUser?.userId
            );
            if (!uniqueCheck.isValid) {
              validation = uniqueCheck;
            }
          }
          break;

        case 'identificationNumber':
          validation = isValidIdentification(this.userForm[fieldName]);
          
          // Si es válido el formato, verificar unicidad
          if (validation.isValid) {
            const uniqueCheck = await isUniqueIdentification(
              this.userForm[fieldName], 
              this.users,
              this.editingUser?.userId
            );
            if (!uniqueCheck.isValid) {
              validation = uniqueCheck;
            }
          }
          break;

        case 'phone':
          validation = isValidPhone(this.userForm[fieldName]);
          break;

        case 'email':
          validation = isValidEmail(this.userForm[fieldName]);
          
          // Si es válido el formato, verificar unicidad
          if (validation.isValid) {
            const uniqueCheck = await isUniqueEmail(
              this.userForm[fieldName], 
              this.users,
              this.editingUser?.userId
            );
            if (!uniqueCheck.isValid) {
              validation = uniqueCheck;
            }
          }
          break;

        case 'address':
          validation = isValidAddress(this.userForm[fieldName]);
          break;

        case 'password':
          validation = isValidPassword(this.userForm[fieldName]);
          this.passwordStrength = getPasswordStrength(this.userForm[fieldName]);
          break;

        default:
          validation = { isValid: true, message: '' };
      }
      
      this.fieldErrors[fieldName] = validation.isValid ? '' : validation.message;
    },
    
    // Validar todo el formulario
    async validateForm() {
      const fields = ['firstName', 'lastName', 'identificationNumber', 'phone', 'email', 'address', 'password'];
      
      // Validar todos los campos de forma secuencial
      for (const field of fields) {
        await this.validateField(field);
      }
      
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
      this.currentPage = 1;
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
      this.passwordStrength = getPasswordStrength(this.userForm.password);
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
      this.passwordStrength = { strength: '', score: 0, color: '' };
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
        const isValid = await this.validateForm();
        if (!isValid) {
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
    
    // Método actualizado para el deleteUser
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
          
          // Ajustar página si es necesario
          if (this.paginatedUsers.length === 0 && this.currentPage > 1) {
            this.currentPage = this.currentPage - 1;
          }
          
        } catch (error) {
          this.errorMessage = error.message || 'Error al eliminar el usuario';
          console.error('Error deleting user:', error);
          
          // Mostrar error específico
          alert(`Error al eliminar el usuario: ${this.errorMessage}`);
        }
      }
    },

    async refreshUsers() {
      await this.loadUsers();
      this.currentPage = 1; // Resetear a la primera página
    }
  }
}
</script>

<style src="../../../assets/styles/users-modal.css"></style>