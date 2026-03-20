<template>
  <div class="unauthorized-container">
    <h1>未授权访问</h1>
    <p>您没有权限访问该页面</p>
    <p v-if="redirectPath">原访问路径: {{ redirectPath }}</p>
    <button @click="goToLogin" class="login-button">返回登录</button>
  </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const redirectPath = route.query.redirect as string

const goToLogin = () => {
  router.push({
    name: 'login',
    query: { redirect: redirectPath },
  })
}
</script>

<style scoped>
.unauthorized-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}

h1 {
  color: #ff4d4f;
  margin-bottom: 20px;
}

p {
  margin-bottom: 10px;
  color: #666;
}

.login-button {
  margin-top: 20px;
  padding: 8px 16px;
  background-color: #cc1616;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.login-button:hover {
  background-color: #40a9ff;
}
</style>
