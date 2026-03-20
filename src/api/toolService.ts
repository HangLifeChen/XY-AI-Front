import { api } from './http'
import type { ToolListParams, ToolListResponse, ToolExecutionResult, Tool } from '@/types/tool'

const API_BASE_URL = '/v1/tools'

export const MCP = 'mcp'
export const SYSTEM = 'system'

export const ToolService = {
  async getTools(params: ToolListParams): Promise<ToolListResponse> {
    return await api.get(API_BASE_URL, { params })
  },

  async getTool(id: string): Promise<Tool> {
    return await api.get(`${API_BASE_URL}/${id}`)
  },

  async createTool(tool: Tool): Promise<Tool> {
    return await api.post(API_BASE_URL, tool)
  },

  async updateTool(id: string, tool: Partial<Tool>): Promise<Tool> {
    return await api.put(`${API_BASE_URL}/${id}`, tool)
  },

  async deleteTool(id: string): Promise<void> {
    await api.delete(`${API_BASE_URL}/${id}`)
  },

  async testTool(id: string, params: Record<string, any>): Promise<ToolExecutionResult> {
    return await api.post(`${API_BASE_URL}/${id}/test`, { params })
  },

  async importTool(definition: any): Promise<Tool> {
    return await api.post(`${API_BASE_URL}/import`, definition)
  },

  async exportTool(id: string): Promise<any> {
    return await api.get(`${API_BASE_URL}/${id}/export`)
  },

  async getMcpTools(mcpId: string): Promise<Tool[]> {
    return await api.get(`${API_BASE_URL}/mcp/${mcpId}/tools`)
  },
}
