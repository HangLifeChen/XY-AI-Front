<template>
  <div class="workflow-status" :class="status">
    <el-icon :class="iconClass"><component :is="statusIcon" /></el-icon>
    <span class="status-text">{{ statusText }}</span>
    <el-progress
      v-if="status === 'running'"
      :percentage="progress"
      :stroke-width="2"
      :show-text="false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CircleClose, SuccessFilled, Loading } from '@element-plus/icons-vue'

const props = defineProps<{
  status: 'idle' | 'running' | 'success' | 'error'
  progress?: number
  message?: string
}>()

const statusIcon = computed(() => {
  switch (props.status) {
    case 'success':
      return SuccessFilled
    case 'error':
      return CircleClose
    case 'running':
      return Loading
    default:
      return null
  }
})

const statusText = computed(() => {
  return (
    props.message ||
    {
      idle: '就绪',
      running: '执行中...',
      success: '执行成功',
      error: '执行失败',
    }[props.status]
  )
})

const iconClass = computed(() => ({
  'success-icon': props.status === 'success',
  'error-icon': props.status === 'error',
  'loading-icon': props.status === 'running',
}))
</script>

<style scoped>
.workflow-status {
  padding: 8px 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.success-icon {
  color: var(--el-color-success);
}
.error-icon {
  color: var(--el-color-danger);
}
.loading-icon {
  animation: rotate 2s linear infinite;
}

.status-text {
  margin-right: 12px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
