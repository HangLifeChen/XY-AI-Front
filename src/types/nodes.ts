import { FieldData } from './node'

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

// 通义千问VL节点数据
export interface QwenVLNodeData {
  model: FieldData
  providers: FieldData
  image: FieldData
  imageUrl: FieldData
  temperature: FieldData
  maxTokens: FieldData
  responseFormat: FieldData
}

// 文本显示节点数据
export interface TextDisplayNodeData {
  title: FieldData
  content: FieldData
  renderMarkdown: FieldData
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