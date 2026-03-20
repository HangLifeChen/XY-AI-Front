export type ToolStatus = 'active' | 'inactive' | 'draft' | 'deprecated'
export type ToolType = 'mcp' | 'system'
export type DataType = 'object' | 'number' | 'integer' | 'string' | 'array' | 'boolean' | 'null'

export interface McpConfig {
  type?: string
  url?: string
  authenticationRequired?: boolean
  credentialType?: string
}

export interface ParametersSchema {
  Type: DataType
  ElemInfo: ParametersSchema
  SubParams: Record<string, ParametersSchema>
  Desc: string
  Enum: string[]
  Required: boolean
}

export interface Tool {
  id?: string
  creatorId?: number
  name?: string
  description?: string
  toolType?: ToolType
  isEnable?: boolean
  parametersSchema?: Record<string, ParametersSchema>
  mcpConfig?: McpConfig
  createdAt?: string
  updatedAt?: string
  version?: string // 添加版本字段，用于前端展示
}

export interface ToolListResponse {
  list: Tool[]
  total: number
  currentPage: number
  pageSize: number
}

export interface ToolListParams {
  page?: number
  pageSize?: number
  type?: string
  name?: string
}

export interface ToolExecutionResult {
  success: boolean
  data?: any
  error?: string
  executionTime: number
}
