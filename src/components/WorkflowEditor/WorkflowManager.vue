<template>
  <div class="workflow-manager">
    <el-card class="main-card">
      <template #header>
        <div class="header">
          <div class="header-content">
            <h2 class="page-title">工作流管理</h2>
            <div class="header-actions">
              <el-button type="primary" @click="createWorkflow" class="create-button">
                <el-icon><Plus /></el-icon>
                新建工作流
              </el-button>
              <el-button @click="importWorkflow" class="import-button">
                <el-icon><Upload /></el-icon>
                导入
              </el-button>
            </div>
          </div>
        </div>
      </template>

      <!-- 工作流列表 - 卡片网格布局 -->
      <div v-loading="isLoading" class="workflow-grid">
        <el-card
          v-for="workflow in workflows"
          :key="workflow.id"
          class="workflow-card"
          shadow="hover"
        >
          <div class="workflow-card-header">
            <div class="workflow-icon">
              <el-avatar :size="48" class="workflow-avatar">
                <el-icon :size="24"><Connection /></el-icon>
              </el-avatar>
            </div>
            <div class="workflow-info">
              <h3 class="workflow-name">{{ workflow.name }}</h3>
              <div class="workflow-meta">
                <span class="workflow-date">{{ formatDate(workflow.updatedAt) }}</span>
                <el-tag size="small" class="version-tag">v{{ workflow.version }}</el-tag>
              </div>
            </div>
          </div>

          <div class="workflow-description">
            {{ workflow.description || '暂无描述' }}
          </div>

          <div class="workflow-actions">
            <el-button size="small" @click="editWorkflow(workflow.id)" class="edit-button">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-dropdown @command="handleCommand" class="more-dropdown">
              <el-button size="small" class="more-button">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    :command="{ action: 'editInfo', workflow }"
                    class="dropdown-item"
                  >
                    <el-icon><Document /></el-icon>
                    编辑信息
                  </el-dropdown-item>
                  <el-dropdown-item :command="{ action: 'clone', workflow }" class="dropdown-item">
                    <el-icon><CopyDocument /></el-icon>
                    克隆
                  </el-dropdown-item>
                  <el-dropdown-item
                    :command="{ action: 'delete', workflow }"
                    class="dropdown-item delete-item"
                    divided
                  >
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-card>

        <div v-if="workflows.length === 0 && !isLoading" class="no-workflows">
          <el-empty description="暂无工作流">
            <el-button type="primary" @click="createWorkflow" class="create-empty-button"
              >创建第一个工作流</el-button
            >
          </el-empty>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[8, 16, 32, 64]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </el-card>

    <!-- 新建工作流对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="新建工作流"
      width="500px"
      :before-close="handleCreateDialogClose"
    >
      <el-form :model="newWorkflowForm" ref="createFormRef" label-width="80px">
        <el-form-item
          label="名称"
          prop="name"
          :rules="[{ required: true, message: '请输入工作流名称', trigger: 'blur' }]"
        >
          <el-input
            v-model="newWorkflowForm.name"
            placeholder="请输入工作流名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="newWorkflowForm.description"
            type="textarea"
            placeholder="请输入工作流描述"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmCreateWorkflow" :loading="creatingWorkflow"
            >创建</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 编辑工作流信息对话框 -->
    <el-dialog
      v-model="showEditInfoDialog"
      title="编辑工作流信息"
      width="500px"
      :before-close="handleEditInfoDialogClose"
    >
      <el-form :model="editWorkflowForm" ref="editFormRef" label-width="80px">
        <el-form-item
          label="名称"
          prop="name"
          :rules="[{ required: true, message: '请输入工作流名称', trigger: 'blur' }]"
        >
          <el-input
            v-model="editWorkflowForm.name"
            placeholder="请输入工作流名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="editWorkflowForm.description"
            type="textarea"
            placeholder="请输入工作流描述"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditInfoDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmEditWorkflow" :loading="updatingWorkflow"
            >保存</el-button
          >
        </span>
      </template>
    </el-dialog>

    <WorkflowExportModal v-if="showExportModal" />
    <WorkflowImportModal v-if="showImportModal" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkflowStore } from '@/stores/workflow'
import WorkflowExportModal from './WorkflowExportModal.vue'
import WorkflowImportModal from './WorkflowImportModal.vue'
import {
  CopyDocument,
  Delete,
  Edit,
  Plus,
  Upload,
  Lightning,
  Connection,
  ArrowDown,
  Document,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const workflowStore = useWorkflowStore()

// 状态管理
const workflows = ref([])
const isLoading = ref(false)
const showExportModal = ref(false)
const showImportModal = ref(false)

// 新建工作流相关
const showCreateDialog = ref(false)
const creatingWorkflow = ref(false)
const createFormRef = ref(null)
const newWorkflowForm = ref({
  name: '',
  description: '',
})

// 编辑工作流信息相关
const showEditInfoDialog = ref(false)
const updatingWorkflow = ref(false)
const editFormRef = ref(null)
const editWorkflowForm = ref({
  id: 0,
  name: '',
  description: '',
})

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 8,
  total: 0,
})

// 日期格式化函数
const formatDate = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 加载工作流列表
const loadWorkflows = async () => {
  isLoading.value = true
  try {
    const response = await workflowStore.fetchWorkflows({
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
    })

    if (Array.isArray(response)) {
      workflows.value = response
    } else {
      workflows.value = response.list || []
      pagination.value.total = response.total || response.list?.length || 0
    }
  } catch (error) {
    console.error('加载工作流列表失败:', error)
    ElMessage.error('加载工作流列表失败')
  } finally {
    isLoading.value = false
  }
}

// 处理分页变化
const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  loadWorkflows()
}

const handleCurrentChange = (page) => {
  pagination.value.currentPage = page
  loadWorkflows()
}

// 打开新建工作流对话框
const createWorkflow = async () => {
  // 重置表单
  newWorkflowForm.value = {
    name: '',
    description: '',
  }
  showCreateDialog.value = true
}

// 确认创建新工作流
const confirmCreateWorkflow = async () => {
  try {
    await createFormRef.value.validate()

    creatingWorkflow.value = true
    const newWorkflow = await workflowStore.createWorkflow({
      name: newWorkflowForm.value.name,
      description: newWorkflowForm.value.description,
      data: { nodes: [], edges: [] },
    })

    if (newWorkflow) {
      ElMessage.success('工作流创建成功')
      showCreateDialog.value = false
      loadWorkflows() // 重新加载列表

      // 跳转到编辑页面
      router.push({
        name: 'workflow-editor',
        params: { id: newWorkflow.id },
      })
    }
  } catch (error) {
    console.error('创建工作流失败:', error)
    ElMessage.error('创建工作流失败: ' + (error.message || '未知错误'))
  } finally {
    creatingWorkflow.value = false
  }
}

// 处理新建对话框关闭
const handleCreateDialogClose = (done) => {
  ElMessageBox.confirm('确定要关闭吗？未保存的更改将会丢失', '确认关闭', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      done()
    })
    .catch(() => {
      // 用户取消关闭
    })
}

// 编辑工作流（跳转到编辑器）
const editWorkflow = (id) => {
  router.push({
    name: 'workflow-editor',
    params: { id },
  })
}

// 打开编辑工作流信息对话框
const openEditInfoDialog = (workflow) => {
  editWorkflowForm.value = {
    id: workflow.id,
    name: workflow.name,
    description: workflow.description || '',
  }
  showEditInfoDialog.value = true
}

// 确认编辑工作流信息
const confirmEditWorkflow = async () => {
  try {
    await editFormRef.value.validate()

    updatingWorkflow.value = true
    const updatedWorkflow = await workflowStore.updateWorkflow(editWorkflowForm.value.id, {
      name: editWorkflowForm.value.name,
      description: editWorkflowForm.value.description,
    })

    if (updatedWorkflow) {
      ElMessage.success('工作流信息更新成功')
      showEditInfoDialog.value = false
      loadWorkflows() // 重新加载列表
    }
  } catch (error) {
    console.error('更新工作流信息失败:', error)
    ElMessage.error('更新工作流信息失败: ' + (error.message || '未知错误'))
  } finally {
    updatingWorkflow.value = false
  }
}

// 处理编辑信息对话框关闭
const handleEditInfoDialogClose = (done) => {
  ElMessageBox.confirm('确定要关闭吗？未保存的更改将会丢失', '确认关闭', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      done()
    })
    .catch(() => {
      // 用户取消关闭
    })
}

// 处理下拉菜单命令
const handleCommand = async (command) => {
  const { action, workflow } = command

  switch (action) {
    case 'editInfo':
      openEditInfoDialog(workflow)
      break
    case 'clone':
      await cloneWorkflow(workflow.id)
      break
    case 'delete':
      await deleteWorkflow(workflow.id)
      break
  }
}

// 克隆工作流
const cloneWorkflow = async (id) => {
  try {
    const { getWorkflowById: apiGetWorkflowById } = await import('@/api/workflow')
    const workflow = await apiGetWorkflowById(id)
    console.log('cloneWorkflow - API response:', JSON.stringify(workflow))
    if (!workflow) {
      ElMessage.error('未找到要克隆的工作流')
      return
    }

    let workflowData = workflow.data
    if (typeof workflowData === 'string') {
      workflowData = JSON.parse(workflowData)
    }

    const { createWorkflow: apiCreateWorkflow } = await import('@/api/workflow')
    const clonedWorkflow = await apiCreateWorkflow({
      name: `${workflow.name} (副本)`,
      description: workflow.description,
      data: {
        nodes: JSON.parse(JSON.stringify(workflowData?.nodes || [])),
        edges: JSON.parse(JSON.stringify(workflowData?.edges || [])),
      },
    })

    if (clonedWorkflow) {
      ElMessage.success('工作流克隆成功')
      loadWorkflows()
    }
  } catch (error) {
    console.error('克隆工作流失败:', error)
    ElMessage.error('克隆工作流失败: ' + (error.message || '未知错误'))
  }
}

// 删除工作流
const deleteWorkflow = async (id) => {
  try {
    // 使用 Element Plus 的确认对话框
    await ElMessageBox.confirm('确定要删除这个工作流吗？此操作不可恢复。', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await workflowStore.deleteWorkflow(id)
    ElMessage.success('工作流删除成功')
    loadWorkflows() // 重新加载列表
  } catch (error) {
    if (error !== 'cancel') {
      // 用户取消删除不显示错误
      console.error('删除工作流失败:', error)
      ElMessage.error('删除工作流失败: ' + (error.message || '未知错误'))
    }
  }
}

const importWorkflow = () => {
  showImportModal.value = true
}

// 导航到工作流测试页面
const goToTester = () => {
  router.push({ name: 'workflow-test' })
}

// 初始化加载
onMounted(() => {
  loadWorkflows()
})
</script>

<style scoped>
.workflow-manager {
  padding: var(--spacing-base);
  background-color: var(--background-color);
  min-height: calc(100vh - var(--header-height) - var(--footer-height));
}

.main-card {
  border-radius: var(--border-radius-medium);
  box-shadow: var(--box-shadow-card);
  border: 1px solid var(--border-color-light);
  overflow: hidden;
}

.main-card :deep(.el-card__header) {
  padding: 0;
  border-bottom: 1px solid var(--border-color-light);
}

.header {
  padding: var(--spacing-base) var(--spacing-large);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-base);
}

.page-title {
  margin: 0;
  font-size: var(--font-size-h2);
  color: var(--text-primary);
  font-weight: 600;
}

.workflow-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-base);
  padding: var(--spacing-base);
}

.workflow-card {
  transition: var(--transition-all);
  border: 1px solid var(--border-color-light);
  border-radius: var(--border-radius-medium);
  overflow: hidden;
  background: var(--background-color-white);
}

.workflow-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--box-shadow-hover);
  border-color: var(--primary-color-light);
}

.workflow-card-header {
  display: flex;
  padding: var(--spacing-base);
  border-bottom: 1px solid var(--border-color-light);
}

.workflow-icon {
  margin-right: var(--spacing-small);
}

.workflow-avatar {
  background-color: var(--background-color);
  color: var(--primary-color);
}

.workflow-info {
  flex: 1;
  min-width: 0;
}

.workflow-name {
  margin: 0 0 8px 0;
  font-size: var(--font-size-medium);
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.workflow-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-tag {
  border-radius: var(--border-radius-small);
}

.workflow-date {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}

.workflow-description {
  padding: var(--spacing-base);
  color: var(--text-regular);
  font-size: var(--font-size-base);
  line-height: 1.6;
  min-height: 80px;
}

.workflow-actions {
  display: flex;
  gap: var(--spacing-small);
  padding: var(--spacing-base);
  border-top: 1px solid var(--border-color-light);
  justify-content: flex-end;
}

.edit-button,
.more-button {
  border-radius: var(--border-radius-base);
}

.more-dropdown {
  display: flex;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-mini);
}

.delete-item {
  color: var(--danger-color);
}

.delete-item :deep(.el-dropdown-menu__item:hover) {
  background-color: var(--el-color-danger-light-9);
}

.create-empty-button {
  border-radius: var(--border-radius-base);
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: var(--spacing-base);
  border-top: 1px solid var(--border-color-light);
}

:deep(.el-pagination) {
  padding: 0;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .workflow-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .workflow-grid {
    grid-template-columns: 1fr;
  }

  .workflow-card {
    max-width: 100%;
  }
}
</style>
