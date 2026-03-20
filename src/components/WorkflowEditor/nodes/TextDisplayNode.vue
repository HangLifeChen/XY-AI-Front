<template>
  <div :class="['text-display-node', { selected: props.selected }]">
    <div class="node-header">
      <!-- 通用输入Handle，用于StartNode连接 -->
      <Handle
        type="target"
        :position="Position.Left"
        id="only_textDisplay_trigger"
        title="触发输入"
        style="top: 20px"
      />
      <el-icon><Document /></el-icon>
      <span>文本呈现</span>
      <el-tooltip :content="nodeData?.content.fieldValue" effect="dark">
        <el-icon class="warning-icon"><Warning /></el-icon>
      </el-tooltip>
    </div>
    <div class="node-content">
      <div class="property-item">
        <Handle type="target" :position="Position.Left" :id="'title'" title="标题输入" />
        <Handle type="source" :position="Position.Right" :id="'title'" title="标题输出" />
        <span class="property-label">标题:</span>
        <span class="property-value">{{ getNodeTitle }}</span>
      </div>

      <div class="property-item">
        <Handle type="target" :position="Position.Left" :id="'content'" title="内容输入" />
        <Handle type="source" :position="Position.Right" :id="'content'" title="内容输出" />
        <span class="property-label">内容:</span>
        <span class="property-value" :class="{ 'not-configured': !getContent }">
          {{ getDisplayText }}
        </span>
      </div>

      <div class="property-item">
        <Handle
          type="target"
          :position="Position.Left"
          :id="'renderMarkdown'"
          title="Markdown渲染设置输入"
        />
        <span class="property-label">渲染Markdown:</span>
        <span class="property-value">{{ isMarkdownEnabled ? '是' : '否' }}</span>
      </div>
      <div class="output-item">
        <span class="output-label">输出</span>
        <Handle type="source" :position="Position.Right" :id="'output'" title="文本输出" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Document, Warning } from '@element-plus/icons-vue'
import { Handle, Position, type GraphEdge } from '@vue-flow/core'
import { computed, onMounted, watch } from 'vue'
import { useNode, createNodeValidator } from '../../../composables/node'
import { FieldType, type NodeProps, type TextDisplayNodeData } from '../../../types/node'

const props = defineProps<NodeProps<TextDisplayNodeData>>()

import { useVueFlow } from '@vue-flow/core'

// 获取 VueFlow 实例
const { findNode, getNode, getEdges } = useVueFlow()

// 默认节点数据
const defaultData: TextDisplayNodeData = {
  content: {
    fieldName: '文本内容',
    fieldType: FieldType.DIV,
    fieldDesc: '在这里写文本内容',
    fieldValue: '文本内容',
    list: false,
    options: [],
    show: true,
    required: true,
  },
  title: {
    fieldName: '文本标题',
    fieldType: FieldType.DIV,
    fieldDesc: '在这里写文本标题',
    fieldValue: '文本标题',
    list: false,
    options: [],
    show: true,
    required: true,
  },
  renderMarkdown: {
    fieldName: '是否渲染Markdown',
    fieldType: FieldType.VAL,
    fieldDesc: '在这里写文本标题',
    fieldValue: '文本标题',
    list: false,
    options: [],
    show: true,
    required: false,
  },
}

// 创建节点验证器
const validateNode = createNodeValidator<TextDisplayNodeData>([], (data) => {
  return { valid: true }
})

const { nodeData } = useNode(props, defaultData, validateNode)

// 组件挂载时记录初始状态并设置连接监听
onMounted(() => {
  // setupConnectionHandling()
})

// 设置连接处理
// const setupConnectionHandling = () => {
//   // 监听边的变化
//   watch(
//     () => getEdges.value,
//     (edges: GraphEdge[]) => {
//       if (!props.id) return

//       // 获取连接到此节点的边
//       const incomingEdges = edges.filter((edge) => edge.target === props.id)

//       // 处理每个输入连接
//       incomingEdges.forEach(async (edge) => {
//         const sourceNode = findNode(edge.source)
//         if (!sourceNode) return

//         // 获取源节点的输出值
//         const sourceValue = sourceNode.data?.output

//         // 根据目标句柄ID更新相应的属性
//         // if (edge.targetHandle?.endsWith('-title-input')) {
//         //   nodeData.value.title = String(sourceValue || '')
//         // } else if (edge.targetHandle?.endsWith('-content-input')) {
//         //   nodeData.value.content = String(sourceValue || '')
//         // } else if (edge.targetHandle?.endsWith('-markdown-input')) {
//         //   nodeData.value.renderMarkdown = Boolean(sourceValue)
//         // }
//       })
//     },
//     { deep: true },
//   )
// }

// 计算输出值
const getOutputValue = () => {
  if (!nodeData.value?.content) return ''
  return nodeData.value.renderMarkdown ? nodeData.value.content : getContent.value
}

// 更新节点输出
watch(
  () => [nodeData.value?.content, nodeData.value?.renderMarkdown],
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
    const content = getContent.value
    if (!content) return '请配置要显示的文本内容'
    return content.length > 10 ? content.substring(0, 10) + '...' : content
  } catch (error) {
    console.error('Error in getDisplayText:', error)
    return '错误'
  }
})

// 获取节点标题
const getNodeTitle = computed(() => {
  try {
    return nodeData.value?.title?.fieldValue || '文本标题'
  } catch (error) {
    console.error('Error in getNodeTitle:', error)
    return '文本标题'
  }
})

// 安全地获取内容
const getContent = computed(() => {
  try {
    return nodeData.value?.content?.fieldValue || ''
  } catch (error) {
    console.error('Error in getContent:', error)
    return ''
  }
})

// 安全地获取 Markdown 渲染状态
const isMarkdownEnabled = computed(() => {
  try {
    return nodeData.value?.renderMarkdown?.fieldValue || false
  } catch (error) {
    console.error('Error in isMarkdownEnabled:', error)
    return false
  }
})

// 获取显示详情
const getDisplayDetails = () => {
  try {
    const data = nodeData.value
    if (!data) return '未配置节点参数'

    let details = `标题: ${data.title || '未设置'}\n`
    details += `渲染Markdown: ${isMarkdownEnabled ? '是' : '否'}`

    return details
  } catch (error) {
    console.error('Error in getDisplayDetails:', error)
    return '获取详情时出错'
  }
}
</script>

<style scoped>
.text-display-node {
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

.text-display-node:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.text-display-node.selected {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
}

.text-display-node.invalid {
  border-color: var(--el-color-danger);
  box-shadow: 0 0 0 2px var(--el-color-danger-light-8);
}

.text-display-node.invalid .warning-icon {
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
  .text-display-node {
    min-width: 160px;
    max-width: 250px;
  }

  .text-content,
  .details {
    font-size: 12px;
  }
}
</style>
