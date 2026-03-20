import { WorkflowValidator } from '../utils/workflowValidator'

describe('WorkflowValidator', () => {
  // 基本结构测试
  describe('Basic Structure', () => {
    test('should validate valid workflow', () => {
      const workflow = [
        {
          id: 'start',
          type: 'custom',
          data: { nodeType: 'start', label: '开始' },
          position: { x: 0, y: 0 },
        },
        {
          id: 'task1',
          type: 'custom',
          data: {
            nodeType: 'task',
            label: '任务1',
            config: JSON.stringify({
              type: 'http',
              url: 'https://api.example.com',
              method: 'GET',
            }),
          },
          position: { x: 0, y: 100 },
        },
        {
          id: 'end',
          type: 'custom',
          data: { nodeType: 'end', label: '结束' },
          position: { x: 0, y: 200 },
        },
        {
          id: 'edge1',
          source: 'start',
          target: 'task1',
        },
        {
          id: 'edge2',
          source: 'task1',
          target: 'end',
        },
      ]

      const validator = new WorkflowValidator(workflow)
      const result = validator.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should detect missing start node', () => {
      const workflow = [
        {
          id: 'task1',
          type: 'custom',
          data: { nodeType: 'task', label: '任务1' },
          position: { x: 0, y: 0 },
        },
        {
          id: 'end',
          type: 'custom',
          data: { nodeType: 'end', label: '结束' },
          position: { x: 0, y: 100 },
        },
      ]

      const validator = new WorkflowValidator(workflow)
      const result = validator.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('工作流缺少起点节点')
    })
  })

  // 条件分支测试
  describe('Conditional Branches', () => {
    test('should validate valid conditional branches', () => {
      const workflow = [
        {
          id: 'condition1',
          type: 'custom',
          data: { nodeType: 'condition', label: '条件1' },
          position: { x: 0, y: 0 },
        },
        {
          id: 'task1',
          type: 'custom',
          data: { nodeType: 'task', label: '任务1' },
          position: { x: -100, y: 100 },
        },
        {
          id: 'task2',
          type: 'custom',
          data: { nodeType: 'task', label: '任务2' },
          position: { x: 100, y: 100 },
        },
        {
          id: 'edge1',
          source: 'condition1',
          target: 'task1',
          data: { condition: 'value > 10' },
        },
        {
          id: 'edge2',
          source: 'condition1',
          target: 'task2',
          data: { isDefault: true },
        },
      ]

      const validator = new WorkflowValidator(workflow)
      const result = validator.validate()
      expect(result.isValid).toBe(true)
    })

    test('should detect missing default branch', () => {
      const workflow = [
        {
          id: 'condition1',
          type: 'custom',
          data: { nodeType: 'condition', label: '条件1' },
          position: { x: 0, y: 0 },
        },
        {
          id: 'task1',
          type: 'custom',
          data: { nodeType: 'task', label: '任务1' },
          position: { x: -100, y: 100 },
        },
        {
          id: 'task2',
          type: 'custom',
          data: { nodeType: 'task', label: '任务2' },
          position: { x: 100, y: 100 },
        },
        {
          id: 'edge1',
          source: 'condition1',
          target: 'task1',
          data: { condition: 'value > 10' },
        },
        {
          id: 'edge2',
          source: 'condition1',
          target: 'task2',
          data: { condition: 'value <= 10' },
        },
      ]

      const validator = new WorkflowValidator(workflow)
      const result = validator.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('条件节点 "条件1" 缺少默认分支')
    })
  })

  // 并行分支测试
  describe('Parallel Branches', () => {
    test('should validate valid parallel branches', () => {
      const workflow = [
        {
          id: 'parallel-start',
          type: 'custom',
          data: { nodeType: 'parallel-start', label: '并行开始' },
          position: { x: 0, y: 0 },
        },
        {
          id: 'task1',
          type: 'custom',
          data: { nodeType: 'task', label: '任务1' },
          position: { x: -100, y: 100 },
        },
        {
          id: 'task2',
          type: 'custom',
          data: { nodeType: 'task', label: '任务2' },
          position: { x: 100, y: 100 },
        },
        {
          id: 'parallel-end',
          type: 'custom',
          data: { nodeType: 'parallel-end', label: '并行结束' },
          position: { x: 0, y: 200 },
        },
        {
          id: 'edge1',
          source: 'parallel-start',
          target: 'task1',
        },
        {
          id: 'edge2',
          source: 'parallel-start',
          target: 'task2',
        },
        {
          id: 'edge3',
          source: 'task1',
          target: 'parallel-end',
        },
        {
          id: 'edge4',
          source: 'task2',
          target: 'parallel-end',
        },
      ]

      const validator = new WorkflowValidator(workflow)
      const result = validator.validate()
      expect(result.isValid).toBe(true)
    })
  })

  // 任务配置测试
  describe('Task Configuration', () => {
    test('should validate HTTP task', () => {
      const workflow = [
        {
          id: 'task1',
          type: 'custom',
          data: {
            nodeType: 'task',
            label: 'HTTP任务',
            config: JSON.stringify({
              type: 'http',
              url: 'https://api.example.com',
              method: 'POST',
            }),
          },
          position: { x: 0, y: 0 },
        },
      ]

      const validator = new WorkflowValidator(workflow)
      expect(validator.validateTaskConfig(workflow[0])).toBe(true)
    })

    test('should validate script task', () => {
      const workflow = [
        {
          id: 'task1',
          type: 'custom',
          data: {
            nodeType: 'task',
            label: '脚本任务',
            config: JSON.stringify({
              type: 'script',
              script: 'console.log("Hello")',
            }),
          },
          position: { x: 0, y: 0 },
        },
      ]

      const validator = new WorkflowValidator(workflow)
      expect(validator.validateTaskConfig(workflow[0])).toBe(true)
    })

    test('should validate function task', () => {
      const workflow = [
        {
          id: 'task1',
          type: 'custom',
          data: {
            nodeType: 'task',
            label: '函数任务',
            config: JSON.stringify({
              type: 'function',
              function: 'processData',
            }),
          },
          position: { x: 0, y: 0 },
        },
      ]

      const validator = new WorkflowValidator(workflow)
      expect(validator.validateTaskConfig(workflow[0])).toBe(true)
    })
  })

  // 循环依赖测试
  describe('Cycle Detection', () => {
    test('should detect cycles in workflow', () => {
      const workflow = [
        {
          id: 'task1',
          type: 'custom',
          data: { nodeType: 'task', label: '任务1' },
          position: { x: 0, y: 0 },
        },
        {
          id: 'task2',
          type: 'custom',
          data: { nodeType: 'task', label: '任务2' },
          position: { x: 0, y: 100 },
        },
        {
          id: 'edge1',
          source: 'task1',
          target: 'task2',
        },
        {
          id: 'edge2',
          source: 'task2',
          target: 'task1',
        },
      ]

      const validator = new WorkflowValidator(workflow)
      const result = validator.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors.some((error) => error.includes('循环依赖'))).toBe(true)
    })
  })
})
