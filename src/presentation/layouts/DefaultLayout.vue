<!--presentation/layouts/DefaultLayout.vue-->
<template>
  <div class="default-layout">
    <slot /> <!-- Aquí se renderizan las páginas -->
  </div>
</template>

<script>
export default {
  name: 'DefaultLayout'
}
</script>

<style scoped>
.default-layout {
  background-color: #f8f9fa;
  min-height: 100vh;
  width: 100%;
}

</style>