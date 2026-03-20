/**
 * 模板相关类型定义
 */

/**
 * 模板类型
 */
export type TemplateType = 'workflow' | 'agent'

/**
 * 基础模板接口
 */
export interface BaseTemplate {
  id: string
  name: string
  description: string
  type: TemplateType
  data: any
  createdAt: string
  updatedAt: string
  createdBy: number
}

/**
 * 工作流模板
 */
export interface WorkflowTemplate extends BaseTemplate {
  type: 'workflow'
  data: {
    nodes: any[]
    edges: any[]
    metadata?: Record<string, any>
  }
}

/**
 * 智能体模板
 */
export interface AgentTemplate extends BaseTemplate {
  type: 'agent'
  data: {
    config?: Record<string, any>
    tools?: string[]
    prompt?: string
    metadata?: Record<string, any>
  }
}

/**
 * 任意类型模板
 */
export type AnyTemplate = WorkflowTemplate | AgentTemplate

/**
 * 模板列表参数
 */
export interface TemplateListParams {
  search?: string
  type?: TemplateType
  category?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * 模板列表响应
 */
export interface TemplateListResponse {
  items: AnyTemplate[]
  total: number
  page: number
  pageSize: number
}

/**
 * 创建模板表单
 */
export interface CreateTemplateForm {
  name: string
  description: string
  type: TemplateType
  tags: string[]
  thumbnail?: string
  definition: any
}

/**
 * 模板应用结果
 */
export interface TemplateApplyResult {
  success: boolean
  message: string
  result: {
    id: string
    name: string
    type: TemplateType
  }
}
