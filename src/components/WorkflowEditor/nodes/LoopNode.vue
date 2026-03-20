<template>
  <div :class="['loop-node', { selected: selected }]">
    <div class="node-header">
      <el-icon><RefreshRight /></el-icon>
      <span>循环控制</span>
      <el-tooltip v-if="!isConfigured" content="请配置循环参数" effect="dark">
        <el-icon class="warning-icon"><Warning /></el-icon>
      </el-tooltip>
    </div>
    <div class="node-content">
      <div class="property-item">
        <Handle type="target" :position="Position.Left" id="input" title="输入" />
        <span class="property-label">输入</span>
        <span class="property-value">{{ getInputPreview }}</span>
      </div>

      <div class="property-item">
        <span class="property-label">循环次数</span>
        <span class="property-value">{{ nodeData?.count?.fieldValue || '未设置' }}</span>
      </div>

      <div class="property-item">
        <span class="property-label">循环变量</span>
        <span class="property-value">{{ nodeData?.variable?.fieldValue || '未设置' }}</span>
      </div>

      <div class="loop-branches">
        <div class="branch-item">
          <span class="branch-label">循环体</span>
          <Handle type="source" :position="Position.Right" id="body" title="循环体输出" />
        </div>
        <div class="branch-item">
          <span class="branch-label">循环结束</span>
          <Handle type="source" :position="Position.Right" id="done" title="循环结束输出" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RefreshRight, Warning } from '@element-plus/icons-vue'
import { Handle, Position } from '@vue-flow/core'
import { computed } from 'vue'
import type { NodeProps, LoopNodeData } from '@/types/node'
import { createNodeValidator, useNode } from '@/composables/node'

const props = defineProps<NodeProps<LoopNodeData>>()

// 默认节点数据
const DEFAULT_NODE: LoopNodeData = {
  count: {
    fieldName: '循环次数',
    fieldValue: 3,
    fieldDesc: '循环执行的次数',
    fieldType: 'number',
    list: false,
    options: [],
    show: true,
    required: true,
  },
  variable: {
    fieldName: '循环变量',
    fieldValue: 'item',
    fieldDesc: '循环中使用的变量名',
    fieldType: 'text',
    list: false,
    options: [],
    show: true,
    required: true,
  },
}

// 创建节点验证器
const validateNode = createNodeValidator<LoopNodeData>([], (data) => {
  return { valid: true }
})

const { nodeData } = useNode(props, DEFAULT_NODE, validateNode)

// 计算节点是否已配置
const isConfigured = computed(() => {
  return nodeData.value?.count?.fieldValue > 0
})

// 获取输入预览
const getInputPreview = computed(() => {
  try {
    return '数组或列表数据'
  } catch (error) {
    console.error('Error in getInputPreview:', error)
    return '错误'
  }
})
</script>

<style scoped>
.loop-node {
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

.loop-node:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.loop-node.selected {
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
  min-width: 70px;
}

.property-value {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--el-color-warning-light-9);
  font-size: 13px;
}

.loop-branches {
  margin-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 12px;
}

.branch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0;
  position: relative;
  padding-right: 15px;
}

.branch-label {
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.branch-item:first-child .branch-label {
  color: var(--el-color-success);
}

.branch-item:last-child .branch-label {
  color: var(--el-color-info);
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
