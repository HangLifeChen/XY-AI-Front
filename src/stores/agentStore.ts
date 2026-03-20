import { defineStore } from 'pinia'
import { AgentService } from '@/api/agentService'
import type { Agent, KnowledgeBase, AgentWorkflow } from '@/types/agent'
import type { Tool } from '@/types/tool'

interface AgentState {
  agents: Agent[]
  currentAgent: Agent | null
  knowledgeBases: KnowledgeBase[]
  tools: Tool[]
  workflows: AgentWorkflow[]
  isLoading: boolean
  error: string | null
  totalAgents: number
}

export const useAgentStore = defineStore('agent', {
  state: (): AgentState => ({
    agents: [],
    currentAgent: null,
    knowledgeBases: [],
    tools: [],
    workflows: [],
    isLoading: false,
    error: null,
    totalAgents: 0,
  }),

  actions: {
    async loadAgents(params?: {
      name?: string
      status?: string
      page?: number
      pageSize?: number
    }) {
      this.isLoading = true
      this.error = null
      try {
        const response = await AgentService.getAgents(params)
        this.agents = response.agents
        this.totalAgents = response.total
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        console.error('加载智能体列表失败:', err)
      } finally {
        this.isLoading = false
      }
    },

    async loadAgent(id: string) {
      this.isLoading = true
      this.error = null
      try {
        this.currentAgent = await AgentService.getAgent(id)

        // 加载关联的知识库、工具和工作流
        await this.loadAgentKnowledgeBases(id)
        await this.loadAgentTools(id)
        await this.loadAgentWorkflows(id)
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        console.error(`加载智能体 ${id} 失败:`, err)
      } finally {
        this.isLoading = false
      }
    },

    async saveAgent(agent: Agent) {
      this.isLoading = true
      this.error = null
      try {
        const savedAgent = agent.id
          ? await AgentService.updateAgent(agent.id, agent)
          : await AgentService.createAgent(agent)

        // 更新列表中的agent
        const index = this.agents.findIndex((a) => a.id === savedAgent.id)
        if (index >= 0) {
          this.agents.splice(index, 1, savedAgent)
        } else {
          this.agents.push(savedAgent)
        }

        this.currentAgent = savedAgent
        return savedAgent
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        console.error('保存智能体失败:', err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async deleteAgent(id: string) {
      this.isLoading = true
      this.error = null
      try {
        await AgentService.deleteAgent(id)
        this.agents = this.agents.filter((agent) => agent.id !== id)
        if (this.currentAgent?.id === id) {
          this.currentAgent = null
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        console.error(`删除智能体 ${id} 失败:`, err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    // 知识库相关操作
    async loadAgentKnowledgeBases(agentId: string) {
      this.isLoading = true
      this.error = null
      try {
        this.knowledgeBases = await AgentService.getAgentKnowledgeBases(agentId)
        if (this.currentAgent && this.currentAgent.id === agentId) {
          this.currentAgent.knowledge_bases = this.knowledgeBases
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        console.error(`加载智能体 ${agentId} 的知识库列表失败:`, err)
      } finally {
        this.isLoading = false
      }
    },

    async addKnowledgeBaseToAgent(agentId: string, kbId: string) {
      this.isLoading = true
      this.error = null
      try {
        await AgentService.addKnowledgeBaseToAgent(agentId, kbId)
        // 重新加载知识库列表
        await this.loadAgentKnowledgeBases(agentId)
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        console.error(`关联知识库到智能体 ${agentId} 失败:`, err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async updateAgentKnowledgeBase(agentId: string, kbId: string, status: 'enabled' | 'disabled') {
      this.isLoading = true
      this.error = null
      try {
        await AgentService.updateAgentKnowledgeBase(agentId, kbId, status)
        // 更新本地状态
        const kb = this.knowledgeBases.find((kb) => kb.kb_id === kbId)
        if (kb) {
          // 假设知识库对象有一个 status 属性
          ;(kb as any).status = status
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        console.error(`更新智能体 ${agentId} 与知识库 ${kbId} 的关联状态失败:`, err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async removeKnowledgeBaseFromAgent(agentId: string, kbId: string) {
      this.isLoading = true
      this.error = null
      try {
        await AgentService.removeKnowledgeBaseFromAgent(agentId, kbId)
        // 更新本地状态
        this.knowledgeBases = this.knowledgeBases.filter((kb) => kb.kb_id !== kbId)
        if (this.currentAgent && this.currentAgent.knowledge_bases) {
          this.currentAgent.knowledge_bases = this.currentAgent.knowledge_bases.filter(
            (kb) => kb.kb_id !== kbId,
          )
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        console.error(`移除智能体 ${agentId} 与知识库 ${kbId} 的关联失败:`, err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    // 工具相关操作
    async loadAgentTools(agentId: string) {
      this.isLoading = true
      this.error = null
      try {
        this.tools = await AgentService.getAgentTools(agentId)
        if (this.currentAgent && this.currentAgent.id === agentId) {
          this.currentAgent.tools = this.tools
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        console.error(`加载智能体 ${agentId} 的工具列表失败:`, err)
      } finally {
        this.isLoading = false
      }
    },

    async addToolToAgent(agentId: string, toolId: string) {
      this.isLoading = true
      this.error = null
      try {
        await AgentService.addToolToAgent(agentId, toolId)
        // 重新加载工具列表
        await this.loadAgentTools(agentId)
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        console.error(`关联工具到智能体 ${agentId} 失败:`, err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async updateAgentTool(agentId: string, toolId: string, status: 'enabled' | 'disabled') {
      this.isLoading = true
      this.error = null
      try {
        await AgentService.updateAgentTool(agentId, toolId, status)
        // 更新本地状态
        const tool = this.tools.find((tool) => tool.tool_id === toolId)
        if (tool) {
          // 假设工具对象有一个 status 属性
          ;(tool as any).status = status
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        console.error(`更新智能体 ${agentId} 与工具 ${toolId} 的关联状态失败:`, err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async removeToolFromAgent(agentId: string, toolId: string) {
      this.isLoading = true
      this.error = null
      try {
        await AgentService.removeToolFromAgent(agentId, toolId)
        // 更新本地状态
        this.tools = this.tools.filter((tool) => tool.tool_id !== toolId)
        if (this.currentAgent && this.currentAgent.tools) {
          this.currentAgent.tools = this.currentAgent.tools.filter(
            (tool) => tool.tool_id !== toolId,
          )
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        console.error(`移除智能体 ${agentId} 与工具 ${toolId} 的关联失败:`, err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    // 工作流相关操作
    async loadAgentWorkflows(agentId: string) {
      this.isLoading = true
      this.error = null
      try {
        this.workflows = await AgentService.getAgentWorkflows(agentId)
        if (this.currentAgent && this.currentAgent.id === agentId) {
          this.currentAgent.workflows = this.workflows
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        console.error(`加载智能体 ${agentId} 的工作流列表失败:`, err)
      } finally {
        this.isLoading = false
      }
    },

    async addWorkflowToAgent(
      agentId: string,
      workflowId: string,
      config: Partial<AgentWorkflow> = {},
    ) {
      this.isLoading = true
      this.error = null
      try {
        await AgentService.addWorkflowToAgent(agentId, workflowId, config)
        // 重新加载工作流列表
        await this.loadAgentWorkflows(agentId)
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        console.error(`关联工作流到智能体 ${agentId} 失败:`, err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async updateAgentWorkflow(agentId: string, workflowId: string, config: Partial<AgentWorkflow>) {
      this.isLoading = true
      this.error = null
      try {
        await AgentService.updateAgentWorkflow(agentId, workflowId, config)
        // 更新本地状态
        const index = this.workflows.findIndex((wf) => wf.workflow_id === workflowId)
        if (index !== -1) {
          this.workflows[index] = { ...this.workflows[index], ...config }
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        console.error(`更新智能体 ${agentId} 与工作流 ${workflowId} 的关联失败:`, err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async removeWorkflowFromAgent(agentId: string, workflowId: string) {
      this.isLoading = true
      this.error = null
      try {
        await AgentService.removeWorkflowFromAgent(agentId, workflowId)
        // 更新本地状态
        this.workflows = this.workflows.filter((wf) => wf.workflow_id !== workflowId)
        if (this.currentAgent && this.currentAgent.workflows) {
          this.currentAgent.workflows = this.currentAgent.workflows.filter(
            (wf) => wf.workflow_id !== workflowId,
          )
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        console.error(`移除智能体 ${agentId} 与工作流 ${workflowId} 的关联失败:`, err)
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async setDefaultWorkflow(agentId: string, workflowId: string) {
      this.isLoading = true
      this.error = null
      try {
        await AgentService.setDefaultWorkflow(agentId, workflowId)
        // 更新本地状态
        this.workflows.forEach((wf) => {
          wf.is_default = wf.workflow_id === workflowId
        })
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        console.error(`设置智能体 ${agentId} 的默认工作流失败:`, err)
        throw err
      } finally {
        this.isLoading = false
      }
    },
  },

  getters: {
    getAgentById: (state) => (id: string) => {
      return state.agents.find((agent) => agent.id === id)
    },

    getKnowledgeBaseById: (state) => (id: string) => {
      return state.knowledgeBases.find((kb) => kb.id === id || kb.kb_id === id)
    },

    getToolById: (state) => (id: string) => {
      return state.tools.find((tool) => tool.id === id || tool.tool_id === id)
    },

    getWorkflowById: (state) => (id: string) => {
      return state.workflows.find((wf) => wf.id === id || wf.workflow_id === id)
    },

    getDefaultWorkflow: (state) => {
      return state.workflows.find((wf) => wf.is_default)
    },
  },
})
