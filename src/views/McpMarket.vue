<template>
  <div class="mcp-market">
    <el-card class="market-card">
      <template #header>
        <div class="card-header">
          <span>MCP服务市场</span>
          <div>
            <el-input
              v-model="searchQuery"
              placeholder="搜索服务名称或描述"
              clearable
              style="width: 300px"
              @keydown.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="handleCreateService" style="margin-left: 10px">
              添加MCP服务
            </el-button>
          </div>
        </div>
      </template>

      <!-- 服务卡片列表 -->
      <div v-loading="loading" class="services-grid">
        <el-card v-for="service in services" :key="service.id" class="service-card-item">
          <div class="service-card-content">
            <div class="service-header">
              <h3 class="service-name">{{ service.name }}</h3>
            </div>

            <div class="service-description">
              {{ service.description || '暂无描述' }}
            </div>

            <div class="service-actions">
              <el-button size="small" @click="handleViewDetails(service)"> 查看详情 </el-button>
              <el-button size="small" @click="handleEditService(service)"> 编辑 </el-button>
              <el-button size="small" type="danger" @click="handleDeleteService(service)">
                删除
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- 空状态 -->
        <div v-if="services.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无MCP服务" />
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="total"
          :page-sizes="[12, 24, 48, 96]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 服务详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="MCP服务详情" width="800px">
      <div v-if="selectedService" class="service-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="服务名称" :span="2">
            {{ selectedService.name }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="selectedService.isEnable === true ? 'success' : 'info'">
              {{ selectedService.isEnable === true ? '启用' : '停用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            {{ selectedService.description }}
          </el-descriptions-item>
          <el-descriptions-item label="服务地址" :span="2">
            {{ selectedService.mcpConfig?.url }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <h4>MCP工具列表</h4>
        <div v-loading="toolsLoading">
          <el-table :data="mcpTools" style="width: 100%" size="small">
            <el-table-column prop="name" label="工具名称" />
            <el-table-column prop="description" label="描述" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button size="small" type="primary" @click="viewToolDetail(row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div style="margin-top: 20px; text-align: right">
          <el-button type="primary" @click="handleCloseDetail"> 确定 </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 添加/编辑服务对话框 -->
    <el-dialog
      v-model="showServiceDialog"
      :title="editingService ? '编辑MCP服务' : '添加MCP服务'"
      width="600px"
    >
      <el-form :model="serviceForm" :rules="serviceRules" ref="serviceFormRef" label-width="100px">
        <el-form-item label="服务名称" prop="name">
          <el-input v-model="serviceForm.name" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="serviceForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="状态" prop="isEnable">
          <el-select v-model="serviceForm.isEnable" style="width: 100%">
            <el-option label="启用" :value="true" />
            <el-option label="停用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="服务地址" prop="mcpConfig.url">
          <el-input v-model="serviceForm.mcpConfig.url" />
        </el-form-item>
        <el-form-item label="令牌" prop="mcpConfig.credentialType">
          <el-input v-model="serviceForm.mcpConfig.credentialType" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showServiceDialog = false">取消</el-button>
          <el-button type="primary" @click="saveService">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 工具详情对话框 -->
    <el-dialog v-model="showToolDetailDialog" title="工具详情" width="600px">
      <div v-if="selectedTool" class="tool-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="工具名称">
            {{ selectedTool.name }}
          </el-descriptions-item>
          <el-descriptions-item label="描述">
            {{ selectedTool.description }}
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag type="success">MCP工具</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <h4>参数结构</h4>
        <pre>{{ JSON.stringify(selectedTool.parametersSchema, null, 2) }}</pre>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showToolDetailDialog = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox, ElRate, ElLink, ElForm } from 'element-plus'
import { Search, Collection, Document, User, Star } from '@element-plus/icons-vue'
import type { Tool, ToolType } from '@/types/tool'
import { ToolService } from '@/api/toolService'

// 状态
const loading = ref(false)
const toolsLoading = ref(false)
const showDetailDialog = ref(false)
const showServiceDialog = ref(false)
const showToolDetailDialog = ref(false)
const selectedService = ref<Tool | null>(null)
const selectedTool = ref<any>(null)
const editingService = ref<Tool | null>(null)
const searchQuery = ref('')
const selectedCategory = ref('')
const services = ref<Tool[]>([])
const mcpTools = ref<any[]>([])
const total = ref(0)

// 表单引用
const serviceFormRef = ref<InstanceType<typeof ElForm>>()

// 服务表单数据
const serviceForm = reactive({
  name: '',
  description: '',
  isEnable: true,
  mcpConfig: {
    url: '',
    credentialType: '',
    authenticationRequired: true,
  },
})

// 表单验证规则
const serviceRules = {
  name: [{ required: true, message: '请输入服务名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
  isEnable: [{ required: true, message: '请选择状态', trigger: 'change' }],
  'mcpConfig.url': [{ required: true, message: '请输入服务地址', trigger: 'blur' }],
}

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 12,
})

// 生命周期
onMounted(() => {
  loadServices()
})

// 方法
async function loadServices() {
  loading.value = true
  try {
    const params = {
      type: 'mcp' as ToolType,
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
    }

    const response = await ToolService.getTools(params)
    services.value = response.list
    total.value = response.total
  } catch (error) {
    ElMessage.error('加载MCP服务列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.value.currentPage = 1
  loadServices()
}

function handleSizeChange(size: number) {
  pagination.value.pageSize = size
  loadServices()
}

function handleCurrentChange(page: number) {
  pagination.value.currentPage = page
  loadServices()
}

async function handleViewDetails(service: Tool) {
  selectedService.value = service
  showDetailDialog.value = true

  // 加载MCP工具
  toolsLoading.value = true
  try {
    mcpTools.value = await ToolService.getMcpTools(service.id!)
  } catch (error) {
    ElMessage.error('加载MCP工具失败')
  } finally {
    toolsLoading.value = false
  }
}

function handleCloseDetail() {
  showDetailDialog.value = false
  selectedService.value = null
  mcpTools.value = []
}

function handleCreateService() {
  editingService.value = null
  // 重置表单
  Object.assign(serviceForm, {
    name: '',
    description: '',
    isEnable: true,
    mcpConfig: {
      url: '',
    },
  })
  showServiceDialog.value = true
}

function handleEditService(service: Tool) {
  console.log('handleEditService', service)
  editingService.value = service
  // 填充表单数据
  Object.assign(serviceForm, {
    id: service.id,
    name: service.name,
    description: service.description,
    isEnable: service.isEnable,
    mcpConfig: {
      url: service.mcpConfig?.url || '',
    },
  })
  showServiceDialog.value = true
}

async function handleDeleteService(service: Tool) {
  try {
    await ElMessageBox.confirm(`确定要删除服务 "${service.name}" 吗？`, '确认删除', {
      type: 'warning',
    })

    await ToolService.deleteTool(service.id)
    ElMessage.success('删除成功')
    loadServices()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

function saveService() {
  serviceFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        const serviceData = {
          name: serviceForm.name,
          description: serviceForm.description,
          isEnable: serviceForm.isEnable as boolean,
          toolType: 'mcp' as ToolType,
          mcpConfig: serviceForm.mcpConfig,
        }
        if (editingService.value) {
          // 编辑服务
          await ToolService.updateTool(editingService.value.id!, serviceData)
          ElMessage.success('更新成功')
        } else {
          // 创建服务
          await ToolService.createTool(serviceData as any)
          ElMessage.success('创建成功')
        }

        showServiceDialog.value = false
        loadServices()
      } catch (error) {
        ElMessage.error(editingService.value ? '更新失败' : '创建失败')
      }
    }
  })
}

function viewToolDetail(tool: any) {
  selectedTool.value = tool
  showToolDetailDialog.value = true
}
</script>

<style scoped>
.mcp-market {
  padding: 20px;
  height: 100%;
  overflow: auto;
}

.market-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mb-4 {
  margin-bottom: 1rem;
}

.category-filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.category-tag {
  cursor: pointer;
}

.category-tag:hover {
  opacity: 0.8;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.service-card-item {
  transition: all 0.3s ease;
}

.service-card-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.service-card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.service-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  flex: 1;
  margin-right: 10px;
}

.service-description {
  flex: 1;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.service-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 12px;
  color: #909399;
}

.service-category,
.service-params,
.service-stats,
.service-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.service-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: auto;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 20px 0;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 0;
}

.service-detail h4 {
  margin: 0 0 12px 0;
  font-weight: 600;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  margin-bottom: 4px;
}

.tool-detail pre {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  max-height: 300px;
  overflow: auto;
  white-space: pre-wrap;
}
</style>
