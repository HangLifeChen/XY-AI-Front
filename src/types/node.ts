import type { Edge, Node } from '@vue-flow/core'

export interface WorkflowNode extends Node {
  category?: string
}
export enum FieldType {
  INPUT = 'input',
  INPUT_NUMBER = 'input_number',
  SELECT = 'select',
  MULTI_SELECT = 'multiSelect',
  TEXT = 'text',
  TEXTAREA = 'textarea',
  DIV = 'div',
  VAL = 'val',
  UPLOAD = 'upload',
  SWITCH = 'switch',
  DATE = 'date',
}
export const FieldValueType = {
  STR: 'string',
  FLOAT: 'float',
  INT: 'int',
  BOOL: 'bool',
}
// 基础节点数据接口
export interface BaseNodeData {
  label?: string
  description?: string
  [key: string]: any
}

export interface NodeData {
  id: string
  data: any
}
// 节点属性接口
export interface NodeProps<T extends BaseNodeData = BaseNodeData> {
  id: string
  data?: T
  selected?: boolean
}

export interface FieldData {
  fieldName: string
  fieldValue: any
  fieldDesc: string
  fieldType: FieldType
  list: boolean
  options: any[]
  show: boolean
  required: boolean
}

// 文本合成节点数据
export interface TextCombineNodeData {
  template: FieldData
  variables: FieldData[]
}

// 通义千问节点数据
export interface TongyiNodeData {
  model: FieldData
  prompt: FieldData
  systemPrompt: FieldData
  temperature: FieldData
  maxTokens: FieldData
  topP: FieldData
  responseFormat: FieldData
}
export interface QwenVLNodeData {
  model: FieldData
  providers: FieldData
  image: FieldData
  imageUrl: FieldData
  promptType: FieldData
  temperature: FieldData
  maxTokens: FieldData
  responseFormat: FieldData
}
// Ollama节点数据
export interface OllamaNodeData {
  baseURL: FieldData
  model: FieldData
  prompt: FieldData
  systemPrompt: FieldData
  temperature: FieldData
  maxTokens: FieldData
  topP: FieldData
  responseFormat: FieldData
}

// 文本显示节点数据
export interface TextDisplayNodeData {
  title: FieldData
  content: FieldData
  renderMarkdown: FieldData
  output?: any
}

// HTML显示节点数据
export interface HtmlDisplayNodeData {
  htmlContent: FieldData
  output?: any
}

// 开始节点数据
export interface StartNodeData {
  output: FieldData
}

// 结束节点数据
export interface EndNodeData {
  input: FieldData
}

// 条件节点数据
export interface ConditionNodeData {
  condition: FieldData
  trueBranch: FieldData
  falseBranch: FieldData
}

// HTTP请求节点数据
export interface HttpRequestNodeData {
  url: FieldData
  method: FieldData
  headers: FieldData
  body: FieldData
}

// 代码执行节点数据
export interface CodeExecutionNodeData {
  language: FieldData
  code: FieldData
  parameters: FieldData
}

// 循环节点数据
export interface LoopNodeData {
  count: FieldData
  variable: FieldData
}

// 数据库节点数据
export interface DatabaseNodeData {
  connectionString: FieldData
  query: FieldData
  parameters: FieldData
}

// 触发器节点数据
export interface TriggerNodeData {
  type: FieldData
  schedule: FieldData
  enabled: FieldData
}

// 网络爬虫节点数据
export interface CrawlerNodeData {
  url: FieldData
  format: FieldData
}

// 文件处理节点数据
export interface FileNodeData {
  filePath: FieldData
  operation: FieldData
  content: FieldData
}

export type NodeTypeData =
  | TextCombineNodeData
  | TongyiNodeData
  | QwenVLNodeData
  | OllamaNodeData
  | TextDisplayNodeData
  | HtmlDisplayNodeData
  | StartNodeData
  | EndNodeData
  | ConditionNodeData
  | HttpRequestNodeData
  | CodeExecutionNodeData
  | LoopNodeData
  | DatabaseNodeData
  | TriggerNodeData
  | CrawlerNodeData
  | FileNodeData

// 节点类型枚举
export enum NodeType {
  Input = 'input',
  Output = 'output',
  TextDisplay = 'textDisplay',
  HtmlDisplay = 'htmlDisplay',
  TextCombine = 'textCombine',
  Start = 'start',
  End = 'end',
  Condition = 'condition',
  Tongyi = 'tongyi',
  QwenVL = 'qwenVL',
  Ollama = 'ollama',
  Database = 'database',
  Trigger = 'trigger',
  Crawler = 'crawler',
  File = 'file',
}
export const responseFormatOptions = [
  {
    value: 'text',
    label: '文本',
  },
  {
    value: 'json',
    label: 'JSON',
  },
]

// 节点验证结果接口
export interface NodeValidationResult {
  valid: boolean
  message?: string
}

// 节点配置接口
export interface NodeConfig<T extends BaseNodeData = BaseNodeData> {
  type: NodeType
  label: string
  data: T
  position?: { x: number; y: number }
  style?: Record<string, any>
}

// 扩展 Vue Flow 的 Node 类型
export type CustomNode<T extends BaseNodeData = BaseNodeData> = Node<T>
