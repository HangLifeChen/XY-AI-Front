<template>
  <div :class="['text-combine-node', { selected: selected }]">
    <div class="node-header">
      <!-- 通用输入Handle，用于StartNode连接 -->
      <Handle
        type="target"
        :position="Position.Left"
        id="only_textCombine_trigger"
        title="触发输入"
        style="top: 20px"
      />
      <el-icon><Document /></el-icon>
      <span>文本合成</span>
      <el-tooltip v-if="!nodeData?.template" content="请配置模板" effect="dark">
        <el-icon class="warning-icon"><Warning /></el-icon>
      </el-tooltip>
    </div>
    <div class="node-content">
      <div class="variables-container">
        <div
          v-for="variable in nodeData?.variables || []"
          :key="variable.fieldName"
          class="variable-input"
        >
          <Handle
            type="target"
            :position="Position.Left"
            :id="`${variable.fieldName}`"
            :title="`变量输入: ${variable.fieldName}`"
          />
          <Handle
            type="source"
            :position="Position.Right"
            :id="`${variable.fieldName}`"
            :title="`变量输出: ${variable.fieldName}`"
          />
          <span class="variable-name">{{ variable.fieldName }}</span>
        </div>
      </div>

      <div class="operation-info">
        <div class="operation" title="模板文本合成">模板文本合成</div>
        <div class="template-preview" :title="nodeData?.template.fieldValue || '未设置模板'">
          {{ getTemplatePreview }}
        </div>
      </div>
      <div class="output-item">
        <span class="output-label">输出</span>
        <Handle type="source" :position="Position.Right" :id="output" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Document } from '@element-plus/icons-vue'
import { Handle, Position } from '@vue-flow/core'
import { computed } from 'vue'

const output = 'output'
const props = defineProps<NodeProps<TextCombineNodeData>>()

import { watch, onMounted, ref } from 'vue'

// 默认节点数据
const DEFAULT_NODE: TextCombineNodeData = {
  template: {
    fieldValue: '这是一个模板，可以包含变量如 {{.变量1}} 和 {{.变量2}}',
    fieldType: 'textarea',
    fieldDesc: '在这里写模版，只支持golang模版语法',
    list: false,
    fieldName: '模版',
    options: [],
    show: true,
    required: true,
  },
  variables: [],
}
// 创建节点验证器
const validateNode = createNodeValidator<TextCombineNodeData>([], (data) => {
  return { valid: true }
})

const { nodeData } = useNode(props, DEFAULT_NODE, validateNode)

// 监听节点数据的具体字段变化
watch(
  () => props?.data,
  (newData, oldData) => {
    if (newData && oldData) {
      console.log('TextCombineNode data changed:')

      // 检查具体哪些字段发生了变化
      const fields = ['combineMode', 'inputCount', 'separator', 'outputVar']
      fields.forEach((field) => {})
    }
  },
  { deep: true },
)

// 组件挂载时记录初始状态
onMounted(() => {
  console.log('TextCombineNode mounted with node:', props?.id, JSON.stringify(props?.data))
})
import { Warning } from '@element-plus/icons-vue'
import type { NodeProps, TextCombineNodeData, TextDisplayNodeData } from '@/types/node'
import { createNodeValidator, useNode } from '@/composables/node'
import { options } from 'marked'

// 获取模板预览
const getTemplatePreview = computed(() => {
  try {
    const template = nodeData.value?.template.fieldValue || ''
    if (!template) return '未设置模板'

    // 如果模板太长，截断显示
    if (template.length > 30) {
      return template.substring(0, 30) + '...'
    }
    return template
  } catch (error) {
    console.error('Error in getTemplatePreview:', error)
    return '错误'
  }
})

// 获取操作详情提示
</script>

<style scoped>
.text-combine-node {
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

.text-combine-node:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.text-combine-node.selected {
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

.variables-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.variable-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: var(--el-color-info-light-9);
  border-radius: 4px;
  position: relative;
}

.variable-name {
  font-size: 12px;
  color: var(--el-text-color-regular);
  flex: 1;
}

.operation-info {
  text-align: center;
  margin: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.template-preview {
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

.details {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  padding: 2px 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.output-var {
  font-size: 12px;
  color: var(--el-color-info);
  background: var(--el-color-info-light-9);
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.output-item {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  text-align: right;
  margin: 12px 0;
  position: relative;
  padding-right: 15px;
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

:deep(.vue-flow__handle-top) {
  top: -5px;
}

:deep(.vue-flow__handle-bottom) {
  bottom: -5px;
}

@media (max-width: 768px) {
  .text-combine-node {
    min-width: 160px;
    max-width: 250px;
  }

  .operation,
  .details,
  .output-var {
    font-size: 12px;
  }
}
</style>
