// 模型状态枚举
export type LLMStatus = 'active' | 'inactive'

// 模型类型枚举
export type LLMType = 'chat' | 'embedding' | 'vision'

// 模型提供商枚举
export type LLMProvider =
  | 'openai'
  | 'azure_openai'
  | 'anthropic'
  | 'google'
  | 'local'
  | 'bailian'
  | 'baichuan'
  | 'zhipu'
  | 'tencent'
  | 'deepseek'

// 模型配置数据结构
export interface LLMConfigData {
  maxTokens?: number
  temperature?: number
  topP?: number
}

// 厂商配置
export interface ProviderConfig {
  id: string
  name: string
  userId: string
  provider: LLMProvider
  description: string
  apiKey: string
  apiBase: string
  status: LLMStatus
  createdAt: string
  updatedAt: string
}

// 用户自定义的AI大语言模型
export interface LLM {
  id: string
  userId: string
  name: string
  description: string
  providerConfigId: string
  providerConfig?: ProviderConfig
  modelName: string
  modelType: LLMType
  config: LLMConfigData
  status: LLMStatus
  createdAt: string
  updatedAt: string
}

// 创建模型请求参数
export interface CreateLLMRequest {
  name: string
  description: string
  providerConfigId: string
  modelName: string
  modelType: LLMType
  config: LLMConfigData
  status: LLMStatus
}

// 更新模型请求参数
export interface UpdateLLMRequest {
  name?: string
  description?: string
  providerConfigId?: number
  modelName?: string
  modelType?: LLMType
  config?: LLMConfigData
  status?: LLMStatus
}

// 创建厂商配置请求参数
export interface CreateProviderConfigRequest {
  provider: LLMProvider
  description: string
  apiKey: string
  apiBase: string
  status: LLMStatus
}

// 更新厂商配置请求参数
export interface UpdateProviderConfigRequest {
  provider?: LLMProvider
  description?: string
  apiKey?: string
  apiBase?: string
  status?: LLMStatus
}
