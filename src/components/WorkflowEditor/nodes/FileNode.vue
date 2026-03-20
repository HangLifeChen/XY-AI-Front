<template>
  <div :class="['file-node', { selected: selected }]">
    <div class="node-header">
      <el-icon><Files /></el-icon>
      <span>文件操作</span>
      <el-tooltip v-if="!hasFilePath" content="请配置文件路径" effect="dark">
        <el-icon class="warning-icon"><Warning /></el-icon>
      </el-tooltip>
    </div>
    <div class="node-content">
      <div class="input-item">
        <Handle type="target" :position="Position.Left" id="input" title="文件输入" />
        <span class="input-label">输入</span>
      </div>

      <div class="operation-info">
        <div
          class="operation"
          :class="{ 'not-configured': !isOperationConfigured }"
          :title="operationLabel"
        >
          {{ operationLabel }}
        </div>
        <div class="file-path" :title="filePathDisplay">
          {{ filePathDisplay }}
        </div>
      </div>

      <div class="output-item">
        <span class="output-label">输出</span>
        <Handle type="source" :position="Position.Right" id="output" title="文件输出" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Files, Warning } from '@element-plus/icons-vue'
import { Handle, Position } from '@vue-flow/core'
import { ref, watch, onMounted, computed } from 'vue'
import type { NodeProps } from '@/types/node'
import { createNodeValidator, useNode } from '@/composables/node'
import type { FileNodeData } from '@/types/node'
import { FieldType } from '@/types/node'

const props = defineProps<NodeProps<FileNodeData>>()

// 默认节点数据
const DEFAULT_NODE: FileNodeData = {
  filePath: {
    fieldName: '文件路径',
    fieldValue: '',
    fieldDesc: '要操作的文件路径',
    fieldType: FieldType.TEXT,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  operation: {
    fieldName: '操作类型',
    fieldValue: 'read',
    fieldDesc: '文件操作类型',
    fieldType: FieldType.SELECT,
    list: false,
    options: ['read', 'write', 'append', 'delete'],
    show: true,
    required: true,
  },
  content: {
    fieldName: '文件内容',
    fieldValue: '',
    fieldDesc: '写入文件的内容',
    fieldType: FieldType.TEXTAREA,
    list: false,
    options: [],
    show: true,
    required: false,
  },
}

// 创建节点验证器
const validateNode = createNodeValidator<FileNodeData>([], (data) => {
  if (!data.filePath.fieldValue) {
    return { valid: false, message: '文件路径不能为空' }
  }
  return { valid: true }
})

const { nodeData } = useNode(props, DEFAULT_NODE, validateNode)

// 1. 定义静态映射表 (Map)，避免在 switch case 中反复执行逻辑
const OPERATION_MAP: Record<string, string> = {
  read: '读取文件',
  write: '写入文件',
  append: '追加文件',
  delete: '删除文件',
}

// 2. 使用 computed 获取标签
// 只有当 operation.fieldValue 真正改变时才会重新计算
const operationLabel = computed(() => {
  const op = nodeData.value?.operation?.fieldValue
  if (!op) return '未配置操作'
  return OPERATION_MAP[op] || '未配置操作'
})

// 3. 辅助 computed，简化模板逻辑
const isOperationConfigured = computed(() => {
  return !!nodeData.value?.operation?.fieldValue
})

const hasFilePath = computed(() => {
  return !!nodeData.value?.filePath?.fieldValue
})

const filePathDisplay = computed(() => {
  return nodeData.value?.filePath?.fieldValue || '未设置文件路径'
})

// 获取操作标签
const getOperationLabel = (operation?: string) => {
  switch (operation) {
    case 'read':
      return '读取文件'
    case 'write':
      return '写入文件'
    case 'append':
      return '追加文件'
    case 'delete':
      return '删除文件'
    default:
      return '未配置操作'
  }
}

// 组件挂载时记录初始状态
onMounted(() => {})
</script>

<style scoped>
.file-node {
  background: var(--el-bg-color);
  border: 2px solid var(--el-border-color);
  border-radius: 8px;
  min-width: 180px;
  max-width: 250px;
  font-size: 14px;
  color: var(--el-text-color-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.file-node:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.file-node.selected {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
}

.node-header {
  background: var(--el-color-info-light-9);
  color: var(--el-color-info-dark-2);
  padding: 8px 12px;
  border-radius: 6px 6px 0 0;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--el-border-color-light);
  position: relative;
}

.warning-icon {
  color: var(--el-color-warning);
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}

.node-content {
  padding: 12px;
  position: relative;
  min-height: 80px;
}

.input-item,
.output-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0;
  position: relative;
  padding-left: 15px;
  padding-right: 15px;
}

.input-label,
.output-label {
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin: 0 8px;
  min-width: 60px;
}

.operation-info {
  text-align: center;
  margin: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.file-path {
  font-size: 12px;
  color: var(--el-text-color-regular);
  padding: 6px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  max-height: 60px;
  overflow-y: auto;
  word-break: break-word;
  text-align: left;
}

.operation {
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--el-color-info-light-9);
}

.operation.not-configured {
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
}

:deep(.vue-flow__handle) {
  width: 10px;
  height: 10px;
  background: var(--el-color-info-light-5);
  border: 2px solid var(--el-border-color-darker);
  transition: all 0.2s ease;
}

:deep(.vue-flow__handle:hover) {
  background: var(--el-color-primary-light-5);
  border-color: var(--el-color-primary);
  transform: scale(1.2);
}

:deep(.vue-flow__handle-left) {
  left: -5px;
}

:deep(.vue-flow__handle-right) {
  right: -5px;
}

@media (max-width: 768px) {
  .file-node {
    min-width: 160px;
    max-width: 220px;
  }
}
</style>