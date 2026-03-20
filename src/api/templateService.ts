import type { AnyTemplate, TemplateListResponse, TemplateListParams } from '@/types/template'
import { api } from './http'

const API_BASE_URL = '/v1/templates'

export const TemplateService = {
  // 获取模板列表
  async getTemplates(params: TemplateListParams = {}): Promise<TemplateListResponse> {
    try {
      return await api.get(API_BASE_URL, { params })
    } catch (err) {
      console.error('获取模板列表失败:', err)
      throw err
    }
  },

  /**
   * 获取单个模板
   * @param id 模板 ID
   * @returns 模板详情
   */
  async getTemplate(id: string): Promise<AnyTemplate> {
    try {
      return await api.get(`${API_BASE_URL}/${id}`)
    } catch (err) {
      console.error(`获取模板 ${id} 失败:`, err)
      throw err
    }
  },

  /**
   * 更新模板
   * @param id 模板 ID
   * @param template 模板数据
   * @returns 更新后的模板
   */
  async updateTemplate(id: string, template: Partial<AnyTemplate>): Promise<AnyTemplate> {
    try {
      return await api.put(`${API_BASE_URL}/${id}`, template)
    } catch (err) {
      console.error(`更新模板 ${id} 失败:`, err)
      throw err
    }
  },

  /**
   * 删除模板
   * @param id 模板 ID
   */
  async deleteTemplate(id: string): Promise<void> {
    try {
      return await api.delete(`${API_BASE_URL}/${id}`)
    } catch (err) {
      console.error(`删除模板 ${id} 失败:`, err)
      throw err
    }
  },

  /**
   * 从工作流创建模板
   */
  async createTemplateFromWorkflow(templateData: any, sourceId: string): Promise<AnyTemplate> {
    try {
      return await api.post(`${API_BASE_URL}/workflow/template`, {
        ...templateData,
        sourceId,
      })
    } catch (err) {
      console.error('从工作流创建模板失败:', err)
      throw err
    }
  },

  /**
   * 从智能体创建模板
   */
  async createTemplateFromAgent(templateData: any, sourceId: string): Promise<AnyTemplate> {
    try {
      return await api.post(`${API_BASE_URL}/agent/template`, {
        ...templateData,
        sourceId,
      })
    } catch (err) {
      console.error('从智能体创建模板失败:', err)
      throw err
    }
  },

  /**
   * 创建工作流实例从模板
   */
  async createWorkflowFromTemplate(
    templateId: string,
    workflowData: { name: string; description?: string },
  ): Promise<any> {
    try {
      return await api.post(`${API_BASE_URL}/workflow`, {
        templateId: templateId,
        name: workflowData.name,
        description: workflowData.description,
      })
    } catch (err) {
      console.error(`从模板创建工作流失败:`, err)
      throw err
    }
  },

  /**
   * 创建智能体实例从模板
   */
  async createAgentFromTemplate(
    templateId: string,
    agentData: { name: string; description?: string },
  ): Promise<any> {
    try {
      return await api.post(`${API_BASE_URL}/agent`, {
        templateId: templateId,
        name: agentData.name,
        description: agentData.description,
      })
    } catch (err) {
      console.error(`从模板创建智能体失败:`, err)
      throw err
    }
  },

  /**
   * 导出模板
   */
  async exportTemplate(id: string): Promise<any> {
    try {
      return await api.get(`${API_BASE_URL}/${id}/export`)
    } catch (err) {
      console.error(`导出模板 ${id} 失败:`, err)
      throw err
    }
  },

  /**
   * 导入模板
   */
  async importTemplate(templateData: any): Promise<AnyTemplate> {
    try {
      return await api.post(`${API_BASE_URL}/import`, templateData)
    } catch (err) {
      console.error('导入模板失败:', err)
      throw err
    }
  },
}
