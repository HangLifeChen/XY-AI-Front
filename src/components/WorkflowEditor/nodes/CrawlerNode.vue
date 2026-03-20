<template>
  <div :class="['crawler-node', { selected: selected }]">
    <div class="node-header">
      <!-- 通用输入Handle，用于StartNode连接 -->
      <Handle
        type="target"
        :position="Position.Left"
        id="only_crawler_trigger"
        title="触发输入"
        style="top: 20px"
      />
      <el-icon><Share /></el-icon>
      <span>网页抓取</span>
      <el-tooltip v-if="!nodeData?.url?.fieldValue" content="请配置网址" effect="dark">
        <el-icon class="warning-icon"><Warning /></el-icon>
      </el-tooltip>
    </div>
    <div class="node-content">
      <div class="property-item">
        <Handle type="target" :position="Position.Left" id="url" title="网址输入" />
        <Handle type="source" :position="Position.Right" id="url" title="网址输出" />
        <span class="property-label">网址</span>
      </div>

      <div class="property-item">
        <Handle type="target" :position="Position.Left" id="format" title="格式输入" />
        <Handle type="source" :position="Position.Right" id="format" title="格式输出" />
        <span class="property-label">格式</span>
      </div>

      <div class="output-item">
        <span class="output-label">标题</span>
        <Handle type="source" :position="Position.Right" id="title" title="网页标题" />
      </div>

      <div class="output-item">
        <span class="output-label">内容</span>
        <Handle type="source" :position="Position.Right" id="content" title="网页内容" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Share, Warning } from '@element-plus/icons-vue'
import { Handle, Position } from '@vue-flow/core'
import { computed } from 'vue'
import type { NodeProps } from '@/types/node'
import { createNodeValidator, useNode } from '@/composables/node'
import type { CrawlerNodeData } from '@/types/node'
import { FieldType } from '@/types/node'

const props = defineProps<NodeProps<CrawlerNodeData>>()

// 默认节点数据
const DEFAULT_NODE: CrawlerNodeData = {
  url: {
    fieldName: '目标网址',
    fieldValue: '',
    fieldDesc: '要抓取的网页URL',
    fieldType: FieldType.TEXT,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  format: {
    fieldName: '输出格式',
    fieldValue: 'text',
    fieldDesc: '输出格式',
    fieldType: FieldType.SELECT,
    list: false,
    options: ['text', 'html'],
    show: true,
    required: true,
  },
}

// 创建节点验证器
const validateNode = createNodeValidator<CrawlerNodeData>([], (data) => {
  if (!data.url.fieldValue) {
    return { valid: false, message: '目标网址不能为空' }
  }
  return { valid: true }
})

const { nodeData } = useNode(props, DEFAULT_NODE, validateNode)

// 计算节点是否已配置
const isConfigured = computed(() => {
  return !!nodeData.value?.url?.fieldValue
})
</script>

<style scoped>
.crawler-node {
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

.crawler-node:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.crawler-node.selected {
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
  min-height: 80px;
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

.output-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0;
  position: relative;
  padding-left: 15px;
}

.output-label {
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin: 0 8px;
  min-width: 60px;
}

:deep(.vue-flow__handle) {
  width: 10px;
  height: 10px;
  background: var(--el-color-success-light-5);
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
  .crawler-node {
    min-width: 160px;
    max-width: 220px;
  }
}
</style>
