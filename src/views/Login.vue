<template>
  <div class="auth-container">
    <el-card class="auth-card" shadow="hover">
      <h1 class="auth-title">
        <el-icon :size="28" style="vertical-align: middle; margin-right: 8px">
          <User />
        </el-icon>
        用户登录
      </h1>
      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" @keyup.enter="handleLogin">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名或邮箱"
            prefix-icon="User"
            clearable
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="auth-button"
            :loading="loading"
            @click="handleLogin"
            style="background-color: #cc1616; border-color: #cc1616"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="auth-footer">
        <el-link type="primary" @click="goToForgotPassword">忘记密码</el-link>
        <span> | </span>
        还没有账号？<el-link type="primary" @click="$router.push('/register')">立即注册</el-link>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { login } from '@/api/auth'

const userStore = useUserStore()
const loginFormRef = ref()
const loading = ref(false)

const router = useRouter()
const route = useRoute()
const redirectUrl = computed(() => route.query.redirect || '/')

const loginForm = ref({
  username: 'admin',
  password: '123456',
})

const validateUsername = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入用户名或邮箱'))
  } else {
    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value) && value.length < 3) {
      callback(new Error('用户名至少3位或请输入正确邮箱格式'))
    } else {
      callback()
    }
  }
}

const loginRules = {
  username: [{ validator: validateUsername, trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleLogin = async () => {
  try {
    loading.value = true
    await loginFormRef.value.validate()
    const data = await login(loginForm.value)
    userStore.setAuthData(data)
    // 登录成功后获取订阅信息
    await userStore.fetchSubscription()
    ElMessage.success('登录成功')
    router.push(redirectUrl.value as string)
  } catch (error) {
    ElMessage.error('登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}

const goToForgotPassword = () => {
  router.push('/forgot-password')
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
  padding: 2rem;
  margin: 1rem;
  box-sizing: border-box;
}

.auth-title {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.auth-button {
  width: 100%;
  height: 40px;
  font-size: 1rem;
}

.auth-footer {
  text-align: center;
  color: #6c757d;
  margin-top: 1.5rem;
  font-size: 0.95rem;
}

@media (max-width: 480px) {
  .auth-container {
    padding: 1rem;
  }

  .auth-card {
    padding: 1.5rem;
  }
}
</style>
