import { api } from './http'

// 模型相关API
export const ModelService = {
  // 获取模型提供商列表
  async getModelProviders(modelType: string): Promise<string[]> {
    try {
      // 调用后端API获取模型提供商列表
      const response = await api.get('/v1/llms/providers', { params: { modelType: modelType } })
      return response.providers || []
    } catch (err) {
      console.error('获取模型提供商列表失败:', err)
      throw err
    }
  },

  // 获取模型列表
  async getModels(providerId: string, modelType: string): Promise<string[]> {
    try {
      // 调用后端API获取模型列表
      const params = { providerId: providerId, modelType: modelType }
      const response = await api.get('/v1/llms/models', { params })
      return response.models || []
    } catch (err) {
      console.error('获取模型列表失败:', err)
      throw err
    }
  },
}
