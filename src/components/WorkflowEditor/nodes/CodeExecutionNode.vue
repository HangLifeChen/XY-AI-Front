<template>
  <div :class="['code-execution-node', { selected: selected }]">
    <div class="node-header">
      <el-icon><CoffeeCup /></el-icon>
      <span>代码执行</span>
      <el-tooltip v-if="!isConfigured" content="请配置代码" effect="dark">
        <el-icon class="warning-icon"><Warning /></el-icon>
      </el-tooltip>
    </div>
    <div class="node-content">
      <div class="property-item">
        <Handle type="target" :position="Position.Left" id="code" title="代码输入" />
        <Handle type="source" :position="Position.Right" id="code" title="代码输出" />
        <span class="property-label">语言</span>
        <span class="property-value">{{ nodeData?.language?.fieldValue || 'javascript' }}</span>
      </div>

      <div class="property-item">
        <span class="property-label">代码</span>
        <span class="property-value code-preview">{{ getCodePreview }}</span>
      </div>

      <div class="input-parameters">
        <div v-for="(param, index) in nodeData?.parameters || []" :key="index" class="param-item">
          <Handle
            type="target"
            :position="Position.Left"
            :id="`param-${param.fieldName}`"
            :title="`参数输入: ${param.fieldName}`"
          />
          <span class="param-name">{{ param.fieldName }}</span>
        </div>
      </div>

      <div class="output-item">
        <span class="output-label">执行结果</span>
        <Handle type="source" :position="Position.Right" id="result" title="执行结果输出" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CoffeeCup, Warning } from '@element-plus/icons-vue'
import { Handle, Position } from '@vue-flow/core'
import { computed } from 'vue'
import { type NodeProps, type CodeExecutionNodeData, FieldType } from '@/types/node'
import { createNodeValidator, useNode } from '@/composables/node'

const props = defineProps<NodeProps<CodeExecutionNodeData>>()

// 默认节点数据
const DEFAULT_NODE: CodeExecutionNodeData = {
  language: {
    fieldName: '编程语言',
    fieldValue: 'javascript',
    fieldDesc: '代码执行的编程语言',
    fieldType: FieldType.SELECT,
    list: false,
    options: ['javascript', 'python', 'bash'],
    show: true,
    required: true,
  },
  code: {
    fieldName: '执行代码',
    fieldValue: '// 在这里编写代码\nreturn "Hello, World!";',
    fieldDesc: '要执行的代码',
    fieldType: FieldType.TEXTAREA,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  parameters: {
    fieldName: '输入参数',
    fieldValue: [],
    fieldDesc: '代码执行的输入参数',
    fieldType: FieldType.DIV,
    list: true,
    options: [],
    show: true,
    required: false,
  },
}

// 创建节点验证器
const validateNode = createNodeValidator<CodeExecutionNodeData>([], (data) => {
  return { valid: true }
})

const { nodeData } = useNode(props, DEFAULT_NODE, validateNode)

// 计算节点是否已配置
const isConfigured = computed(() => {
  return !!nodeData.value?.code?.fieldValue
})

// 获取代码预览
const getCodePreview = computed(() => {
  try {
    const code = nodeData.value?.code?.fieldValue || ''
    if (!code) return '未设置代码'

    // 提取代码的前几行作为预览
    const lines = code.split('\n')
    if (lines.length > 3) {
      return lines.slice(0, 3).join('\n') + '\n...'
    }
    return code
  } catch (error) {
    console.error('Error in getCodePreview:', error)
    return '错误'
  }
})
</script>

<style scoped>
.code-execution-node {
  background: var(--el-bg-color);
  border: 2px solid var(--el-border-color);
  border-radius: 8px;
  min-width: 220px;
  max-width: 320px;
  font-size: 14px;
  color: var(--el-text-color-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.code-execution-node:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.code-execution-node.selected {
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
  min-width: 60px;
}

.property-value {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--el-color-success-light-9);
  font-size: 13px;
}

.property-value.code-preview {
  font-family: monospace;
  white-space: pre;
  max-height: 60px;
  overflow-y: auto;
}

.input-parameters {
  margin: 16px 0;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 12px;
}

.param-item {
  display: flex;
  align-items: center;
  margin: 8px 0;
  position: relative;
  padding-left: 15px;
}

.param-name {
  margin-left: 8px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.output-item {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  text-align: right;
  margin: 16px 0 8px;
  position: relative;
  padding-right: 15px;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 12px;
}

.output-label {
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-right: 8px;
  min-width: 80px;
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
</style>
