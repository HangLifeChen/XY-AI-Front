<template>
  <div class="flow-container">
    <VueFlow
      v-model="elements"
      :nodes-draggable="true"
      :nodes-connectable="true"
      :node-types="nodeTypes"
      @node-drag-stop="onNodeDragStop"
      @connect="onConnect"
      @node-click="onNodeClick"
      @drop="onDrop"
      @dragover="onDragOver"
    >
      <Background pattern-color="#aaa" :gap="16" />
      <Controls />
      <MiniMap />
    </VueFlow>

    <!-- 节点配置面板 -->
    <el-drawer v-model="showConfigPanel" title="节点配置" direction="rtl" size="30%">
      <NodeConfigForm v-if="selectedNode" :node="selectedNode" @update:node="onNodeConfigUpdate" />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { debounce } from 'lodash-es'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Controls as ControlComponents } from '@vue-flow/controls'
import { MiniMap as MiniMapComponent } from '@vue-flow/minimap'
import { Background as BackgroundComponent } from '@vue-flow/background'
import { Menu, Share, User, ChatDotRound, SetUp } from '@element-plus/icons-vue'
import NodeConfigForm from './NodeConfigForm.vue'
import CustomNode from './CustomNode.vue'

interface FlowElement {
  id: string
  type?: string
  position: { x: number; y: number }
  data?: any
  label?: string
  source?: string
  target?: string
}

const props = defineProps<{
  modelValue: FlowElement[]
}>()

const emit = defineEmits([
  'update:modelValue',
  'nodeDragStop',
  'connect',
  'nodeClick',
  'nodeConfigUpdate',
])

const elements = ref<FlowElement[]>(props.modelValue)
const selectedNode = ref<FlowElement | null>(null)
const showConfigPanel = ref(false)
let nodeId = 0 // 用于生成唯一节点ID，移到顶部并只定义一次

// 注册组件
const Controls = ControlComponents
const MiniMap = MiniMapComponent
const Background = BackgroundComponent

// 注册自定义节点类型
const nodeTypes = {
  task: CustomNode,
  condition: CustomNode,
  agent: CustomNode,
  message: CustomNode,
  decision: CustomNode,
}

// 防抖处理节点位置更新
const debouncedUpdate = debounce((elements: FlowElement[]) => {
  emit('update:modelValue', elements)
}, 300)

watch(
  elements,
  (newVal) => {
    debouncedUpdate(newVal)
  },
  { deep: true },
)

// 验证节点连接是否有效
const isValidConnection = (connection: any) => {
  const sourceNode = elements.value.find((n) => n.id === connection.source)
  const targetNode = elements.value.find((n) => n.id === connection.target)

  // 禁止连接到自身
  if (connection.source === connection.target) return false

  // 输入节点只能作为起点
  if (sourceNode?.type === 'input' && targetNode?.type === 'input') return false

  // 输出节点只能作为终点
  if (sourceNode?.type === 'output' || targetNode?.type === 'output') {
    return sourceNode?.type !== 'output' && targetNode?.type === 'output'
  }

  return true
}

const onNodeDragStop = debounce((event: any, node: any) => {
  if (!node.id) {
    node.id = `node-${nodeId++}`
  }
  emit('nodeDragStop', event, node)
}, 100)

// 性能优化：只渲染可见区域的节点
onMounted(() => {
  const flowInstance = document.querySelector('.vue-flow') as HTMLElement
  if (flowInstance) {
    flowInstance.style.willChange = 'transform'
  }
})

const onConnect = (params: any) => {
  const newEdge = {
    id: `edge-${params.source}-${params.target}`,
    source: params.source,
    target: params.target,
  }
  elements.value.push(newEdge)
  emit('connect', params)
}

const onNodeClick = (event: any, node: any) => {
  selectedNode.value = node
  showConfigPanel.value = true
  emit('nodeClick', event, node)
}

const onNodeConfigUpdate = (updatedNode: any) => {
  const index = elements.value.findIndex((n) => n.id === updatedNode.id)
  if (index !== -1) {
    elements.value[index] = updatedNode
  }
  emit('nodeConfigUpdate', updatedNode)
}

// 处理拖拽节点悬停
const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

// 处理节点拖放
const onDrop = (event: DragEvent) => {
  event.preventDefault()

  if (!event.dataTransfer) return

  const nodeType = event.dataTransfer.getData('application/vueflow-node-type')
  const nodeDataStr = event.dataTransfer.getData('application/vueflow-node-data')

  if (!nodeType || !nodeDataStr) return

  // 获取画布上的鼠标位置
  const wrapper = document.querySelector('.vue-flow') as HTMLElement
  if (!wrapper) return

  const bounds = wrapper.getBoundingClientRect()
  const position = {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  }

  const nodeData = JSON.parse(nodeDataStr)

  // 映射图标名称到组件
  const iconMap = {
    menu: 'Menu',
    share: 'Share',
    user: 'User',
    chat: 'ChatDotRound',
    setting: 'SetUp',
  }

  // 创建新节点
  const newNode = {
    id: `node-${nodeId++}`,
    type: nodeType,
    position,
    data: {
      label: nodeData.label || `New ${nodeType}`,
      icon: iconMap[nodeData.icon] || 'Menu',
      color: nodeData.color || '#67C23A',
      type: nodeType,
      ...getDefaultDataForType(nodeType),
    },
  }

  elements.value = [...elements.value, newNode]
  emit('update:modelValue', elements.value)
}

// 根据节点类型获取默认数据
const getDefaultDataForType = (type: string) => {
  switch (type) {
    case 'condition':
      return {
        conditions: [],
        type: 'condition',
      }
    case 'task':
      return {
        task: '',
        type: 'task',
      }
    case 'agent':
      return {
        agent: '',
        type: 'agent',
      }
    case 'message':
      return {
        message: '',
        type: 'message',
      }
    case 'decision':
      return {
        decision: '',
        type: 'decision',
      }
    default:
      return {}
  }
}
</script>

<style scoped>
.flow-container {
  flex: 1;
  position: relative;
  height: 100%;
}
</style>

<style>
/* 画布背景 */
.vue-flow__container {
  background-color: #fafafa;
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Vue Flow 组件样式 */
.vue-flow__minimap {
  right: 10px;
  bottom: 10px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.vue-flow__controls {
  left: 10px;
  top: 10px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 滚动条优化 */
.vue-flow__viewport::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.vue-flow__viewport::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 4px;
}

/* 自定义节点拖拽样式 */
.vue-flow__node {
  cursor: grab;
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease;
  user-select: none;
}

.vue-flow__node.dragging {
  cursor: grabbing;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.vue-flow__node:hover:not(.dragging) {
  filter: drop-shadow(0 0 2px rgba(0, 122, 255, 0.3));
}

/* 连接线样式优化 */
.vue-flow__edge-path {
  stroke: #b1b1b7;
  stroke-width: 2;
  transition: stroke 0.3s ease;
}

.vue-flow__edge.selected .vue-flow__edge-path {
  stroke: #cc1616;
  stroke-width: 3;
}
</style>
