<template>
  <div>
    <div class="workflow-editor" @contextmenu.prevent="onContextMenu">
      <div class="toolbar">
        <el-button-group>
          <el-tooltip content="撤销 (Ctrl+Z)" placement="bottom">
            <el-button
              :disabled="!workflowStore.canUndo()"
              @click="workflowStore.undo()"
              type="primary"
            >
              <el-icon><Back /></el-icon> 撤销
            </el-button>
          </el-tooltip>
          <el-tooltip content="重做 (Ctrl+Y)" placement="bottom">
            <el-button
              :disabled="!workflowStore.canRedo()"
              @click="workflowStore.redo()"
              type="primary"
            >
              <el-icon><Right /></el-icon> 重做
            </el-button>
          </el-tooltip>
        </el-button-group>

        <el-divider direction="vertical" />

        <el-button-group>
          <el-tooltip content="保存工作流" placement="bottom">
            <el-button @click="saveWorkflow" type="primary">
              <el-icon><Download /></el-icon> 保存
            </el-button>
          </el-tooltip>
          <el-tooltip content="导出为JSON" placement="bottom">
            <el-button @click="navigateToExport" type="primary">
              <el-icon><Upload /></el-icon> 导出
            </el-button>
          </el-tooltip>
          <el-tooltip content="导入工作流" placement="bottom">
            <el-button @click="navigateToImport" type="primary">
              <el-icon><FolderOpened /></el-icon> 导入
            </el-button>
          </el-tooltip>
          <el-tooltip content="版本管理" placement="bottom">
            <el-button @click="navigateToVersions" type="primary">
              <el-icon><Clock /></el-icon> 版本
            </el-button>
          </el-tooltip>
        </el-button-group>

        <el-divider direction="vertical" />

        <el-button-group>
          <el-tooltip content="自动布局" placement="bottom">
            <el-button @click="autoLayout" type="danger">
              <el-icon><SetUp /></el-icon> 自动布局
            </el-button>
          </el-tooltip>
          <el-tooltip content="重置画布" placement="bottom">
            <el-button @click="resetWorkflow" type="danger">
              <el-icon><Delete /></el-icon> 重置
            </el-button>
          </el-tooltip>
        </el-button-group>

        <el-divider direction="vertical" />

        <el-tooltip content="执行工作流" placement="bottom">
          <el-button type="success" @click="showExecutionPreview">
            <el-icon><VideoPlay /></el-icon> 执行
          </el-button>
        </el-tooltip>

        <el-tooltip content="测试工作流" placement="bottom">
          <el-button type="warning" @click="showWorkflowTest">
            <el-icon><Lightning /></el-icon> 测试
          </el-button>
        </el-tooltip>

        <div class="toolbar-right">
          <el-tooltip content="切换全屏" placement="bottom">
            <el-button @click="toggleFullscreen" type="primary">
              <el-icon><FullScreen /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <div class="editor-container">
        <NodePanel @drag-start="onDragStart" />
        <div class="flow-area" ref="vueFlowRef" @drop="onDrop">
          <VueFlow
            v-model:nodes="workflowStore.nodes"
            v-model:edges="workflowStore.edges"
            @node-click="onNodeClick"
            @connect="onConnect"
            @pane-ready="onPaneReady"
            :nodes-draggable="true"
            :nodes-connectable="true"
            fit-view-on-init
            @dragover="onDragOver"
            :min-zoom="0.1"
            :max-zoom="1"
          >
            <Background />
            <Controls />
            <MiniMap />
            <template #node-tongyi="props">
              <TongyiNode v-bind="props" />
            </template>
            <template #node-textCombine="props">
              <TextCombineNode v-bind="props" />
            </template>
            <template #node-textDisplay="props">
              <TextDisplayNode v-bind="props" />
            </template>
            <template #node-start="props">
              <StartNode v-bind="props" />
            </template>
            <template #node-end="props">
              <EndNode v-bind="props" />
            </template>
            <template #node-condition="props">
              <ConditionNode v-bind="props" />
            </template>
            <template #node-httpRequest="props">
              <HttpRequestNode v-bind="props" />
            </template>
            <template #node-codeExecution="props">
              <CodeExecutionNode v-bind="props" />
            </template>
            <template #node-loop="props">
              <LoopNode v-bind="props" />
            </template>
            <template #node-file="props">
              <FileNode v-bind="props" />
            </template>
            <template #node-crawler="props">
              <CrawlerNode v-bind="props" />
            </template>
            <template #node-database="props">
              <DatabaseNode v-bind="props" />
            </template>
            <template #node-trigger="props">
              <TriggerNode v-bind="props" />
            </template>
            <template #node-ollama="props">
              <OllamaNode v-bind="props" />
            </template>
            <template #node-qwenVL="props">
              <QwenVLNode v-bind="props" />
            </template>
            <template #node-htmlDisplay="props">
              <HtmlDisplayNode v-bind="props" />
            </template>
            <template #node-a2aTask="props">
              <A2ATaskNode v-bind="props" />
            </template>
            <template #node-callAgent="props">
              <CallAgentNode v-bind="props" />
            </template>
          </VueFlow>
          <!-- 水平对齐辅助线 -->
          <div class="guide-line horizontal" :style="horizontalGuideStyle"></div>

          <!-- 垂直对齐辅助线 -->
          <div class="guide-line vertical" :style="verticalGuideStyle"></div>
        </div>
      </div>

      <NodePropertiesPanel ref="propertiesPanel" />
    </div>

    <!-- 右键菜单 -->
    <div
      v-if="contextMenu.isVisible"
      class="context-menu"
      :style="{ left: contextMenu.position.x + 'px', top: contextMenu.position.y + 'px' }"
      @click.stop
    >
      <div class="menu-item" @click="copyNode" v-if="contextMenu.node">
        <el-icon><DocumentCopy /></el-icon> 复制节点
      </div>
      <div class="menu-item" @click="deleteNode" v-if="contextMenu.node">
        <el-icon><Delete /></el-icon> 删除节点
      </div>
      <div class="menu-item" @click="testNode" v-if="contextMenu.node">
        <el-icon><Lightning /></el-icon> 测试节点
      </div>
    </div>

    <!-- 执行预览对话框 -->
    <ExecutionPreviewDialog v-model:visible="showExecutionDialog" />

    <!-- 工作流测试对话框 -->
    <WorkflowTestDialog v-model:visible="showTestDialog" />

    <!-- 节点测试对话框 -->
    <NodeTestDialog v-model:visible="nodeTestDialog.visible" :node="nodeTestDialog.node" />

    <!-- 导出模态框 -->
    <WorkflowExportModal
      v-if="showExportModal"
      :workflow-id="String(workflowId)"
      @close="showExportModal = false"
    />

    <!-- 导入模态框 -->
    <WorkflowImportModal
      v-if="showImportModal"
      @close="showImportModal = false"
      @imported="onWorkflowImported"
    />

    <!-- 版本管理模态框 -->
    <div v-if="showVersionModal" class="modal-overlay" @click="showVersionModal = false">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="showVersionModal = false">
          <el-icon><Close /></el-icon>
        </button>
        <WorkflowVersion />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { markRaw, onBeforeUnmount, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { setupKeyboardShortcuts } from './keyboard'
import NodePanel from './NodePanel.vue'
import { VueFlow, useVueFlow, Panel, PanelPosition } from '@vue-flow/core'
import type { WorkflowEdge, WorkflowData } from '@/types/workflow'
import { Clock, Close } from '@element-plus/icons-vue'

import {
  Download,
  Delete,
  DocumentCopy,
  Back,
  Right,
  Upload,
  FolderOpened,
  SetUp,
  FullScreen,
  VideoPlay,
  Lightning,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElAlert } from 'element-plus'
import NodePropertiesPanel from './NodePropertiesPanel.vue'
import ExecutionPreviewDialog from './ExecutionPreviewDialog.vue'
import WorkflowTestDialog from './WorkflowTestDialog.vue'
import type { Node, NodeMouseEvent, NodeDragEvent } from '@vue-flow/core'
import type { WorkflowNode } from '@/types/node'
import type { Edge } from '@vue-flow/core'
// 导入模态框组件
import WorkflowExportModal from './WorkflowExportModal.vue'
import WorkflowImportModal from './WorkflowImportModal.vue'
import WorkflowVersion from './WorkflowVersion.vue'
import { useWorkflowStore } from '@/stores/workflow'
import { ref } from 'vue'
const { addNodes, screenToFlowCoordinate, onNodesInitialized, updateNode } = useVueFlow()
const router = useRouter()

const route = useRoute()

const workflowId = route.params.id

const horizontalGuideStyle = ref({ display: 'none', top: '0px', left: '0px' })
const verticalGuideStyle = ref({ display: 'none', left: '0px', top: '0px' })
// 定义对齐的阈值（像素）
const SNAP_THRESHOLD = 5
// 执行预览对话框控制
const showExecutionDialog = ref(false)
const showExecutionPreview = () => {
  showExecutionDialog.value = true
}

// 工作流测试对话框控制
const showTestDialog = ref(false)
const showWorkflowTest = () => {
  showTestDialog.value = true
}

const { project, viewport } = useVueFlow()
const workflowStore = useWorkflowStore()
const propertiesPanel = ref()

// 导出、导入和版本管理模态框控制
const showExportModal = ref(false)
const showImportModal = ref(false)
const showVersionModal = ref(false)

const navigateToExport = () => {
  showExportModal.value = true
}

const navigateToImport = () => {
  showImportModal.value = true
}

const navigateToVersions = () => {
  showVersionModal.value = true
}

// 工作流导入完成回调
const onWorkflowImported = (workflowData) => {
  ElMessage.success('工作流导入成功')
  // 可以在这里添加额外的处理逻辑
}

const onNodeClick = (event: NodeMouseEvent) => {
  console.log('onNodeClick', event)
  propertiesPanel.value?.onNodeClick(event.node)
}

const onNodeDoubleClick = (event: NodeDragEvent) => {
  propertiesPanel.value?.onNodeClick(event.node)
}

const onDragStart = (event: DragEvent, node: any) => {
  event.dataTransfer?.setData('application/vueflow', node.type)
  event.dataTransfer!.effectAllowed = 'move'
}

/**
 * 显示垂直辅助线
 * @param {number} xPosition - 画布内部的 x 坐标
 */
const showVerticalGuide = (xPosition: number) => {
  screenX = xPosition * viewport.value.zoom + viewport.value.x
  const guideLeft = screenX

  verticalGuideStyle.value = {
    display: 'block',
    left: `${guideLeft}px`,
    top: '0',
  }
}

/**
 * 显示水平辅助线
 * @param {number} yPosition - 画布内部的 y 坐标
 */
const showHorizontalGuide = (yPosition: number) => {
  screenY = yPosition * viewport.value.zoom + viewport.value.y
  horizontalGuideStyle.value = {
    display: 'block',
    top: `${screenY}px`,
    left: '0', // 从左边开始
  }
}

/**
 * 隐藏所有辅助线
 */
const hideAllGuides = () => {
  if (horizontalGuideStyle.value.display !== 'none') {
    horizontalGuideStyle.value.display = 'none'
  }
  if (verticalGuideStyle.value.display !== 'none') {
    verticalGuideStyle.value.display = 'none'
  }
}

let dragSnapCandidates: {
  id: string
  x: number
  y: number
  width: number
  height: number
  centerX: number
  centerY: number
  rightX: number
  bottomY: number
}[] = []

// RAF 锁，防止在一帧内多次计算
let rafId: number | null = null

/**
 * 拖拽开始：缓存所有其他节点的位置信息
 * 这样在拖拽过程中就不需要访问响应式的 workflowStore.nodes 了
 */
// const onNodeDragStart = (event: NodeDragEvent) => {
//   const { node: draggingNode } = event
//   const nodes = workflowStore.nodes

//   // 预先计算并缓存所有其他节点的几何信息
//   dragSnapCandidates = nodes
//     .filter((n) => n.id !== draggingNode.id && !n.hidden) // 排除自己和隐藏节点
//     .map((n) => {
//       const w = n.dimensions.width || (n.width as number) || 0
//       const h = n.dimensions.height || (n.height as number) || 0
//       return {
//         id: n.id,
//         x: n.position.x,
//         y: n.position.y,
//         width: w,
//         height: h,
//         centerX: n.position.x + w / 2,
//         centerY: n.position.y + h / 2,
//         rightX: n.position.x + w,
//         bottomY: n.position.y + h,
//       }
//     })
// }
/**
 * 拖拽中：使用 RAF 节流，并使用缓存数据进行计算
 */
// const onNodeDrag = (event: NodeDragEvent) => {
//   // 如果上一帧的计算还没完成，直接跳过
//   if (rafId) return

//   rafId = requestAnimationFrame(() => {
//     // 1. 移除 console.log

//     // 2. 先重置辅助线 (不在循环里重置，减少操作)
//     let vGuide = { display: 'none', left: '0px', top: '0' }
//     let hGuide = { display: 'none', top: '0px', left: '0' }

//     const { node: draggingNode } = event

//     // 获取当前拖拽节点的实时几何信息
//     const w = draggingNode.dimensions.width || 0
//     const h = draggingNode.dimensions.height || 0
//     const draggingNodeCenterX = draggingNode.position.x + w / 2
//     const draggingNodeCenterY = draggingNode.position.y + h / 2
//     const draggingNodeRightX = draggingNode.position.x + w
//     const draggingNodeBottomY = draggingNode.position.y + h

//     // 3. 遍历缓存的候选节点 (使用纯JS数组，速度极快)
//     for (const other of dragSnapCandidates) {
//       // --- 垂直对齐检查 (X轴) ---
//       // 左对左
//       if (Math.abs(draggingNode.position.x - other.x) < SNAP_THRESHOLD) {
//         vGuide = {
//           display: 'block',
//           left: `${viewport.value.x + other.x * viewport.value.zoom}px`,
//           top: '0',
//         }
//         draggingNode.position.x = other.x // 吸附
//       }
//       // 中对中
//       else if (Math.abs(draggingNodeCenterX - other.centerX) < SNAP_THRESHOLD) {
//         vGuide = {
//           display: 'block',
//           left: `${viewport.value.x + other.centerX * viewport.value.zoom}px`,
//           top: '0',
//         }
//         draggingNode.position.x = other.centerX - w / 2
//       }
//       // 右对右
//       else if (Math.abs(draggingNodeRightX - other.rightX) < SNAP_THRESHOLD) {
//         vGuide = {
//           display: 'block',
//           left: `${viewport.value.x + other.rightX * viewport.value.zoom}px`,
//           top: '0',
//         }
//         draggingNode.position.x = other.rightX - w
//       }

//       // --- 水平对齐检查 (Y轴) ---
//       // 顶对顶
//       if (Math.abs(draggingNode.position.y - other.y) < SNAP_THRESHOLD) {
//         hGuide = {
//           display: 'block',
//           top: `${viewport.value.y + other.y * viewport.value.zoom}px`,
//           left: '0',
//         }
//         draggingNode.position.y = other.y
//       }
//       // 中对中
//       else if (Math.abs(draggingNodeCenterY - other.centerY) < SNAP_THRESHOLD) {
//         hGuide = {
//           display: 'block',
//           top: `${viewport.value.y + other.centerY * viewport.value.zoom}px`,
//           left: '0',
//         }
//         draggingNode.position.y = other.centerY - h / 2
//       }
//       // 底对底
//       else if (Math.abs(draggingNodeBottomY - other.bottomY) < SNAP_THRESHOLD) {
//         hGuide = {
//           display: 'block',
//           top: `${viewport.value.y + other.bottomY * viewport.value.zoom}px`,
//           left: '0',
//         }
//         draggingNode.position.y = other.bottomY - h
//       }
//     }

//     // 4. 批量更新 DOM 样式 (只更新一次)
//     verticalGuideStyle.value = vGuide
//     horizontalGuideStyle.value = hGuide

//     rafId = null
//   })
// }
// const onNodeDrag = (event: NodeDragEvent) => {
//   if (rafId) return
//   // console.log('Node dragged:', event.node.id, 'to position:', event.node.position)
//   // workflowStore.updateNodePosition(event.node.id, event.node.position)
//   // 先隐藏所有线，避免上一帧的线残留
//   hideAllGuides()
//   const { node: draggingNode } = event
//   const nodes = workflowStore.nodes
//   // 获取拖动节点的中心点和边缘坐标
//   const draggingNodeHalfWidth = (draggingNode.dimensions.width || 0) / 2
//   const draggingNodeHalfHeight = (draggingNode.dimensions.height || 0) / 2
//   const draggingNodeCenterX = draggingNode.position.x + draggingNodeHalfWidth
//   const draggingNodeCenterY = draggingNode.position.y + draggingNodeHalfHeight
//   const draggingNodeRightX = draggingNode.position.x + draggingNode.dimensions.width
//   const draggingNodeBottomY = draggingNode.position.y + draggingNode.dimensions.height
//   let isSnapped = false // 标志位，用于实现"吸附"效果
//   // 遍历所有其他节点进行比较
//   for (const otherNode of nodes) {
//     if (otherNode.id === draggingNode.id) continue
//     const otherNodeHalfWidth = (Number(otherNode.width) || 0) / 2
//     const otherNodeHalfHeight = (Number(otherNode.height) || 0) / 2
//     const otherNodeCenterX = otherNode.position.x + otherNodeHalfWidth
//     const otherNodeCenterY = otherNode.position.y + otherNodeHalfHeight
//     const otherNodeRightX = otherNode.position.x + Number(otherNode.width)
//     const otherNodeBottomY = otherNode.position.y + Number(otherNode.height)
//     // 检查各种对齐可能性
//     // 1. 垂直对齐 (比较 X 坐标)
//     // 左对左
//     if (Math.abs(draggingNode.position.x - otherNode.position.x) < SNAP_THRESHOLD) {
//       showVerticalGuide(otherNode.position.x)
//       // 吸附效果：强制将拖动节点的位置设置为对齐位置
//       draggingNode.position.x = otherNode.position.x
//       isSnapped = true
//     }
//     // 中对中
//     if (Math.abs(draggingNodeCenterX - otherNodeCenterX) < SNAP_THRESHOLD) {
//       showVerticalGuide(otherNodeCenterX)
//       draggingNode.position.x = otherNodeCenterX - draggingNodeHalfWidth
//       isSnapped = true
//     }
//     // 右对右
//     if (Math.abs(draggingNodeRightX - otherNodeRightX) < SNAP_THRESHOLD) {
//       showVerticalGuide(otherNodeRightX)
//       draggingNode.position.x = otherNodeRightX - draggingNode.dimensions.width
//       isSnapped = true
//     }
//     // 2. 水平对齐 (比较 Y 坐标)
//     // 顶对顶
//     if (Math.abs(draggingNode.position.y - otherNode.position.y) < SNAP_THRESHOLD) {
//       showHorizontalGuide(otherNode.position.y)
//       draggingNode.position.y = otherNode.position.y
//       isSnapped = true
//     }
//     // 中对中
//     if (Math.abs(draggingNodeCenterY - otherNodeCenterY) < SNAP_THRESHOLD) {
//       showHorizontalGuide(otherNodeCenterY)
//       draggingNode.position.y = otherNodeCenterY - draggingNodeHalfHeight
//       isSnapped = true
//     }
//     // 底对底
//     if (Math.abs(draggingNodeBottomY - otherNodeBottomY) < SNAP_THRESHOLD) {
//       showHorizontalGuide(otherNodeBottomY)
//       draggingNode.position.y = otherNodeBottomY - draggingNode.dimensions.height
//       isSnapped = true
//     }
//   }
// }

const onNodeDragStop = (event: NodeDragEvent) => {
  // 清理 RAF
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  // 清理缓存
  dragSnapCandidates = []

  // 隐藏辅助线
  hideAllGuides()
  // if (!node.id) {
  //   node.id = `node-${nodeId++}`
  // }
  // console.log('Node drag stopped:', event.node.id, 'final position:', event.node.position)
  // workflowStore.updateNodePosition(event.node.id, event.node.position)
  // 拖动结束时，隐藏所有辅助线
  // hideAllGuides()
}

// 处理节点变化的方法
const onNodesChange = (changes: any[]) => {
  // changes.forEach((change) => {
  //   if (change.type === 'dimensions') {
  //     // 处理节点尺寸变化
  //     const node = workflowStore.nodes.find((n) => n.id === change.id)
  //     if (node) {
  //       node.dimensions = change.dimensions
  //     }
  //   } else if (change.type === 'select') {
  //     // 处理节点选择状态变化
  //     const node = workflowStore.nodes.find((n) => n.id === change.id)
  //     if (node) {
  //       node.selected = change.selected
  //     }
  //   } else if (change.type === 'remove') {
  //     // 处理节点删除
  //     workflowStore.nodes = workflowStore.nodes.filter((n) => n.id !== change.id)
  //   }
  // })
  // // 强制更新节点数组以触发响应式更新
  // workflowStore.nodes = [...workflowStore.nodes]
}

const onPaneReady = ({ fitView }: { fitView: () => void }) => {
  fitView()
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}
const vueFlowRef = ref<HTMLDivElement | null>(null)

const onDrop = (event: DragEvent) => {
  event.preventDefault()
  if (!vueFlowRef.value) {
    // 如果容器引用不存在，则无法计算，提前退出
    return
  }
  const type = event.dataTransfer?.getData('application/vueflow')
  const nodeDataStr = event.dataTransfer?.getData('nodeData')
  const categoryId = event.dataTransfer?.getData('categoryId')
  const nodeLabel = event.dataTransfer?.getData('nodeLabel')

  if (typeof type === 'string' && type) {
    // const containerRect = vueFlowRef.value.getBoundingClientRect()
    // const screenPos = project({
    //   x: event.clientX - containerRect.left,
    //   y: event.clientY - containerRect.top,
    // })
    // // 验证并规范化位置
    // const position = {
    //   x: isNaN(screenPos.x) ? 0 : screenPos.x - 10,
    //   y: isNaN(screenPos.y) ? 0 : screenPos.y,
    // }
    const position = screenToFlowCoordinate({
      x: event.clientX,
      y: event.clientY,
    })
    // 解析节点数据
    let nodeData = {}
    try {
      if (nodeDataStr) {
        nodeData = JSON.parse(nodeDataStr)
      }
    } catch (error) {
      console.error('Failed to parse node data:', error)
    }
    const nodeId = `${type}-${Date.now()}`
    // 创建新节点
    const newNode = {
      id: nodeId,
      type,
      category: categoryId || 'default',
      position: position,
      data: {
        ...nodeData,
      },
    }
    const { off } = onNodesInitialized(() => {
      updateNode(nodeId, (node) => ({
        position: {
          x: node.position.x - node.dimensions.width / 2,
          y: node.position.y - node.dimensions.height / 2,
        },
      }))

      off()
    })
    // 添加节点到画布
    workflowStore.nodes.push(newNode)
  }
}

const onConnect = (connection: WorkflowEdge) => {
  // 验证连接是否有效
  const sourceNode = workflowStore.nodes.find((n) => n.id === connection.source)
  const targetNode = workflowStore.nodes.find((n) => n.id === connection.target)

  if (!sourceNode || !targetNode) {
    ElMessage.warning('无效的连接')
    return
  }

  // 检查是否已存在相同连接
  // const exists = workflowStore.edges.some(
  //   (edge) => edge.source === connection.source && edge.target === connection.target,
  // )

  // if (exists) {
  //   ElMessage.warning('连接已存在')
  //   return
  // }

  workflowStore.edges.push({
    ...connection,
    id: `edge-${Date.now()}`,
    animated: true,
    style: { stroke: '#cc1616' },
  })
}

// 导出工作流为JSON文件
const exportWorkflow = () => {
  const workflow = {
    nodes: workflowStore.nodes,
    edges: workflowStore.edges,
  }
  const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `workflow-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  ElMessage.success('工作流已导出')
}

// 导入工作流
const importWorkflow = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      try {
        const text = await file.text()
        const workflow = JSON.parse(text)
        if (workflow.nodes && workflow.edges) {
          // 验证并修复节点位置
          workflow.nodes = workflow.nodes.map((node: any) => ({
            ...node,
            position: {
              x: isNaN(node.position?.x) ? 0 : node.position?.x || 0,
              y: isNaN(node.position?.y) ? 0 : node.position?.y || 0,
            },
          }))

          workflowStore.nodes = workflow.nodes
          workflowStore.edges = workflow.edges
          ElMessage.success('工作流已导入')
        } else {
          throw new Error('Invalid workflow format')
        }
      } catch (error) {
        ElMessage.error('导入失败：无效的工作流文件')
      }
    }
  }
  input.click()
}

// 自动布局
const autoLayout = () => {
  if (workflowStore.nodes.length === 0) {
    ElMessage.warning('没有可布局的节点')
    return
  }

  // 创建节点映射以便快速查找
  const nodeMap = new Map(workflowStore.nodes.map((node) => [node.id, node]))

  // 计算每个节点的入度（有多少条边指向该节点）
  const inDegrees = new Map()
  workflowStore.nodes.forEach((node) => {
    inDegrees.set(node.id, 0)
  })

  workflowStore.edges.forEach((edge) => {
    const currentInDegree = inDegrees.get(edge.target) || 0
    inDegrees.set(edge.target, currentInDegree + 1)
  })

  // 找到所有入度为0的节点（起始节点）
  const startNodes = workflowStore.nodes.filter((node) => (inDegrees.get(node.id) || 0) === 0)

  // 如果没有明确的起始节点，使用第一个节点作为起始
  const actualStartNodes = startNodes.length > 0 ? startNodes : [workflowStore.nodes[0]]

  // 设置布局参数
  const LAYER_SPACING = 250 // 层间距（水平方向）
  const NODE_SPACING = 150 // 节点间距（垂直方向）
  const START_X = 100 // 起始X位置
  const START_Y = 100 // 起始Y位置

  // 使用广度优先搜索进行层级布局
  const visited = new Set()
  const queue = actualStartNodes.map((node, index) => ({
    node,
    level: 0,
    index,
  }))

  // 记录每层的节点
  const levelNodes = new Map()
  levelNodes.set(0, [...actualStartNodes])

  // 处理起始节点
  actualStartNodes.forEach((node, index) => {
    node.position = {
      x: START_X,
      y: START_Y + index * NODE_SPACING,
    }
    visited.add(node.id)
  })

  // BFS遍历所有节点
  while (queue.length > 0) {
    const { node, level } = queue.shift() || {}

    if (!node) continue

    // 找到当前节点的所有后续节点
    const nextEdges = workflowStore.edges.filter((edge) => edge.source === node.id)

    nextEdges.forEach((edge, edgeIndex) => {
      const nextNode = nodeMap.get(edge.target)
      if (nextNode && !visited.has(nextNode.id)) {
        // 减少入度计数
        const newInDegree = (inDegrees.get(nextNode.id) || 0) - 1
        inDegrees.set(nextNode.id, newInDegree)

        // 如果入度为0，可以处理该节点
        if (newInDegree === 0) {
          const nextLevel = level + 1

          // 获取当前层的节点列表
          if (!levelNodes.has(nextLevel)) {
            levelNodes.set(nextLevel, [])
          }
          const currentLevelNodes = levelNodes.get(nextLevel)
          currentLevelNodes?.push(nextNode)

          visited.add(nextNode.id)

          // 加入队列继续处理
          queue.push({
            node: nextNode,
            level: nextLevel,
            index: (currentLevelNodes?.length || 1) - 1,
          })
        }
      }
    })
  }

  // 根据层级信息设置所有节点的最终位置
  levelNodes.forEach((nodes, level) => {
    if (nodes) {
      nodes.forEach((node, index) => {
        node.position = {
          x: START_X + level * LAYER_SPACING,
          y: START_Y + index * NODE_SPACING,
        }
      })
    }
  })

  // 处理未连接的节点（孤立节点）
  workflowStore.nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      const maxLevel = levelNodes.size > 0 ? Math.max(...Array.from(levelNodes.keys())) : 0
      const nextLevel = maxLevel + 1

      // 获取当前层的节点列表
      if (!levelNodes.has(nextLevel)) {
        levelNodes.set(nextLevel, [])
      }
      const currentLevelNodes = levelNodes.get(nextLevel)
      currentLevelNodes?.push(node)

      node.position = {
        x: START_X + nextLevel * LAYER_SPACING,
        y: START_Y + ((currentLevelNodes?.length || 1) - 1) * NODE_SPACING,
      }
    }
  })

  ElMessage.success('自动布局完成')
}

import { saveWorkflow as apiSaveWorkflow, loadWorkflow } from '@/api/workflow'

const saveWorkflow = async () => {
  try {
    // 准备工作流数据
    const workflowData: WorkflowData = {
      id: workflowId as string, // 如果是更新现有工作流
      name: workflowStore.currentWorkflow?.name || '未命名工作流',
      description: workflowStore.currentWorkflow?.description || '',
      data: { nodes: workflowStore.nodes, edges: workflowStore.edges },
      version: workflowStore.currentWorkflow?.version || 1,
    }

    // 保存到服务器
    await apiSaveWorkflow(workflowData)

    // 更新本地存储
    // workflowStore.saveToStorage()

    // 更新当前工作流信息
    workflowStore.setCurrentWorkflow(workflowData)

    ElMessage.success('工作流保存成功')
  } catch (error) {
    console.error('保存工作流失败:', error)
    ElMessage.error('保存失败：' + (error instanceof Error ? error.message : '未知错误'))
  }
}

// 切换全屏
const isFullscreen = ref(false)
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 监听全屏变化
onMounted(() => {
  loadWorkflow(workflowId as string).then((workflow) => {
    workflowStore.setCurrentWorkflow(workflow)
  })
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})

onUnmounted(() => {
  workflowStore.nodes = []
  workflowStore.edges = []
  document.removeEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})

const resetWorkflow = () => {
  ElMessageBox.confirm('确定要重置工作流吗？所有更改将丢失', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    workflowStore.nodes = []
    workflowStore.edges = []
    workflowStore.setSelectedNode(null)
    ElMessage.success('工作流已重置')
  })
}

import type { ContextMenuState } from '@/types/editor'
import TextCombineNode from './nodes/TextCombineNode.vue'
import TongyiNode from './nodes/TongyiNode.vue'
import TextDisplayNode from './nodes/TextDisplayNode.vue'
import StartNode from './nodes/StartNode.vue'
import EndNode from './nodes/EndNode.vue'
import ConditionNode from './nodes/ConditionNode.vue'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import HttpRequestNode from './nodes/HttpRequestNode.vue'
import CodeExecutionNode from './nodes/CodeExecutionNode.vue'
import LoopNode from './nodes/LoopNode.vue'
import FileNode from './nodes/FileNode.vue'
import CrawlerNode from './nodes/CrawlerNode.vue'
import DatabaseNode from './nodes/DatabaseNode.vue'
import TriggerNode from './nodes/TriggerNode.vue'
import OllamaNode from './nodes/OllamaNode.vue'
import NodeTestDialog from './NodeTestDialog.vue'
import HtmlDisplayNode from './nodes/HtmlDisplayNode.vue'
import QwenVLNode from './nodes/QwenVLNode.vue'
import A2ATaskNode from './nodes/A2ATaskNode.vue'
import CallAgentNode from './nodes/CallAgentNode.vue'
import { throttle } from '@/utils/throttle'

const contextMenu = ref<ContextMenuState>({
  isVisible: false,
  position: { x: 0, y: 0 },
  node: undefined,
})

const onContextMenu = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const nodeElement = target.closest('.vue-flow__node')

  if (nodeElement) {
    const nodeId = nodeElement.getAttribute('data-id')
    const node = workflowStore.nodes.find((n: Node) => n.id === nodeId)
    console.log('node', node)
    contextMenu.value = {
      isVisible: true,
      position: { x: event.clientX, y: event.clientY },
      node: node || undefined,
    }
  } else {
    contextMenu.value = {
      isVisible: true,
      position: { x: event.clientX, y: event.clientY },
      node: undefined,
    }
  }
}

const copyNode = () => {
  if (!contextMenu.value.node) return

  const newNode: WorkflowNode = {
    ...contextMenu.value.node,
    id: `node-${Date.now()}`,
    position: {
      x: contextMenu.value.node.position.x + 50,
      y: contextMenu.value.node.position.y + 50,
    },
  }
  workflowStore.nodes.push(newNode)
  contextMenu.value.isVisible = false
  ElMessage.success('节点已复制')
}

const deleteNode = () => {
  if (!contextMenu.value.node) return

  ElMessageBox.confirm('确定要删除这个节点吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    workflowStore.nodes = workflowStore.nodes.filter(
      (n: Node) => n.id !== contextMenu.value.node?.id,
    )
    workflowStore.edges = workflowStore.edges.filter(
      (e: Edge) =>
        e.source !== contextMenu.value.node?.id && e.target !== contextMenu.value.node?.id,
    )
    contextMenu.value.isVisible = false
    ElMessage.success('节点已删除')
  })
}

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Delete' && workflowStore.selectedNode) {
    ElMessageBox.confirm('确定要删除这个节点吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      workflowStore.nodes = workflowStore.nodes.filter(
        (n) => n.id !== workflowStore.selectedNode?.id,
      )
      workflowStore.edges = workflowStore.edges.filter(
        (e) =>
          e.source !== workflowStore.selectedNode?.id &&
          e.target !== workflowStore.selectedNode?.id,
      )
      workflowStore.setSelectedNode(null)
      ElMessage.success('节点已删除')
    })
  }
}

const closeContextMenu = () => {
  contextMenu.value.isVisible = false
}

// 存储清理函数的引用
let cleanupKeyboardShortcuts: (() => void) | null = null

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  document.addEventListener('click', closeContextMenu)

  // 设置撤销/重做快捷键
  cleanupKeyboardShortcuts = setupKeyboardShortcuts(
    () => workflowStore.undo(),
    () => workflowStore.redo(),
    () => workflowStore.canUndo(),
    () => workflowStore.canRedo(),
  )
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('click', closeContextMenu)

  // 清理快捷键监听器
  if (cleanupKeyboardShortcuts) {
    cleanupKeyboardShortcuts()
  }
})

// 节点测试对话框状态
const nodeTestDialog = ref({
  visible: false,
  node: null as WorkflowNode | null,
  formData: {} as Record<string, any>,
  result: null as any,
  error: null as string | null,
  loading: false,
})

const nodeTestFormRef = ref()

// 添加变量（针对textCombine节点）
const addVariable = () => {
  if (nodeTestDialog.value.node?.type === 'textCombine') {
    nodeTestDialog.value.formData.variables.push({
      fieldType: 'input',
      fieldName: `variable${nodeTestDialog.value.formData.variables.length + 1}`,
      fieldDesc: `变量 ${nodeTestDialog.value.formData.variables.length + 1}`,
      fieldValue: '',
      options: [],
      show: true,
      list: false,
      required: false,
    })
  }
}

// 测试节点功能
const testNode = () => {
  if (!contextMenu.value.node) return

  // 初始化表单数据
  const formData: Record<string, any> = {}

  // 针对textCombine节点的特殊处理
  if (contextMenu.value.node.type === 'textCombine') {
    // 初始化template字段
    formData.template = contextMenu.value.node.data.template?.fieldValue || ''

    // 初始化variables字段
    formData.variables = []
    if (Array.isArray(contextMenu.value.node.data.variables)) {
      contextMenu.value.node.data.variables.forEach((variable: any) => {
        formData.variables.push({
          ...variable,
          fieldValue: variable.fieldValue || '',
        })
      })
    }
  } else {
    // 其他节点类型的通用处理
    Object.entries(contextMenu.value.node.data).forEach(([key, field]: [string, any]) => {
      // 只处理 FieldData 类型的字段
      if (field && typeof field === 'object' && 'fieldValue' in field) {
        formData[key] = field.fieldValue !== undefined ? field.fieldValue : ''
      }
    })
  }

  nodeTestDialog.value = {
    visible: true,
    node: contextMenu.value.node as WorkflowNode,
    formData,
    result: null,
    error: null,
    loading: false,
  }

  contextMenu.value.isVisible = false
}
</script>

<style scoped>
.context-menu {
  position: fixed;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 120px;
}

.menu-item {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item .el-icon {
  font-size: 14px;
}

.workflow-editor {
  max-height: calc(100vh - 130px);
  display: flex;
  flex-direction: column;
}

.toolbar {
  padding: 10px;
  background: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  gap: 8px;

  .el-button-group {
    margin-right: 4px;
  }

  .el-divider {
    margin: 0 8px;
  }

  .toolbar-right {
    margin-left: auto;
  }

  :deep(.el-button) {
    display: inline-flex;
    align-items: center;
    gap: 4px;

    .el-icon {
      margin-right: 2px;
    }

    &:hover {
      transform: translateY(-1px);
      transition: transform 0.2s ease;
    }

    &:active {
      transform: translateY(0);
    }
  }
}

.editor-container {
  flex: 1;
  position: relative;
  height: calc(100% - 52px);
  display: flex;
  overflow: hidden;
}

.node-panel-container {
  width: 280px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  height: 100%;
  overflow-y: auto;
  flex-shrink: 0;
  z-index: 1;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.flow-area {
  flex: 1;
  position: relative;
  transition: all 0.3s ease;
  background: var(--el-bg-color-page);
}

:deep(.vue-flow__node) {
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }

  &.selected {
    box-shadow: 0 0 0 2px var(--el-color-primary);
  }
}

:deep(.vue-flow__edge) {
  &.selected {
    .vue-flow__edge-path {
      stroke: var(--el-color-primary);
      stroke-width: 2;
    }
  }
}

:deep(.vue-flow__minimap) {
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.vue-flow__controls) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;

  button {
    background: #fff;
    border: 1px solid #dcdfe6;
    border-bottom: none;
    width: 24px;
    height: 24px;

    &:last-child {
      border-bottom: 1px solid #dcdfe6;
    }

    &:hover {
      background: #f5f7fa;
    }

    svg {
      width: 12px;
      height: 12px;
    }
  }
}

.vue-flow {
  width: 100%;
  height: 100%;
}
.guide-line {
  position: absolute;
  background-color: #ff0072; /* 一个醒目的颜色 */
  z-index: 9; /* 确保在节点下方，但在背景之上 */
  pointer-events: none; /* 确保它不会干扰鼠标事件 */
}

.guide-line.horizontal {
  width: 100%;
  height: 1px;
}

.guide-line.vertical {
  height: 100%;
  width: 1px;
}

.test-result {
  max-height: 300px;
  overflow: auto;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #f5f7fa;
  margin-top: 15px;

  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    word-break: break-all;
    margin: 0;
    font-family: 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace;
  }
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #f5f7fa;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: #e1e5eb;
  transform: rotate(90deg);
}
</style>
