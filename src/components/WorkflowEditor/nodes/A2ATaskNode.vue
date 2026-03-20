<template>
  <div :class="['a2a-node', { selected: selected }]">
    <div class="node-header">
      <el-icon><Connection /></el-icon>
      <span>A2A任务</span>
    </div>
    <div class="node-content">
      <div class="field-item">
        <label class="field-label">目标端点</label>
        <el-input
          v-model="nodeData.endpoint.fieldValue"
          placeholder="请输入A2A端点URL"
          size="small"
          class="field-input"
          @blur="updateNodeData"
        />
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
        <label class="field-label">输入变量</label>
        <div
          v-for="(variable, index) in nodeData.inputVariables"
          :key="index"
          class="variable-item"
        >
          <el-input
            v-model="variable.name"
            placeholder="变量名"
            size="small"
            class="variable-name"
            @blur="updateNodeData"
          />
          <el-input
            v-model="variable.value"
            placeholder="变量值"
            size="small"
            class="variable-value"
            @blur="updateNodeData"
          />
          <el-button
            type="danger"
            icon="Delete"
            size="small"
            circle
            @click="removeVariable(index)"
          />
        </div>
        <el-button
          type="primary"
          icon="Plus"
          size="small"
          class="add-variable-btn"
          @click="addVariable"
        >
          添加变量
        </el-button>
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

interface A2ATaskNodeData {
  endpoint: FieldData
  taskDescription: FieldData
  inputVariables: Array<{ name: string; value: string }>
  output: any
}

const props = defineProps<NodeProps<A2ATaskNodeData>>()

// 默认节点数据
const DEFAULT_NODE: A2ATaskNodeData = {
  endpoint: {
    fieldName: '目标端点',
    fieldValue: '',
    fieldDesc: 'A2A智能体的端点URL',
    fieldType: FieldType.TEXT,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  taskDescription: {
    fieldName: '任务描述',
    fieldValue: '',
    fieldDesc: '发送给A2A智能体的任务描述',
    fieldType: FieldType.TEXTAREA,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  inputVariables: [],
  output: null,
}

// 创建节点验证器
const validateNode = createNodeValidator<A2ATaskNodeData>([], (data) => {
  if (!data.endpoint.fieldValue) {
    return { valid: false, message: '目标端点不能为空' }
  }

  if (!data.taskDescription.fieldValue) {
    return { valid: false, message: '任务描述不能为空' }
  }

  return { valid: true }
})

const { nodeData, updateNode } = useNode(props, DEFAULT_NODE, validateNode)

// 添加变量
const addVariable = () => {
  nodeData.value.inputVariables.push({
    name: '',
    value: '',
  })
  updateNodeData()
}

// 删除变量
const removeVariable = (index: number) => {
  nodeData.value.inputVariables.splice(index, 1)
  updateNodeData()
}

// 更新节点数据
const updateNodeData = () => {
  updateNode(nodeData.value)
}

onMounted(() => {
  // 初始化节点数据
  if (!nodeData.value.inputVariables) {
    nodeData.value.inputVariables = []
  }
})
</script>

<style scoped>
.a2a-node {
  background: var(--el-bg-color);
  border: 2px solid var(--el-border-color);
  border-radius: 8px;
  width: 280px;
  font-size: 14px;
  color: var(--el-text-color-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.a2a-node:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.a2a-node.selected {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
}

.node-header {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary-dark-2);
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

.variable-item {
  display: flex;
  gap: 4px;
  margin-bottom: 6px;
  align-items: center;
}

.variable-name,
.variable-value {
  flex: 1;
}

.add-variable-btn {
  width: 100%;
  margin-top: 4px;
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
