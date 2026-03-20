import { computed, ref, watch } from 'vue'
import type { NodeProps, BaseNodeData, NodeValidationResult, NodeData } from '../types/node'

/**
 * 节点组合式函数，提供节点的通用功能
 * @param props 节点属性
 * @param defaultData 默认节点数据
 * @param validateFn 可选的验证函数
 * @returns 节点相关的状态和方法
 */
export function useNode<T extends BaseNodeData>(
  props: NodeProps<T>,
  defaultData: T,
  validateFn?: (data: T) => NodeValidationResult,
) {
  // 确保节点数据安全访问
  const safeNode = computed(() => {
    if (!props) {
      console.warn('Node: props is undefined, using default')
      return {
        id: 'default-id',
        data: { ...defaultData },
        selected: false,
      }
    }

    if (!props.data) {
      console.warn(`Node ${props.id}: props.data is undefined, using default data`)
      return {
        ...props,
        data: { ...defaultData },
      }
    }

    return props
  })

  // 节点数据
  const nodeData = computed(() => {
    return {
      ...safeNode.value.data,
    } as T
  })

  // 节点是否有效
  const isValid = computed(() => {
    if (!validateFn) return true
    const result = validateFn(nodeData.value)
    return result.valid
  })

  // 验证消息
  const validationMessage = computed(() => {
    if (!validateFn) return ''
    const result = validateFn(nodeData.value)
    return result.message || ''
  })

  // 获取节点数据的特定字段，带默认值
  const getNodeField = <K extends keyof T>(field: K, defaultValue: T[K]): T[K] => {
    return nodeData.value[field] !== undefined ? nodeData.value[field] : defaultValue
  }

  // 检查节点是否配置完成
  const isConfigured = (requiredFields: (keyof T)[]) => {
    return requiredFields.every((field) => {
      const value = nodeData.value[field]
      if (value === undefined || value === null) return false
      if (typeof value === 'string' && value.trim() === '') return false
      if (Array.isArray(value) && value.length === 0) return false
      return true
    })
  }

  return {
    safeNode,
    nodeData,
    isValid,
    validationMessage,
    getNodeField,
    isConfigured,
  }
}

/**
 * 创建节点验证函数
 * @param requiredFields 必填字段列表
 * @param customValidation 自定义验证函数
 * @returns 验证函数
 */
export function createNodeValidator<T extends BaseNodeData>(
  requiredFields: (keyof T)[],
  customValidation?: (data: T) => NodeValidationResult,
) {
  return (data: T): NodeValidationResult => {
    // 检查必填字段
    for (const field of requiredFields) {
      const value = data[field]
      if (value === undefined || value === null) {
        return { valid: false, message: `${String(field)} 是必填项` }
      }
      if (typeof value === 'string' && value.trim() === '') {
        return { valid: false, message: `${String(field)} 不能为空` }
      }
      if (Array.isArray(value) && value.length === 0) {
        return { valid: false, message: `${String(field)} 不能为空数组` }
      }
    }

    // 执行自定义验证
    if (customValidation) {
      return customValidation(data)
    }

    return { valid: true }
  }
}
