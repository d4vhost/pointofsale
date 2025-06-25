<!--presentation/pages/AdminPage.vue-->
<template>
  <div class="admin-page">
    <!-- HEADER -->
    <header class="app-header">
      <div class="header-container">
        <div class="logo-container">
          <div class="logo-placeholder"></div>
          <h1 class="company-name">FactuSys</h1>
        </div>
        <div class="header-actions">
          <button @click="logout" class="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>

    <!-- PANEL DEL ADMINISTRADOR -->
    <section class="admin-panel">
      <div class="admin-panel-container">
        <h1>Panel de Administración</h1>
        <p>Bienvenido, {{ fullName }} - Gestiona todos los aspectos del sistema FactuSys</p>
      </div>
    </section>

    <!-- CONTENIDO CENTRAL -->
    <div class="admin-container">
      <!-- Dashboard Cards -->
      <section class="dashboard-overview">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon users-icon">
              <span class="icon-users">👥</span>
            </div>
            <div class="stat-info">
              <h3>Usuarios</h3>
              <p class="stat-number">{{ isLoading ? '...' : userCount }}</p>
              <span class="stat-label">Total activos</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon products-icon">
              <span class="icon-products">📦</span>
            </div>
            <div class="stat-info">
              <h3>Productos</h3>
              <p class="stat-number">{{ isLoadingProducts ? '...' : productCount }}</p>
              <span class="stat-label">En inventario</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon invoices-icon">
              <span class="icon-invoices">🧾</span>
            </div>
            <div class="stat-info">
              <h3>Facturas</h3>
              <p class="stat-number">{{ isLoadingInvoices ? '...' : invoiceCount }}</p>
              <span class="stat-label">Total registradas</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon security-icon">
              <span class="icon-security">🔒</span>
            </div>
            <div class="stat-info">
              <h3>Usuarios Bloqueados</h3>
              <p class="stat-number">{{ isLoading ? '...' : blockedUsersCount }}</p>
              <span class="stat-label">Por fallos de autenticación</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Navigation Menu -->
      <section class="admin-navigation">
        <h2>Gestión del Sistema</h2>
        <div class="nav-grid">
          <!-- Gestión de Usuarios -->
          <div class="nav-card" @click="openUsersModal">
            <div class="nav-icon">
              <span class="icon-user-management">👤</span>
            </div>
            <div class="nav-content">
              <h3>Gestión de Usuarios</h3>
              <p>Administrar usuarios, roles y permisos</p>
              <ul class="nav-features">
                <li>Crear/Editar usuarios</li>
                <li>Asignar roles</li>
                <li>Eliminar usuarios</li>
              </ul>
            </div>
            <div class="nav-arrow">
              <span class="icon-arrow-right">→</span>
            </div>
          </div>

          <!-- Gestión de Productos -->
          <div class="nav-card" @click="openProductsModal">
            <div class="nav-icon">
              <span class="icon-product-management">📋</span>
            </div>
            <div class="nav-content">
              <h3>Gestión de Productos</h3>
              <p>Administrar inventario y catálogo</p>
              <ul class="nav-features">
                <li>CRUD de productos</li>
                <li>Control de stock</li>
                <li>Categorías</li>
              </ul>
            </div>
            <div class="nav-arrow">
              <span class="icon-arrow-right">→</span>
            </div>
          </div>

          <!-- Gestión de Seguridad -->
          <div class="nav-card" @click="openSecurityModal">
            <div class="nav-icon">
              <span class="icon-security-management">🔐</span>
            </div>
            <div class="nav-content">
              <h3>Gestión de Seguridad</h3>
              <p>Administrar usuarios bloqueados/desbloqueados</p>
              <ul class="nav-features">
                <li>Ver usuarios bloqueados</li>
                <li>Desbloquear usuarios</li>
                <li>Gestionar accesos</li>
              </ul>
            </div>
            <div class="nav-arrow">
              <span class="icon-arrow-right">→</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- FOOTER -->
    <footer class="app-footer">
      <div class="copyright">
        © 2025 FactuSys. Todos los derechos reservados.
      </div>
    </footer>

    <!-- MODAL DE USUARIOS -->
    <UsersModal 
      :isVisible="showUsersModal" 
      @close="closeUsersModal"
    />

    <!-- MODAL DE PRODUCTOS -->
    <ProductsModal 
      :isVisible="showProductsModal" 
      @close="closeProductsModal"
    />

    <!-- MODAL DE GESTIÓN DE SEGURIDAD -->
    <BlockedUnblockedUsersModal 
      :isVisible="showSecurityModal" 
      @close="closeSecurityModal"
    />
  </div>
</template>

<script>
// Importar el componente del modal y las APIs
import UsersModal from '../components/modals/users-modal.vue'
import ProductsModal from '../components/modals/products-modal.vue'
import BlockedUnblockedUsersModal from '../components/modals/blocked-unblocked-users.vue'
import { getUsers } from '../../data/api/get/getUsers.js'
import { getProductsApi } from '../../data/api/get/getProducts.js'
import { getInvoicesApi } from '../../data/api/get/getInvoices.js'

export default {
  name: 'AdminPage',
  components: {
    UsersModal,
    ProductsModal,
    BlockedUnblockedUsersModal
  },
  data() {
    return {
      userCount: 0,
      productCount: 0,
      invoiceCount: 0,
      blockedUsersCount: 0,
      showUsersModal: false,
      showProductsModal: false,
      showSecurityModal: false,
      isLoading: false,
      isLoadingProducts: false,
      isLoadingInvoices: false
    }
  },
  computed: {
    fullName() {
      const firstName = localStorage.getItem('firstName') || '';
      const lastName = localStorage.getItem('lastName') || '';
      return `${firstName} ${lastName}`.trim() || 'Administrador';
    }
  },
  methods: {
    // Método para abrir el modal de usuarios
    openUsersModal() {
      this.showUsersModal = true;
    },
    
    // Método para cerrar el modal de usuarios
    closeUsersModal() {
      this.showUsersModal = false;
    },

    // Método para abrir el modal de productos
    openProductsModal() {
      this.showProductsModal = true;
    },
    
    // Método para cerrar el modal de productos
    closeProductsModal() {
      this.showProductsModal = false;
    },

    // Método para abrir el modal de seguridad
    openSecurityModal() {
      this.showSecurityModal = true;
    },
    
    // Método para cerrar el modal de seguridad
    closeSecurityModal() {
      this.showSecurityModal = false;
    },
    
    navigateTo(route) {
      this.$router.push(`/admin/${route}`);
    },
    
    logout() {
      localStorage.clear();
      this.$router.push('/');
    },
    
    // Cargar el conteo de usuarios activos y bloqueados desde la API
    async loadActiveUsersCount() {
      try {
        this.isLoading = true;
        const users = await getUsers();
        
        // CORRECCIÓN: IsActive es un BIT (0 o 1)
        // IsActive = 1 (true) significa usuario activo
        // IsActive = 0 (false) significa usuario bloqueado/inactivo
        const activeUsers = users.filter(user => user.isActive === true || user.isActive === 1);
        const blockedUsers = users.filter(user => user.isActive === false || user.isActive === 0);
        
        this.userCount = activeUsers.length;
        this.blockedUsersCount = blockedUsers.length;
        
        console.log(`Total usuarios: ${users.length}`);
        console.log(`Usuarios activos (IsActive = 1): ${this.userCount}`);
        console.log(`Usuarios bloqueados (IsActive = 0): ${this.blockedUsersCount}`);
        
        // Debug: mostrar algunos usuarios para verificar el campo IsActive
        console.log('Muestra de usuarios:', users.slice(0, 3).map(u => ({
          id: u.userId,
          name: `${u.firstName} ${u.lastName}`,
          isActive: u.isActive,
          type: typeof u.isActive
        })));
        
      } catch (error) {
        console.error('Error al cargar usuarios activos:', error);
        this.userCount = 0;
        this.blockedUsersCount = 0;
      } finally {
        this.isLoading = false;
      }
    },

    // Cargar el conteo de productos desde la API
    async loadProductsCount() {
      try {
        this.isLoadingProducts = true;
        const response = await getProductsApi();
        this.productCount = response.data.length;
        
        console.log(`Total productos: ${this.productCount}`);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        this.productCount = 0;
      } finally {
        this.isLoadingProducts = false;
      }
    },

    // Cargar el conteo de facturas desde la API
    async loadInvoicesCount() {
      try {
        this.isLoadingInvoices = true;
        const response = await getInvoicesApi();
        this.invoiceCount = response.data.length;
        
        console.log(`Total facturas: ${this.invoiceCount}`);
      } catch (error) {
        console.error('Error al cargar facturas:', error);
        this.invoiceCount = 0;
      } finally {
        this.isLoadingInvoices = false;
      }
    },
    
    async loadDashboardData() {
      try {
        // Cargar todos los datos desde las APIs correspondientes
        await Promise.all([
          this.loadActiveUsersCount(),
          this.loadProductsCount(),
          this.loadInvoicesCount()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    }
  },
  mounted() {
    this.loadDashboardData();
  }
}
</script>

<style src="../../assets/styles/admin.css"></style>