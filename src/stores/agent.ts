import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Agent, KnowledgeBase, Tool, AgentWorkflow } from '@/types/agent'
import { useUserStore } from './user'
import axios from 'axios'

export const useAgentStore = defineStore('agent1', () => {
  // 状态
  const agents = ref<Agent[]>([])
  const currentAgent = ref<Agent | null>(null)
  const knowledgeBases = ref<KnowledgeBase[]>([])
  const tools = ref<Tool[]>([])
  const workflows = ref<AgentWorkflow[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 监听agent数量变化，更新用户资源使用情况
  const userStore = useUserStore()
  watch(
    () => agents.value.length,
    (newLength) => {
      userStore.updateUsedResources({ agents: newLength })
    }
  )

  // 监听用户订阅变化，检查限制
  watch(
    () => userStore.userSubscription,
    (subscription) => {
      // 可以在这里添加订阅变化时的处理逻辑
    }
  )

  // Getter
  const getAgentById = async (id: string): Promise<Agent> => {
    loading.value = true
    error.value = null

    try {
      // TODO: 替换为实际的API调用
      // const response = await axios.get(`/api/agents/${id}`)
      // return response.data

      // 模拟API响应
      const mockAgent: Agent = {
        id,
        agent_id: `agent_${id}`,
        creator_id: '1',
        name: '智能助手',
        description: '我是一个通用型智能助手，可以帮助您完成各种任务。',
        model_provider: 'openai',
        model_name: 'gpt-4-turbo',
        version: 1,
        status: 'draft',
        visibility: 'public',
        invocation_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        knowledge_bases: [],
        tools: [],
        workflows: [],
        contexts: [],
      }

      currentAgent.value = mockAgent
      return mockAgent
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取智能体信息失败'
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  // Actions
  const fetchAgents = async () => {
    loading.value = true
    error.value = null

    try {
      // TODO: 替换为实际的API调用
      // const response = await axios.get('/api/agents')
      // agents.value = response.data

      // 模拟API响应
      agents.value = [
        {
          id: '1',
          agent_id: 'agent_1',
          creator_id: '1',
          name: '代码助手',
          description: '专注于代码相关任务的智能助手',
          model_provider: 'openai',
          model_name: 'gpt-4-turbo',
          version: 1,
          status: 'published',
          visibility: 'public',
          invocation_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          contexts: [],
        },
        {
          id: '2',
          agent_id: 'agent_2',
          creator_id: '1',
          name: '文档助手',
          description: '专注于文档处理的智能助手',
          model_provider: 'openai',
          model_name: 'gpt-4-turbo',
          version: 1,
          status: 'published',
          visibility: 'public',
          invocation_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          contexts: [],
        },
      ]
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取智能体列表失败'
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  const createAgent = async (agentData: Omit<Agent, 'id'>) => {
    loading.value = true
    error.value = null

    // 检查是否达到Agent数量限制
    const userStore = useUserStore()
    if (userStore.isAgentLimitReached) {
      error.value = '已达到Agent创建数量限制，请升级订阅计划以创建更多Agent'
      loading.value = false
      throw new Error(error.value)
    }

    try {
      // TODO: 替换为实际的API调用
      // const response = await axios.post('/api/agents', agentData)
      // const newAgent = response.data

      // 模拟API响应
      const newAgent: Agent = {
        id: Math.random().toString(36).substr(2, 9),
        ...agentData,
        agent_id: `agent_${Math.random().toString(36).substr(2, 9)}`,
        creator_id: '1',
        version: 1,
        status: 'draft',
        visibility: 'private',
        invocation_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      agents.value.push(newAgent)
      return newAgent
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建智能体失败'
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  const updateAgent = async (id: string, agentData: Partial<Agent>) => {
    loading.value = true
    error.value = null

    try {
      // TODO: 替换为实际的API调用
      // const response = await axios.patch(`/api/agents/${id}`, agentData)
      // const updatedAgent = response.data

      // 模拟API响应
      const index = agents.value.findIndex((agent) => agent.id === id)
      if (index === -1) {
        throw new Error('智能体不存在')
      }

      const updatedAgent = {
        ...agents.value[index],
        ...agentData,
        updated_at: new Date().toISOString(),
      }

      agents.value[index] = updatedAgent
      if (currentAgent.value?.id === id) {
        currentAgent.value = updatedAgent
      }

      return updatedAgent
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新智能体失败'
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  const deleteAgent = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      // TODO: 替换为实际的API调用
      // await axios.delete(`/api/agents/${id}`)

      // 模拟API响应
      const index = agents.value.findIndex((agent) => agent.id === id)
      if (index === -1) {
        throw new Error('智能体不存在')
      }

      agents.value.splice(index, 1)
      if (currentAgent.value?.id === id) {
        currentAgent.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除智能体失败'
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  // 知识库相关操作
  const loadAgentKnowledgeBases = async (agentId: string) => {
    loading.value = true
    error.value = null

    try {
      // 模拟API响应
      knowledgeBases.value = [
        {
          id: '1',
          kb_id: 'kb_1',
          name: '产品知识库',
          description: '包含产品相关的文档和信息',
          storage_type: 'vector_db',
          file_count: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          kb_id: 'kb_2',
          name: '技术文档库',
          description: '包含技术文档和API参考',
          storage_type: 'vector_db',
          file_count: 15,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      if (currentAgent.value && currentAgent.value.id === agentId) {
        currentAgent.value.knowledge_bases = knowledgeBases.value
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : `加载智能体 ${agentId} 的知识库列表失败`
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  // 工具相关操作
  const loadAgentTools = async (agentId: string) => {
    loading.value = true
    error.value = null

    try {
      // 模拟API响应
      tools.value = [
        {
          id: '1',
          tool_id: 'tool_1',
          name: '天气查询',
          description: '查询指定城市的天气信息',
          type: 'api',
          config: { url: 'https://api.weather.com' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          tool_id: 'tool_2',
          name: '搜索引擎',
          description: '在网络上搜索信息',
          type: 'api',
          config: { url: 'https://api.search.com' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      if (currentAgent.value && currentAgent.value.id === agentId) {
        currentAgent.value.tools = tools.value
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : `加载智能体 ${agentId} 的工具列表失败`
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  // 工作流相关操作
  const loadAgentWorkflows = async (agentId: string) => {
    loading.value = true
    error.value = null

    try {
      // 模拟API响应
      workflows.value = [
        {
          id: '1',
          agent_id: agentId,
          workflow_id: 'workflow_1',
          is_default: true,
          priority: 0,
          status: 'enabled',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          agent_id: agentId,
          workflow_id: 'workflow_2',
          is_default: false,
          trigger_condition: 'weather',
          priority: 1,
          status: 'enabled',
          created_at: new Date().toISOString(),
        },
      ]

      if (currentAgent.value && currentAgent.value.id === agentId) {
        currentAgent.value.workflows = workflows.value
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : `加载智能体 ${agentId} 的工作流列表失败`
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  // 重置状态
  const reset = () => {
    agents.value = []
    currentAgent.value = null
    knowledgeBases.value = []
    tools.value = []
    workflows.value = []
    loading.value = false
    error.value = null
  }

  return {
    // 状态
    agents,
    currentAgent,
    knowledgeBases,
    tools,
    workflows,
    loading,
    error,

    // Getter
    getAgentById,

    // Actions
    fetchAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    loadAgentKnowledgeBases,
    loadAgentTools,
    loadAgentWorkflows,
    reset,
  }
})