<template>
  <div :class="['tongyi-node', { selected: selected }]">
    <div class="node-header">
      <el-icon><ChatRound /></el-icon>
      <span>通义千问</span>
      <el-tooltip v-if="!nodeData?.prompt?.fieldValue" content="请配置提示词" effect="dark">
        <el-icon class="warning-icon"><Warning /></el-icon>
      </el-tooltip>
    </div>
    <div class="node-content">
      <div class="property-item">
        <Handle type="target" :position="Position.Left" id="prompt" :title="'提示词输入'" />
        <Handle type="source" :position="Position.Right" id="prompt" :title="'提示词输出'" />
        <span class="property-label">提示词</span>
      </div>
      <div class="property-item">
        <Handle type="target" :position="Position.Left" id="model" :title="'模型输入'" />
        <Handle type="source" :position="Position.Right" id="model" :title="'模型输出'" />
        <span class="property-label">模型</span>
      </div>
      <div class="property-item">
        <Handle
          type="target"
          :position="Position.Left"
          id="systemPrompt"
          :title="'系统提示词输入'"
        />
        <Handle
          type="source"
          :position="Position.Right"
          id="systemPrompt"
          :title="'系统提示词输出'"
        />
        <span class="property-label">系统提示词</span>
      </div>
      <div class="property-item">
        <Handle type="target" :position="Position.Left" id="temperature" :title="'温度输入'" />
        <Handle type="source" :position="Position.Right" id="temperature" :title="'温度输出'" />
        <span class="property-label">温度</span>
      </div>
      <div class="property-item">
        <Handle type="target" :position="Position.Left" id="systemPrompt" :title="'核采样输入'" />
        <Handle type="source" :position="Position.Right" id="systemPrompt" :title="'核采样输出'" />
        <span class="property-label">核采样</span>
      </div>

      <div class="property-item">
        <Handle
          type="target"
          :position="Position.Left"
          id="responseFormat"
          :title="'输出格式输入'"
        />
        <Handle
          type="source"
          :position="Position.Right"
          id="responseFormat"
          :title="'输出格式输出'"
        />
        <span class="property-label">输出格式</span>
      </div>
      <div class="property-item">
        <Handle type="target" :position="Position.Left" id="maxTokens" :title="'最大token数输入'" />
        <Handle
          type="source"
          :position="Position.Right"
          id="maxTokens"
          :title="'最大token数输出'"
        />
        <span class="property-label">最大token数</span>
      </div>
      <div class="output-item">
        <span class="output-label">输出</span>
        <Handle type="source" :position="Position.Right" id="output" :title="'生成结果'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChatRound, Warning } from '@element-plus/icons-vue'
import { Handle, Position } from '@vue-flow/core'
import { computed } from 'vue'
import { FieldType, type NodeProps, type TongyiNodeData } from '@/types/node'
import { createNodeValidator, useNode } from '@/composables/node'

const props = defineProps<NodeProps<TongyiNodeData>>()
// 默认节点数据
const DEFAULT_NODE: TongyiNodeData = {
  model: {
    fieldName: '模型',
    fieldValue: 'qweb3-32b',
    fieldDesc: '',
    fieldType: FieldType.SELECT,
    list: false,
    options: ['qweb3-32b'],
    show: true,
    required: true,
  },
  prompt: {
    fieldName: '提示词',
    fieldValue: '',
    fieldDesc: '',
    fieldType: FieldType.TEXTAREA,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  systemPrompt: {
    fieldName: '系统提示词',
    fieldValue: '',
    fieldDesc: '',
    fieldType: FieldType.TEXTAREA,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  temperature: {
    fieldName: '温度',
    fieldValue: 0.7,
    fieldDesc: '',
    fieldType: FieldType.INPUT_NUMBER,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  maxTokens: {
    fieldName: '最大token数',
    fieldValue: 10000,
    fieldDesc: '',
    fieldType: FieldType.INPUT_NUMBER,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  topP: {
    fieldName: '核采样',
    fieldValue: 0.95,
    fieldDesc: '',
    fieldType: FieldType.INPUT_NUMBER,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  responseFormat: {
    fieldName: '响应格式',
    fieldValue: 'text',
    fieldDesc: '',
    fieldType: FieldType.SELECT,
    list: false,
    options: ['text', 'json'],
    show: true,
    required: true,
  },
}

// 创建节点验证器
const validateNode = createNodeValidator<TongyiNodeData>([], (data) => {
  return { valid: true }
})

const { nodeData } = useNode(props, DEFAULT_NODE, validateNode)

// 计算节点是否已配置
const isConfigured = computed(() => {
  return !!nodeData.value?.prompt?.fieldValue
})

// 获取操作标签
const getOperationLabel = () => {
  if (!isConfigured.value) {
    return '请配置提示词'
  }
  return '通义千问'
}

// 获取提示词预览
const getPromptPreview = () => {
  try {
    const prompt = nodeData.value?.prompt?.fieldValue || ''
    if (!prompt) return '未设置提示词'

    // 如果提示词太长，截断显示
    if (prompt.length > 30) {
      return prompt.substring(0, 30) + '...'
    }
    return prompt
  } catch (error) {
    console.error('Error in getPromptPreview:', error)
    return '错误'
  }
}
</script>

<style scoped>
.tongyi-node {
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

.tongyi-node:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.tongyi-node.selected {
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
  padding-left: 15px; /* 为左侧连接点留出空间 */
}

.property-label {
  font-weight: 500;
  color: var(--el-text-color-secondary);
  margin-right: 8px;
  min-width: 80px;
}
.output-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0;
  position: relative;
}

.output-label {
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.operation-info {
  margin: 16px 0;
  padding: 8px;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.operation {
  font-weight: 500;
  padding: 4px 8px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary-dark-2);
  border-radius: 4px;
  margin-bottom: 8px;
  text-align: center;
}

.operation.not-configured {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning-dark-2);
}

.details {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.model-info {
  margin-bottom: 4px;
  padding: 2px 6px;
  background: var(--el-color-info-light-9);
  border-radius: 4px;
  display: inline-block;
}

.prompt-preview {
  padding: 4px 6px;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  margin-top: 4px;
  word-break: break-word;
  max-height: 60px;
  overflow-y: auto;
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
