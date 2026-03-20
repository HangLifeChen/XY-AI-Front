import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { KnowledgeBaseService } from '@/api/knowledgeBaseService'
import { useUserStore } from './user'
import type {
  KnowledgeBase,
  CreateKnowledgeBaseForm,
  KnowledgeBaseDocument,
  KnowledgeBaseSearchParams,
  KnowledgeBaseSearchResponse,
} from '@/types/knowledgeBase'

export const useKnowledgeBaseStore = defineStore('knowledgeBase', () => {
  // 状态
  const knowledgeBases = ref<KnowledgeBase[]>([])
  const currentKnowledgeBase = ref<KnowledgeBase | null>(null)
  const documents = ref<KnowledgeBaseDocument[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const documentsTotal = ref(0)
  const documentsPage = ref(1)
  const documentsPageSize = ref(10)
  const totalKnowledgeBaseSize = ref(0) // 总知识库大小（MB）

  // 监听知识库大小变化，更新用户资源使用情况
  const userStore = useUserStore()
  watch(
    () => totalKnowledgeBaseSize.value,
    (newSize) => {
      userStore.updateUsedResources({ knowledgeBaseSize: newSize })
    }
  )

  // 监听用户订阅变化
  watch(
    () => userStore.userSubscription,
    (subscription) => {
      // 可以在这里添加订阅变化时的处理逻辑
    }
  )

  // 过滤条件
  const filters = ref({
    search: '',
    sortBy: 'updated_at',
    sortOrder: 'desc' as 'asc' | 'desc',
    page: 1,
    pageSize: 10,
  })

  const documentFilters = ref({
    knowledgeBaseId: '',
    search: '',
    status: '',
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc',
    page: 1,
    pageSize: 10,
  })

  // 获取知识库列表
  async function fetchKnowledgeBases() {
    isLoading.value = true
    error.value = null

    try {
      const response = await KnowledgeBaseService.getKnowledgeBases({
        page: filters.value.page,
        pageSize: filters.value.pageSize,
        search: filters.value.search,
        sortBy: filters.value.sortBy,
        sortOrder: filters.value.sortOrder,
      })
      knowledgeBases.value = response.knowledgeBases
      total.value = response.total
      currentPage.value = filters.value.page
      pageSize.value = filters.value.pageSize

      // 计算总知识库大小
      totalKnowledgeBaseSize.value = knowledgeBases.value.reduce((sum, kb) => sum + (kb.size || 0), 0)

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取知识库列表失败'
      console.error('获取知识库列表失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 获取单个知识库详情
  async function fetchKnowledgeBase(id: string) {
    isLoading.value = true
    error.value = null

    try {
      var data = await KnowledgeBaseService.getKnowledgeBase(id)
      // 同时获取该知识库的文档
      if (data) {
        documentFilters.value.knowledgeBaseId = id
        await fetchDocuments(id)
      }
      currentKnowledgeBase.value = data
      return currentKnowledgeBase.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取知识库详情失败'
      console.error('获取知识库详情失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 创建知识库
  async function createKnowledgeBase(data: CreateKnowledgeBaseForm) {
    isLoading.value = true
    error.value = null

    // 检查是否达到知识库容量限制
    const userStore = useUserStore()
    if (userStore.isKnowledgeBaseLimitReached) {
      error.value = '已达到知识库容量限制，请升级订阅计划以增加存储空间'
      console.error('创建知识库失败:', error.value)
      isLoading.value = false
      return null
    }

    try {
      const newKnowledgeBase = await KnowledgeBaseService.createKnowledgeBase(data)
      await fetchKnowledgeBases() // 刷新列表
      return newKnowledgeBase
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建知识库失败'
      console.error('创建知识库失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 更新知识库
  async function updateKnowledgeBase(id: string, data: Partial<CreateKnowledgeBaseForm>) {
    isLoading.value = true
    error.value = null

    try {
      const updatedKnowledgeBase = await KnowledgeBaseService.updateKnowledgeBase(id, data)

      // 更新本地状态
      if (currentKnowledgeBase.value && currentKnowledgeBase.value.id === id) {
        currentKnowledgeBase.value = updatedKnowledgeBase
      }

      // 更新列表中的知识库
      const index = knowledgeBases.value.findIndex((kb) => kb.id === id)
      if (index !== -1) {
        knowledgeBases.value[index] = updatedKnowledgeBase
      }

      return updatedKnowledgeBase
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新知识库失败'
      console.error('更新知识库失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 删除知识库
  async function deleteKnowledgeBase(id: string) {
    isLoading.value = true
    error.value = null

    try {
      await KnowledgeBaseService.deleteKnowledgeBase(id)

      // 更新本地状态
      if (currentKnowledgeBase.value && currentKnowledgeBase.value.id === id) {
        currentKnowledgeBase.value = null
      }

      // 从列表中移除
      knowledgeBases.value = knowledgeBases.value.filter((kb) => kb.id !== id)

      // 重新计算总大小
      totalKnowledgeBaseSize.value = knowledgeBases.value.reduce((sum, kb) => sum + (kb.size || 0), 0)

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除知识库失败'
      console.error('删除知识库失败:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 获取知识库文档列表
  async function fetchDocuments(knowledgeBaseId: string) {
    isLoading.value = true
    error.value = null

    try {
      documentFilters.value.knowledgeBaseId = knowledgeBaseId
      const response = await KnowledgeBaseService.getDocuments({
        knowledgeBaseId,
        page: documentFilters.value.page,
        pageSize: documentFilters.value.pageSize,
        search: documentFilters.value.search,
        status: documentFilters.value.status,
        sortBy: documentFilters.value.sortBy,
        sortOrder: documentFilters.value.sortOrder,
      })

      documents.value = response.items
      documentsTotal.value = response.total
      documentsPage.value = documentFilters.value.page
      documentsPageSize.value = documentFilters.value.pageSize

      return response
    } catch (err) {
      console.log(err)
      error.value = err instanceof Error ? err.message : '获取文档列表失败'
      console.error('获取文档列表失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 上传文档
  async function uploadDocument(
    knowledgeBaseId: string,
    file: File,
    metadata?: Record<string, any>,
  ) {
    isLoading.value = true
    error.value = null

    // 检查是否达到知识库容量限制
    const userStore = useUserStore()
    const fileSizeMB = file.size / (1024 * 1024) // 转换为MB
    if (userStore.isKnowledgeBaseLimitReached || 
        (userStore.subscription && 
         userStore.subscription.usedKnowledgeBaseSize + fileSizeMB > userStore.subscription.maxKnowledgeBaseSize &&
         userStore.subscription.maxKnowledgeBaseSize !== -1)) {
      error.value = '上传此文件将超出知识库容量限制，请升级订阅计划以增加存储空间'
      console.error('上传文档失败:', error.value)
      isLoading.value = false
      return null
    }

    // 额外检查：如果用户没有订阅信息，则使用默认限制
    if (!userStore.subscription && 
        userStore.subscriptionLimits.usedKnowledgeBaseSize + fileSizeMB > userStore.subscriptionLimits.maxKnowledgeBaseSize) {
      error.value = '上传此文件将超出知识库容量限制，请升级订阅计划以增加存储空间'
      console.error('上传文档失败:', error.value)
      isLoading.value = false
      return null
    }

    try {
      const document = await KnowledgeBaseService.uploadDocument(knowledgeBaseId, file, metadata)

      // 刷新文档列表
      await fetchDocuments(knowledgeBaseId)

      // 更新总大小
      totalKnowledgeBaseSize.value += fileSizeMB

      return document
    } catch (err) {
      error.value = err instanceof Error ? err.message : '上传文档失败'
      console.error('上传文档失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 删除文档
  async function deleteDocument(knowledgeBaseId: string, documentId: string) {
    isLoading.value = true
    error.value = null

    try {
      await KnowledgeBaseService.deleteDocument(knowledgeBaseId, documentId)

      // 从列表中移除
      const docIndex = documents.value.findIndex((doc) => doc.id === documentId)
      let docSize = 0
      if (docIndex !== -1) {
        docSize = documents.value[docIndex].size || 0
        documents.value.splice(docIndex, 1)
      }

      // 更新总大小
      totalKnowledgeBaseSize.value -= docSize

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除文档失败'
      console.error('删除文档失败:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 搜索知识库
  async function searchKnowledgeBase(
    params: KnowledgeBaseSearchParams,
  ): Promise<KnowledgeBaseSearchResponse> {
    isLoading.value = true
    error.value = null

    try {
      return await KnowledgeBaseService.searchKnowledgeBase(params)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '搜索知识库失败'
      console.error('搜索知识库失败:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 获取文档内容
  async function getDocumentContent(knowledgeBaseId: string, documentId: string) {
    isLoading.value = true
    error.value = null

    try {
      return await KnowledgeBaseService.getDocumentContent(knowledgeBaseId, documentId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取文档内容失败'
      console.error('获取文档内容失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 重新索引文档
  async function reindexDocument(knowledgeBaseId: string, documentId: string) {
    isLoading.value = true
    error.value = null

    try {
      const updatedDocument = await KnowledgeBaseService.reindexDocument(
        knowledgeBaseId,
        documentId,
      )

      // 更新文档列表
      const index = documents.value.findIndex((doc) => doc.id === documentId)
      if (index !== -1) {
        documents.value[index] = updatedDocument
      }

      return updatedDocument
    } catch (err) {
      error.value = err instanceof Error ? err.message : '重新索引文档失败'
      console.error('重新索引文档失败:', err)
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

  // 更新文档过滤条件
  function updateDocumentFilters(
    newFilters: Partial<Omit<typeof documentFilters.value, 'knowledgeBaseId'>>,
  ) {
    documentFilters.value = {
      ...documentFilters.value,
      ...newFilters,
    }
  }

  return {
    // 状态
    knowledgeBases,
    currentKnowledgeBase,
    documents,
    isLoading,
    error,
    total,
    currentPage,
    pageSize,
    documentsTotal,
    documentsPage,
    documentsPageSize,
    filters,
    documentFilters,
    totalKnowledgeBaseSize,

    // 方法
    fetchKnowledgeBases,
    fetchKnowledgeBase,
    createKnowledgeBase,
    updateKnowledgeBase,
    deleteKnowledgeBase,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    searchKnowledgeBase,
    getDocumentContent,
    reindexDocument,
    updateFilters,
    updateDocumentFilters,
  }
})