<template>
  <div :class="['http-request-node', { selected: selected }]">
    <div class="node-header">
      <el-icon><Connection /></el-icon>
      <span>HTTP请求</span>
      <el-tooltip v-if="!isConfigured" content="请配置请求参数" effect="dark">
        <el-icon class="warning-icon"><Warning /></el-icon>
      </el-tooltip>
    </div>
    <div class="node-content">
      <div class="property-item">
        <Handle type="target" :position="Position.Left" id="url" title="URL输入" />
        <Handle type="source" :position="Position.Right" id="url" title="URL输出" />
        <span class="property-label">URL</span>
        <span class="property-value">{{ getUrlPreview }}</span>
      </div>

      <div class="property-item">
        <Handle type="target" :position="Position.Left" id="method" title="方法输入" />
        <span class="property-label">方法</span>
        <span class="property-value">{{ nodeData?.method?.fieldValue || 'GET' }}</span>
      </div>

      <div class="property-item">
        <Handle type="target" :position="Position.Left" id="headers" title="请求头输入" />
        <span class="property-label">请求头</span>
        <span class="property-value">{{ getHeadersPreview }}</span>
      </div>

      <div class="property-item">
        <Handle type="target" :position="Position.Left" id="body" title="请求体输入" />
        <span class="property-label">请求体</span>
        <span class="property-value">{{ getBodyPreview }}</span>
      </div>

      <div class="output-item">
        <span class="output-label">响应</span>
        <Handle type="source" :position="Position.Right" id="response" title="响应输出" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Connection, Warning } from '@element-plus/icons-vue'
import { Handle, Position } from '@vue-flow/core'
import { computed } from 'vue'
import { type NodeProps, type HttpRequestNodeData, FieldType } from '@/types/node'
import { createNodeValidator, useNode } from '@/composables/node'

const props = defineProps<NodeProps<HttpRequestNodeData>>()

// 默认节点数据
const DEFAULT_NODE: HttpRequestNodeData = {
  url: {
    fieldName: '请求URL',
    fieldValue: '',
    fieldDesc: 'HTTP请求的URL地址',
    fieldType: FieldType.TEXT,
    list: false,
    options: [],
    show: true,
    required: true,
  },
  method: {
    fieldName: '请求方法',
    fieldValue: 'GET',
    fieldDesc: 'HTTP请求方法',
    fieldType: FieldType.SELECT,
    list: false,
    options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    show: true,
    required: true,
  },
  headers: {
    fieldName: '请求头',
    fieldValue: '{}',
    fieldDesc: 'HTTP请求头，JSON格式',
    fieldType: FieldType.TEXTAREA,
    list: false,
    options: [],
    show: true,
    required: false,
  },
  body: {
    fieldName: '请求体',
    fieldValue: '',
    fieldDesc: 'HTTP请求体',
    fieldType: FieldType.TEXTAREA,
    list: false,
    options: [],
    show: true,
    required: false,
  },
}

// 创建节点验证器
const validateNode = createNodeValidator<HttpRequestNodeData>([], (data) => {
  return { valid: true }
})

const { nodeData } = useNode(props, DEFAULT_NODE, validateNode)

// 计算节点是否已配置
const isConfigured = computed(() => {
  return !!nodeData.value?.url?.fieldValue
})

// 获取URL预览
const getUrlPreview = computed(() => {
  try {
    const url = nodeData.value?.url?.fieldValue || ''
    if (!url) return '未设置URL'

    // 如果URL太长，截断显示
    if (url.length > 30) {
      return url.substring(0, 30) + '...'
    }
    return url
  } catch (error) {
    console.error('Error in getUrlPreview:', error)
    return '错误'
  }
})

// 获取请求头预览
const getHeadersPreview = computed(() => {
  try {
    const headers = nodeData.value?.headers?.fieldValue || '{}'
    if (!headers || headers === '{}') return '无请求头'

    // 尝试解析JSON以获取键值对数量
    try {
      const parsed = JSON.parse(headers)
      const count = Object.keys(parsed).length
      return `${count} 个请求头`
    } catch {
      return 'JSON格式错误'
    }
  } catch (error) {
    console.error('Error in getHeadersPreview:', error)
    return '错误'
  }
})

// 获取请求体预览
const getBodyPreview = computed(() => {
  try {
    const body = nodeData.value?.body?.fieldValue || ''
    if (!body) return '无请求体'

    // 如果请求体太长，截断显示
    if (body.length > 20) {
      return body.substring(0, 20) + '...'
    }
    return body
  } catch (error) {
    console.error('Error in getBodyPreview:', error)
    return '错误'
  }
})
</script>

<style scoped>
.http-request-node {
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

.http-request-node:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.http-request-node.selected {
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
  background: var(--el-color-info-light-9);
  font-size: 13px;
}

.output-item {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  text-align: right;
  margin: 16px 0 8px;
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
