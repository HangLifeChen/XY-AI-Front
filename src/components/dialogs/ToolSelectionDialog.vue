<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Tools } from '@/types/tool'
import { MCP, ToolService } from '@/api/toolService'
import { ElMessage, type TabPaneName } from 'element-plus'

// 定义工具和类型信息的接口
interface ToolWithType {
  tool: Tools
  type: string
}

const props = defineProps<{
  visible: boolean
  tools: Tools[]
  toolTypeMap: Record<string, { name: string; tagType: string }>
}>()

// 修改emit定义，传递工具和类型信息
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', tools: ToolWithType[]): void
  (e: 'cancel'): void
}>()

const activeTab = ref('system')
const selectedTools = ref<ToolWithType[]>([])
const loading = ref(false)

// 分页相关
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 表格数据
const tableData = ref<Tools[]>([])

// MCP工具数据
const mcpTools = ref<Tools[]>([])
const mcpToolsLoaded = ref(false)

// 根据implementation字段判断工具类型
const getToolType = (tool: Tools) => {
  return tool.toolType
}

const systemTools = computed(() => {
  return props.tools.filter((tool) => getToolType(tool) === 'system')
})

const filteredTools = computed(() => {
  if (activeTab.value === 'system') {
    return systemTools.value
  } else {
    return mcpTools.value
  }
})

// 修改选择处理逻辑，包含工具类型信息
const handleSelectionChange = (selection: Tools[]) => {
  selectedTools.value = selection.map((tool) => ({
    tool,
    type: activeTab.value, // 使用当前标签页作为工具类型
  }))
}

const getToolTypeTagType = (tool: Tools) => {
  const toolType = getToolType(tool)
  return props.toolTypeMap[toolType]?.tagType || 'info'
}

const getToolTypeName = (tool: Tools) => {
  const toolType = getToolType(tool)
  return props.toolTypeMap[toolType]?.name || toolType
}

const handleClose = () => {
  activeTab.value = 'system'
  selectedTools.value = []
  mcpTools.value = []
  mcpToolsLoaded.value = false
  pagination.value = {
    currentPage: 1,
    pageSize: 10,
    total: 0,
  }
}

const handleConfirm = () => {
  emit('submit', selectedTools.value)
}

const handleTabChange = (tabName: TabPaneName) => {
  console.log('标签页切换:', tabName)
  if (tabName === 'mcp' && !mcpToolsLoaded.value) {
    loadMcpTools()
  } else {
    updateTableData()
  }
}

const loadMcpTools = async () => {
  loading.value = true
  try {
    const response = await ToolService.getTools({
      type: MCP,
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
    })

    mcpTools.value = response.list
    pagination.value.total = response.total
    mcpToolsLoaded.value = true
    updateTableData()
  } catch (error) {
    ElMessage.error(`加载MCP工具失败: ${error || '未知错误'}`)
  } finally {
    loading.value = false
  }
}

const updateTableData = () => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  tableData.value = filteredTools.value.slice(start, end)
}

const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
  if (activeTab.value === 'mcp') {
    loadMcpTools()
  } else {
    updateTableData()
  }
}

const handleCurrentChange = (page: number) => {
  pagination.value.currentPage = page
  if (activeTab.value === 'mcp') {
    loadMcpTools()
  } else {
    updateTableData()
  }
}

// 监听工具数据变化
watch(
  () => [props.tools, activeTab.value, pagination.value.currentPage, pagination.value.pageSize],
  () => {
    if (props.visible) {
      if (activeTab.value === 'system') {
        pagination.value.total = systemTools.value.length
        updateTableData()
      } else if (mcpToolsLoaded.value) {
        updateTableData()
      }
    }
  },
  { immediate: true },
)

// 监听对话框可见性变化
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      // 对话框打开时，根据当前标签页加载数据
      if (activeTab.value === 'system') {
        pagination.value.total = systemTools.value.length
        updateTableData()
      } else if (!mcpToolsLoaded.value) {
        // 异步加载MCP工具数据
        setTimeout(() => {
          loadMcpTools()
        }, 0)
      } else {
        updateTableData()
      }
    }
  },
)

// 组件挂载时初始化
onMounted(() => {
  if (props.visible) {
    updateTableData()
  }
})
</script>

<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    title="添加工具"
    width="800px"
    @close="handleClose"
  >
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="系统工具" name="system"></el-tab-pane>
      <el-tab-pane label="MCP工具" name="mcp"></el-tab-pane>
    </el-tabs>

    <el-table
      :data="tableData"
      @selection-change="handleSelectionChange"
      style="width: 100%"
      height="400"
      v-loading="loading"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="名称" min-width="120">
        <template #default="{ row }">
          <div class="tool-name-cell">
            <span>{{ row.name }}</span>
            <el-tag :type="getToolTypeTagType(row)" size="small" class="tool-type-tag">
              {{ getToolTypeName(row) }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="200" />
      <el-table-column prop="category" label="分类" width="120" />
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <div class="selected-info" v-if="selectedTools.length > 0">
      已选择 {{ selectedTools.length }} 个工具:
      <span v-for="(item, index) in selectedTools" :key="item.tool.id" class="selected-tool-tag">
        {{ item.tool.name }}({{ item.type === 'mcp' ? 'MCP' : '系统' }})
        <span v-if="index < selectedTools.length - 1">, </span>
      </span>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="emit('cancel')">取消</el-button>
        <el-button type="primary" @click="handleConfirm">添加</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.tool-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-type-tag {
  height: 20px;
  line-height: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.selected-info {
  margin-top: 15px;
  padding: 10px;
  background-color: var(--el-bg-color-page);
  border-radius: 4px;
  font-size: 14px;
}

.selected-tool-tag {
  color: var(--el-color-primary);
}
</style>
