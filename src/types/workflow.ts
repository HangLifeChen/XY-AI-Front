import type { GraphNode, Connection, Node, Edge } from '@vue-flow/core'
import { NodeTypes } from '../constants/nodeTypes'
import type { WorkflowNode } from './node'

export interface NodeData {}

export interface TaskNodeData extends NodeData {
  taskType: string
  config?: Record<string, any>
}

export interface ConditionNodeData extends NodeData {
  condition: string
  evaluator?: string
}

export interface AgentNodeData extends NodeData {
  agentId: string
  prompt?: string
  parameters?: Record<string, any>
}

export interface MessageNodeData extends NodeData {
  messageType: 'send' | 'receive'
  channel?: string
  template?: string
}

export interface DecisionNodeData extends NodeData {
  options: string[]
  criteria?: string
}
export interface TextCombineNodeData extends NodeData {
  template: string
  variables: Array<string>
  outputVar: string
}

export interface InputNodeData extends NodeData {
  variableName: string
  defaultValue?: any
  description?: string
  required?: boolean
  inputType?: 'text' | 'number' | 'boolean' | 'file' | 'select' | 'multiselect'
  options?: Array<{ label: string; value: any }>
}

export interface OutputNodeData extends NodeData {
  variableName: string
  format?: 'text' | 'json' | 'html' | 'markdown'
  template?: string
}

export interface TextDisplayNodeData extends NodeData {
  content: string
  title: string
  renderMarkdown: boolean
}

export interface CrawlerNodeData extends NodeData {
  url: string
  selector?: string
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: string
  outputVar: string
  pagination?: {
    enabled: boolean
    nextSelector?: string
    maxPages?: number
  }
}

export interface AudioGenNodeData extends NodeData {
  text: string
  voice?: string
  language?: string
  speed?: number
  pitch?: number
  outputVar: string
  format?: 'mp3' | 'wav' | 'ogg'
}

export interface BreakNodeData extends NodeData {
  condition?: string
  message?: string
}

export interface FileOperationNodeData extends NodeData {
  operation: 'read' | 'write' | 'copy' | 'delete'
  sourcePath: string
  targetPath?: string
  encoding?: string
  outputVar?: string
}

export interface HttpNodeData extends NodeData {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  outputVar: string
  timeout?: number
  retries?: number
}

export interface ImageGenNodeData extends NodeData {
  prompt: string
  negativePrompt?: string
  model?: string
  width?: number
  height?: number
  steps?: number
  outputVar: string
}

export interface JsonNodeData extends NodeData {
  operation: 'parse' | 'stringify' | 'select' | 'transform'
  input: string
  path?: string
  template?: string
  outputVar: string
}

export interface LoopNodeData extends NodeData {
  loopType: 'count' | 'collection' | 'condition'
  count?: number
  collection?: string
  condition?: string
  itemVar?: string
  indexVar?: string
}

export interface MultimodalNodeData extends NodeData {
  inputs: Array<{
    type: 'text' | 'image' | 'audio' | 'video'
    content: string
  }>
  model: string
  task: string
  outputVar: string
}

export interface PythonNodeData extends NodeData {
  code: string
  requirements?: string[]
  inputVars?: string[]
  outputVar: string
  timeout?: number
}

export interface SqlDbNodeData extends NodeData {
  connection: {
    type: 'mysql' | 'postgresql' | 'sqlite'
    host?: string
    port?: number
    database: string
    username?: string
    password?: string
  }
  query: string
  parameters?: Record<string, any>
  outputVar: string
}

export interface TextProcessNodeData extends NodeData {
  operation: 'extract' | 'replace' | 'split' | 'join' | 'regex'
  input: string
  pattern?: string
  replacement?: string
  outputVar: string
}

export interface VectorDbNodeData extends NodeData {
  operation: 'insert' | 'search' | 'delete'
  collection: string
  data?: any
  query?: any
  outputVar?: string
}

export interface VideoGenNodeData extends NodeData {
  prompt: string
  duration?: number
  fps?: number
  resolution?: string
  model?: string
  outputVar: string
}

export interface WebhookNodeData extends NodeData {
  endpoint: string
  method: 'GET' | 'POST'
  headers?: Record<string, string>
  payload?: any
  outputVar: string
}
export interface WorkflowPageData {
  total: number
  list: WorkflowData[]
  currentPage: number
  pageSize: number
}
export interface WorkflowData {
  id: string
  name: string
  description?: string
  data: {
    nodes?: WorkflowNode[] // 新增，用于更好的类型支持
    edges?: Edge[] // 新增，用于更好的类型支持
  }
  createdAt?: string
  updatedAt?: string
  version?: number
}

export type WorkflowNodeData = TextCombineNodeData | TextDisplayNodeData

// export interface WorkflowNode extends GraphNode<WorkflowNodeData> {
//   id: string
//   type: (typeof NodeTypes)[keyof typeof NodeTypes]
//   position: {
//     x: number
//     y: number
//   }
//   data: WorkflowNodeData
// }

export type WorkflowEdge = Connection

export type NodeStatus = 'running' | 'completed' | 'error' | undefined

export interface ExecutionContext {
  variables: Record<string, any>
  logs: ExecutionLog[]
}

export interface ExecutionLog {
  type: 'info' | 'success' | 'error'
  message: string
  nodeId?: string
  timestamp: number
}
