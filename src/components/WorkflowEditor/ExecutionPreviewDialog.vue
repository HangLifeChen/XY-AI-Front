<template>
  <el-dialog
    v-model="dialogVisible"
    title="执行预览"
    width="60%"
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <div class="execution-preview">
      <div class="preview-header">
        <el-button-group>
          <el-button type="primary" @click="startExecution" :loading="isExecuting">
            <el-icon><VideoPlay /></el-icon>
            开始执行
          </el-button>
          <el-button @click="stopExecution" :disabled="!isExecuting">
            <el-icon><VideoPause /></el-icon>
            停止执行
          </el-button>
        </el-button-group>

        <el-select v-model="selectedMode" placeholder="选择执行模式" style="width: 150px">
          <el-option label="顺序执行" value="sequential" />
          <el-option label="并行执行" value="parallel" />
        </el-select>
      </div>

      <div class="execution-status">
        <div class="status-header">
          <span>执行状态</span>
          <el-tag :type="executionStatusType">{{ executionStatusText }}</el-tag>
        </div>

        <el-scrollbar height="300px">
          <div class="execution-logs">
            <div v-for="(log, index) in executionLogs" :key="index" class="log-item">
              <el-tag size="small" :type="log.type">{{ log.time }}</el-tag>
              <span :class="['log-content', `log-${log.type}`]">{{ log.message }}</span>
            </div>
          </div>
        </el-scrollbar>
      </div>

      <div class="node-status">
        <div class="status-header">
          <span>节点状态</span>
        </div>
        <el-scrollbar height="200px">
          <el-table :data="nodeStatusList" style="width: 100%">
            <el-table-column prop="name" label="节点名称" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="duration" label="执行时间" width="120" />
          </el-table>
        </el-scrollbar>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { VideoPlay, VideoPause } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useWorkflowStore } from '@/stores/workflow'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const workflowStore = useWorkflowStore()

// 对话框可见性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

// 执行状态
const isExecuting = ref(false)
const selectedMode = ref('sequential')
const executionLogs = ref<Array<{ time: string; type: string; message: string }>>([])
const nodeStatusList = ref<Array<{ name: string; status: string; duration: string }>>([])

// 执行状态计算属性
const executionStatusType = computed(() => {
  if (isExecuting.value) return 'primary'
  if (executionLogs.value.some((log) => log.type === 'error')) return 'danger'
  if (executionLogs.value.length > 0) return 'success'
  return 'info'
})

const executionStatusText = computed(() => {
  if (isExecuting.value) return '执行中'
  if (executionLogs.value.some((log) => log.type === 'error')) return '执行失败'
  if (executionLogs.value.length > 0) return '执行完成'
  return '未执行'
})

// 开始执行
const startExecution = async () => {
  if (workflowStore.nodes.length === 0) {
    ElMessage.warning('工作流中没有可执行的节点')
    return
  }

  isExecuting.value = true
  executionLogs.value = []
  nodeStatusList.value = []

  // 初始化节点状态列表
  workflowStore.nodes.forEach((node) => {
    nodeStatusList.value.push({
      name: node.data.label || node.id,
      status: '等待中',
      duration: '-',
    })
  })

  // 添加开始执行日志
  addLog('info', '开始执行工作流')

  try {
    // 模拟节点执行
    for (const node of workflowStore.nodes) {
      const nodeIndex = nodeStatusList.value.findIndex(
        (n) => n.name === (node.data.label || node.id),
      )

      // 更新节点状态为执行中
      if (nodeIndex !== -1) {
        nodeStatusList.value[nodeIndex].status = '执行中'
      }

      addLog('info', `开始执行节点: ${node.data.label || node.id}`)

      // 模拟节点执行时间
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 随机成功或失败
      if (Math.random() > 0.2) {
        addLog('success', `节点 ${node.data.label || node.id} 执行成功`)
        if (nodeIndex !== -1) {
          nodeStatusList.value[nodeIndex].status = '已完成'
          nodeStatusList.value[nodeIndex].duration = '1s'
        }
      } else {
        addLog('error', `节点 ${node.data.label || node.id} 执行失败`)
        if (nodeIndex !== -1) {
          nodeStatusList.value[nodeIndex].status = '失败'
          nodeStatusList.value[nodeIndex].duration = '1s'
        }
        throw new Error(`节点 ${node.data.label || node.id} 执行失败`)
      }
    }

    addLog('success', '工作流执行完成')
  } catch (error) {
    addLog('error', error instanceof Error ? error.message : '工作流执行出错')
  } finally {
    isExecuting.value = false
  }
}

// 停止执行
const stopExecution = () => {
  isExecuting.value = false
  addLog('warning', '手动停止执行')
}

// 添加日志
const addLog = (type: string, message: string) => {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  executionLogs.value.push({ time, type, message })
}

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case '执行中':
      return 'primary'
    case '已完成':
      return 'success'
    case '失败':
      return 'danger'
    default:
      return 'info'
  }
}

// 关闭对话框
const handleClose = () => {
  if (isExecuting.value) {
    ElMessage.warning('请先停止执行')
    return
  }
  dialogVisible.value = false
}
</script>

<style scoped>
.execution-preview {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 10px;
}

.execution-logs {
  padding: 10px;
}

.log-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  font-family: monospace;
}

.log-content {
  white-space: pre-wrap;
  word-break: break-all;
}

.log-error {
  color: #f56c6c;
}

.log-success {
  color: #67c23a;
}

.log-warning {
  color: #e6a23c;
}

.node-status {
  border-top: 1px solid #dcdfe6;
  padding-top: 20px;
}

:deep(.el-table) {
  --el-table-border-color: var(--el-border-color-lighter);
  --el-table-border: 1px solid var(--el-table-border-color);
  --el-table-text-color: var(--el-text-color-regular);
  --el-table-header-text-color: var(--el-text-color-secondary);
  --el-table-row-hover-bg-color: var(--el-fill-color-light);
  --el-table-current-row-bg-color: var(--el-fill-color-lighter);
  --el-table-header-bg-color: var(--el-fill-color-light);
  --el-table-fixed-box-shadow: var(--el-box-shadow-light);
  --el-table-bg-color: var(--el-fill-color-blank);
  --el-table-tr-bg-color: var(--el-fill-color-blank);
  --el-table-expanded-cell-bg-color: var(--el-fill-color-blank);
}
</style>
