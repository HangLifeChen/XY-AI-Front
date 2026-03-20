<template>
  <el-card class="execution-panel">
    <template #header>
      <div class="panel-header">
        <div class="header-title">
          <span>执行预览</span>
          <el-tag v-if="isExecuting" type="warning" size="small">
            <el-icon><Timer /></el-icon>
            {{ executionTime }}s
          </el-tag>
        </div>
        <div class="header-actions">
          <el-button
            v-if="executionLogs.length > 0"
            type="info"
            size="small"
            plain
            @click="executionLogs = []"
          >
            清除
          </el-button>
          <el-button type="primary" size="small" @click="executeWorkflow" :loading="isExecuting">
            {{ isExecuting ? '执行中' : '执行' }}
          </el-button>
        </div>
      </div>
    </template>

    <div class="execution-log">
      <el-empty v-if="executionLogs.length === 0" description="暂无执行日志" :image-size="60" />
      <div
        v-else
        v-for="(log, index) in executionLogs"
        :key="index"
        class="log-item"
        :class="[log.type, { 'node-log': log.nodeId }]"
      >
        <div class="log-icon">
          <el-icon v-if="log.type === 'success'">
            <CircleCheck />
          </el-icon>
          <el-icon v-else-if="log.type === 'error'">
            <CircleClose />
          </el-icon>
          <el-icon v-else-if="log.type === 'info'">
            <Loading v-if="isExecuting && index === executionLogs.length - 1" class="is-loading" />
            <Timer v-else />
          </el-icon>
        </div>
        <div class="log-content">
          <div class="log-message">{{ log.message }}</div>
          <div class="log-time">{{ formatTime(log.timestamp) }}</div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import { CircleCheck, CircleClose, Loading, Timer } from '@element-plus/icons-vue'
import { useWorkflowStore } from '@/stores/workflow'
import { ref, computed, nextTick } from 'vue'
import { WorkflowExecutor } from '@/utils/WorkflowExecutor'
import type { ExecutionLog, NodeStatus } from '@/types/workflow'
import { ElMessage } from 'element-plus'

const workflowStore = useWorkflowStore()
const executionLogs = ref<ExecutionLog[]>([])
const isExecuting = ref(false)
const startTime = ref<number>(0)

const executionTime = computed(() => {
  if (!startTime.value || !isExecuting.value) return 0
  return Math.floor((Date.now() - startTime.value) / 1000)
})

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

const updateNodeStatus = (nodeId: string, status: 'running' | 'completed' | 'error') => {
  workflowStore.updateNodeStatus(nodeId, status)
}

const addLog = (log: ExecutionLog) => {
  executionLogs.value.push(log)
  // 自动滚动到最新日志
  nextTick(() => {
    const logContainer = document.querySelector('.execution-log')
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight
    }
  })
}

const executeWorkflow = async () => {
  if (!workflowStore.nodes.length) {
    ElMessage.warning('工作流为空，请先添加节点')
    return
  }

  isExecuting.value = true
  executionLogs.value = []
  startTime.value = Date.now()

  try {
    // 重置所有节点状态
    workflowStore.nodes.forEach((node) => {
      workflowStore.updateNodeStatus(node.id, undefined)
    })

    const executor = new WorkflowExecutor(
      workflowStore.nodes,
      workflowStore.edges,
      updateNodeStatus,
      addLog,
    )

    await executor.execute()
  } catch (error) {
    ElMessage.error(`工作流执行失败: ${error}`)
  } finally {
    isExecuting.value = false
  }
}
</script>

<style scoped>
.execution-panel {
  position: absolute;
  left: 20px;
  bottom: 20px;
  width: 400px;
  max-height: 400px;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.execution-panel:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.execution-panel :deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.execution-panel :deep(.el-card__body) {
  padding: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.execution-log {
  overflow-y: auto;
  max-height: 320px;
  padding: 8px;
  scrollbar-width: thin;
  scrollbar-color: var(--el-border-color) transparent;
}

.execution-log::-webkit-scrollbar {
  width: 4px;
}

.execution-log::-webkit-scrollbar-track {
  background: transparent;
}

.execution-log::-webkit-scrollbar-thumb {
  background-color: var(--el-border-color);
  border-radius: 2px;
}

.log-item {
  padding: 8px 12px;
  margin-bottom: 6px;
  border-radius: 4px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background-color: var(--el-fill-color-light);
  transition: all 0.3s ease;
  animation: fadeIn 0.3s ease;
}

.log-icon {
  padding-top: 2px;
}

.log-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

.log-message {
  flex: 1;
  word-break: break-word;
  line-height: 1.4;
}

.log-time {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  white-space: nowrap;
}

.log-item.success {
  color: var(--el-color-success);
  background-color: var(--el-color-success-light-9);
  border-left: 3px solid var(--el-color-success);
}

.log-item.error {
  color: var(--el-color-error);
  background-color: var(--el-color-error-light-9);
  border-left: 3px solid var(--el-color-error);
}

.log-item.info {
  color: var(--el-color-info);
  background-color: var(--el-color-info-light-9);
  border-left: 3px solid var(--el-color-info);
}

.node-log {
  margin-left: 16px;
  font-size: 0.95em;
}

.is-loading {
  animation: rotate 1s linear infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

:deep(.el-empty) {
  padding: 32px 0;
}

:deep(.el-tag) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

:deep(.el-button) {
  padding: 6px 12px;
}
</style>
