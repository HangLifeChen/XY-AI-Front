import { NodeTypes, getDefaultNodeConfig, getNodeTypeLabel } from '../constants/nodeTypes'
import type { WorkflowNode, WorkflowNodeData } from '../types/workflow'

/**
 * 创建新的工作流节点
 * @param type 节点类型
 * @param id 节点ID
 * @param position 节点位置
 * @returns 新创建的工作流节点
 */
export function createNode(
  type: keyof typeof NodeTypes,
  id: string,
  position: { x: number; y: number },
): WorkflowNode {
  // 获取节点默认配置
  const defaultConfig = getDefaultNodeConfig(type)

  // 创建节点数据
  const data: WorkflowNodeData = {
    label: getNodeTypeLabel(type),
    type,
    ...defaultConfig,
  }

  // 特殊节点类型的处理
  if (type === NodeTypes.LOOP) {
    ;(data as any).loopType = 'count'
  } else if (type === NodeTypes.CONDITION) {
    ;(data as any).condition = ''
  } else if (type === NodeTypes.AGENT) {
    ;(data as any).agentId = ''
    ;(data as any).prompt = ''
  } else if (type === NodeTypes.HTML_DISPLAY) {
    ;(data as any).htmlContent = '<p>请输入HTML内容</p>'
  }

  // 创建并返回节点
  return {
    id,
    type,
    position,
    data,
    // 默认样式和行为
    draggable: true,
    selectable: true,
    connectable: true,
  }
}

/**
 * 根据节点类型获取节点的输入输出端口配置
 * @param type 节点类型
 * @returns 输入输出端口配置
 */
export function getNodeHandles(type: keyof typeof NodeTypes): {
  inputs: string[]
  outputs: string[]
} {
  // 默认配置
  const defaultHandles = {
    inputs: ['default'],
    outputs: ['default'],
  }

  // 根据节点类型返回特定的端口配置
  switch (type) {
    case NodeTypes.INPUT:
      return {
        inputs: [],
        outputs: ['output'],
      }

    case NodeTypes.OUTPUT:
      return {
        inputs: ['input'],
        outputs: [],
      }

    case NodeTypes.CONDITION:
      return {
        inputs: ['input'],
        outputs: ['true', 'false'],
      }

    case NodeTypes.LOOP:
      return {
        inputs: ['input'],
        outputs: ['body', 'exit'],
      }

    case NodeTypes.DECISION:
      return {
        inputs: ['input'],
        outputs: ['option1', 'option2', 'option3'],
      }

    case NodeTypes.HTML_DISPLAY:
      return {
        inputs: ['input'],
        outputs: ['output'],
      }
      
    case NodeTypes.QWEN_VL:
      return {
        inputs: ['prompt', 'image', 'imageUrl'],
        outputs: ['output'],
      }

    // 可以根据需要添加更多节点类型的端口配置

    default:
      return defaultHandles
  }
}

/**
 * 验证节点数据是否有效
 * @param node 工作流节点
 * @returns 是否有效
 */
export function validateNode(node: WorkflowNode): boolean {
  const { type, data } = node

  // 基本验证
  if (!type || !data) {
    return false
  }

  // 根据节点类型进行特定验证
  switch (type) {
    case NodeTypes.INPUT:
      return !!data.variableName

    case NodeTypes.OUTPUT:
      return !!data.variableName

    case NodeTypes.CONDITION:
      return !!data.condition

    case NodeTypes.LOOP:
      if (data.loopType === 'count') {
        return typeof data.count === 'number' && data.count > 0
      } else if (data.loopType === 'collection') {
        return !!data.collection && !!data.itemVar
      } else if (data.loopType === 'condition') {
        return !!data.condition
      }
      return false

    case NodeTypes.AGENT:
      return !!data.agentId

    case NodeTypes.HTML_DISPLAY:
      return !!data.htmlContent
      
    case NodeTypes.QWEN_VL:
      // 验证QwenVL节点至少需要提示词和一个图片输入
      return !!(data as any).prompt?.fieldValue && 
             (!!(data as any).image?.fieldValue || !!(data as any).imageUrl?.fieldValue)

    // 可以根据需要添加更多节点类型的验证逻辑

    default:
      return true
  }
}