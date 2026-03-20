<template>
  <el-dialog v-model="visible" title="微信支付" width="500px" :before-close="handleClose">
    <div class="payment-dialog">
      <div class="plan-info">
        <h3>{{ selectedPlan?.name }}</h3>
        <p class="price">
          ¥{{ (calculatedPrice / 100).toFixed(2) }}
          <span v-if="duration === 'quarter'">(季付)</span>
          <span v-else-if="duration === 'year'">(年付)</span>
          <span v-else>(月付)</span>
        </p>
        <p class="duration" v-if="originalPrice > calculatedPrice">
          原价: ¥{{ (originalPrice / 100).toFixed(2) }}
          <span class="discount">{{ discountInfo }}</span>
        </p>
      </div>
      <!-- 如果是免费计划，则不显示支付二维码 -->
      <div v-if="selectedPlan && selectedPlan.plan !== 'free'" class="payment-qrcode">
        <div class="qrcode-placeholder">
          <canvas v-show="paymentQRCode" ref="qrcodeCanvas" class="qrcode-canvas"></canvas>
          <div v-show="!paymentQRCode" class="qrcode-loading">
            <el-icon size="30"><Loading /></el-icon>
            <p>正在生成支付二维码...</p>
          </div>
        </div>
        <p class="scan-tip">请使用微信扫描二维码完成支付</p>
      </div>

      <!-- 如果是免费计划，显示提示信息 -->
      <div v-else-if="selectedPlan && selectedPlan.plan === 'free'" class="free-plan-message">
        <el-alert type="success" title="您选择的是免费计划，无需支付" show-icon />
      </div>

      <div class="payment-status" v-if="paymentStatus">
        <el-alert :type="paymentStatus.type" :title="paymentStatus.message" show-icon />
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelPayment">取消支付</el-button>
        <!-- 如果是免费计划，按钮文字改为"确认选择" -->
        <el-button
          v-if="selectedPlan && selectedPlan.plan === 'free'"
          type="primary"
          @click="handleFreePlanSelection"
        >
          确认选择
        </el-button>
        <el-button
          v-else
          type="primary"
          :loading="isCheckingPayment"
          @click="orderId && checkPaymentStatus(orderId)"
        >
          我已支付
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { SubscriptionPlanConfigs } from '@/types/user'
import { Loading } from '@element-plus/icons-vue'
import { createWeChatPaymentOrder, checkPaymentStatus } from '@/api/subscriptionService'
import QRCode from 'qrcode'

const props = defineProps<{
  modelValue: boolean
  plan: SubscriptionPlanConfigs | null
  duration: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'payment-success'): void
  (e: 'payment-cancel'): void
}>()

// 支付状态
const paymentQRCode = ref<string | null>(null)
const isCheckingPayment = ref(false)
const paymentCheckInterval = ref<number | null>(null)
const orderId = ref<string | null>(null)
const qrcodeCanvas = ref<HTMLCanvasElement | null>(null)

// 支付状态信息
const paymentStatus = ref<{
  type: 'success' | 'warning' | 'info' | 'error'
  message: string
} | null>(null)

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const selectedPlan = computed(() => props.plan)

// 订阅时长
const duration = computed(() => props.duration || 'month')

// 原始价格（按月计算）
const originalPrice = computed(() => {
  if (!selectedPlan.value) return 0
  const monthlyPrice = selectedPlan.value.price

  switch (duration.value) {
    case 'month':
      return monthlyPrice
    case 'quarter':
      return monthlyPrice * 3
    case 'year':
      return monthlyPrice * 12
    default:
      return monthlyPrice
  }
})

// 折扣信息
const discountInfo = computed(() => {
  switch (duration.value) {
    case 'quarter':
      return '9.5折'
    case 'year':
      return '8.5折'
    default:
      return ''
  }
})

// 折扣金额
const discount = computed(() => {
  if (!selectedPlan.value) return 0

  switch (duration.value) {
    case 'quarter':
      // 季付优惠5%
      return parseFloat((originalPrice.value * 0.05).toFixed(2))
    case 'year':
      // 年付优惠15%
      return parseFloat((originalPrice.value * 0.15).toFixed(2))
    default:
      return 0
  }
})

// 计算后的价格
const calculatedPrice = computed(() => {
  return parseFloat((originalPrice.value - discount.value).toFixed(2))
})

// 监听对话框显示状态
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      // 生成支付二维码
      generatePaymentQRCode()
      // 开始轮询支付状态
      startPaymentCheck()
    } else {
      // 清理资源
      clearPaymentCheck()
      resetPaymentState()
    }
  },
)

// 生成支付二维码
const generatePaymentQRCode = async () => {
  // 如果是免费计划，不需要生成支付二维码
  if (selectedPlan.value && selectedPlan.value.plan === 'free') {
    paymentQRCode.value = null
    paymentStatus.value = {
      type: 'success',
      message: '免费计划无需支付',
    }
    return
  }

  try {
    // 调用后端API生成微信支付订单和二维码
    const response = await createWeChatPaymentOrder(
      selectedPlan.value!.plan as any,
      duration.value as 'month' | 'quarter' | 'year',
      calculatedPrice.value,
    )

    orderId.value = response.orderId
    paymentQRCode.value = response.qrCodeUrl

    // 使用 QRCode 库生成二维码
    if (qrcodeCanvas.value) {
      QRCode.toCanvas(
        qrcodeCanvas.value,
        response.qrCodeUrl,
        {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) {
            console.error('生成二维码失败:', error)
            paymentStatus.value = {
              type: 'error',
              message: '生成支付二维码失败，请稍后重试',
            }
          } else {
            paymentStatus.value = {
              type: 'info',
              message: '二维码已生成，请使用微信扫描支付',
            }
          }
        },
      )
    }
  } catch (error) {
    console.error('创建支付订单失败:', error)
    paymentStatus.value = {
      type: 'error',
      message: '生成支付二维码失败，请稍后重试',
    }
  }
}

// 开始轮询支付状态
const startPaymentCheck = () => {
  clearPaymentCheck()
  // 每5秒检查一次支付状态
  paymentCheckInterval.value = window.setInterval(() => {
    checkPaymentResult()
  }, 5000)
}

// 清理支付状态检查
const clearPaymentCheck = () => {
  if (paymentCheckInterval.value) {
    clearInterval(paymentCheckInterval.value)
    paymentCheckInterval.value = null
  }
}

// 检查支付状态
const checkPaymentResult = async () => {
  // 如果是免费计划，直接处理成功逻辑
  if (selectedPlan.value && selectedPlan.value.plan === 'free') {
    visible.value = false
    emit('payment-success')
    ElMessage.success('您已选择免费计划！')
    return
  }

  // 如果没有订单ID，先生成支付二维码
  if (!orderId.value) {
    await generatePaymentQRCode()
    return
  }

  isCheckingPayment.value = true
  try {
    // 调用后端API检查支付状态
    const isPaid = await checkPaymentStatus(orderId.value)

    if (isPaid) {
      paymentStatus.value = {
        type: 'success',
        message: '支付成功！正在处理您的订阅...',
      }

      // 清理检查
      clearPaymentCheck()

      // 延迟关闭对话框并触发支付成功事件
      setTimeout(() => {
        visible.value = false
        emit('payment-success')
        ElMessage.success('支付成功，订阅已更新！')
      }, 2000)
    } else {
      paymentStatus.value = {
        type: 'info',
        message: '等待支付确认中...请用微信扫一下二维码完成支付',
      }
    }
  } catch (error) {
    console.error('检查支付状态失败:', error)
    paymentStatus.value = {
      type: 'error',
      message: '检查支付状态失败，请稍后重试',
    }
  } finally {
    isCheckingPayment.value = false
  }
}

// 取消支付
const cancelPayment = () => {
  visible.value = false
  emit('payment-cancel')
}

// 重置支付状态
const resetPaymentState = () => {
  paymentQRCode.value = null
  paymentStatus.value = null
  isCheckingPayment.value = false
  orderId.value = null
}

// 关闭对话框前的处理
const handleClose = () => {
  visible.value = false
}

// 组件卸载时清理
onUnmounted(() => {
  clearPaymentCheck()
})

// 处理免费计划的选择
const handleFreePlanSelection = () => {
  visible.value = false
  emit('payment-success')
  ElMessage.success('您已选择免费计划！')
}
</script>

<style scoped>
.payment-dialog {
  text-align: center;
}

.plan-info h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  color: #303133;
}

.plan-info .price {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #e53939;
}

.plan-info .duration {
  margin: 5px 0 0 0;
  font-size: 14px;
  color: #606266;
}

.plan-info .discount {
  color: #67c23a;
  margin-left: 10px;
}

.payment-qrcode {
  margin: 30px 0;
}

.qrcode-placeholder {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.qrcode-canvas {
  width: 200px;
  height: 200px;
  margin: 0 auto;
}

.qrcode-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #909399;
}

.scan-tip {
  margin: 15px 0 0 0;
  font-size: 14px;
  color: #606266;
}

.payment-status {
  margin: 20px 0;
}

.dialog-footer {
  text-align: right;
}
</style>
