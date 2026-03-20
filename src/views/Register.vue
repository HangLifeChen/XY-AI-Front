<template>
  <div class="auth-container">
    <el-card class="auth-card" shadow="hover">
      <h1 class="auth-title">
        <el-icon :size="28" style="vertical-align: middle; margin-right: 8px">
          <User />
        </el-icon>
        用户注册
      </h1>
      <el-form
        :model="registerForm"
        :rules="registerRules"
        ref="registerFormRef"
        @keyup.enter="handleRegister"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            clearable
          />
        </el-form-item>
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱"
            prefix-icon="Message"
            clearable
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="auth-button"
            :loading="loading"
            @click="handleRegister"
            style="background-color: #cc1616; border-color: #cc1616"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>
      <div class="auth-footer">
        已有账号？<el-link type="primary" @click="goLogin">立即登录</el-link>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { User, Lock, Message } from '@element-plus/icons-vue'
import { register } from '@/api/auth'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const redirectUrl = computed(() => route.query.redirect || '/')
const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const validatePassword = (rule: any, value: string, callback: any) => {
  if (value !== registerForm.value.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const validateEmail = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入邮箱'))
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      callback(new Error('请输入正确的邮箱格式'))
    } else {
      callback()
    }
  }
}

const registerRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' },
  ],
}

const loading = ref(false)
const registerFormRef = ref()

const handleRegister = async () => {
  try {
    await registerFormRef.value.validate()
    loading.value = true
    
    // 构造注册参数，包含邮箱
    const registerParams = {
      username: registerForm.value.username,
      password: registerForm.value.password,
      email: registerForm.value.email
    }
    
    const data = await register(registerParams)
    userStore.setAuthData(data)
    ElMessage.success('注册成功')
    router.push(redirectUrl.value as string)
  } catch (error) {
    ElMessage.error('注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const goLogin = () => {
  router.push('/login')
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
  margin-bottom: 30px;
  text-align: center;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.auth-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

.auth-footer {
  margin-top: 24px;
  text-align: center;
  color: #606266;
  font-size: 14px;
}

@media (max-width: 480px) {
  .auth-container {
    padding: 10px;
  }

  .auth-card {
    padding: 30px 20px;
  }
}
</style>