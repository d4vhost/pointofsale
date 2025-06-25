<!-- presentation/pages/LoginPage.vue -->
<template>
  <AuthLayout>
    <Login @login-success="redirectToPage" />
  </AuthLayout>
</template>

<script>
import AuthLayout from '../layouts/AuthLayout.vue'
import Login from '../components/auth/Login.vue'

export default {
  name: 'LoginPage',
  components: {
    AuthLayout,
    Login
  },
  methods: {
    redirectToPage(role) {
      if (role === 'Administrador') {
        this.$router.push('/admin')
      } else if (role === 'Cliente') {
        this.$router.push('/user')
      } else {
        this.$router.push('/dashboard') // fallback
      }
    }
  }
}
</script>

<style src="../../assets/styles/login.css"></style>
