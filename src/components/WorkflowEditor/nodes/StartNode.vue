<template>
  <div :class="['start-node', { selected: selected }]">
    <div class="node-header">
      <el-icon><VideoPlay /></el-icon>
      <span>开始</span>
    </div>
    <div class="node-content">
      <div class="output-item">
        <span class="output-label">输出</span>
        <Handle type="source" :position="Position.Right" id="output" title="开始输出" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VideoPlay } from '@element-plus/icons-vue'
import { Handle, Position } from '@vue-flow/core'
import { ref, watch } from 'vue'
import type { NodeProps } from '@/types/node'
import { createNodeValidator, useNode } from '@/composables/node'
import type { StartNodeData } from '@/types/node'

const props = defineProps<NodeProps<StartNodeData>>()

// 默认节点数据
const DEFAULT_NODE: StartNodeData = {
  output: {
    fieldName: '输出',
    fieldValue: '开始',
    fieldDesc: '开始节点输出',
    fieldType: 'div',
    list: false,
    options: [],
    show: true,
    required: true,
  },
}

// 创建节点验证器
const validateNode = createNodeValidator<StartNodeData>([], (data) => {
  return { valid: true }
})

const { nodeData } = useNode(props, DEFAULT_NODE, validateNode)
</script>

<style scoped>
.start-node {
  background: var(--el-bg-color);
  border: 2px solid var(--el-border-color);
  border-radius: 8px;
  min-width: 150px;
  max-width: 200px;
  font-size: 14px;
  color: var(--el-text-color-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.start-node:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.start-node.selected {
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
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.output-item {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  text-align: right;
  position: relative;
  padding-right: 15px;
}

.output-label {
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-right: 8px;
  min-width: 40px;
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
