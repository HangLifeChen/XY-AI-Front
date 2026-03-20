<template>
  <div class="auth-container">
    <el-card class="auth-card" shadow="hover">
      <h1 class="auth-title">
        <el-icon :size="28" style="vertical-align: middle; margin-right: 8px">
          <Lock />
        </el-icon>
        忘记密码
      </h1>
      <el-steps :active="step" finish-status="success" simple>
        <el-step title="填写邮箱" />
        <el-step title="验证邮箱" />
        <el-step title="重置密码" />
      </el-steps>

      <div class="step-content">
        <!-- 步骤1: 填写邮箱 -->
        <div v-if="step === 0">
          <el-form
            :model="emailForm"
            :rules="emailRules"
            ref="emailFormRef"
            @keyup.enter="sendVerificationCode"
          >
            <el-form-item prop="email">
              <el-input
                v-model="emailForm.email"
                placeholder="请输入注册时使用的邮箱"
                prefix-icon="Message"
                clearable
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                class="auth-button"
                :loading="loading"
                @click="sendVerificationCode"
                style="background-color: #cc1616; border-color: #cc1616"
              >
                发送验证码
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 步骤2: 验证邮箱 -->
        <div v-else-if="step === 1">
          <el-form
            :model="verificationForm"
            :rules="verificationRules"
            ref="verificationFormRef"
            @keyup.enter="verifyCode"
          >
            <el-form-item label="验证码已发送至">
              <span class="email-display">{{ emailForm.email }}</span>
              <el-button type="text" @click="resendCode" :disabled="countdown > 0">
                {{ countdown > 0 ? `${countdown}s后重新发送` : '重新发送' }}
              </el-button>
            </el-form-item>
            <el-form-item prop="code">
              <el-input
                v-model="verificationForm.code"
                placeholder="请输入邮箱收到的验证码"
                prefix-icon="Key"
                clearable
                maxlength="6"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                class="auth-button"
                :loading="loading"
                @click="verifyCodeSubmit"
                style="background-color: #cc1616; border-color: #cc1616"
              >
                验证
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 步骤3: 重置密码 -->
        <div v-else-if="step === 2">
          <el-form
            :model="resetForm"
            :rules="resetRules"
            ref="resetFormRef"
            @keyup.enter="resetPassword"
          >
            <el-form-item prop="password">
              <el-input
                v-model="resetForm.password"
                type="password"
                placeholder="请输入新密码"
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="resetForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                class="auth-button"
                :loading="loading"
                @click="resetPasswordSubmit"
                style="background-color: #cc1616; border-color: #cc1616"
              >
                重置密码
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <div class="auth-footer">
        <el-link type="primary" @click="goBack">
          {{ step > 0 ? '上一步' : '返回登录' }}
        </el-link>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, Message, Key } from '@element-plus/icons-vue'
import { forgotPassword, resetPassword, verifyCode } from '@/api/auth'

const router = useRouter()

// 步骤控制
const step = ref(0)

// 表单引用
const emailFormRef = ref()
const verificationFormRef = ref()
const resetFormRef = ref()

// 加载状态
const loading = ref(false)

// 邮箱表单
const emailForm = reactive({
  email: '',
})

// 验证码表单
const verificationForm = reactive({
  code: '',
})

// 重置密码表单
const resetForm = reactive({
  token: '',
  password: '',
  confirmPassword: '',
})

// 倒计时
const countdown = ref(0)
let countdownInterval: NodeJS.Timeout | null = null

// 验证规则
const emailRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] },
  ],
}

const verificationRules = {
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' },
  ],
}

const validatePassword = (rule: any, value: string, callback: any) => {
  if (value !== resetForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const resetRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' },
  ],
}

// 发送验证码
const sendVerificationCode = async () => {
  if (!emailFormRef.value) return

  try {
    await emailFormRef.value.validate()
    loading.value = true

    // 发送验证码请求
    await forgotPassword({ email: emailForm.email })

    ElMessage.success('验证码已发送，请查收邮件')
    step.value = 1

    // 启动倒计时
    startCountdown()
  } catch (error) {
    console.error('发送验证码失败，请检查邮箱是否正确')
  } finally {
    loading.value = false
  }
}

// 重新发送验证码
const resendCode = async () => {
  try {
    loading.value = true
    await forgotPassword({ email: emailForm.email })
    ElMessage.success('验证码已重新发送')
    startCountdown()
  } catch (error) {
    console.error('重新发送验证码失败')
  } finally {
    loading.value = false
  }
}

// 启动倒计时
const startCountdown = () => {
  countdown.value = 60
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
  countdownInterval = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      if (countdownInterval) {
        clearInterval(countdownInterval)
      }
    }
  }, 1000)
}

// 验证验证码
const verifyCodeSubmit = async () => {
  if (!verificationFormRef.value) return

  try {
    await verificationFormRef.value.validate()
    loading.value = true

    // 调用后端API验证验证码
    const data = await verifyCode({
      email: emailForm.email,
      code: verificationForm.code,
    })
    resetForm.token = data.token
    ElMessage.success('验证成功')
    step.value = 2
    loading.value = false
  } catch (error) {
    loading.value = false
  }
}

// 重置密码
const resetPasswordSubmit = async () => {
  if (!resetFormRef.value) return

  try {
    await resetFormRef.value.validate()
    loading.value = true

    // 执行密码重置
    await resetPassword({
      email: emailForm.email,
      token: resetForm.token,
      newPassword: resetForm.password,
    })

    ElMessage.success('密码重置成功')

    // 延迟跳转到登录页
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error) {
    console.error('密码重置失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 返回上一步或登录页
const goBack = () => {
  if (step.value > 0) {
    step.value--
  } else {
    router.push('/login')
  }
}

// 组件销毁时清除倒计时
// onUnmounted(() => {
//   if (countdownInterval) {
//     clearInterval(countdownInterval)
//   }
// })
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
  margin-bottom: 20px;
  text-align: center;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.step-content {
  margin: 24px 0;
}

.email-display {
  font-weight: bold;
  color: #303133;
}

.auth-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

.auth-footer {
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
