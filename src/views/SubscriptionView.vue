<template>
  <div class="subscription-container">
    <el-card class="subscription-card">
      <template #header>
        <div class="card-header">
          <span>订阅计划</span>
        </div>
      </template>

      <div class="current-plan" v-if="currentUserSubscription">
  
        <h3>当前订阅计划</h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="计划类型">{{ currentPlanName }}</el-descriptions-item>
          <el-descriptions-item label="开始日期">{{
            formatDate(currentUserSubscription.startDate)
          }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{
            formatDate(currentUserSubscription.endDate)
          }}</el-descriptions-item>
          <el-descriptions-item label="Agent数量">
            <div class="resource-item">
              <span
                >{{ currentUserSubscription.usedAgents }} /
                {{
                  currentUserSubscription.configs.maxAgents === -1
                    ? '无限制'
                    : currentUserSubscription.configs.maxAgents
                }}</span
              >
              <el-progress
                :percentage="
                  currentUserSubscription.configs.maxAgents === -1
                    ? 0
                    : Math.round(
                        (currentUserSubscription.usedAgents /
                          currentUserSubscription.configs.maxAgents) *
                          100,
                      )
                "
                :status="
                  getProgressStatus(
                    currentUserSubscription.usedAgents /
                      (currentUserSubscription.configs.maxAgents === -1
                        ? 100
                        : currentUserSubscription.configs.maxAgents),
                  )
                "
                :show-text="false"
                class="resource-progress"
              />
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="工作流数量">
            <div class="resource-item">
              <span
                >{{ currentUserSubscription.usedWorkflows }} /
                {{
                  currentUserSubscription.configs.maxWorkflows === -1
                    ? '无限制'
                    : currentUserSubscription.configs.maxWorkflows
                }}</span
              >
              <el-progress
                :percentage="
                  currentUserSubscription.configs.maxWorkflows === -1
                    ? 0
                    : Math.round(
                        (currentUserSubscription.usedWorkflows /
                          currentUserSubscription.configs.maxWorkflows) *
                          100,
                      )
                "
                :status="
                  getProgressStatus(
                    currentUserSubscription.usedWorkflows /
                      (currentUserSubscription.configs.maxWorkflows === -1
                        ? 100
                        : currentUserSubscription.configs.maxWorkflows),
                  )
                "
                :show-text="false"
                class="resource-progress"
              />
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="知识库容量">
            <div class="resource-item">
              <span
                >{{ formatSize(currentUserSubscription.usedKnowledgeBaseSize) }} /
                {{
                  currentUserSubscription.configs.maxKnowledgeBaseSize === -1
                    ? '无限制'
                    : formatSize(currentUserSubscription.configs.maxKnowledgeBaseSize)
                }}</span
              >
              <el-progress
                :percentage="
                  currentUserSubscription.configs.maxKnowledgeBaseSize === -1
                    ? 0
                    : Math.round(
                        (currentUserSubscription.usedKnowledgeBaseSize /
                          currentUserSubscription.configs.maxKnowledgeBaseSize) *
                          100,
                      )
                "
                :status="
                  getProgressStatus(
                    currentUserSubscription.usedKnowledgeBaseSize /
                      (currentUserSubscription.configs.maxKnowledgeBaseSize === -1
                        ? 100
                        : currentUserSubscription.configs.maxKnowledgeBaseSize),
                  )
                "
                :show-text="false"
                class="resource-progress"
              />
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <div class="plan-actions" v-if="currentUserSubscription.plan !== 'enterprise'">
          <el-button type="primary" @click="showUpgradeDialog = true">升级计划</el-button>
        </div>
      </div>

      <div class="no-plan" v-else>
        <h3>您当前使用的是免费版</h3>
        <el-button type="primary" @click="showUpgradeDialog = true">升级到付费版</el-button>
      </div>
    </el-card>

    <el-card class="plans-card">
      <template #header>
        <div class="card-header">
          <span>订阅计划</span>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="6" v-for="plan in paidPlans" :key="plan.id">
          <el-card
            class="plan-card"
            :class="{ 'active-plan': currentUserSubscription?.plan === plan.plan }"
          >
            <div class="plan-header">
              <h3>{{ plan.name }}</h3>
              <div class="plan-price">¥{{ plan.price / 100 }}<span>/月</span></div>
            </div>

            <ul class="plan-features">
              <li>
                <el-icon><User /></el-icon>
                <span
                  >最多
                  {{ plan.configs.maxAgents === -1 ? '无限制' : plan.configs.maxAgents }}
                  个Agent</span
                >
              </li>
              <li>
                <el-icon><Connection /></el-icon>
                <span
                  >最多
                  {{ plan.configs.maxWorkflows === -1 ? '无限制' : plan.configs.maxWorkflows }}
                  个工作流</span
                >
              </li>
              <li>
                <el-icon><Folder /></el-icon>
                <span
                  >{{
                    plan.configs.maxKnowledgeBaseSize === -1
                      ? '无限制'
                      : formatSize(plan.configs.maxKnowledgeBaseSize)
                  }}
                  知识库容量</span
                >
              </li>
            </ul>

            <el-button
              v-if="
                (!currentUserSubscription || plan.plan !== currentUserSubscription.plan) &&
                plan.plan !== 'free'
              "
              type="primary"
              @click="selectPlan(plan)"
              :disabled="isUpgrading"
            >
              {{ currentUserSubscription ? '升级到此计划' : '选择此计划' }}
            </el-button>

            <el-button v-else type="success" disabled>当前计划</el-button>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 升级对话框 -->
    <el-dialog v-model="showUpgradeDialog" title="选择订阅计划" width="30%">
      <el-form>
        <el-form-item label="选择计划">
          <el-select v-model="selectedPlan" placeholder="请选择订阅计划">
            <el-option
              v-for="plan in upgradePlans"
              :key="plan.id"
              :label="plan.name"
              :value="plan.plan"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="订阅时长">
          <el-radio-group v-model="selectedDuration">
            <el-radio label="month">月付 (1个月)</el-radio>
            <el-radio label="quarter">季付 (3个月)</el-radio>
            <el-radio label="year">年付 (12个月)</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="支付金额">
          <div class="price-display">
            <span class="price">¥{{ (calculatedPrice / 100).toFixed(2) }}</span>
            <span class="original-price" v-if="discount > 0"
              >原价: ¥{{ (originalPrice / 100).toFixed(2) }}</span
            >
            <span class="discount" v-if="discountInfo">{{ discountInfo }}</span>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUpgradeDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="confirmUpgrade"
            :loading="isUpgrading"
            :disabled="!selectedPlan"
          >
            确认升级
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 微信支付对话框 -->
    <WeChatPaymentDialog
      v-model="showPaymentDialog"
      :plan="selectedPlanDetail"
      :duration="selectedDuration"
      @payment-success="handlePaymentSuccess"
      @payment-cancel="handlePaymentCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import type { SubscriptionPlan, SubscriptionPlanConfigs } from '@/types/user'
import {
  getSubscriptionPlans,
  updateSubscription,
  cancelSubscription as apiCancelSubscription,
} from '@/api/subscriptionService'
import { User, Connection, Folder } from '@element-plus/icons-vue'
import WeChatPaymentDialog from '@/components/dialogs/WeChatPaymentDialog.vue'

const userStore = useUserStore()
const showUpgradeDialog = ref(false)
const showPaymentDialog = ref(false)
const selectedPlan = ref('')
const selectedDuration = ref('month') // month, quarter, year
const isUpgrading = ref(false)
const availablePlans = ref<SubscriptionPlanConfigs[]>([])

// 当前用户订阅信息
const currentUserSubscription = computed(() => userStore.userSubscription)

// 当前计划名称
const currentPlanName = computed(() => {
  if (!currentUserSubscription.value) return 'free'
  const plan = availablePlans.value.find((p) => p.plan === currentUserSubscription.value?.plan)
  return plan ? plan.name : "free"
})

// 可升级的计划（只显示更高级别的计划，并排除免费计划）
const upgradePlans = computed(() => {
  if (!currentUserSubscription.value) {
    return availablePlans.value.filter((plan) => plan.plan !== 'free')
  }

  const currentPlanIndex = availablePlans.value.findIndex(
    (p) => p.plan === currentUserSubscription.value?.plan,
  )
  return availablePlans.value.filter((plan, index) => index > currentPlanIndex)
})

// 付费计划（去除免费版）
const paidPlans = computed(() => {
  return availablePlans.value
})

// 选中的计划详情
const selectedPlanDetail = computed(() => {
  return availablePlans.value.find((plan) => plan.plan === selectedPlan.value) || null
})

// 原始价格（按月计算）
const originalPrice = computed(() => {
  if (!selectedPlanDetail.value) return 0
  const monthlyPrice = selectedPlanDetail.value.price

  switch (selectedDuration.value) {
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
  if (!selectedPlanDetail.value) return ''

  switch (selectedDuration.value) {
    case 'quarter':
      const quarterDiscount = selectedPlanDetail.value.quarterRate * 10
      return `${quarterDiscount.toFixed(0)}折`
    case 'year':
      const yearDiscount = selectedPlanDetail.value.yearRate * 10
      return `${yearDiscount.toFixed(0)}折`
    default:
      return ''
  }
})

// 折扣金额
const discount = computed(() => {
  if (!selectedPlanDetail.value) return 0

  switch (selectedDuration.value) {
    case 'quarter':
      // 季付折扣
      return parseFloat(
        (originalPrice.value * (1 - selectedPlanDetail.value.quarterRate)).toFixed(2),
      )
    case 'year':
      // 年付折扣
      return parseFloat((originalPrice.value * (1 - selectedPlanDetail.value.yearRate)).toFixed(2))
    default:
      return 0
  }
})

// 计算后的价格
const calculatedPrice = computed(() => {
  return parseFloat((originalPrice.value - discount.value).toFixed(2))
})

// 格式化状态显示
const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '活跃',
    inactive: '非活跃',
    cancelled: '已取消',
    expired: '已过期',
  }
  return statusMap[status] || status
}

// 格式化日期显示
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 格式化大小显示
const formatSize = (size: number) => {
  if (size < 1024) {
    return `${size} MB`
  } else {
    return `${(size / 1024).toFixed(2)} GB`
  }
}

// 获取进度条状态
const getProgressStatus = (ratio: number) => {
  if (ratio < 0.8) return '' // 默认状态
  if (ratio < 0.9) return 'warning' // 警告状态
  return 'exception' // 异常状态（红色）
}

// 选择计划
const selectPlan = (plan: SubscriptionPlanConfigs) => {
  selectedPlan.value = plan.plan
  showUpgradeDialog.value = true
}

// 确认升级
const confirmUpgrade = async () => {
  if (!selectedPlan.value) return

  // 关闭选择计划对话框
  showUpgradeDialog.value = false

  // 显示微信支付对话框
  showPaymentDialog.value = true
}

// 处理支付成功
const handlePaymentSuccess = async () => {
  try {
    // 支付成功后更新订阅
    await updateSubscription(selectedPlan.value as SubscriptionPlan)

    // 更新用户订阅信息
    await userStore.fetchSubscription()

    ElMessage.success('订阅计划更新成功')
    selectedPlan.value = ''
  } catch (error) {
    ElMessage.error('订阅计划更新失败: ' + (error as Error).message)
  }
}

// 处理支付取消
const handlePaymentCancel = () => {
  selectedPlan.value = ''
}

// 取消订阅
const cancelSubscription = () => {
  ElMessageBox.confirm('确定要取消当前订阅吗？取消后可能会失去部分功能。', '确认取消订阅', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const result = await apiCancelSubscription()
        if (result) {
          await userStore.fetchSubscription()
          ElMessage.success('订阅已取消')
        } else {
          ElMessage.error('取消订阅失败')
        }
      } catch (error) {
        ElMessage.error('取消订阅失败: ' + (error as Error).message)
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 获取可用计划
const fetchAvailablePlans = async () => {
  try {
    availablePlans.value = await getSubscriptionPlans()
  } catch (error) {
    ElMessage.error('获取订阅计划失败: ' + (error as Error).message)
  }
}

onMounted(() => {
  fetchAvailablePlans()
  // 获取当前用户的订阅信息
  userStore.fetchSubscription()
})
</script>

<style scoped>
.subscription-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.subscription-card,
.plans-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.current-plan h3,
.no-plan h3 {
  margin-top: 0;
}

.plan-actions {
  margin-top: 20px;
}

.plan-actions .el-button {
  margin-right: 10px;
}

.plan-card {
  height: 100%;
  text-align: center;
}

.plan-card.active-plan {
  border-color: #409eff;
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.2);
}

.plan-header h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.plan-price {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 20px;
}

.plan-price span {
  font-size: 14px;
  font-weight: normal;
  color: #909399;
}

.plan-features {
  list-style: none;
  padding: 0;
  text-align: left;
  margin-bottom: 20px;
}

.plan-features li {
  padding: 5px 0;
  display: flex;
  align-items: center;
}

.plan-features li .el-icon {
  margin-right: 10px;
  color: #409eff;
}

.dialog-footer {
  text-align: right;
}

.resource-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.resource-progress {
  width: 100%;
}

.price-display {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.price {
  font-size: 20px;
  font-weight: bold;
  color: #e53939;
}

.original-price {
  font-size: 14px;
  color: #909399;
  text-decoration: line-through;
}

.discount {
  font-size: 14px;
  color: #67c23a;
  font-weight: bold;
}
</style>
