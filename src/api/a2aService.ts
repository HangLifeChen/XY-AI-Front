import type {
  SendTaskRequest,
  SendTaskResponse,
  TaskStatusRequest,
  TaskStatusResponse,
  TaskResultRequest,
  TaskResultResponse,
  SubscribeTaskRequest,
  SubscribeTaskResponse,
  AgentCard,
  AgentMarket,
} from '@/types/a2a'
import { api } from './http'

/**
 * A2A (Agent-to-Agent) Protocol Service
 *
 * This service implements the A2A protocol for agent-to-agent communication.
 */

// Agent Discovery
export const getAgentCard = async (agentUrl: string): Promise<AgentCard> => {
  try {
    const response = await api.post<AgentCard>('/v1/a2a/getAgentCard', {
      agentUrl,
    })
    return response
  } catch (error) {
    throw new Error(`Failed to fetch agent card: ${error}`)
  }
}
export const listAgentMarkets = async (): Promise<AgentMarket[]> => {
  const response = await api.get<AgentMarket[]>('/v1/a2a/list')
  return response
}
export const saveAgentCard = async (agentUrl: string, handlerPath: string): Promise<void> => {
  try {
    await api.post<void>('/v1/a2a/saveAgentCard', {
      agentUrl: agentUrl,
      handlerPath: handlerPath,
    })
  } catch (error) {
    throw new Error(`Failed to save agent: ${error}`)
  }
}
export const deleteAgentMarket = async (id: string): Promise<void> => {
  try {
    await api.delete<void>(`/v1/a2a/delete/${id}`)
  } catch (error) {
    throw new Error(`Failed to save agent: ${error}`)
  }
}
// A2A Service Implementation
export const a2aService = {
  getAgentCard,
  saveAgentCard,
  listAgentMarkets,
  deleteAgentMarket,
}
