import type { WorkflowData, WorkflowPageData } from '@/types/workflow'
import { api } from './http'
import type { WorkflowNode } from '@/types/node'
import type { Edge } from '@vue-flow/core'

const API_BASE_URL = '/v1/workflows'

// 保存工作流
export const saveWorkflow = async (workflow: WorkflowData): Promise<WorkflowData> => {
  return await api.post(API_BASE_URL + '/save', workflow)
}

// 加载工作流
export const loadWorkflow = async (workflowId: string): Promise<WorkflowData> => {
  return await api.get(`${API_BASE_URL}/${workflowId}`)
}

// 获取工作流（与loadWorkflow相同，为了保持API命名一致）
export const getWorkflowById = loadWorkflow

// 执行工作流测试
export interface WorkflowExecutionResult {
  success: boolean
  result: any
  error?: string
  executionTime?: number
  logs?: string[]
}

export const executeWorkflow = async (
  workflowId: string,
  nodes: WorkflowNode[],
  edges: Edge[],
): Promise<WorkflowExecutionResult> => {
  return await api.post(`${API_BASE_URL}/execute`, {
    workflowId,
    data: {
      nodes,
      edges,
    },
  })
}

// 获取工作流列表
// 创建新工作流
export const createWorkflow = async (
  workflowData: Partial<WorkflowData>,
): Promise<WorkflowData> => {
  return await api.post(API_BASE_URL + '/create', workflowData)
}

// 更新工作流
export const updateWorkflow = async (
  workflowId: string,
  workflowData: Partial<WorkflowData>,
): Promise<WorkflowData> => {
  workflowData.id = workflowId
  return await api.put(`${API_BASE_URL}/update`, workflowData)
}

export const getWorkflowList = async (
  page: number,
  pageSize: number,
): Promise<WorkflowPageData> => {
  return await api.post(API_BASE_URL + '/list', {
    page,
    pageSize,
  })
}
export const listAllWorflow = async (): Promise<WorkflowData[]> => {
  return await api.post(API_BASE_URL + '/all', {})
}
// 删除工作流
export const deleteWorkflow = async (workflowId: string): Promise<void> => {
  return await api.delete(`${API_BASE_URL}/${workflowId}`)
}
