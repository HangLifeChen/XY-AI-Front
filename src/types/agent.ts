import type { AgentMarket } from './a2a'
import type { Tool } from './tool'

// 消息内容类型
export interface MessageContent {
  type: 'text' | 'code' | 'image' | 'markdown' | 'link'
  content: string
  language?: string // 用于代码块
  alt?: string // 用于图片
}

// 消息类型
export interface Message {
  id: string
  role: 'user' | 'assistant'
  contents: MessageContent[]
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'error'
  timestamp: number
  workflowInfo?: WorkflowInfo
}

// 工作流信息
export interface WorkflowInfo {
  id: string
  name: string
  status: 'preparing' | 'running' | 'paused' | 'completed' | 'failed'
  progress: number
  error?: string
  logs: string[]
}

// 上下文类型
export interface Context {
  id: string
  name: string
  variables: Record<string, any>
  timestamp: number
  messages: Message[]
}

// 知识库类型
export interface KnowledgeBase {
  id: string
  kb_id: string
  name: string
  description?: string
  embedding_model?: string
  storage_type: string
  storage_config?: Record<string, any>
  file_count: number
  created_at: string
  updated_at: string
}

// 工作流类型
export interface Workflow {
  id: string
  workflow_id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

// 智能体与知识库关联
export interface AgentKnowledgeBase {
  id: string
  agent_id: string
  kb_id: string
  status: 'enabled' | 'disabled'
  created_at: string
}

// 智能体与工具关联
export interface AgentTool {
  id: string
  agentUd: string
  toolId: string
  toolType: string
  status: 'enabled' | 'disabled'
  createdAt: string
}

// 智能体与工作流关联
export interface AgentWorkflow {
  id: string
  agent_id: string
  workflow_id: string
  is_default: boolean
  trigger_condition?: string
  priority: number
  status: 'enabled' | 'disabled'
  created_at: string
}

export interface AgentAgent {
  id: number
  agentId: string
  agentMarketId: string
}
// 模型提供商接口
export interface ModelProvider {
  id: string
  name: string
  description: string
  key?: string // 新增字段，用于后端返回的数据结构
}

// 模型接口
export interface Model {
  id: string
  provider_id: string
  name: string
  display_name: string
  description: string
  capabilities: string[]
  is_enabled: boolean
  created_at: string
  updated_at: string
}

export interface CreateAgentForm {
  id?: string
  name: string
  description: string
  status: string
  systemPrompt: string
  modelConfig: {
    provider: string
    model: string
    temperature: number
    maxTokens: number
    topP: number
    frequencyPenalty: number
    presencePenalty: number
  }
  workflows: []
}
// 智能体类型
export interface Agent {
  id: string
  creatorId: string
  name: string
  description?: string
  icon?: string
  systemPrompt?: string
  modelProvider: string
  modelName: string
  modelParameters?: Record<string, any>
  // 向量化模型配置
  embeddingModelProvider?: string
  embeddingModelName?: string
  embeddingModelParameters?: Record<string, any>
  openingDialogue?: string
  suggestedQuestions?: string[]
  memoryConfig?: Record<string, any>
  version: number
  status: 'draft' | 'published' | 'archived'
  visibility: 'private' | 'public' | 'link_only'
  invocation_count: number
  publishedAt?: string
  createdAt: string
  updatedAt: string

  // 关联数据
  knowledge_bases?: KnowledgeBase[]
  tools?: Tool[]
  workflows?: AgentWorkflow[]
  contexts?: Context[]
  agentMarkets?: AgentMarket[]
}

// 智能体列表响应
export interface AgentListResponse {
  agents: Agent[]
  total: number
}

// 消息请求接口
export interface MessageRequest {
  message: string
  contextId?: string
  workflowId?: string
  variables?: Record<string, any>
  references?: {
    type: string
    id: string
    content?: string
  }[]
}

// 消息响应类型
export interface MessageResponse {
  response: string
}

export interface CreateSessionRequest {
  agentId: string
  title?: string
}

export interface ChatSession {
  id: string
  agentId: string
  userId: string
  title: string
  createdAt: string
  updatedAt: string
  messages: ChatMessage[]
}

export interface ChatMessage {
  id: string
  sessionId: string
  content: string
  role: string
  createdAt: string
}
