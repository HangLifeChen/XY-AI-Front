<template>
  <div :class="['trigger-node', { selected: selected }]">
    <div class="node-header">
      <el-icon><Timer /></el-icon>
      <span>定时触发</span>
      <el-tooltip v-if="!hasSchedule" content="请配置调度表达式" effect="dark">
        <el-icon class="warning-icon"><Warning /></el-icon>
      </el-tooltip>
    </div>
    <div class="node-content">
      <div class="trigger-info">
        <div
          class="trigger-type"
          :class="{ 'not-configured': !isTypeConfigured }"
          :title="triggerTypeLabel"
        >
          {{ triggerTypeLabel }}
        </div>

        <div class="schedule" :title="scheduleDisplay">
          {{ scheduleDisplay }}
        </div>

        <div class="status">
          <el-tag :type="isEnabled ? 'success' : 'info'" size="small">
            {{ isEnabled ? '已启用' : '已禁用' }}
          </el-tag>
        </div>
      </div>

      <div class="output-item">
        <span class="output-label">触发</span>
        <Handle type="source" :position="Position.Right" id="output" title="触发输出" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Timer, Warning } from '@element-plus/icons-vue'
import { Handle, Position } from '@vue-flow/core'
import { computed, onMounted } from 'vue'
import type { NodeProps } from '@/types/node'
import { createNodeValidator, useNode } from '@/composables/node'
import type { TriggerNodeData } from '@/types/node'
import { FieldType } from '@/types/node'

const props = defineProps<NodeProps<TriggerNodeData>>()

// 默认节点数据
const DEFAULT_NODE: TriggerNodeData = {
  type: {
    fieldName: '触发类型',
    fieldValue: 'cron',
    fieldDesc: '触发器类型',
    fieldType: FieldType.SELECT,
    list: false,
    options: ['cron', 'interval'],
    show: true,
    required: true,
  },
  schedule: {
    fieldName: '调度表达式',
    fieldValue: '0 0 * * *',
    fieldDesc: 'Cron表达式或间隔时间',
    fieldType: FieldType.TEXT,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  enabled: {
    fieldName: '是否启用',
    fieldValue: true,
    fieldDesc: '触发器是否启用',
    fieldType: FieldType.SWITCH,
    list: false,
    options: [],
    show: true,
    required: true,
  },
}

const validateNode = createNodeValidator<TriggerNodeData>([], (data) => {
  if (!data.schedule.fieldValue) {
    return { valid: false, message: '调度表达式不能为空' }
  }
  return { valid: true }
})

const { nodeData } = useNode(props, DEFAULT_NODE, validateNode)

// 1. 静态 Map 替代 switch-case
const TRIGGER_TYPE_MAP: Record<string, string> = {
  cron: 'Cron调度',
  interval: '间隔调度',
}

// 2. Computed: 触发类型标签
const triggerTypeLabel = computed(() => {
  const type = nodeData.value?.type?.fieldValue
  if (!type) return '未配置'
  return TRIGGER_TYPE_MAP[type] || '未配置'
})

// 3. Computed: 辅助状态
const isTypeConfigured = computed(() => !!nodeData.value?.type?.fieldValue)

const hasSchedule = computed(() => !!nodeData.value?.schedule?.fieldValue)

const scheduleDisplay = computed(() => {
  return nodeData.value?.schedule?.fieldValue || '未设置调度表达式'
})

const isEnabled = computed(() => {
  return !!nodeData.value?.enabled?.fieldValue
})

onMounted(() => {
  // console.log('TriggerNode mounted with node:', props?.id)
})
</script>

<style scoped>
/* 样式保持不变 */
.trigger-node {
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

.trigger-node:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.trigger-node.selected {
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
  min-height: 80px;
}

.trigger-info {
  text-align: center;
  margin: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.trigger-type {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning-dark-2);
}

.trigger-type.not-configured {
  color: var(--el-color-info);
  background: var(--el-color-info-light-9);
}

.schedule {
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

.status {
  display: flex;
  justify-content: center;
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
  min-width: 60px;
}

:deep(.vue-flow__handle) {
  width: 10px;
  height: 10px;
  background: var(--el-color-warning-light-5);
  border: 2px solid var(--el-border-color-darker);
  transition: all 0.2s ease;
}

:deep(.vue-flow__handle:hover) {
  background: var(--el-color-primary-light-5);
  border-color: var(--el-color-primary);
  transform: scale(1.2);
}

:deep(.vue-flow__handle-right) {
  right: -5px;
}

@media (max-width: 768px) {
  .trigger-node {
    min-width: 160px;
    max-width: 220px;
  }
}
</style>