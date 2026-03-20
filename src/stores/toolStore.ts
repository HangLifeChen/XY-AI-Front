import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ToolService } from '@/api/toolService'
import type { ToolListParams, ToolExecutionResult, ToolType, Tool } from '@/types/tool'

export const useToolStore = defineStore('tool', () => {
  // 状态
  const tools = ref<Tool[]>([])
  const currentTool = ref<Tool | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const categories = ref<{ id: string; name: string; count: number }[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)

  // 过滤条件
  const filters = ref({
    search: '',
    category: '',
    status: '',
    sortBy: 'updated_at',
    sortOrder: 'desc' as 'asc' | 'desc',
    page: 1,
    pageSize: 10,
  })

  // 获取工具列表
  async function fetchTools(toolType: ToolType) {
    isLoading.value = true
    error.value = null

    try {
      const params: ToolListParams = {
        page: filters.value.page,
        pageSize: filters.value.pageSize,
        name: filters.value.search,
        type: toolType,
      }

      const response = await ToolService.getTools(params)
      tools.value = response.list
      total.value = response.total
      currentPage.value = response.currentPage
      pageSize.value = response.pageSize
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取工具列表失败'
      console.error('获取工具列表失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 获取单个工具详情
  async function fetchTool(id: string) {
    isLoading.value = true
    error.value = null

    try {
      currentTool.value = await ToolService.getTool(id)
      return currentTool.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取工具详情失败'
      console.error('获取工具详情失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 创建工具
  async function createTool(tool: Tool) {
    isLoading.value = true
    error.value = null

    try {
      await ToolService.createTool(tool)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建工具失败'
      console.error('创建工具失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 更新工具
  async function updateTool(id: string, tool: Partial<Tool>) {
    isLoading.value = true
    error.value = null

    try {
      const updatedTool = await ToolService.updateTool(id, tool)

      // 更新本地状态
      if (currentTool.value && currentTool.value.id === id) {
        currentTool.value = updatedTool
      }

      // 更新列表中的工具
      const index = tools.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        tools.value[index] = updatedTool
      }

      return updatedTool
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新工具失败'
      console.error('更新工具失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 删除工具
  async function deleteTool(id: string) {
    isLoading.value = true
    error.value = null

    try {
      await ToolService.deleteTool(id)

      // 更新本地状态
      if (currentTool.value && currentTool.value.id === id) {
        currentTool.value = null
      }

      // 从列表中移除
      tools.value = tools.value.filter((t) => t.id !== id)

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除工具失败'
      console.error('删除工具失败:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 测试工具
  async function testTool(
    id: string,
    params: Record<string, any>,
  ): Promise<ToolExecutionResult | null> {
    isLoading.value = true
    error.value = null

    try {
      return await ToolService.testTool(id, params)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '测试工具失败'
      console.error('测试工具失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 更新过滤条件
  function updateFilters(newFilters: Partial<typeof filters.value>) {
    filters.value = {
      ...filters.value,
      ...newFilters,
    }
  }

  // 重置当前工具
  function resetCurrentTool() {
    currentTool.value = null
  }

  return {
    // 状态
    tools,
    currentTool,
    isLoading,
    error,
    categories,
    total,
    currentPage,
    pageSize,
    filters,

    // 方法
    fetchTools,
    fetchTool,
    createTool,
    updateTool,
    deleteTool,
    testTool,
    updateFilters,
    resetCurrentTool,
  }
})
