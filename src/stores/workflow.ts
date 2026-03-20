import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Node, Edge } from '@vue-flow/core'
import type { WorkflowData } from '@/types/workflow'
import type { WorkflowNode } from '@/types/node'
import { useUserStore } from './user'

const MAX_HISTORY = 50 // 最大历史记录数量

interface WorkflowState {
  nodes: WorkflowNode[]
  edges: Edge[]
}

export const useWorkflowStore = defineStore(
  'workflow',
  () => {
    const nodes = ref<WorkflowNode[]>([])
    const edges = ref<Edge[]>([])
    const selectedNode = ref<Node | null>(null)
    // 历史记录相关状态
    const history = ref<WorkflowState[]>([])
    const currentHistoryIndex = ref(-1)
    const isUndoRedo = ref(false)
    // 保存当前状态到历史记录
    const saveToHistory = () => {
      if (isUndoRedo.value) {
        isUndoRedo.value = false
        return
      }

      // 如果当前不在历史记录的末尾，删除当前位置之后的记录
      if (currentHistoryIndex.value < history.value.length - 1) {
        history.value = history.value.slice(0, currentHistoryIndex.value + 1)
      }

      // 添加新的状态
      history.value.push({
        nodes: JSON.parse(JSON.stringify(nodes.value)),
        edges: JSON.parse(JSON.stringify(edges.value)),
      })

      // 限制历史记录数量
      if (history.value.length > MAX_HISTORY) {
        history.value = history.value.slice(history.value.length - MAX_HISTORY)
      }

      currentHistoryIndex.value = history.value.length - 1
    }

    // 撤销
    const undo = () => {
      if (currentHistoryIndex.value > 0) {
        isUndoRedo.value = true
        currentHistoryIndex.value--
        const state = history.value[currentHistoryIndex.value]
        nodes.value = JSON.parse(JSON.stringify(state.nodes))
        edges.value = JSON.parse(JSON.stringify(state.edges))
      }
    }

    // 重做
    const redo = () => {
      if (currentHistoryIndex.value < history.value.length - 1) {
        isUndoRedo.value = true
        currentHistoryIndex.value++
        const state = history.value[currentHistoryIndex.value]
        nodes.value = JSON.parse(JSON.stringify(state.nodes))
        edges.value = JSON.parse(JSON.stringify(state.edges))
      }
    }

    // 监听变化自动保存
    watch(
      [nodes, edges],
      () => {
        if (!isUndoRedo.value) {
          saveToHistory()
        }
      },
      { deep: true },
    )

    // 监听工作流数量变化，更新用户资源使用情况
    const userStore = useUserStore()

    const addNode = (node: WorkflowNode) => {
      nodes.value.push(node)
    }

    const removeNode = (id: string) => {
      nodes.value = nodes.value.filter((node) => node.id !== id)
      edges.value = edges.value.filter((edge) => edge.source !== id && edge.target !== id)
    }

    const setSelectedNode = (node: Node | null) => {
      selectedNode.value = node
    }

    const addConditionNode = () => {
      const newNode = {
        id: `node-${Date.now()}`,
        type: 'condition',
        position: { x: 100, y: 100 },
        data: {
          label: '条件分支',
          conditionType: 'if',
          expression: '',
        },
        category: 'condition',
      }
      nodes.value.push(newNode)
    }

    const updateNodePosition = (id: string, position: { x: number; y: number }) => {
      const node = nodes.value.find((n) => n.id === id)
      if (node) {
        node.position = position
      }
    }

    // 检查是否可以撤销/重做
    const canUndo = () => currentHistoryIndex.value > 0
    const canRedo = () => currentHistoryIndex.value < history.value.length - 1

    // 更新节点数据
    const updateNode = (id: string, data: any) => {
      try {
        const nodeIndex = nodes.value.findIndex((n) => n.id === id)
        if (nodeIndex === -1) {
          console.error('Node not found:', id)
          return
        }

        // 创建节点的深拷贝
        const originalNode = nodes.value[nodeIndex]
        console.log('Original node:', originalNode)

        const updatedNode = JSON.parse(JSON.stringify(originalNode))

        // 更新节点数据，确保所有字段都被正确合并
        updatedNode.data = {
          ...updatedNode.data,
          ...JSON.parse(JSON.stringify(data)),
        }

        console.log('Updated node data:', updatedNode.data)

        // 使用新的节点替换原有节点，触发响应式更新
        const newNodes = [
          ...nodes.value.slice(0, nodeIndex),
          updatedNode,
          ...nodes.value.slice(nodeIndex + 1),
        ]

        // 确保新数组与原数组不同，以触发Vue的响应式更新
        if (JSON.stringify(nodes.value) !== JSON.stringify(newNodes)) {
          nodes.value = newNodes
          console.log('Nodes array updated')
        }

        // 如果当前选中的是这个节点，也更新选中的节点
        if (selectedNode.value?.id === id) {
          selectedNode.value = updatedNode
          console.log('Selected node updated')
        }

        // 验证更新是否成功
        const verifyNode = nodes.value.find((n) => n.id === id)
        console.log('Verification - Updated node in store:', verifyNode)

        if (!verifyNode || JSON.stringify(verifyNode.data) !== JSON.stringify(updatedNode.data)) {
          console.warn('Node update verification failed')
        }

        return updatedNode
      } catch (error) {
        console.error('Error updating node:', error)
        throw new Error(`Failed to update node ${id}: ${error}`)
      }
    }

    // 更新节点样式
    const updateNodeStyle = (id: string, style: any) => {
      const node = nodes.value.find((n) => n.id === id)
      if (node) {
        node.style = { ...node.style, ...style }
      }
    }

    // 删除节点
    const deleteNode = (id: string) => {
      nodes.value = nodes.value.filter((node) => node.id !== id)
      edges.value = edges.value.filter((edge) => edge.source !== id && edge.target !== id)
      if (selectedNode.value?.id === id) {
        selectedNode.value = null
      }
    }

    // 创建新工作流
    const createWorkflow = async (workflowData: any) => {
      // 检查是否达到工作流数量限制
      const userStore = useUserStore()
      if (userStore.isWorkflowLimitReached) {
        throw new Error('已达到工作流创建数量限制，请升级订阅计划以创建更多工作流')
      }

      // 额外检查：如果用户没有订阅信息，则使用默认限制
      if (
        !userStore.subscription &&
        userStore.subscriptionLimits.usedWorkflows >= userStore.subscriptionLimits.maxWorkflows
      ) {
        throw new Error('已达到工作流创建数量限制，请升级订阅计划以创建更多工作流')
      }

      try {
        const { createWorkflow: apiCreateWorkflow } = await import('@/api/workflow')
        const newWorkflow = await apiCreateWorkflow(workflowData)

        // 重置本地状态
        nodes.value = []
        edges.value = []
        selectedNode.value = null
        history.value = []
        currentHistoryIndex.value = -1

        return newWorkflow
      } catch (error) {
        console.error('Error creating workflow:', error)
        throw error
      }
    }

    // 更新工作流
    const updateWorkflow = async (id: string, workflowData: any) => {
      try {
        const { updateWorkflow: apiUpdateWorkflow } = await import('@/api/workflow')
        const updatedWorkflow = await apiUpdateWorkflow(id, workflowData)

        // 如果更新的是当前工作流，同步更新本地状态
        if (currentWorkflow.value && currentWorkflow.value.id === id) {
          currentWorkflow.value = {
            ...currentWorkflow.value,
            ...workflowData,
          }
        }

        return updatedWorkflow
      } catch (error) {
        console.error(`Error updating workflow ${id}:`, error)
        throw error
      }
    }

    // 获取工作流列表
    const fetchWorkflows = async (data: any) => {
      try {
        const { getWorkflowList } = await import('@/api/workflow')
        return await getWorkflowList(data.page, data.pageSize)
      } catch (error) {
        console.error('Error fetching workflows:', error)
        throw new Error('Failed to load workflows. Please check API availability.')
      }
    }

    // 获取单个工作流
    const getWorkflowById = async (id: string) => {
      try {
        const { getWorkflowById: apiGetWorkflowById } = await import('@/api/workflow')
        return await apiGetWorkflowById(id)
      } catch (error) {
        console.error(`Error fetching workflow ${id}:`, error)
        throw new Error('Failed to load workflow. Please check API availability.')
      }
    }

    // 删除工作流
    const deleteWorkflow = async (id: string) => {
      try {
        const { deleteWorkflow: apiDeleteWorkflow } = await import('@/api/workflow')
        await apiDeleteWorkflow(id)

        // 如果删除的是当前工作流，清空当前工作流
        if (currentWorkflow.value && currentWorkflow.value.id === id) {
          currentWorkflow.value = undefined
        }

        return true
      } catch (error) {
        console.error(`Error deleting workflow ${id}:`, error)
        throw error
      }
    }

    // 当前工作流ID
    const currentWorkflow = ref<WorkflowData>()

    // 设置当前工作流
    const setCurrentWorkflow = (data: WorkflowData) => {
      currentWorkflow.value = data
      if (data.data.nodes) {
        nodes.value = data.data.nodes
      }
      if (data.data.edges) {
        edges.value = data.data.edges
      }
    }

    // 保存工作流到本地存储
    const saveToStorage = () => {
      // 由于已经设置了 persist: true，Pinia 会自动保存状态
      // 这个方法主要用于手动触发保存操作，例如在用户点击保存按钮时
      // 可以在这里添加额外的保存逻辑，如更新保存时间戳等

      // 如果需要，可以在这里添加额外的元数据
      const timestamp = new Date().toISOString()

      console.log('工作流已保存到本地存储，时间：', timestamp)
      return timestamp
    }

    return {
      nodes,
      edges,
      selectedNode,
      addNode,
      addConditionNode,
      removeNode,
      setSelectedNode,
      updateNodePosition,
      // 新增的撤销/重做相关方法
      undo,
      redo,
      canUndo,
      canRedo,
      // 新增的节点更新方法
      updateNode,
      updateNodeStyle,
      deleteNode,
      // 新增的创建工作流方法
      createWorkflow,
      updateWorkflow,
      // 新增的获取工作流列表方法
      fetchWorkflows,
      // 新增的保存到本地存储方法
      saveToStorage,
      // 工作流执行相关
      getWorkflowById,
      // 删除工作流
      deleteWorkflow,
      // 当前工作流
      currentWorkflow,
      setCurrentWorkflow,
    }
  },
  {
    persist: true, // 开启持久化
  },
)
