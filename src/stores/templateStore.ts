import { defineStore } from 'pinia'
import { ref } from 'vue'
import { TemplateService } from '@/api/templateService'
import type {
  AnyTemplate,
  TemplateListParams,
} from '@/types/template'

export const useTemplateStore = defineStore('template', () => {
  // 状态
  const templates = ref<AnyTemplate[]>([])
  const currentTemplate = ref<AnyTemplate | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)

  // 获取模板列表
  async function fetchTemplates(params?: TemplateListParams) {
    isLoading.value = true
    error.value = null

    try {
      const response = await TemplateService.getTemplates(params || {})
      templates.value = response.items
      total.value = response.total
      currentPage.value = response.page
      pageSize.value = response.pageSize

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取模板列表失败'
      console.error('获取模板列表失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 获取单个模板详情
  async function fetchTemplate(id: string) {
    isLoading.value = true
    error.value = null

    try {
      currentTemplate.value = await TemplateService.getTemplate(id)
      return currentTemplate.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取模板详情失败'
      console.error('获取模板详情失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 更新模板
  async function updateTemplate(id: string, template: Partial<AnyTemplate>) {
    isLoading.value = true
    error.value = null

    try {
      const updatedTemplate = await TemplateService.updateTemplate(id, template)

      // 更新本地状态
      if (currentTemplate.value && currentTemplate.value.id === id) {
        currentTemplate.value = updatedTemplate
      }

      // 更新列表中的模板
      const index = templates.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        templates.value[index] = updatedTemplate
      }

      return updatedTemplate
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新模板失败'
      console.error('更新模板失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 删除模板
  async function deleteTemplate(id: string) {
    isLoading.value = true
    error.value = null

    try {
      await TemplateService.deleteTemplate(id)

      // 更新本地状态
      if (currentTemplate.value && currentTemplate.value.id === id) {
        currentTemplate.value = null
      }

      // 从列表中移除
      templates.value = templates.value.filter((t) => t.id === id)

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除模板失败'
      console.error('删除模板失败:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 从工作流创建模板
  async function createTemplateFromWorkflow(sourceId: string, templateData: any) {
    isLoading.value = true
    error.value = null

    try {
      const newTemplate = await TemplateService.createTemplateFromWorkflow(templateData, sourceId)
      await fetchTemplates() // 刷新列表
      return newTemplate
    } catch (err) {
      error.value = err instanceof Error ? err.message : '从工作流创建模板失败'
      console.error('从工作流创建模板失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 从智能体创建模板
  async function createTemplateFromAgent(sourceId: string, templateData: any) {
    isLoading.value = true
    error.value = null

    try {
      const newTemplate = await TemplateService.createTemplateFromAgent(templateData, sourceId)
      await fetchTemplates() // 刷新列表
      return newTemplate
    } catch (err) {
      error.value = err instanceof Error ? err.message : '从智能体创建模板失败'
      console.error('从智能体创建模板失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 创建工作流实例从模板
  async function createWorkflowFromTemplate(templateId: string, workflowData: { name: string; description?: string }) {
    isLoading.value = true
    error.value = null

    try {
      return await TemplateService.createWorkflowFromTemplate(templateId, workflowData)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '从模板创建工作流失败'
      console.error('从模板创建工作流失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 创建智能体实例从模板
  async function createAgentFromTemplate(templateId: string, agentData: { name: string; description?: string }) {
    isLoading.value = true
    error.value = null

    try {
      return await TemplateService.createAgentFromTemplate(templateId, agentData)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '从模板创建智能体失败'
      console.error('从模板创建智能体失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 应用模板（创建实例）
  async function applyTemplate(template: AnyTemplate, instanceData: { name: string; description?: string }) {
    isLoading.value = true
    error.value = null

    try {
      if (template.type === 'workflow') {
        return await createWorkflowFromTemplate(template.id, instanceData)
      } else if (template.type === 'agent') {
        return await createAgentFromTemplate(template.id, instanceData)
      } else {
        throw new Error('不支持的模板类型')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '应用模板失败'
      console.error('应用模板失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 导出模板
  async function exportTemplate(id: string) {
    isLoading.value = true
    error.value = null

    try {
      return await TemplateService.exportTemplate(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '导出模板失败'
      console.error('导出模板失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 导入模板
  async function importTemplate(templateData: any) {
    isLoading.value = true
    error.value = null

    try {
      const importedTemplate = await TemplateService.importTemplate(templateData)
      await fetchTemplates() // 刷新列表
      return importedTemplate
    } catch (err) {
      error.value = err instanceof Error ? err.message : '导入模板失败'
      console.error('导入模板失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    // 状态
    templates,
    currentTemplate,
    isLoading,
    error,
    total,
    currentPage,
    pageSize,

    // 方法
    fetchTemplates,
    fetchTemplate,
    updateTemplate,
    deleteTemplate,
    createTemplateFromWorkflow,
    createTemplateFromAgent,
    createWorkflowFromTemplate,
    createAgentFromTemplate,
    applyTemplate,
    exportTemplate,
    importTemplate,
  }
})