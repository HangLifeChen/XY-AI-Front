import type {
  WorkflowNode as Node,
  WorkflowEdge as Edge,
  ExecutionContext,
  ExecutionLog,
  NodeStatus,
  TaskNodeData,
  ConditionNodeData,
  AgentNodeData,
  MessageNodeData,
  DecisionNodeData,
  TextCombineNodeData,
  WorkflowNodeData,
} from '@/types/workflow'
import { a2aService } from '@/api/a2aService'
import type { SendTaskRequest } from '@/types/a2a'
import { AgentCommunicationService } from '@/api/agentCommunicationService'
import { AgentService } from '@/api/agentService'

// 类型守卫
const isTaskNode = (data: WorkflowNodeData): data is TaskNodeData => 'taskType' in data
const isConditionNode = (data: WorkflowNodeData): data is ConditionNodeData => 'condition' in data
const isAgentNode = (data: WorkflowNodeData): data is AgentNodeData => 'agentId' in data
const isMessageNode = (data: WorkflowNodeData): data is MessageNodeData => 'messageType' in data
const isDecisionNode = (data: WorkflowNodeData): data is DecisionNodeData => 'options' in data
const isTextCombineNode = (data: WorkflowNodeData): data is TextCombineNodeData =>
  'template' in data

// A2A任务节点数据类型
interface A2ATaskNodeData {
  endpoint: string
  taskDescription: string
  inputVariables: Array<{ name: string; value: string }>
}

const isA2ATaskNode = (data: WorkflowNodeData): data is A2ATaskNodeData => 'endpoint' in data && 'taskDescription' in data

// 调用Agent节点数据类型
interface CallAgentNodeData {
  targetAgentId: string
  taskDescription: string
  outputVariable: string
}

const isCallAgentNode = (data: WorkflowNodeData): data is CallAgentNodeData => 'targetAgentId' in data && 'taskDescription' in data

export class WorkflowExecutor {
  private nodes: Node[]
  private edges: Edge[]
  private context: ExecutionContext
  private updateNodeStatus: (nodeId: string, status: NodeStatus) => void
  private addLog: (log: ExecutionLog) => void
  private executedNodes: Set<string>

  constructor(
    nodes: Node[],
    edges: Edge[],
    updateNodeStatus: (nodeId: string, status: NodeStatus) => void,
    addLog: (log: ExecutionLog) => void,
  ) {
    this.nodes = nodes
    this.edges = edges
    this.updateNodeStatus = updateNodeStatus
    this.addLog = addLog
    this.executedNodes = new Set()
    this.context = {
      variables: {},
      logs: [],
    }
  }

  async execute(): Promise<void> {
    const startNodes = this.findStartNodes()
    if (startNodes.length === 0) {
      throw new Error('No start nodes found in the workflow')
    }

    try {
      await Promise.all(startNodes.map((node) => this.executeNode(node)))
    } catch (error) {
      this.addLog({
        type: 'error',
        message: `Workflow execution failed: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: Date.now(),
      })
      throw error
    }
  }

  private findStartNodes(): Node[] {
    const nodeWithIncoming = new Set(this.edges.map((edge) => edge.target))
    return this.nodes.filter((node) => !nodeWithIncoming.has(node.id))
  }

  private async executeNode(node: Node): Promise<void> {
    if (this.executedNodes.has(node.id)) {
      return
    }

    this.updateNodeStatus(node.id, 'running')
    this.addLog({
      type: 'info',
      message: `开始执行节点: ${node.data.label}`,
      nodeId: node.id,
      timestamp: Date.now(),
    })

    try {
      await this.processNode(node)
      this.executedNodes.add(node.id)
      this.updateNodeStatus(node.id, 'completed')
      this.addLog({
        type: 'success',
        message: `节点执行完成: ${node.data.label}`,
        nodeId: node.id,
        timestamp: Date.now(),
      })

      // 执行后续节点
      const nextNodes = this.findNextNodes(node)
      await Promise.all(nextNodes.map((nextNode) => this.executeNode(nextNextNode)))
    } catch (error) {
      this.updateNodeStatus(node.id, 'error')
      this.addLog({
        type: 'error',
        message: `节点执行失败: ${error instanceof Error ? error.message : String(error)}`,
        nodeId: node.id,
        timestamp: Date.now(),
      })
      throw error
    }
  }

  private async processNode(node: Node): Promise<void> {
    const { data } = node

    if (isTaskNode(data)) {
      await this.executeTaskNode(node.id, data)
    } else if (isConditionNode(data)) {
      await this.executeConditionNode(node.id, data)
    } else if (isAgentNode(data)) {
      await this.executeAgentNode(node.id, data)
    } else if (isMessageNode(data)) {
      await this.executeMessageNode(node.id, data)
    } else if (isDecisionNode(data)) {
      await this.executeDecisionNode(node.id, data)
    } else if (isTextCombineNode(data)) {
      await this.executeTextCombineNode(node.id, data)
    } else if (isA2ATaskNode(data)) {
      await this.executeA2ATaskNode(node.id, data)
    } else if (isCallAgentNode(data)) {
      await this.executeCallAgentNode(node.id, data)
    } else {
      throw new Error(`Unknown node type for node: ${node.id}`)
    }
  }

  private async executeTaskNode(nodeId: string, data: TaskNodeData): Promise<void> {
    // 模拟任务执行
    await new Promise((resolve) => setTimeout(resolve, 1000))
    this.context.variables[`task_${nodeId}_result`] = {
      status: 'completed',
      taskType: data.taskType,
      timestamp: Date.now(),
    }
  }

  private async executeConditionNode(nodeId: string, data: ConditionNodeData): Promise<void> {
    // 模拟条件评估
    const result = await this.evaluateCondition(data.condition)
    this.context.variables[`condition_${nodeId}_result`] = result
  }

  private async executeAgentNode(nodeId: string, data: AgentNodeData): Promise<void> {
    // 模拟 AI 代理执行
    await new Promise((resolve) => setTimeout(resolve, 1500))
    this.context.variables[`agent_${nodeId}_result`] = {
      agentId: data.agentId,
      response: '模拟的代理响应',
      timestamp: Date.now(),
    }
  }

  private async executeMessageNode(nodeId: string, data: MessageNodeData): Promise<void> {
    // 模拟消息处理
    await new Promise((resolve) => setTimeout(resolve, 500))
    this.context.variables[`message_${nodeId}_result`] = {
      type: data.messageType,
      channel: data.channel,
      timestamp: Date.now(),
    }
  }

  private async executeDecisionNode(nodeId: string, data: DecisionNodeData): Promise<void> {
    // 模拟决策过程
    const selectedOption = data.options[Math.floor(Math.random() * data.options.length)]
    this.context.variables[`decision_${nodeId}_result`] = {
      selected: selectedOption,
      timestamp: Date.now(),
    }
  }

  private async executeTextCombineNode(nodeId: string, data: TextCombineNodeData): Promise<void> {
    const { template, variables, outputVar } = data

    // 获取输入边
    const inputEdges = this.edges.filter((edge) => edge.target === nodeId)

    // 创建变量值映射
    const variableValues: Record<string, string> = {}

    // 从输入节点获取变量值
    for (const edge of inputEdges) {
      const sourceNodeId = edge.source
      const sourceNodeResult = this.getNodeResult(sourceNodeId)

      // 从源节点结果中提取变量名和值
      if (sourceNodeResult) {
        // 如果结果是对象，尝试从中提取所有可能的变量值
        if (typeof sourceNodeResult === 'object') {
          for (const [key, value] of Object.entries(sourceNodeResult)) {
            if (variables.includes(key)) {
              variableValues[key] = this.convertToString(value)
            }
          }
        } else {
          // 如果结果是简单值，检查边的标签是否匹配任何变量名
          const edgeLabel = edge.label || ''
          if (variables.includes(edgeLabel)) {
            variableValues[edgeLabel] = this.convertToString(sourceNodeResult)
          }
        }
      }
    }

    // 使用模板和变量值生成最终文本
    let resultText = template
    for (const variable of variables) {
      const value = variableValues[variable] || ''
      const regex = new RegExp(`\\{\\{${variable}\\}\\}`, 'g')
      resultText = resultText.replace(regex, value)
    }

    // 存储结果到指定的输出变量名
    this.context.variables[outputVar] = resultText

    // 同时保持原有的结果格式以保证兼容性
    this.context.variables[`textCombine_${nodeId}_result`] = {
      text: resultText,
      timestamp: Date.now(),
    }
  }

  private async executeA2ATaskNode(nodeId: string, data: A2ATaskNodeData): Promise<void> {
    try {
      // 构建A2A任务请求
      const taskRequest: SendTaskRequest = {
        task: {
          input: {
            role: 'user',
            parts: [
              {
                type: 'text',
                text: data.taskDescription
              }
            ],
            timestamp: new Date().toISOString()
          }
        }
      }

      // 如果有输入变量，添加到任务请求中
      if (data.inputVariables && data.inputVariables.length > 0) {
        const variablesData = data.inputVariables.reduce((acc, variable) => {
          acc[variable.name] = variable.value
          return acc
        }, {} as Record<string, string>)

        taskRequest.task.input!.parts.push({
          type: 'data',
          data: variablesData
        })
      }

      // 发送任务到A2A端点
      const response = await a2aService.sendTask(data.endpoint, taskRequest)
      
      // 轮询任务状态直到完成
      let taskStatus = await a2aService.getTaskStatus(data.endpoint, { taskId: response.taskId })
      
      while (taskStatus.task.status !== 'completed' && taskStatus.task.status !== 'failed') {
        await new Promise(resolve => setTimeout(resolve, 1000)) // 等待1秒
        taskStatus = await a2aService.getTaskStatus(data.endpoint, { taskId: response.taskId })
      }

      if (taskStatus.task.status === 'completed') {
        // 获取任务结果
        const taskResult = await a2aService.getTaskResult(data.endpoint, { taskId: response.taskId })
        
        // 将结果存储到上下文中
        this.context.variables[`a2a_${nodeId}_result`] = {
          taskId: response.taskId,
          status: 'completed',
          result: taskResult.artifact,
          timestamp: Date.now(),
        }
      } else {
        throw new Error(`A2A任务执行失败: ${taskStatus.task.error?.message || '未知错误'}`)
      }
    } catch (error) {
      throw new Error(`执行A2A任务时出错: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private async executeCallAgentNode(nodeId: string, data: CallAgentNodeData): Promise<void> {
    try {
      // 获取目标Agent
      const targetAgent = await AgentService.getAgent(Number(data.targetAgentId))
      
      // 调用Agent
      const result = await AgentCommunicationService.callAgent(targetAgent, data.taskDescription)
      
      // 存储结果到上下文中
      this.context.variables[data.outputVariable] = result
      this.context.variables[`callAgent_${nodeId}_result`] = {
        agentId: data.targetAgentId,
        taskDescription: data.taskDescription,
        result: result,
        timestamp: Date.now(),
      }
    } catch (error) {
      throw new Error(`执行调用Agent任务时出错: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private convertToString(value: any): string {
    if (typeof value === 'string') {
      return value
    } else if (value && typeof value === 'object') {
      if ('text' in value) {
        return String(value.text)
      } else if ('result' in value) {
        return String(value.result)
      } else if ('response' in value) {
        return String(value.response)
      } else if ('selected' in value) {
        return String(value.selected)
      } else {
        return JSON.stringify(value)
      }
    } else if (value !== undefined && value !== null) {
      return String(value)
    }
    return ''
  }

  private async evaluateCondition(condition: string): Promise<boolean> {
    // 模拟条件评估
    return Math.random() > 0.5
  }

  private getNodeResult(nodeId: string): any {
    // 尝试从上下文变量中获取节点结果
    const variableKeys = Object.keys(this.context.variables)

    // 按照节点类型查找结果
    const resultKeys = [
      `task_${nodeId}_result`,
      `condition_${nodeId}_result`,
      `agent_${nodeId}_result`,
      `message_${nodeId}_result`,
      `decision_${nodeId}_result`,
      `textCombine_${nodeId}_result`,
      `a2a_${nodeId}_result`,
    ]

    for (const key of resultKeys) {
      if (key in this.context.variables) {
        return this.context.variables[key]
      }
    }

    // 如果没有找到特定类型的结果，尝试查找任何包含节点ID的结果
    for (const key of variableKeys) {
      if (key.includes(nodeId)) {
        return this.context.variables[key]
      }
    }

    return null
  }

  private findNextNodes(node: Node): Node[] {
    const outgoingEdges = this.edges.filter((edge) => edge.source === node.id)
    return outgoingEdges
      .map((edge) => this.nodes.find((node) => node.id === edge.target))
      .filter((node): node is Node => node !== undefined)
  }
}