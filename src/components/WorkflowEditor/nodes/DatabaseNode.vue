<template>
  <div :class="['database-node', { selected: selected }]">
    <div class="node-header">
      <el-icon><Grid /></el-icon>
      <span>数据库查询</span>
      <el-tooltip
        v-if="!nodeData?.connectionString.fieldValue || !nodeData?.query.fieldValue"
        content="请配置连接字符串和查询语句"
        effect="dark"
      >
        <el-icon class="warning-icon"><Warning /></el-icon>
      </el-tooltip>
    </div>
    <div class="node-content">
      <div class="input-item">
        <Handle type="target" :position="Position.Left" id="input" title="数据库输入" />
        <span class="input-label">输入</span>
      </div>

      <div class="database-info">
        <div
          class="connection"
          :title="nodeData?.connectionString.fieldValue || '未设置连接字符串'"
        >
          {{ getConnectionPreview }}
        </div>
        <div class="query" :title="nodeData?.query.fieldValue || '未设置查询语句'">
          {{ getQueryPreview }}
        </div>
        <div class="parameters">参数: {{ getParameterCount }} 个</div>
      </div>

      <div class="output-item">
        <span class="output-label">输出</span>
        <Handle type="source" :position="Position.Right" id="output" title="数据库输出" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Grid, Warning } from '@element-plus/icons-vue'
import { Handle, Position } from '@vue-flow/core'
import { ref, watch, onMounted, computed } from 'vue'
import type { NodeProps } from '@/types/node'
import { createNodeValidator, useNode } from '@/composables/node'
import type { DatabaseNodeData } from '@/types/node'
import { FieldType } from '@/types/node'

const props = defineProps<NodeProps<DatabaseNodeData>>()

// 默认节点数据
const DEFAULT_NODE: DatabaseNodeData = {
  connectionString: {
    fieldName: '连接字符串',
    fieldValue: '',
    fieldDesc: '数据库连接字符串',
    fieldType: FieldType.TEXT,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  query: {
    fieldName: '查询语句',
    fieldValue: 'SELECT * FROM table',
    fieldDesc: 'SQL查询语句',
    fieldType: FieldType.TEXTAREA,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  parameters: {
    fieldName: '查询参数',
    fieldValue: [],
    fieldDesc: 'SQL查询参数',
    fieldType: FieldType.TEXT,
    list: true,
    options: [],
    show: true,
    required: false,
  },
}

// 创建节点验证器
const validateNode = createNodeValidator<DatabaseNodeData>([], (data) => {
  if (!data.connectionString.fieldValue) {
    return { valid: false, message: '连接字符串不能为空' }
  }
  if (!data.query.fieldValue) {
    return { valid: false, message: '查询语句不能为空' }
  }
  return { valid: true }
})

const { nodeData } = useNode(props, DEFAULT_NODE, validateNode)

// 获取连接字符串预览
const getConnectionPreview = computed(() => {
  try {
    const connection = nodeData.value?.connectionString.fieldValue || ''
    if (!connection) return '未设置连接字符串'

    // 如果连接字符串太长，截断显示
    if (connection.length > 30) {
      return connection.substring(0, 30) + '...'
    }
    return connection
  } catch (error) {
    console.error('Error in getConnectionPreview:', error)
    return '错误'
  }
})

// 获取查询语句预览
const getQueryPreview = computed(() => {
  try {
    const query = nodeData.value?.query.fieldValue || ''
    if (!query) return '未设置查询语句'

    // 如果查询语句太长，截断显示
    if (query.length > 30) {
      return query.substring(0, 30) + '...'
    }
    return query
  } catch (error) {
    console.error('Error in getQueryPreview:', error)
    return '错误'
  }
})

// 获取参数数量
const getParameterCount = computed(() => {
  try {
    const parameters = nodeData.value?.parameters.fieldValue
    if (Array.isArray(parameters)) {
      return parameters.length
    }
    return 0
  } catch (error) {
    console.error('Error in getParameterCount:', error)
    return 0
  }
})

// 组件挂载时记录初始状态
onMounted(() => {
  console.log('DatabaseNode mounted with node:', props?.id)
})
</script>

<style scoped>
.database-node {
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

.database-node:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.database-node.selected {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
}

.node-header {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger-dark-2);
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

.database-info {
  text-align: center;
  margin: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.connection,
.query {
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

.parameters {
  font-size: 12px;
  color: var(--el-text-color-regular);
  padding: 4px 6px;
  background: var(--el-color-danger-light-9);
  border-radius: 4px;
}

:deep(.vue-flow__handle) {
  width: 10px;
  height: 10px;
  background: var(--el-color-danger-light-5);
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
  .database-node {
    min-width: 160px;
    max-width: 220px;
  }
}
</style>
