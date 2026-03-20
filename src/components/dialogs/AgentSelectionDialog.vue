<template>
  <el-dialog v-model="dialogVisible" title="选择Agent" width="600px" :before-close="handleClose">
    <div class="agent-selection-dialog">
      <!-- 搜索框 -->
      <div class="search-section">
        <el-input v-model="searchQuery" placeholder="搜索Agent名称" clearable @input="handleSearch">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- Agent列表 -->
      <div class="agent-list" v-loading="loading">
        <el-table :data="filteredAgents" max-height="400" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="Agent名称" width="200">
            <template #default="{ row }">
              <div class="agent-info">
                <el-avatar :size="32" :src="row.icon || undefined" class="agent-avatar">
                  <el-icon :size="16"><Avatar /></el-icon>
                </el-avatar>
                <span class="agent-name">{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述">
            <template #default="{ row }">
              <span class="agent-description">
                {{ row.description || '暂无描述' }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="submitting"
          :disabled="selectedAgents.length === 0"
        >
          确认调用
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Avatar } from '@element-plus/icons-vue'
import type { Agent } from '@/types/agent'
import { AgentService } from '@/api/agentService'
import { AgentCommunicationService } from '@/api/agentCommunicationService'
import type { FormInstance } from 'element-plus'
import type { AgentMarket } from '@/types/a2a'
import { a2aService } from '@/api/a2aService'

const props = defineProps<{
  visible: boolean
  currentAgentId?: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'submit', agent: AgentMarket[]): void
  (e: 'cancel'): void
}>()

// --- 新增代码 Start ---

// 1. 创建一个本地的、可写的 ref，用于 v-model
const dialogVisible = ref(props.visible)

// 2. 监听 prop 的变化，同步到本地 ref (父组件 -> 子组件)
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal
  },
)

// 3. 监听本地 ref 的变化，通过 emit 通知父组件 (子组件 -> 父组件)
//    这样当用户点击 'x' 或按 ESC 关闭对话框时，父组件也能收到通知
watch(dialogVisible, (newVal) => {
  if (newVal !== props.visible) {
    emit('update:visible', newVal)
  }
})

// --- 新增代码 End ---

// 表单引用
const taskFormRef = ref<FormInstance>()

// 状态
const loading = ref(false)
const submitting = ref(false)
const searchQuery = ref('')
const agents = ref<AgentMarket[]>([])
const selectedAgents = ref<AgentMarket[]>([])

// 表单数据
const taskForm = ref({
  taskDescription: '',
})

// 过滤后的Agents
const filteredAgents = computed(() => {
  if (!searchQuery.value) {
    return agents.value
  }

  const query = searchQuery.value.toLowerCase()
  return agents.value.filter(
    (agent) =>
      agent.name.toLowerCase().includes(query) ||
      (agent.description && agent.description.toLowerCase().includes(query)),
  )
})

// 方法
const loadAgents = async () => {
  try {
    loading.value = true
    const response = await a2aService.listAgentMarkets()
    agents.value = Array.isArray(response) ? response : response.list || []
  } catch (error) {
    ElMessage.error('加载Agent列表失败')
    console.error('加载Agent列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // 搜索逻辑已在computed中实现
}

const handleClose = () => {
  dialogVisible.value = false
  emit('cancel')
  resetForm()
}

const resetForm = () => {
  searchQuery.value = ''
  selectedAgents.value = []
  taskForm.value.taskDescription = ''
  if (taskFormRef.value) {
    taskFormRef.value.resetFields()
  }
}

const handleSubmit = async () => {
  if (selectedAgents.value.length === 0) {
    ElMessage.warning('请至少选择一个Agent')
    return
  }

  if (!props.currentAgentId) {
    ElMessage.error('未指定当前Agent')
    return
  }

  try {
    submitting.value = true

    // 调用父组件传入的submit事件，传递选中的Agents
    emit('submit', selectedAgents.value)

    ElMessage.success('操作成功')
    handleClose()
  } catch (error) {
    console.error('处理Agent关联时出错:', error)
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const handleSelectionChange = (selection: AgentMarket[]) => {
  selectedAgents.value = selection
}

// 监听可见性变化
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal
    if (newVal) {
      loadAgents()
    }
  },
)

// 组件挂载时加载数据
onMounted(() => {
  if (props.visible) {
    loadAgents()
  }
})
</script>

<style scoped>
.agent-selection-dialog {
  padding: 10px 0;
}

.search-section {
  margin-bottom: 16px;
}

.agent-list {
  margin-bottom: 16px;
}

.agent-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.agent-avatar {
  background-color: var(--el-color-primary-light-9);
}

.agent-name {
  font-weight: 500;
}

.agent-description {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.task-input {
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-light);
}
</style>
