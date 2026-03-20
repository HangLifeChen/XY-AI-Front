import type { Tool } from '@/types/tool'
import { api } from './http'
import type {
  Agent,
  AgentListResponse,
  KnowledgeBase,
  AgentKnowledgeBase,
  AgentTool,
  AgentWorkflow,
  MessageRequest,
  MessageResponse,
  ModelProvider,
  Model,
  ChatSession,
  ChatMessage,
} from '@/types/agent'
import { useUserStore } from '@/stores/user'

export const AgentService = {
  // 获取智能体列表
  async getAgents(params?: {
    name?: string
    status?: string
    page?: number
    pageSize?: number
  }): Promise<AgentListResponse> {
    try {
      return await api.post('/v1/agents/list', { params })
    } catch (err) {
      console.error('获取智能体列表失败:', err)
      throw err
    }
  },
  async listAllAgents(): Promise<Agent[]> {
    try {
      return await api.post('/v1/agents/all')
    } catch (err) {
      console.error('获取智能体列表失败:', err)
      throw err
    }
  },

  // 获取单个智能体
  async getAgent(id: string): Promise<Agent> {
    try {
      return await api.get(`/v1/agents/${id}`)
    } catch (err) {
      console.error(`获取智能体 ${id} 失败:`, err)
      throw err
    }
  },

  // 创建智能体
  async createAgent(agent: Omit<Agent, 'id'>): Promise<Agent> {
    try {
      return await api.post('/v1/agents/create', agent)
    } catch (err) {
      console.error('创建智能体失败:', err)
      throw err
    }
  },

  // 更新智能体
  async updateAgent(agent: Partial<Agent>): Promise<Agent> {
    try {
      return await api.put(`/v1/agents/update`, agent)
    } catch (err) {
      console.error(`更新智能体失败:`, err)
      throw err
    }
  },

  // 删除智能体
  async deleteAgent(id: string): Promise<void> {
    try {
      await api.delete(`/v1/agents/${id}`)
    } catch (err) {
      console.error(`删除智能体 ${id} 失败:`, err)
      throw err
    }
  },

  // 获取模型提供商列表
  async getModelProviders(modelType?: string): Promise<ModelProvider[]> {
    try {
      const params = modelType ? { model_type: modelType } : {}
      const response = await api.get('/v1/models/providers', { params })
      return response.data
    } catch (err) {
      console.error('获取模型提供商列表失败:', err)
      throw err
    }
  },

  // 获取模型列表
  async getModels(providerId?: string, modelType?: string): Promise<Model[]> {
    try {
      const params: any = {}
      if (providerId) params.provider_id = providerId
      if (modelType) params.model_type = modelType
      const response = await api.get('/v1/models', { params })
      return response.data
    } catch (err) {
      console.error('获取模型列表失败:', err)
      throw err
    }
  },

  // 获取智能体关联的知识库列表
  async getAgentKnowledgeBases(agentId: string): Promise<KnowledgeBase[]> {
    try {
      return await api.get(`/v1/agents/${agentId}/knowledge-bases`)
    } catch (err) {
      console.error(`获取智能体 ${agentId} 的知识库列表失败:`, err)
      throw err
    }
  },

  // 关联知识库到智能体
  async addKnowledgeBaseToAgent(agentId: string, kbId: string): Promise<AgentKnowledgeBase> {
    try {
      return await api.post(`/v1/agents/${agentId}/knowledge-bases`, { kb_id: kbId })
    } catch (err) {
      console.error(`关联知识库到智能体 ${agentId} 失败:`, err)
      throw err
    }
  },

  // 更新智能体与知识库的关联状态
  async updateAgentKnowledgeBase(
    agentId: string,
    kbId: string,
    status: 'enabled' | 'disabled',
  ): Promise<AgentKnowledgeBase> {
    try {
      return await api.put(`/v1/agents/${agentId}/knowledge-bases/${kbId}`, { status })
    } catch (err) {
      console.error(`更新智能体 ${agentId} 与知识库 ${kbId} 的关联状态失败:`, err)
      throw err
    }
  },

  // 移除智能体与知识库的关联
  async removeKnowledgeBaseFromAgent(agentId: string, kbId: string): Promise<void> {
    try {
      await api.delete(`/v1/agents/${agentId}/knowledge-bases/${kbId}`)
    } catch (err) {
      console.error(`移除智能体 ${agentId} 与知识库 ${kbId} 的关联失败:`, err)
      throw err
    }
  },

  // 获取智能体关联的工具列表
  async getAgentTools(agentId: string): Promise<Tool[]> {
    try {
      return await api.get(`/v1/agents/${agentId}/tools`)
    } catch (err) {
      console.error(`获取智能体 ${agentId} 的工具列表失败:`, err)
      throw err
    }
  },

  // 关联工具到智能体
  async addToolToAgent(agentId: string, toolId: string): Promise<AgentTool> {
    try {
      return await api.post(`/v1/agents/${agentId}/tools`, { toolId: toolId })
    } catch (err) {
      console.error(`关联工具到智能体 ${agentId} 失败:`, err)
      throw err
    }
  },

  // 批量关联工具到智能体（支持系统工具和MCP工具）
  async addToolsToAgent(
    agentId: string,
    toolParams: { id: string; type: string }[],
  ): Promise<AgentTool[]> {
    try {
      return await api.post(`/v1/agents/${agentId}/tools/batch`, { tools: toolParams })
    } catch (err) {
      console.error(`批量关联工具到智能体 ${agentId} 失败:`, err)
      throw err
    }
  },

  // 批量关联外部智能体到智能体
  async addAgentToAgent(agentId: string, agentMarketIds: string[]): Promise<AgentTool[]> {
    try {
      return await api.post(`/v1/agents/market/add`, {
        agentId: agentId,
        agentMarketIds: agentMarketIds,
      })
    } catch (err) {
      console.error(`关联外部智能体到智能体 ${agentId} 失败:`, err)
      throw err
    }
  },

  // 移除智能体与外部智能体的关联
  async removeAgentFromAgent(agentId: string, agentMarketId: string): Promise<void> {
    try {
      await api.post(`/v1/agents/market/delete`, {
        agentMarketId: agentMarketId,
        agentId: agentId,
      })
    } catch (err) {
      console.error(`移除智能体 ${agentId} 与外部智能体 ${agentMarketId} 的关联失败:`, err)
      throw err
    }
  },

  // 更新智能体与工具的关联状态
  async updateAgentTool(agentId: string, toolId: string, isEnable: boolean): Promise<AgentTool> {
    try {
      return await api.put(`/v1/agents/${agentId}/tools/${toolId}`, { isEnable })
    } catch (err) {
      console.error(`更新智能体 ${agentId} 与工具 ${toolId} 的关联状态失败:`, err)
      throw err
    }
  },

  // 移除智能体与工具的关联
  async removeToolFromAgent(agentId: string, toolId: string): Promise<void> {
    try {
      await api.delete(`/v1/agents/${agentId}/tools/${toolId}`)
    } catch (err) {
      console.error(`移除智能体 ${agentId} 与工具 ${toolId} 的关联失败:`, err)
      throw err
    }
  },

  // 获取智能体关联的工作流列表
  async getAgentWorkflows(agentId: string): Promise<AgentWorkflow[]> {
    try {
      return await api.get(`/v1/agents/${agentId}/workflows`)
    } catch (err) {
      console.error(`获取智能体 ${agentId} 的工作流列表失败:`, err)
      throw err
    }
  },

  // 关联工作流到智能体
  async addWorkflowToAgent(
    agentId: string,
    workflowId: string,
    config: Partial<AgentWorkflow>,
  ): Promise<AgentWorkflow> {
    try {
      return await api.post(`/v1/agents/${agentId}/workflows`, {
        workflow_id: workflowId,
        is_default: config.is_default || false,
        trigger_condition: config.trigger_condition,
        priority: config.priority || 0,
        status: config.status || 'enabled',
      })
    } catch (err) {
      console.error(`关联工作流到智能体 ${agentId} 失败:`, err)
      throw err
    }
  },

  // 更新智能体与工作流的关联
  async updateAgentWorkflow(
    agentId: string,
    workflowId: string,
    config: Partial<AgentWorkflow>,
  ): Promise<AgentWorkflow> {
    try {
      return await api.put(`/v1/agents/${agentId}/workflows/${workflowId}`, config)
    } catch (err) {
      console.error(`更新智能体 ${agentId} 与工作流 ${workflowId} 的关联失败:`, err)
      throw err
    }
  },

  // 移除智能体与工作流的关联
  async removeWorkflowFromAgent(agentId: string, workflowId: string): Promise<void> {
    try {
      await api.delete(`/v1/agents/${agentId}/workflows/${workflowId}`)
    } catch (err) {
      console.error(`移除智能体 ${agentId} 与工作流 ${workflowId} 的关联失败:`, err)
      throw err
    }
  },

  // 设置智能体的默认工作流
  async setDefaultWorkflow(agentId: string, workflowId: string): Promise<AgentWorkflow> {
    try {
      // 先获取工作流信息
      const workflow = await api.get(`/v1/agents/${agentId}/workflows/${workflowId}`)
      // 更新为默认工作流
      return await api.put(`/v1/agents/${agentId}/workflows/${workflowId}`, {
        ...workflow,
        is_default: true,
      })
    } catch (err) {
      console.error(`设置智能体 ${agentId} 的默认工作流失败:`, err)
      throw err
    }
  },

  // 发送消息到智能体并获取响应（支持流式传输）
  async sendMessage(agentId: string, message: MessageRequest): Promise<MessageResponse> {
    try {
      return await api.post(`/v1/agents/chat`, {
        agentId,
        message: message.message,
      })
    } catch (err) {
      console.error(`向智能体 ${agentId} 发送消息失败:`, err)
      throw err
    }
  },

  //创建session
  async createSession(agentId: string, title: string): Promise<ChatSession> {
    try {
      return await api.post(`/v1/agents/sessions`, {
        agentId: agentId,
        title: title,
      })
    } catch (err) {
      console.error(`创建会话失败:`, err)
      throw err
    }
  },
  // list session
  async listSession(agentId: string): Promise<ChatSession[]> {
    try {
      const params = {
        agentId: agentId,
      }
      return await api.get(`/v1/agents/sessions`, { params })
    } catch (err) {
      console.error(`获取会话列表失败:`, err)
      throw err
    }
  },
  //session messages
  async sessionMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const params = {
        sessionId: sessionId,
      }
      return await api.get(`/v1/agents/sessions/${sessionId}/messages`, { params })
    } catch (err) {
      console.error(`获取会话消息列表失败:`, err)
      throw err
    }
  },
  // delete session
  async deleteSession(sessionId: string): Promise<void> {
    try {
      await api.delete(`/v1/agents/sessions/${sessionId}`)
    } catch (err) {
      console.error(`删除会话失败:`, err)
      throw err
    }
  },
  // 发送消息到智能体并流式获取响应
  async sendMessageStream(
    agentId: string,
    message: {
      message: string
      sessionId?: string
    },
    onChunk: (chunk: string) => void,
    onComplete?: () => void,
    onError?: (error: any) => void,
  ): Promise<void> {
    try {
      const userStore = useUserStore()
      const response = await fetch(`/api/v1/agents/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userStore.token || ''}`,
        },
        body: JSON.stringify({
          agentId: agentId,
          message: message.message,
          sessionId: message.sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            if (onComplete) onComplete()
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          onChunk(chunk)
        }
      } catch (error) {
        if (onError) onError(error)
        throw error
      } finally {
        reader.releaseLock()
      }
    } catch (err) {
      console.error(`向智能体 ${agentId} 发送消息失败:`, err)
      if (onError) onError(err)
      throw err
    }
  },
}
