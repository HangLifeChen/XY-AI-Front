<template>
  <div :class="['html-display-node', { selected: props.selected }]">
    <div class="node-header">
      <!-- 通用输入Handle，用于StartNode连接 -->
      <Handle
        type="target"
        :position="Position.Left"
        id="only_htmlDisplay_trigger"
        title="触发输入"
        style="top: 20px"
      />
      <el-icon><Document /></el-icon>
      <span>HTML呈现</span>
      <el-tooltip :content="getHtmlContent" effect="dark">
        <el-icon class="warning-icon"><Warning /></el-icon>
      </el-tooltip>
    </div>
    <div class="node-content">
      <div class="property-item">
        <Handle type="target" :position="Position.Left" :id="'htmlContent'" title="HTML内容输入" />
        <span class="property-label">HTML:</span>
        <span class="property-value" :class="{ 'not-configured': !getHtmlContent }">
          {{ getDisplayText }}
        </span>
      </div>

      <div class="output-item">
        <span class="output-label">输出</span>
        <Handle type="source" :position="Position.Right" :id="'output'" title="HTML输出" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Document, Warning } from '@element-plus/icons-vue'
import { Handle, Position, type GraphEdge } from '@vue-flow/core'
import { computed, onMounted, watch } from 'vue'
import { useNode, createNodeValidator } from '../../../composables/node'
import { FieldType, type NodeProps, type HtmlDisplayNodeData } from '../../../types/node'

const props = defineProps<NodeProps<HtmlDisplayNodeData>>()

import { useVueFlow } from '@vue-flow/core'

// 获取 VueFlow 实例
const { findNode, getNode, getEdges } = useVueFlow()

// 默认节点数据
const defaultData: HtmlDisplayNodeData = {
  htmlContent: {
    fieldName: 'HTML内容',
    fieldType: FieldType.TEXTAREA,
    fieldDesc: '在这里写HTML内容',
    fieldValue: '<p>请输入HTML内容</p>',
    list: false,
    options: [],
    show: true,
    required: true,
  },
}

// 创建节点验证器
const validateNode = createNodeValidator<HtmlDisplayNodeData>([], (data) => {
  return { valid: true }
})

const { nodeData } = useNode(props, defaultData, validateNode)

// 组件挂载时记录初始状态并设置连接监听
onMounted(() => {
  // setupConnectionHandling()
})

// 设置连接处理
const setupConnectionHandling = () => {
  // 监听边的变化
  watch(
    () => getEdges.value,
    (edges: GraphEdge[]) => {
      if (!props.id) return

      // 获取连接到此节点的边
      const incomingEdges = edges.filter((edge) => edge.target === props.id)

      // 处理每个输入连接
      incomingEdges.forEach(async (edge) => {
        const sourceNode = findNode(edge.source)
        if (!sourceNode) return

        // 获取源节点的输出值
        const sourceValue = sourceNode.data?.output

        // 根据目标句柄ID更新相应的属性
        // if (edge.targetHandle?.endsWith('-title-input')) {
        //   nodeData.value.title = String(sourceValue || '')
        // } else if (edge.targetHandle?.endsWith('-content-input')) {
        //   nodeData.value.htmlContent = String(sourceValue || '')
        // }
      })
    },
    { deep: true },
  )
}

// 计算输出值
const getOutputValue = () => {
  if (!nodeData.value?.htmlContent) return ''
  return getHtmlContent
}

// 更新节点输出
watch(
  () => [nodeData.value?.htmlContent],
  () => {
    if (nodeData.value) {
      nodeData.value.output = getOutputValue()
    }
  },
  { deep: true },
)

// 获取显示文本
const getDisplayText = computed(() => {
  try {
    const content = getHtmlContent
    if (!content) return '请配置要显示的HTML内容'
    // 移除HTML标签，只显示文本内容
    const textContent = content.value.replace(/<[^>]*>/g, '')
    return textContent.length > 10 ? textContent.substring(0, 10) + '...' : textContent
  } catch (error) {
    console.error('Error in getDisplayText:', error)
    return '错误'
  }
})

// 安全地获取HTML内容
const getHtmlContent = computed(() => {
  try {
    return nodeData.value?.htmlContent?.fieldValue || ''
  } catch (error) {
    console.error('Error in getHtmlContent:', error)
    return ''
  }
})
</script>

<style scoped>
.html-display-node {
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

.html-display-node:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.html-display-node.selected {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
}

.html-display-node.invalid {
  border-color: var(--el-color-danger);
  box-shadow: 0 0 0 2px var(--el-color-danger-light-8);
}

.html-display-node.invalid .warning-icon {
  color: var(--el-color-danger);
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
  padding-left: 15px; /* 为左侧连接点留出空间 */
}

.property-label {
  font-weight: 500;
  color: var(--el-text-color-secondary);
  margin-right: 8px;
  min-width: 80px;
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

.property-value.not-configured {
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
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
  .html-display-node {
    min-width: 160px;
    max-width: 250px;
  }

  .text-content,
  .details {
    font-size: 12px;
  }
}
</style>
