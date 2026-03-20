import type {
  LLM,
  ProviderConfig,
  CreateLLMRequest,
  UpdateLLMRequest,
  CreateProviderConfigRequest,
  UpdateProviderConfigRequest,
} from '@/types/model'
import { api } from '@/api/http'

// 模型管理API
export const ModelService = {
  // 创建模型
  async createLLM(data: CreateLLMRequest): Promise<LLM> {
    return await api.post('/v1/llms', data)
  },

  // 获取模型列表
  async listLLMs(params?: { modelType?: string }): Promise<{ llms: LLM[]; total: number }> {
    return await api.get('/v1/llms', { params })
  },

  // 获取模型列表
  async listAllLLMs(params?: { modelType?: string }): Promise<LLM[]> {
    return await api.get('/v1/llms/all', { params })
  },

  // 获取模型详情
  async getLLM(modelId: string): Promise<LLM> {
    return await api.get(`/v1/llms/${modelId}`)
  },

  // 更新模型
  async updateLLM(modelId: string, data: UpdateLLMRequest): Promise<LLM> {
    return await api.put(`/v1/llms/${modelId}`, data)
  },

  // 删除模型
  async deleteLLM(id: string): Promise<void> {
    await api.delete(`/v1/llms/${id}`)
  },

  // 厂商配置管理API
  // 创建厂商配置
  async createProviderConfig(data: CreateProviderConfigRequest): Promise<ProviderConfig> {
    return await api.post('/v1/provider-configs', data)
  },

  // 获取厂商配置列表
  async listProviderConfigs(): Promise<{ providerConfigs: ProviderConfig[]; total: number }> {
    return await api.get('/v1/provider-configs')
  },

  // 获取厂商配置详情
  async getProviderConfig(id: string): Promise<ProviderConfig> {
    return await api.get(`/v1/provider-configs/${id}`)
  },

  // 更新厂商配置
  async updateProviderConfig(
    id: string,
    data: UpdateProviderConfigRequest,
  ): Promise<ProviderConfig> {
    return await api.put(`/v1/provider-configs/${id}`, data)
  },

  // 删除厂商配置
  async deleteProviderConfig(id: string): Promise<void> {
    await api.delete(`/v1/provider-configs/${id}`)
  },

  // 根据厂商配置ID获取模型列表
  async listLLMsByConfig(configId: string): Promise<LLM[]> {
    return await api.get(`/v1/llms/config/${configId}`)
  },
}
