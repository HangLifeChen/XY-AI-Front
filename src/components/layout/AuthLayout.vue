<template>
  <div class="auth-layout">
    <slot />
  </div>
</template>

<script setup>
// 空脚本块，仅用于定义组件
</script>

<style scoped>
.auth-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 0;
  margin: 0;
  overflow: hidden;
}
</style>
