import { defineStore, type StoreGeneric } from 'pinia'
import { ref, watch } from 'vue'
import type { Node, Edge } from '@vue-flow/core'
import type { WorkflowData, WorkflowPageData } from '@/types/workflow'
import type { WorkflowNode } from '@/types/node'
import { useUserStore } from './user'

const MAX_HISTORY = 50

interface WorkflowState {
  nodes: WorkflowNode[]
  edges: Edge[]
}

function workflowStoreSetup() {
  const nodes = ref<WorkflowNode[]>([])
  const edges = ref<Edge[]>([])
  const selectedNode = ref<Node | null>(null)
  const history = ref<WorkflowState[]>([])
  const currentHistoryIndex = ref(-1)
  const isUndoRedo = ref(false)
  const currentWorkflow = ref<WorkflowData>()

  const saveToHistory = () => {
    if (isUndoRedo.value) {
      isUndoRedo.value = false
      return
    }

    if (currentHistoryIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, currentHistoryIndex.value + 1)
    }

    history.value.push({
      nodes: JSON.parse(JSON.stringify(nodes.value)),
      edges: JSON.parse(JSON.stringify(edges.value)),
    })

    if (history.value.length > MAX_HISTORY) {
      history.value = history.value.slice(history.value.length - MAX_HISTORY)
    }

    currentHistoryIndex.value = history.value.length - 1
  }

  const undo = () => {
    if (currentHistoryIndex.value > 0) {
      isUndoRedo.value = true
      currentHistoryIndex.value--
      const state = history.value[currentHistoryIndex.value]
      nodes.value = JSON.parse(JSON.stringify(state.nodes))
      edges.value = JSON.parse(JSON.stringify(state.edges))
    }
  }

  const redo = () => {
    if (currentHistoryIndex.value < history.value.length - 1) {
      isUndoRedo.value = true
      currentHistoryIndex.value++
      const state = history.value[currentHistoryIndex.value]
      nodes.value = JSON.parse(JSON.stringify(state.nodes))
      edges.value = JSON.parse(JSON.stringify(state.edges))
    }
  }

  watch(
    [nodes, edges],
    () => {
      if (!isUndoRedo.value) {
        saveToHistory()
      }
    },
    { deep: true },
  )

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

  const canUndo = () => currentHistoryIndex.value > 0
  const canRedo = () => currentHistoryIndex.value < history.value.length - 1

  const updateNode = (id: string, data: any) => {
    try {
      const nodeIndex = nodes.value.findIndex((n) => n.id === id)
      if (nodeIndex === -1) {
        console.error('Node not found:', id)
        return
      }

      const originalNode = nodes.value[nodeIndex]
      const updatedNode = JSON.parse(JSON.stringify(originalNode))

      updatedNode.data = {
        ...updatedNode.data,
        ...JSON.parse(JSON.stringify(data)),
      }

      const newNodes = [
        ...nodes.value.slice(0, nodeIndex),
        updatedNode,
        ...nodes.value.slice(nodeIndex + 1),
      ]

      if (JSON.stringify(nodes.value) !== JSON.stringify(newNodes)) {
        nodes.value = newNodes
      }

      if (selectedNode.value?.id === id) {
        selectedNode.value = updatedNode
      }

      return updatedNode
    } catch (error) {
      console.error('Error updating node:', error)
      throw new Error(`Failed to update node ${id}: ${error}`)
    }
  }

  const updateNodeStyle = (id: string, style: any) => {
    const node = nodes.value.find((n) => n.id === id)
    if (node) {
      node.style = { ...node.style, ...style }
    }
  }

  const deleteNode = (id: string) => {
    nodes.value = nodes.value.filter((node) => node.id !== id)
    edges.value = edges.value.filter((edge) => edge.source !== id && edge.target !== id)
    if (selectedNode.value?.id === id) {
      selectedNode.value = null
    }
  }

  const createWorkflow = async (workflowData: any) => {
    const userStore = useUserStore()
    if (userStore.isWorkflowLimitReached) {
      throw new Error('已达到工作流创建数量限制，请升级订阅计划以创建更多工作流')
    }

    if (
      !userStore.subscription &&
      userStore.subscriptionLimits.usedWorkflows >= userStore.subscriptionLimits.maxWorkflows
    ) {
      throw new Error('已达到工作流创建数量限制，请升级订阅计划以创建更多工作流')
    }

    try {
      const { createWorkflow: apiCreateWorkflow } = await import('@/api/workflow')
      const newWorkflow = await apiCreateWorkflow(workflowData)

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

  const updateWorkflow = async (id: string, workflowData: any) => {
    try {
      const { updateWorkflow: apiUpdateWorkflow } = await import('@/api/workflow')
      const updatedWorkflow = await apiUpdateWorkflow(id, workflowData)

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

  const fetchWorkflows = async (data: any): Promise<WorkflowPageData> => {
    try {
      const { getWorkflowList } = await import('@/api/workflow')
      return await getWorkflowList(data.page, data.pageSize)
    } catch (error) {
      console.error('Error fetching workflows:', error)
      throw new Error('Failed to load workflows. Please check API availability.')
    }
  }

  const getWorkflowById = async (id: string): Promise<WorkflowData> => {
    try {
      const { getWorkflowById: apiGetWorkflowById } = await import('@/api/workflow')
      return await apiGetWorkflowById(id)
    } catch (error) {
      console.error(`Error fetching workflow ${id}:`, error)
      throw new Error('Failed to load workflow. Please check API availability.')
    }
  }

  const deleteWorkflow = async (id: string): Promise<boolean> => {
    try {
      const { deleteWorkflow: apiDeleteWorkflow } = await import('@/api/workflow')
      await apiDeleteWorkflow(id)

      if (currentWorkflow.value && currentWorkflow.value.id === id) {
        currentWorkflow.value = undefined
      }

      return true
    } catch (error) {
      console.error(`Error deleting workflow ${id}:`, error)
      throw error
    }
  }

  const setCurrentWorkflow = (data: WorkflowData) => {
    currentWorkflow.value = data
    if (data.data.nodes) {
      nodes.value = data.data.nodes
    }
    if (data.data.edges) {
      edges.value = data.data.edges
    }
  }

  const saveToStorage = () => {
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
    undo,
    redo,
    canUndo,
    canRedo,
    updateNode,
    updateNodeStyle,
    deleteNode,
    createWorkflow,
    updateWorkflow,
    fetchWorkflows,
    saveToStorage,
    getWorkflowById,
    deleteWorkflow,
    currentWorkflow,
    setCurrentWorkflow,
  }
}

export const useWorkflowStore = defineStore('workflow', workflowStoreSetup, {
  persist: true,
}) as unknown as StoreGeneric
