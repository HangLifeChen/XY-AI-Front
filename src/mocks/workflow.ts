import type { MockMethod } from 'vite-plugin-mock'
import type { WorkflowData } from '@/types/workflow'

// 模拟工作流数据存储
const mockWorkflows: WorkflowData[] = []

export default [
  {
    url: '/api/workflows',
    method: 'post',
    timeout: 500,
    response: ({ body }: { body: Partial<WorkflowData> }): WorkflowData => {
      // 模拟创建失败情况
      if (!body.name || body.name.length > 50) {
        return {
          code: 400,
          message: '工作流名称不能为空且长度不能超过50个字符',
        } as any
      }

      // 生成模拟数据
      const newWorkflow: WorkflowData = {
        id: `wf_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`,
        name: body.name || '未命名工作流',
        description: body.description || '',
        nodes: body.nodes || [],
        edges: body.edges || [],
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      mockWorkflows.push(newWorkflow)

      return {
        code: 200,
        data: newWorkflow,
        message: '创建工作流成功',
      }
    },
  },
  {
    url: '/api/workflows',
    method: 'get',
    timeout: 500,
    response: (): WorkflowData[] => {
      return {
        code: 200,
        data: mockWorkflows,
        message: '获取工作流列表成功',
      }
    },
  },
] as MockMethod[]
