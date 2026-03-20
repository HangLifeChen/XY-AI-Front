<template>
  <div :class="['condition-node', { selected: selected }]">
    <div class="node-header">
      <el-icon><Share /></el-icon>
      <span>条件判断</span>
      <el-tooltip v-if="!nodeData?.condition?.fieldValue" content="请配置条件表达式" effect="dark">
        <el-icon class="warning-icon"><Warning /></el-icon>
      </el-tooltip>
    </div>
    <div class="node-content">
      <div class="property-item">
        <Handle type="target" :position="Position.Left" id="input" title="条件输入" />
        <span class="property-label">输入</span>
      </div>

      <div class="condition-expression">
        <div class="expression-label">条件表达式</div>
        <div class="expression-content">
          {{ getConditionPreview }}
        </div>
      </div>

      <div class="outputs">
        <div class="output-item true-branch">
          <span class="output-label">为真</span>
          <Handle type="source" :position="Position.Right" id="true" title="条件为真时的输出" />
        </div>
        <div class="output-item false-branch">
          <span class="output-label">为假</span>
          <Handle type="source" :position="Position.Right" id="false" title="条件为假时的输出" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Share, Warning } from '@element-plus/icons-vue'
import { Handle, Position } from '@vue-flow/core'
import { computed } from 'vue'
import { type NodeProps, type ConditionNodeData, FieldType } from '@/types/node'
import { createNodeValidator, useNode } from '@/composables/node'

const props = defineProps<NodeProps<ConditionNodeData>>()

// 默认节点数据
const DEFAULT_NODE: ConditionNodeData = {
  condition: {
    fieldName: '条件表达式',
    fieldValue: '',
    fieldDesc: '条件判断表达式，如: {{.变量名}} > 10',
    fieldType: FieldType.TEXTAREA,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  trueBranch: {
    fieldName: '为真时的分支',
    fieldValue: 'true',
    fieldDesc: '条件为真时执行的分支',
    fieldType: FieldType.DIV,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  falseBranch: {
    fieldName: '为假时的分支',
    fieldValue: 'false',
    fieldDesc: '条件为假时执行的分支',
    fieldType: FieldType.DIV,
    list: false,
    options: [],
    show: true,
    required: true,
  },
}

// 创建节点验证器
const validateNode = createNodeValidator<ConditionNodeData>([], (data) => {
  return { valid: true }
})

const { nodeData } = useNode(props, DEFAULT_NODE, validateNode)

// 获取条件表达式预览
const getConditionPreview = computed(() => {
  try {
    const condition = nodeData.value?.condition?.fieldValue || ''
    if (!condition) return '未设置条件表达式'

    // 如果条件表达式太长，截断显示
    if (condition.length > 30) {
      return condition.substring(0, 30) + '...'
    }
    return condition
  } catch (error) {
    console.error('Error in getConditionPreview:', error)
    return '错误'
  }
})
</script>

<style scoped>
.condition-node {
  background: var(--el-bg-color);
  border: 2px solid var(--el-border-color);
  border-radius: 8px;
  min-width: 200px;
  max-width: 300px;
  font-size: 14px;
  color: var(--el-text-color-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.condition-node:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.condition-node.selected {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
}

.node-header {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning-dark-2);
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
  min-height: 60px;
}

.property-item {
  display: flex;
  align-items: center;
  margin: 12px 0;
  position: relative;
  padding-left: 15px;
}

.property-label {
  font-weight: 500;
  color: var(--el-text-color-secondary);
  margin-right: 8px;
  min-width: 80px;
}

.condition-expression {
  margin: 16px 0;
  padding: 8px;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.expression-label {
  font-weight: 500;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin-bottom: 4px;
}

.expression-content {
  font-family: monospace;
  font-size: 13px;
  color: var(--el-color-primary);
  word-break: break-all;
  padding: 4px;
  background: var(--el-color-white);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 2px;
}

.outputs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.output-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding-right: 15px;
}

.output-item.true-branch .output-label {
  color: var(--el-color-success);
}

.output-item.false-branch .output-label {
  color: var(--el-color-danger);
}

.output-label {
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

:deep(.vue-flow__handle) {
  width: 10px;
  height: 10px;
  background: var(--el-color-info-light-5);
  border: 2px solid var(--el-border-color-darker);
}

:deep(.vue-flow__handle:hover) {
  background: var(--el-color-primary-light-5);
  border-color: var(--el-color-primary);
  transform: scale(1.2);
}
</style>
