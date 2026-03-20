import { a2aService } from '@/api/a2aService'
import { AgentService } from '@/api/agentService'
import type { Agent } from '@/types/agent'
import type { SendTaskRequest } from '@/types/a2a'

/**
 * Agent间通信服务
 * 支持本地Agent和远程A2A Agent的调用
 */
export class AgentCommunicationService {
  /**
   * 调用本地Agent
   * @param agentId 要调用的Agent ID
   * @param input 输入内容
   * @returns Agent的响应
   */
  static async callLocalAgent(agentId: string, input: string): Promise<string> {
    try {
      // 这里应该调用实际的Agent执行逻辑
      // 由于我们没有直接执行Agent的API，我们模拟一个响应
      const agent = await AgentService.getAgent(agentId)

      // 模拟处理过程
      return `来自本地Agent "${agent.name}" 的响应: 已处理您的请求 "${input}"。`
    } catch (error) {
      throw new Error(`调用本地Agent失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 调用远程A2A Agent
   * @param a2aEndpoint A2A端点URL
   * @param input 输入内容
   * @returns Agent的响应
   */
  static async callRemoteAgent(a2aEndpoint: string, input: string): Promise<string> {
    try {
      // 构建A2A任务请求
      const taskRequest: SendTaskRequest = {
        task: {
          input: {
            role: 'user',
            parts: [
              {
                type: 'text',
                text: input,
              },
            ],
            timestamp: new Date().toISOString(),
          },
        },
      }

      // 发送任务到A2A端点
      const response = await a2aService.sendTask(a2aEndpoint, taskRequest)

      // 轮询任务状态直到完成
      let taskStatus = await a2aService.getTaskStatus(a2aEndpoint, { taskId: response.taskId })

      while (taskStatus.task.status !== 'completed' && taskStatus.task.status !== 'failed') {
        await new Promise((resolve) => setTimeout(resolve, 1000)) // 等待1秒
        taskStatus = await a2aService.getTaskStatus(a2aEndpoint, { taskId: response.taskId })
      }

      if (taskStatus.task.status === 'completed') {
        // 获取任务结果
        const taskResult = await a2aService.getTaskResult(a2aEndpoint, { taskId: response.taskId })

        // 解析结果
        let resultContent = ''
        if (taskResult.artifact && taskResult.artifact.parts) {
          // 遍历所有部分并组合成文本
          resultContent = taskResult.artifact.parts
            .map((part) => {
              if (part.type === 'text') {
                return part.text
              } else if (part.type === 'data') {
                return JSON.stringify(part.data, null, 2)
              } else {
                return `[${part.type} content]`
              }
            })
            .join('\n\n')
        }

        return resultContent
      } else {
        throw new Error(`A2A任务执行失败: ${taskStatus.task.error?.message || '未知错误'}`)
      }
    } catch (error) {
      throw new Error(`调用远程Agent失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 调用Agent（自动判断是本地还是远程）
   * @param agent 要调用的Agent对象
   * @param input 输入内容
   * @returns Agent的响应
   */
  static async callAgent(agent: Agent, input: string): Promise<string> {
    if (agent.a2aEndpoint) {
      // 远程A2A Agent
      return await this.callRemoteAgent(agent.a2aEndpoint, input)
    } else {
      // 本地Agent
      return await this.callLocalAgent(agent.id as number, input)
    }
  }
}
