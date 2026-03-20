<template>
  <div class="template-management">
    <div class="page-header">
      <el-space>
        <el-dropdown @command="handleCreateTemplate">
          <el-button type="primary">
            <el-icon><Plus /></el-icon>
            创建模板
            <el-icon><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="from-workflow">从工作流创建</el-dropdown-item>
              <el-dropdown-item command="from-agent">从智能体创建</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button @click="showImportModal = true">
          <el-icon><Upload /></el-icon>
          导入模板
        </el-button>
      </el-space>
    </div>

    <div class="filter-section">
      <el-space align="center">
        <el-input v-model="filters.search" clearable placeholder="搜索模板" @input="handleSearch">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filters.type" clearable placeholder="类型" style="width: 150px">
          <el-option
            v-for="option in typeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-space>
    </div>

    <div class="template-list">
      <el-empty v-if="templates.length === 0" description="暂无模板" />
      <div v-else class="template-grid">
        <template-card
          v-for="template in templates"
          :key="template.id"
          :template="template"
          @edit="handleEditTemplate"
          @delete="handleDeleteTemplate"
          @apply="handleApplyTemplate"
        />
      </div>
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 从工作流创建模板对话框 -->
    <el-dialog v-model="showCreateFromWorkflowModal" title="从工作流创建模板" width="500px">
      <el-form
        :model="createFromWorkflowForm"
        label-position="left"
        :rules="createFromWorkflowRules"
        ref="createFromWorkflowFormRef"
        label-width="80px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="createFromWorkflowForm.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            type="textarea"
            v-model="createFromWorkflowForm.description"
            :rows="3"
            placeholder="请输入模板描述"
          />
        </el-form-item>
        <el-form-item label="来源" prop="sourceId">
          <el-select
            v-model="createFromWorkflowForm.sourceId"
            placeholder="请选择工作流来源"
            style="width: 100%"
          >
            <el-option
              v-for="option in workflowOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-space>
          <el-button @click="showCreateFromWorkflowModal = false">取消</el-button>
          <el-button type="primary" @click="handleCreateFromWorkflow">创建</el-button>
        </el-space>
      </template>
    </el-dialog>

    <!-- 从智能体创建模板对话框 -->
    <el-dialog v-model="showCreateFromAgentModal" title="从智能体创建模板" width="500px">
      <el-form
        :model="createFromAgentForm"
        label-position="left"
        :rules="createFromAgentRules"
        ref="createFromAgentFormRef"
        label-width="80px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="createFromAgentForm.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            type="textarea"
            v-model="createFromAgentForm.description"
            :rows="3"
            placeholder="请输入模板描述"
          />
        </el-form-item>
        <el-form-item label="来源" prop="sourceId">
          <el-select
            v-model="createFromAgentForm.sourceId"
            placeholder="请选择智能体来源"
            style="width: 100%"
          >
            <el-option
              v-for="option in agentOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-space>
          <el-button @click="showCreateFromAgentModal = false">取消</el-button>
          <el-button type="primary" @click="handleCreateFromAgent">创建</el-button>
        </el-space>
      </template>
    </el-dialog>

    <!-- 导入模板对话框 -->
    <el-dialog v-model="showImportModal" title="导入模板" width="500px">
      <el-upload
        drag
        :auto-upload="false"
        :on-change="handleImportFileChange"
        :file-list="fileList"
      >
        <el-icon class="el-icon--upload"><Upload /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <el-alert
        v-if="importFile"
        title="已选择文件"
        type="info"
        :closable="false"
        style="margin-top: 16px"
      >
        {{ importFile.name }} ({{ importFile.size ? formatFileSize(importFile.size) : '0 B' }})
      </el-alert>
      <template #footer>
        <el-space>
          <el-button @click="showImportModal = false">取消</el-button>
          <el-button type="primary" :loading="importing" @click="handleImportTemplate">
            导入
          </el-button>
        </el-space>
      </template>
    </el-dialog>

    <el-dialog v-model="showApplyModal" title="应用模板" width="600px">
      <template-applier
        v-if="selectedTemplate"
        :template="selectedTemplate"
        @cancel="showApplyModal = false"
        @complete="handleApplyComplete"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Upload, ArrowDown } from '@element-plus/icons-vue'
import TemplateApplier from '@/components/template/TemplateApplier.vue'
import TemplateCard from '@/components/template/TemplateCard.vue'
import { useTemplateStore } from '@/stores/templateStore'
import type { AnyTemplate, TemplateListParams } from '@/types/template'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { AgentService } from '@/api/agentService'
import { getWorkflowList, listAllWorflow } from '@/api/workflow'

// 状态
const loading = ref(false)
const importing = ref(false)
const showCreateFromWorkflowModal = ref(false)
const showCreateFromAgentModal = ref(false)
const showImportModal = ref(false)
const showApplyModal = ref(false)
const selectedTemplate = ref<AnyTemplate | null>(null)
const importFile = ref<UploadFile | null>(null)
const fileList = ref<UploadFile[]>([])
const createFromWorkflowFormRef = ref<FormInstance | null>(null)
const createFromAgentFormRef = ref<FormInstance | null>(null)
const templateStore = useTemplateStore()

// 过滤器
const filters = reactive<TemplateListParams>({
  search: '',
  type: undefined,
  page: 1,
  pageSize: 10,
  sortBy: 'updatedAt',
})

// 分页信息
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

// 创建表单
const createFromWorkflowForm = reactive({
  name: '',
  description: '',
  sourceId: '',
})

const createFromAgentForm = reactive({
  name: '',
  description: '',
  sourceId: '',
})

// 表单验证规则
const createFromWorkflowRules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  sourceId: [{ required: true, message: '请选择工作流来源', trigger: 'change' }],
} as FormRules

const createFromAgentRules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  sourceId: [{ required: true, message: '请选择智能体来源', trigger: 'change' }],
} as FormRules

// 选项
const typeOptions = [
  { label: '工作流', value: 'workflow' },
  { label: '智能体', value: 'agent' },
]

const workflowOptions = ref<{ label: string; value: string }[]>([])
const agentOptions = ref<{ label: string; value: string }[]>([])

// 模板列表
const templates = ref<AnyTemplate[]>([])

// 生命周期钩子
onMounted(async () => {
  await loadTemplates()
})

// 加载模板列表
async function loadTemplates() {
  loading.value = true
  try {
    const params = {
      ...filters,
      page: pagination.page,
      pageSize: pagination.pageSize,
    }

    const response = await templateStore.fetchTemplates(params)
    if (response) {
      templates.value = response.items
      pagination.total = response.total
    }
  } catch (error) {
    ElMessage.error('加载模板失败')
  } finally {
    loading.value = false
  }
}

// 加载智能体列表
async function loadAgents() {
  try {
    const response = await AgentService.listAllAgents()
    agentOptions.value = response.map((agent) => ({
      label: agent.name,
      value: agent.id,
    }))
  } catch (error) {
    console.error('加载智能体列表失败:', error)
    ElMessage.error('加载智能体列表失败')
  }
}
async function loadWorkflows() {
  try {
    const response = await listAllWorflow()
    workflowOptions.value = response.map((workflow) => ({
      label: workflow.name,
      value: workflow.id,
    }))
  } catch (error) {
    console.error('加载工作流列表失败:', error)
    ElMessage.error('加载工作流列表失败')
  }
}
// 搜索处理
function handleSearch() {
  pagination.page = 1
  loadTemplates()
}

// 分页处理
function handlePageChange(page: number) {
  pagination.page = page
  loadTemplates()
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize
  loadTemplates()
}

// 模板操作
function handleEditTemplate(template: AnyTemplate) {
  ElMessage.info(`编辑模板: ${template.name}`)
}

async function handleDeleteTemplate(template: AnyTemplate) {
  try {
    await ElMessageBox.confirm(
      `确定要删除模板 "${template.name}" 吗？此操作不可撤销。`,
      '确认删除',
      {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消',
      },
    )

    await templateStore.deleteTemplate(template.id)
    ElMessage.success('删除模板成功')
    await loadTemplates()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除模板失败')
    }
  }
}

function handleApplyTemplate(template: AnyTemplate) {
  selectedTemplate.value = template
  showApplyModal.value = true
}

async function handleApplyComplete() {
  showApplyModal.value = false
  ElMessage.success('模板应用成功')
}

// 创建模板
async function handleCreateTemplate(command: string) {
  if (command === 'from-workflow') {
    showCreateFromWorkflowModal.value = true
    loadWorkflows()
  } else if (command === 'from-agent') {
    showCreateFromAgentModal.value = true
    loadAgents()
  }
}

async function handleCreateFromWorkflow() {
  try {
    await createFromWorkflowFormRef.value?.validate()

    await templateStore.createTemplateFromWorkflow(createFromWorkflowForm.sourceId, {
      name: createFromWorkflowForm.name,
      description: createFromWorkflowForm.description,
    })

    ElMessage.success('创建成功')
    showCreateFromWorkflowModal.value = false

    // 重置表单
    createFromWorkflowForm.name = ''
    createFromWorkflowForm.description = ''
    createFromWorkflowForm.sourceId = ''

    // 重新加载模板列表
    await loadTemplates()
  } catch (error) {
    ElMessage.error('创建失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

async function handleCreateFromAgent() {
  try {
    await createFromAgentFormRef.value?.validate()

    await templateStore.createTemplateFromAgent(createFromAgentForm.sourceId, {
      name: createFromAgentForm.name,
      description: createFromAgentForm.description,
    })

    ElMessage.success('创建成功')
    showCreateFromAgentModal.value = false

    // 重置表单
    createFromAgentForm.name = ''
    createFromAgentForm.description = ''
    createFromAgentForm.sourceId = ''

    // 重新加载模板列表
    await loadTemplates()
  } catch (error) {
    ElMessage.error('创建失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

// 导入模板
function handleImportFileChange(file: UploadFile) {
  importFile.value = file
  fileList.value = [file]
}

async function handleImportTemplate() {
  if (!importFile.value?.raw) {
    ElMessage.warning('请选择文件')
    return
  }

  importing.value = true
  try {
    const fileContent = await readFileAsText(importFile.value.raw)
    const templateData = JSON.parse(fileContent)
    await templateStore.importTemplate(templateData)
    ElMessage.success('导入成功')
    showImportModal.value = false
    importFile.value = null
    fileList.value = []
    await loadTemplates()
  } catch (error) {
    console.error('Failed to import template:', error)
    ElMessage.error('导入失败: ' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    importing.value = false
  }
}

// 辅助函数
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

function formatFileSize(size: number): string {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  }
}
</script>

<style scoped>
.template-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.filter-section {
  margin-bottom: 24px;
  background-color: #f9f9f9;
  padding: 16px;
  border-radius: 4px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
