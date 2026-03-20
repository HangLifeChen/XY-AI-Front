<template>
  <div :class="['call-agent-node', { selected: selected }]">
    <div class="node-header">
      <el-icon><Connection /></el-icon>
      <span>调用Agent</span>
    </div>
    <div class="node-content">
      <div class="field-item">
        <label class="field-label">目标Agent</label>
        <el-select
          v-model="nodeData.targetAgentId.fieldValue"
          placeholder="请选择目标Agent"
          size="small"
          class="field-input"
          @change="updateNodeData"
        >
          <el-option
            v-for="agent in availableAgents"
            :key="agent.id"
            :label="agent.name"
            :value="agent.id"
          />
        </el-select>
      </div>

      <div class="field-item">
        <label class="field-label">任务描述</label>
        <el-input
          v-model="nodeData.taskDescription.fieldValue"
          type="textarea"
          :rows="2"
          placeholder="请输入任务描述"
          size="small"
          class="field-input"
          @blur="updateNodeData"
        />
      </div>

      <div class="field-item">
        <label class="field-label">输出变量名</label>
        <el-input
          v-model="nodeData.outputVariable.fieldValue"
          placeholder="请输入输出变量名"
          size="small"
          class="field-input"
          @blur="updateNodeData"
        />
      </div>

      <div class="handles">
        <Handle type="target" :position="Position.Left" id="input" class="input-handle" />
        <Handle type="source" :position="Position.Right" id="output" class="output-handle" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { FieldType, type NodeProps } from '@/types/node'
import { createNodeValidator, useNode } from '@/composables/node'
import type { FieldData } from '@/types/node'
import { ElMessage } from 'element-plus'
import { Connection } from '@element-plus/icons-vue'
import { AgentService } from '@/api/agentService'

interface CallAgentNodeData {
  targetAgentId: FieldData
  taskDescription: FieldData
  outputVariable: FieldData
}

const props = defineProps<NodeProps<CallAgentNodeData>>()

// 可用的Agents
const availableAgents = ref([])

// 默认节点数据
const DEFAULT_NODE: CallAgentNodeData = {
  targetAgentId: {
    fieldName: '目标Agent',
    fieldValue: '',
    fieldDesc: '要调用的目标Agent',
    fieldType: FieldType.SELECT,
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
}

// 创建节点验证器
const validateNode = createNodeValidator<CallAgentNodeData>([], (data) => {
  if (!data.targetAgentId.fieldValue) {
    return { valid: false, message: '目标Agent不能为空' }
  }

  if (!data.taskDescription.fieldValue) {
    return { valid: false, message: '任务描述不能为空' }
  }

  if (!data.outputVariable.fieldValue) {
    return { valid: false, message: '输出变量名不能为空' }
  }

  return { valid: true }
})

const { nodeData, updateNode } = useNode(props, DEFAULT_NODE, validateNode)

// 更新节点数据
const updateNodeData = () => {
  updateNode(nodeData.value)
}

// 加载可用的Agents
const loadAvailableAgents = async () => {
  try {
    const response = await AgentService.getAgents()
    availableAgents.value = Array.isArray(response) ? response : response.list || []

    // 如果还没有选择目标Agent，且有Agent列表，则默认选择第一个
    if (!nodeData.value.targetAgentId.fieldValue && availableAgents.value.length > 0) {
      nodeData.value.targetAgentId.fieldValue = availableAgents.value[0].id
      updateNodeData()
    }
  } catch (error) {
    ElMessage.error('加载Agent列表失败')
    console.error('加载Agent列表失败:', error)
  }
}

onMounted(() => {
  loadAvailableAgents()
})
</script>

<style scoped>
.call-agent-node {
  background: var(--el-bg-color);
  border: 2px solid var(--el-border-color);
  border-radius: 8px;
  width: 280px;
  font-size: 14px;
  color: var(--el-text-color-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.call-agent-node:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.call-agent-node.selected {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
}

.node-header {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success-dark-2);
  padding: 8px 12px;
  border-radius: 6px 6px 0 0;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--el-border-color-light);
  position: relative;
}

.node-content {
  padding: 12px;
  position: relative;
  min-height: 60px;
}

.field-item {
  margin-bottom: 12px;
}

.field-label {
  display: block;
  margin-bottom: 4px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.field-input {
  width: 100%;
}

.handles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.handles :deep(.vue-flow__handle) {
  pointer-events: all;
  width: 8px;
  height: 8px;
  background: var(--el-color-primary);
  border: 2px solid var(--el-color-white);
  border-radius: 50%;
}

.input-handle {
  top: 50%;
  left: -4px;
  transform: translate(0, -50%);
}

.output-handle {
  top: 50%;
  right: -4px;
  transform: translate(0, -50%);
}
</style>
