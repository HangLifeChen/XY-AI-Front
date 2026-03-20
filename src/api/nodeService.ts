import { api } from './http'

// 节点测试请求接口
export interface TestNodeRequest {
  nodeType: string
  nodeData: Record<string, any>
  inputData: Record<string, any>
}

// 节点测试响应接口
export interface TestNodeResponse {
  success: boolean
  output: {
    output: any
    type: string
  }
  error?: string
  executionTime?: number
}

// 测试节点功能
export const testNode = async (request: TestNodeRequest): Promise<TestNodeResponse> => {
  return await api.post('/v1/nodes/test', request)
}

// 获取节点测试示例
export const getNodeExample = async (nodeType: string): Promise<TestNodeRequest> => {
  return await api.get('/v1/nodes/example', {
    params: { nodeType },
  })
}
