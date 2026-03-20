import type { SystemSettings } from '@/types/settings'
import { api } from '@/api/http'

// 系统设置API服务
export const SettingsService = {
  // 获取系统设置
  async getSettings(): Promise<SystemSettings> {
    return await api.get('/v1/settings')
  },

  // 保存系统设置
  async saveSettings(data: SystemSettings): Promise<SystemSettings> {
    return await api.post('/v1/settings', data)
  },

  // 更新系统设置
  async updateSettings(data: SystemSettings): Promise<SystemSettings> {
    return await api.put('/v1/settings', data)
  },

  // 获取特定模块的设置
  async getSettingsModule(module: string): Promise<any> {
    return await api.get(`/v1/settings/${module}`)
  },

  // 更新特定模块的设置
  async updateSettingsModule(module: string, data: any): Promise<any> {
    return await api.put(`/v1/settings/${module}`, data)
  },
}
