<template>
  <div class="knowledge-management">
    <div class="header">
      <h2>知识库管理</h2>
    </div>

    <knowledge-base-list
      :knowledge-bases="knowledgeBases"
      :loading="isLoading"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      @search="handleListSearch"
      @view="handleViewKnowledgeBase"
      @edit="openEditModal"
      @delete="handleDeleteKnowledgeBase"
      @size-change="handlePageSizeChange"
      @current-change="handlePageChange"
    >
      <template #actions>
        <el-button type="primary" @click="openCreateModal">
          <el-icon><Plus /></el-icon>
          创建知识库
        </el-button>
      </template>
    </knowledge-base-list>

    <!-- 创建知识库对话框 -->
    <el-dialog
      v-model="showCreateModal"
      title="创建知识库"
      width="600px"
      :close-on-click-modal="false"
    >
      <knowledge-base-form
        :is-loading="isLoading"
        @submit="handleCreateSubmit"
        @cancel="showCreateModal = false"
      />
    </el-dialog>

    <!-- 编辑知识库对话框 -->
    <el-dialog
      v-model="showEditModal"
      title="编辑知识库"
      width="600px"
      :close-on-click-modal="false"
    >
      <knowledge-base-form
        v-if="editingKnowledgeBase"
        :knowledge-base="editingKnowledgeBase"
        :is-loading="isLoading"
        @submit="handleEditSubmit"
        @cancel="showEditModal = false"
      />
    </el-dialog>

    <!-- 上传文档对话框 -->
    <el-dialog v-model="showUploadModal" title="上传文档" width="800px" top="5vh">
      <document-upload-form
        v-if="currentKnowledgeBaseId"
        :knowledge-base-id="currentKnowledgeBaseId"
        :is-loading="isLoading"
        @uploaded="handleUploadComplete"
        @cancel="showUploadModal = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useKnowledgeBaseStore } from '@/stores/knowledgeBaseStore'
import KnowledgeBaseList from '@/components/knowledge/KnowledgeBaseList.vue'
import KnowledgeBaseForm from '@/components/knowledge/KnowledgeBaseForm.vue'
import DocumentUploadForm from '@/components/knowledge/DocumentUploadForm.vue'
import type { CreateKnowledgeBaseForm, KnowledgeBase } from '@/types/knowledgeBase'

const route = useRoute()
const router = useRouter()
const knowledgeBaseStore = useKnowledgeBaseStore()

// 状态变量
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showUploadModal = ref(false)
const editingKnowledgeBase = ref<KnowledgeBase | null>(null)
const currentKnowledgeBaseId = ref<string | null>(null)

// 从store获取数据
const isLoading = computed(() => knowledgeBaseStore.isLoading)
const knowledgeBases = computed(() => knowledgeBaseStore.knowledgeBases)
const total = computed(() => knowledgeBaseStore.total)
const currentPage = computed(() => knowledgeBaseStore.currentPage)
const pageSize = computed(() => knowledgeBaseStore.pageSize)

// 生命周期钩子
onMounted(async () => {
  await knowledgeBaseStore.fetchKnowledgeBases()
  // 添加事件监听器
  window.addEventListener('openEditModal', handleOpenEditModal)
  window.addEventListener('openUploadModal', handleOpenUploadModal)
  window.addEventListener('knowledgeBaseDeleted', handleKnowledgeBaseDeleted)
})

onBeforeUnmount(() => {
  // 清理事件监听器
  window.removeEventListener('openEditModal', handleOpenEditModal)
  window.removeEventListener('openUploadModal', handleOpenUploadModal)
  window.removeEventListener('knowledgeBaseDeleted', handleKnowledgeBaseDeleted)
})

// 方法
const openCreateModal = () => {
  showCreateModal.value = true
}

const openEditModal = async (knowledgeBase: KnowledgeBase) => {
  // 直接根据id查询知识库信息
  try {
    editingKnowledgeBase.value = await knowledgeBaseStore.fetchKnowledgeBase(knowledgeBase.id)
    showEditModal.value = true
  } catch (error) {
    ElMessage.error('获取知识库信息失败')
  }
}

// 通过CustomEvent打开编辑模态框的处理函数
const handleOpenEditModal = async (event: CustomEvent) => {
  const knowledgeBase = event.detail as KnowledgeBase
  openEditModal(knowledgeBase)
}

const openUploadModal = async (knowledgeBase: KnowledgeBase) => {
  currentKnowledgeBaseId.value = knowledgeBase.id
  showUploadModal.value = true
}

// 通过CustomEvent打开上传模态框的处理函数
const handleOpenUploadModal = async (event: CustomEvent) => {
  const knowledgeBase = event.detail as KnowledgeBase
  openUploadModal(knowledgeBase)
}

// 知识库被删除的处理函数
const handleKnowledgeBaseDeleted = async (event: CustomEvent) => {
  await knowledgeBaseStore.fetchKnowledgeBases()
}

const handleCreateSubmit = async (form: CreateKnowledgeBaseForm) => {
  try {
    const result = await knowledgeBaseStore.createKnowledgeBase(form)
    if (result) {
      showCreateModal.value = false
      ElMessage.success('知识库创建成功')
      await knowledgeBaseStore.fetchKnowledgeBases()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '创建知识库失败')
  }
}

const handleEditSubmit = async (form: CreateKnowledgeBaseForm) => {
  if (!editingKnowledgeBase.value) return

  try {
    const result = await knowledgeBaseStore.updateKnowledgeBase(editingKnowledgeBase.value.id, form)
    if (result) {
      showEditModal.value = false
      ElMessage.success('知识库更新成功')
      await knowledgeBaseStore.fetchKnowledgeBases()
      editingKnowledgeBase.value = null
    }
  } catch (error: any) {
    ElMessage.error(error.message || '更新知识库失败')
  }
}

const handleUploadComplete = async (success: boolean) => {
  if (success) {
    showUploadModal.value = false
    ElMessage.success('文档上传成功')
    currentKnowledgeBaseId.value = null
  }
}

const handleViewKnowledgeBase = async (knowledgeBase: KnowledgeBase) => {
  // 跳转到知识库详情页面
  router.push({ name: 'KnowledgeBaseDetail', params: { id: knowledgeBase.id } })
}

async function handleDeleteKnowledgeBase(kb: KnowledgeBase) {
  try {
    await ElMessageBox.confirm('确定要删除这个知识库吗？此操作不可撤销。', '确认删除', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })

    await knowledgeBaseStore.deleteKnowledgeBase(kb.id)
    ElMessage.success('删除知识库成功')
    await knowledgeBaseStore.fetchKnowledgeBases()
  } catch (error) {
    console.log(error)
    if (error !== 'cancel') {
      ElMessage.error('删除知识库失败')
    }
  }
}

const handleListSearch = (query: string) => {
  knowledgeBaseStore.updateFilters({ search: query })
  knowledgeBaseStore.fetchKnowledgeBases()
}

const handlePageChange = (page: number) => {
  knowledgeBaseStore.updateFilters({ page })
  knowledgeBaseStore.fetchKnowledgeBases()
}

const handlePageSizeChange = (size: number) => {
  knowledgeBaseStore.updateFilters({ pageSize: size, page: 1 })
  knowledgeBaseStore.fetchKnowledgeBases()
}
</script>

<style scoped>
.knowledge-management {
  padding: 16px;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.header h2 {
  margin: 0;
}

:deep(.el-tabs) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: auto;
}

:deep(.el-tab-pane) {
  height: 100%;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .knowledge-management {
    padding: 12px;
    height: calc(100vh - 50px);
  }
}
</style>
