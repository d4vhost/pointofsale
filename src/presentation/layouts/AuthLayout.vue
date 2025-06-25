//presentation/layouts/AuthLayout.vue

<template>
  <div class="auth-layout">
    <main>
      <slot /> <!-- Renderiza la vista correspondiente -->
    </main>
  </div>
</template>

<script>
export default {
  name: 'AuthLayout'
}
</script>

