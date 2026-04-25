<template>
  <div class="knowledge-base-detail" v-if="knowledgeBase">
    <el-card class="kb-detail-card">
      <template #header>
        <div class="card-header">
          <span>{{ knowledgeBase.name }}</span>
          <el-space>
            <el-button @click="handleEditKnowledgeBase">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button @click="handleUploadDocument">
              <el-icon><Upload /></el-icon>
              上传文档
            </el-button>
            <el-popconfirm
              title="确认删除此知识库？此操作不可恢复。"
              @confirm="handleDeleteKnowledgeBase"
            >
              <template #reference>
                <el-button type="danger" :loading="isDeleting">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </el-space>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="描述">
          {{ knowledgeBase.description || '无描述' }}
        </el-descriptions-item>
        <el-descriptions-item label="文档数量">
          {{ knowledgeBase.documentCount }}
        </el-descriptions-item>
        <el-descriptions-item label="总大小">
          {{ formatFileSize(knowledgeBase.totalSize) }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDate(knowledgeBase.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatDate(knowledgeBase.updatedAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="标签">
          <el-space>
            <el-tag v-for="tag in knowledgeBase.tags" :key="tag" size="small">
              {{ tag }}
            </el-tag>
            <el-tag
              v-if="!knowledgeBase.tags || knowledgeBase.tags.length === 0"
              size="small"
              type="info"
            >
              无标签
            </el-tag>
          </el-space>
        </el-descriptions-item>
        <el-descriptions-item label="向量模型提供商" v-if="knowledgeBase.embeddingModelProvider">
          {{ knowledgeBase.embeddingModelProvider }}
        </el-descriptions-item>
        <el-descriptions-item label="向量模型" v-if="knowledgeBase.embeddingModelName">
          {{ knowledgeBase.embeddingModelName }}
        </el-descriptions-item>
        <el-descriptions-item label="对话模型提供商" v-if="knowledgeBase.chatModelProvider">
          {{ knowledgeBase.chatModelProvider }}
        </el-descriptions-item>
        <el-descriptions-item label="对话模型" v-if="knowledgeBase.chatModelName">
          {{ knowledgeBase.chatModelName }}
        </el-descriptions-item>
      </el-descriptions>

      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="文档列表" name="documents">
          <!-- 文档筛选区域 -->
          <div class="filter-section mb-4">
            <el-row :gutter="12">
              <el-col :span="8">
                <el-input
                  v-model="searchQuery"
                  placeholder="搜索文档名称"
                  clearable
                  @keydown.enter="handleSearch"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </el-col>
              <el-col :span="6">
                <el-select
                  v-model="statusFilter"
                  placeholder="选择状态"
                  clearable
                  style="width: 100%"
                  @change="handleSearch"
                >
                  <el-option
                    v-for="option in statusOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-col>
              <el-col :span="6">
                <el-select
                  v-model="sortOption"
                  placeholder="排序方式"
                  style="width: 100%"
                  @change="handleSortChange"
                >
                  <el-option
                    v-for="option in sortOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-col>
              <el-col :span="4">
                <el-button @click="handleSearch" style="width: 100%">
                  <el-icon><Search /></el-icon>
                  搜索
                </el-button>
              </el-col>
            </el-row>
          </div>

          <!-- 文档列表 -->
          <el-table :data="documents" v-loading="isLoading" stripe @sort-change="handleSortChange">
            <el-table-column prop="name" label="文件名" min-width="200" show-overflow-tooltip />
            <el-table-column prop="fileType" label="类型" width="100" />
            <el-table-column label="大小" width="100">
              <template #default="scope">
                {{ formatFileSize(scope.row.size) }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getDocumentStatusType(scope.row.status)" size="small">
                  {{ getDocumentStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="pageCount" label="页数" width="80" />
            <el-table-column prop="vectorCount" label="向量数" width="80" />
            <el-table-column label="更新时间" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.updatedAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220">
              <template #default="scope">
                <el-space>
                  <el-button size="small" @click="handlePreviewDocument(scope.row)">
                    预览
                  </el-button>
                  <el-button
                    size="small"
                    @click="handleReindexDocument(scope.row)"
                    :disabled="scope.row.status === 'processing'"
                  >
                    重新索引
                  </el-button>
                  <el-popconfirm title="确认删除此文档？" @confirm="deleteDocument(scope.row)">
                    <template #reference>
                      <el-button size="small" type="danger" :loading="deleteLoading[scope.row.id]">
                        删除
                      </el-button>
                    </template>
                  </el-popconfirm>
                </el-space>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="documentsTotal"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handlePageSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="知识库搜索" name="search">
          <knowledge-base-search :knowledge-base="knowledgeBase" />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 文档内容预览对话框 -->
    <el-dialog
      v-model="showPreviewModal"
      title="文档内容预览"
      width="80%"
      max-width="1000px"
      top="5vh"
    >
      <div v-if="documentContent" class="document-preview">
        <div class="document-content">
          <pre>{{ documentContent }}</pre>
        </div>
      </div>
      <div v-else class="document-preview-loading">
        <el-skeleton :rows="5" animated />
        <p>加载文档内容中...</p>
      </div>
      <template #footer>
        <el-button @click="showPreviewModal = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 编辑知识库对话框 -->
    <el-dialog
      v-model="showEditModal"
      title="编辑知识库"
      width="600px"
      :close-on-click-modal="false"
    >
      <knowledge-base-form
        v-if="knowledgeBase"
        :knowledge-base="knowledgeBase"
        :is-loading="isLoading"
        @submit="handleEditSubmit"
        @cancel="showEditModal = false"
      />
    </el-dialog>

    <!-- 上传文档对话框 -->
    <el-dialog v-model="showUploadModal" title="上传文档" width="800px" top="5vh">
      <document-upload-form
        v-if="knowledgeBase"
        :knowledge-base-id="knowledgeBase.id"
        :is-loading="isLoading"
        @uploaded="handleUploadComplete"
        @cancel="showUploadModal = false"
      />
    </el-dialog>
  </div>

  <div v-else class="loading-container">
    <el-skeleton :rows="5" animated />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Edit, Upload, Refresh, Delete } from '@element-plus/icons-vue'
import { useKnowledgeBaseStore } from '@/stores/knowledgeBaseStore'
import KnowledgeBaseForm from '@/components/knowledge/KnowledgeBaseForm.vue'
import DocumentUploadForm from '@/components/knowledge/DocumentUploadForm.vue'
import KnowledgeBaseSearch from '@/components/knowledge/KnowledgeBaseSearch.vue'
import type { KnowledgeBase, KnowledgeBaseDocument } from '@/types/knowledgeBase'

const route = useRoute()
const router = useRouter()
const knowledgeBaseStore = useKnowledgeBaseStore()

// 状态变量
const knowledgeBase = ref<KnowledgeBase | null>(null)
const activeTab = ref('documents')
const searchQuery = ref('')
const statusFilter = ref('')
const sortOption = ref('updatedAt:desc')
const showPreviewModal = ref(false)
const showEditModal = ref(false)
const showUploadModal = ref(false)
const documentContent = ref<string | null>(null)
const isReindexing = ref(false)
const isDeleting = ref(false)
const isLoadingKnowledgeBase = ref(true)
const reindexLoading = ref<Record<string, boolean>>({})
const deleteLoading = ref<Record<string, boolean>>({})

// 从store获取数据
const documents = computed(() => knowledgeBaseStore.documents)
const isLoading = computed(() => knowledgeBaseStore.isLoading)
const documentsTotal = computed(() => knowledgeBaseStore.documentsTotal)
const currentPage = computed({
  get: () => knowledgeBaseStore.documentsPage,
  set: (value) => knowledgeBaseStore.updateDocumentFilters({ page: value }),
})
const pageSize = computed({
  get: () => knowledgeBaseStore.documentsPageSize,
  set: (value) => knowledgeBaseStore.updateDocumentFilters({ pageSize: value }),
})

// 选项数据
const statusOptions = [
  { label: '待处理', value: 'pending' },
  { label: '处理中', value: 'processing' },
  { label: '已索引', value: 'completed' },
  { label: '错误', value: 'failed' },
]

const sortOptions = [
  { label: '更新时间 ↓', value: 'updatedAt:desc' },
  { label: '更新时间 ↑', value: 'updatedAt:asc' },
  { label: '创建时间 ↓', value: 'created_at:desc' },
  { label: '创建时间 ↑', value: 'created_at:asc' },
  { label: '文件大小 ↓', value: 'size:desc' },
  { label: '文件大小 ↑', value: 'size:asc' },
  { label: '文件名 A-Z', value: 'name:asc' },
  { label: '文件名 Z-A', value: 'name:desc' },
]

// 生命周期钩子
onMounted(async () => {
  await loadKnowledgeBase()
})

// 监听路由变化
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await loadKnowledgeBase()
    }
  },
)

// 方法
const loadKnowledgeBase = async () => {
  isLoadingKnowledgeBase.value = true
  try {
    const id = route.params.id as string
    knowledgeBase.value = await knowledgeBaseStore.fetchKnowledgeBase(id)
    await fetchDocuments()
  } catch (error) {
    ElMessage.error('获取知识库信息失败')
    router.push({ name: 'KnowledgeManagement' })
  } finally {
    isLoadingKnowledgeBase.value = false
  }
}

const fetchDocuments = async () => {
  if (knowledgeBase.value) {
    await knowledgeBaseStore.fetchDocuments(knowledgeBase.value.id)
  }
}

const handleSearch = () => {
  knowledgeBaseStore.updateDocumentFilters({
    page: 1,
    search: searchQuery.value,
    status: statusFilter.value,
  })
  fetchDocuments()
}

const handleSortChange = (value: string) => {
  const [sortBy, sortOrder] = value.split(':')
  knowledgeBaseStore.updateDocumentFilters({
    sortBy,
    sortOrder: sortOrder as 'asc' | 'desc',
  })
  fetchDocuments()
}

const handleTableSortChange = (sort: { column: any; prop: string; order: string }) => {
  if (sort.prop && sort.order) {
    const sortOrder = sort.order === 'ascending' ? 'asc' : 'desc'
    knowledgeBaseStore.updateDocumentFilters({
      sortBy: sort.prop,
      sortOrder: sortOrder as 'asc' | 'desc',
    })
    fetchDocuments()
  }
}

const handlePageChange = (page: number) => {
  knowledgeBaseStore.updateDocumentFilters({ page })
  fetchDocuments()
}

const handlePageSizeChange = (pageSize: number) => {
  knowledgeBaseStore.updateDocumentFilters({ pageSize, page: 1 })
  fetchDocuments()
}

const handleEditKnowledgeBase = () => {
  showEditModal.value = true
}

const handleUploadDocument = () => {
  showUploadModal.value = true
}

const handleDeleteKnowledgeBase = async () => {
  isDeleting.value = true
  try {
    await ElMessageBox.confirm('此操作将永久删除该知识库及其所有文档，是否继续？', '确认删除', {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
    })

    if (knowledgeBase.value) {
      const success = await knowledgeBaseStore.deleteKnowledgeBase(knowledgeBase.value.id)
      if (success) {
        ElMessage.success('知识库删除成功')
        // 通知父组件刷新列表
        window.dispatchEvent(
          new CustomEvent('knowledgeBaseDeleted', { detail: knowledgeBase.value.id }),
        )
        router.push({ name: 'KnowledgeManagement' })
      } else {
        ElMessage.error('知识库删除失败')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除操作失败')
    }
  } finally {
    isDeleting.value = false
  }
}

const handlePreviewDocument = async (document: KnowledgeBaseDocument) => {
  if (!knowledgeBase.value) return

  showPreviewModal.value = true
  documentContent.value = null

  try {
    documentContent.value = await knowledgeBaseStore.getDocumentContent(
      knowledgeBase.value.id,
      document.id,
    )
  } catch (error) {
    documentContent.value = '无法加载文档内容'
    ElMessage.error('文档内容加载失败')
  }
}

const handleReindexDocument = async (document: KnowledgeBaseDocument) => {
  if (!knowledgeBase.value) return

  reindexLoading.value[document.id] = true
  try {
    const result = await knowledgeBaseStore.reindexDocument(knowledgeBase.value.id, document.id)
    if (result) {
      ElMessage.success('文档重新索引请求已提交')
      fetchDocuments()
    }
  } catch (error) {
    ElMessage.error('文档重新索引失败')
  } finally {
    reindexLoading.value[document.id] = false
  }
}

const deleteDocument = async (document: KnowledgeBaseDocument) => {
  if (!knowledgeBase.value) return

  deleteLoading.value[document.id] = true
  try {
    const success = await knowledgeBaseStore.deleteDocument(knowledgeBase.value.id, document.id)
    if (success) {
      ElMessage.success('文档已删除')
      fetchDocuments()
    } else {
      ElMessage.error('文档删除失败')
    }
  } catch (error) {
    ElMessage.error('删除操作失败')
  } finally {
    deleteLoading.value[document.id] = false
  }
}

const handleEditSubmit = async (form: any) => {
  if (!knowledgeBase.value) return

  try {
    const result = await knowledgeBaseStore.updateKnowledgeBase(knowledgeBase.value.id, form)
    if (result) {
      showEditModal.value = false
      ElMessage.success('知识库更新成功')
      await loadKnowledgeBase()
      // 通知父组件刷新列表
      window.dispatchEvent(new CustomEvent('knowledgeBaseUpdated', { detail: result }))
    }
  } catch (error: any) {
    ElMessage.error(error.message || '更新知识库失败')
  }
}

const handleUploadComplete = async (success: boolean) => {
  if (success) {
    showUploadModal.value = false
    ElMessage.success('文档上传成功')
    await fetchDocuments()
  }
}

// 获取状态类型
const getStatusType = (status: string): 'success' | 'info' | 'warning' | 'error' | '' => {
  const statusMap: Record<string, 'success' | 'info' | 'warning' | 'error' | ''> = {
    active: 'success',
    processing: 'info',
    error: 'error',
    archived: 'warning',
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: '活跃',
    processing: '处理中',
    error: '错误',
    archived: '已归档',
  }
  return statusMap[status] || status
}

// 获取文档状态类型
const getDocumentStatusType = (status: string): 'success' | 'info' | 'warning' | 'error' | '' => {
  const statusMap: Record<string, 'success' | 'info' | 'warning' | 'error' | ''> = {
    pending: 'info',
    processing: 'warning',
    indexed: 'success',
    error: 'error',
  }
  return statusMap[status] || 'info'
}

// 获取文档状态文本
const getDocumentStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    indexed: '已索引',
    error: '错误',
  }
  return statusMap[status] || status
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  if (!bytes) return '未知'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期
const formatDate = (dateString: string | number): string => {
  if (!dateString) return '未知'

  let date: Date

  // 检查是否为 Unix 时间戳（秒）
  if (typeof dateString === 'number') {
    date = new Date(dateString * 1000) // 转换为毫秒
  } else if (typeof dateString === 'string' && /^\d+$/.test(dateString)) {
    // 如果是纯数字字符串，也当作时间戳处理
    date = new Date(parseInt(dateString, 10) * 1000)
  } else {
    // 普通日期字符串
    date = new Date(dateString)
  }

  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return '无效日期'
  }

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
</script>

<style scoped>
.knowledge-base-detail {
  width: 100%;
  padding: 16px;
}

.kb-detail-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-section {
  margin-bottom: 16px;
}

.mb-4 {
  margin-bottom: 16px;
}

.document-preview {
  padding: 16px;
  max-height: 60vh;
  overflow-y: auto;
}

.document-content {
  white-space: pre-wrap;
  font-family: monospace;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
  max-height: 50vh;
  overflow-y: auto;
}

.document-preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.loading-container {
  padding: 20px;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-section .el-row {
    flex-direction: column;
    gap: 12px;
  }

  .filter-section .el-col {
    width: 100%;
  }

  .knowledge-base-detail {
    padding: 12px;
  }
}
</style>
