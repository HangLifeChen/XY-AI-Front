<template>
  <div class="tool-management">
    <el-card class="tool-card">
      <template #header>
        <div class="card-header">
          <span>工具管理</span>
          <div>
            <el-button type="primary" @click="handleCreateTool">
              <el-icon><Plus /></el-icon>
              创建工具
            </el-button>
          </div>
        </div>
      </template>

      <!-- 工具筛选区域 -->
      <div class="filter-section mb-4">
        <el-row :gutter="12">
          <el-col :span="6">
            <el-input
              v-model="searchQuery"
              placeholder="搜索工具名称或描述"
              clearable
              @keydown.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>

          <el-col :span="6">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleResetFilters" class="ml-2"> 重置 </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 工具卡片列表 -->
      <div v-loading="loading" class="tools-grid">
        <el-card
          v-for="tool in tools"
          :key="tool.id"
          class="tool-card-item"
          :class="{ 'tool-card-disabled': !tool.isEnable }"
        >
          <div class="tool-card-content">
            <div class="tool-header">
              <h3 class="tool-name">{{ tool.name }}</h3>
              <div class="tool-tags">
                <el-tag type="success" class="tool-type-tag"> 系统工具 </el-tag>
              </div>
            </div>

            <div class="tool-description">
              {{ tool.description || '暂无描述' }}
            </div>

            <div class="tool-actions">
              <el-button size="small" type="primary" @click="handleViewDetail(tool)" plain>
                查看详情
              </el-button>
              <el-button size="small" @click="handleEdit(tool)"> 编辑 </el-button>
              <el-dropdown @command="handleCommand">
                <el-button size="small">
                  更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="{ action: 'test', row: tool }">
                      测试
                    </el-dropdown-item>
                    <el-dropdown-item
                      :command="{ action: 'delete', row: tool }"
                      divided
                      style="color: red"
                    >
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-card>

        <!-- 空状态 -->
        <div v-if="tools.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无工具数据">
            <el-button type="primary" @click="handleCreateTool"> 创建第一个工具 </el-button>
          </el-empty>
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

    <!-- 工具表单对话框 -->
    <el-dialog
      v-model="showToolForm"
      :title="currentTool ? '编辑工具' : '创建工具'"
      width="600px"
      @close="handleFormClose"
    >
      <ToolForm
        ref="toolFormRef"
        :tool="formToolData"
        @submit="handleFormSubmit"
        @cancel="showToolForm = false"
      />
    </el-dialog>

    <!-- 工具详情对话框 -->
    <el-dialog v-model="showToolDetail" title="工具详情" width="700px" @close="handleDetailClose">
      <ToolDetail v-if="currentTool" :tool="currentTool" @close="showToolDetail = false" />
    </el-dialog>

    <!-- 工具测试对话框 -->
    <el-dialog v-model="showTestForm" title="测试工具" width="600px">
      <ToolTestForm v-if="currentTool" :tool="currentTool" @close="showTestForm = false" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, ArrowDown, Document } from '@element-plus/icons-vue'
import ToolForm from '@/components/tools/ToolForm.vue'
import ToolTestForm from '@/components/tools/ToolTestForm.vue'
import ToolDetail from '@/components/tools/ToolDetail.vue'
import { useToolStore } from '@/stores/toolStore'
import type { Tool } from '@/types/tool'

// 状态
const toolStore = useToolStore()
const loading = ref(false)
const showToolForm = ref(false)
const showToolDetail = ref(false)
const showTestForm = ref(false)
const currentTool = ref<Tool | null>(null)
const searchQuery = ref('')
const selectedTools = ref<Tool[]>([])

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
})

// 计算属性
const tools = computed(() => toolStore.tools)
const total = computed(() => toolStore.total)

// 为ToolForm组件准备的数据
const formToolData = computed(() => {
  if (!currentTool.value) return undefined

  return {
    id: currentTool.value.id,
    name: currentTool.value.name,
    description: currentTool.value.description,
  }
})

// 生命周期
onMounted(() => {
  loadTools()
})

// 方法
async function loadTools() {
  loading.value = true
  try {
    toolStore.updateFilters({
      search: searchQuery.value,
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
    })
    // 只加载系统工具
    await toolStore.fetchTools('system')
  } catch (error) {
    ElMessage.error('加载工具列表失败')
  } finally {
    loading.value = false
  }
}

function handleCreateTool() {
  currentTool.value = null
  showToolForm.value = true
}

function handleSearch() {
  pagination.value.currentPage = 1
  loadTools()
}

function handleResetFilters() {
  searchQuery.value = ''
  pagination.value.currentPage = 1
  loadTools()
}

function handleEdit(tool: Tool) {
  currentTool.value = { ...tool }
  showToolForm.value = true
}

function handleViewDetail(tool: Tool) {
  currentTool.value = tool
  showToolDetail.value = true
}

function handleSizeChange(size: number) {
  pagination.value.pageSize = size
  loadTools()
}

function handleCurrentChange(page: number) {
  pagination.value.currentPage = page
  loadTools()
}

function handleCommand(command: { action: string; row: Tool }) {
  const { action, row } = command

  switch (action) {
    case 'test':
      currentTool.value = row
      showTestForm.value = true
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

async function handleDelete(tool: Tool) {
  try {
    await ElMessageBox.confirm(`确定要删除工具 "${tool.name}" 吗？此操作不可撤销。`, '确认删除', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })

    await toolStore.deleteTool(tool.id!)
    ElMessage.success('删除工具成功')
    loadTools()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除工具失败')
    }
  }
}

function handleFormSubmit(tool: Tool) {
  showToolForm.value = false
  if (currentTool.value) {
    // 编辑工具
    toolStore.updateTool(tool.id!, tool)
  } else {
    // 创建工具
    toolStore.createTool(tool)
  }
  loadTools()
}

function handleFormClose() {
  currentTool.value = null
}

function handleDetailClose() {
  currentTool.value = null
}

function getToolTypeName() {
  return '系统工具'
}
</script>

<style scoped>
.tool-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ml-2 {
  margin-left: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}

.filter-section {
  margin-bottom: 20px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.tool-card-item {
  transition: all 0.3s ease;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.tool-card-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  border-color: #409eff;
}

.tool-card-disabled {
  opacity: 0.6;
}

.tool-card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.tool-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  flex: 1;
  margin-right: 10px;
}

.tool-tags {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tool-description {
  flex: 1;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tool-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 12px;
  color: #909399;
}

.tool-category,
.tool-version {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tool-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.tool-actions .el-button {
  padding: 6px 12px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 0;
}
</style>
