<template>
  <div class="call-agent-properties">
    <el-form label-position="top">
      <!-- 目标Agent -->
      <el-form-item label="目标Agent" required>
        <el-select
          v-model="localData.targetAgentId.fieldValue"
          placeholder="请选择目标Agent"
          style="width: 100%"
          @change="updateNodeData"
        >
          <el-option
            v-for="agent in availableAgents"
            :key="agent.id"
            :label="agent.name"
            :value="agent.id"
          />
        </el-select>
        <div class="field-description">要调用的目标Agent</div>
      </el-form-item>

      <!-- 任务描述 -->
      <el-form-item label="任务描述" required>
        <el-input
          v-model="localData.taskDescription.fieldValue"
          type="textarea"
          :rows="3"
          placeholder="请输入任务描述"
          @input="updateNodeData"
        />
        <div class="field-description">发送给目标Agent的任务描述</div>
      </el-form-item>

      <!-- 输出变量名 -->
      <el-form-item label="输出变量名" required>
        <el-input
          v-model="localData.outputVariable.fieldValue"
          placeholder="请输入输出变量名"
          @input="updateNodeData"
        />
        <div class="field-description">存储结果的变量名</div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, onMounted, ref } from 'vue'
import { FieldType, type NodeProps } from '@/types/node'
import type { CallAgentNodeData } from '@/types/node'
import { AgentService } from '@/api/agentService'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  node: NodeProps<CallAgentNodeData>
}>()

const emit = defineEmits<{
  (e: 'update:node', node: NodeProps<CallAgentNodeData>): void
}>()

// 可用的Agents
const availableAgents = ref([])

// 创建本地响应式数据
const localData = reactive<CallAgentNodeData>({
  targetAgentId: {
    fieldName: '目标Agent',
    fieldValue: '',
    fieldDesc: '要调用的目标Agent',
    fieldType: FieldType.TEXT,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  taskDescription: {
    fieldName: '任务描述',
    fieldValue: '',
    fieldDesc: '发送给目标Agent的任务描述',
    fieldType: FieldType.TEXTAREA,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  outputVariable: {
    fieldName: '输出变量名',
    fieldValue: 'agent_result',
    fieldDesc: '存储结果的变量名',
    fieldType: FieldType.TEXT,
    list: false,
    options: [],
    show: true,
    required: true,
  },
})

// 初始化本地数据
onMounted(() => {
  if (props.node.data) {
    Object.assign(localData, props.node.data)
  }
  loadAvailableAgents()
})

// 加载可用的Agents
const loadAvailableAgents = async () => {
  try {
    const response = await AgentService.getAgents()
    availableAgents.value = Array.isArray(response) ? response : response.list || []

    // 如果还没有选择目标Agent，且有Agent列表，则默认选择第一个
    if (!localData.targetAgentId.fieldValue && availableAgents.value.length > 0) {
      localData.targetAgentId.fieldValue = availableAgents.value[0].id
      updateNodeData()
    }
  } catch (error) {
    ElMessage.error('加载Agent列表失败')
    console.error('加载Agent列表失败:', error)
  }
}

// 更新节点数据
const updateNodeData = () => {
  if (props.node.id) {
    props.node.data = { ...localData }
    const updatedNode = { ...props.node }
    emit('update:node', updatedNode)
  }
}

// 监听节点数据变化
watch(
  () => props.node.data,
  (newData) => {
    if (newData) {
      Object.assign(localData, newData)
    }
  },
  { deep: true },
)
</script>

<style scoped>
.call-agent-properties {
  padding: 16px;
}

.field-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.4;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-input-number .el-input__wrapper) {
  padding-left: 11px;
  padding-right: 11px;
}

:deep(.el-select .el-input__wrapper) {
  padding-left: 11px;
  padding-right: 11px;
}

:deep(.el-form-item__label) {
  padding-bottom: 4px;
  font-weight: 500;
}

:deep(.el-textarea__inner) {
  font-family: var(--el-font-family);
}

:deep(.el-input-number.is-controls-right .el-input-number__decrease),
:deep(.el-input-number.is-controls-right .el-input-number__increase) {
  background-color: var(--el-fill-color-light);
}
</style>
