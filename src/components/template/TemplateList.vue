<template>
  <div class="template-list">
    <div class="list-header">
      <el-space>
        <el-input
          v-model="searchQuery"
          clearable
          placeholder="搜索模板"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="selectedTags"
          multiple
          placeholder="标签"
          style="width: 200px"
          @change="handleTagChange"
        >
          <el-option
            v-for="option in tagOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-select
          v-model="sortOption"
          placeholder="排序"
          style="width: 150px"
          @change="handleSortChange"
        >
          <el-option
            v-for="option in sortOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-space>
    </div>

    <div v-if="isLoading" class="loading-container">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="p" style="height: 20px; margin-bottom: 10px" />
          <el-skeleton-item variant="p" style="height: 20px; margin-bottom: 10px" />
          <el-skeleton-item variant="p" style="height: 20px; margin-bottom: 10px" />
        </template>
      </el-skeleton>
    </div>

    <div v-else-if="templates.length === 0" class="empty-container">
      <el-empty description="没有找到匹配的模板" />
    </div>

    <el-table
      v-else
      :data="templates"
      stripe
    >
      <el-table-column label="名称" min-width="200">
        <template #default="scope">
          <div class="template-name-cell">
            <div class="template-icon">
              <el-icon :size="20">
                <component :is="getTemplateIcon(scope.row.type)" />
              </el-icon>
            </div>
            <span class="template-name">{{ scope.row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="描述" min-width="250">
        <template #default="scope">
          <el-tooltip :content="scope.row.description" placement="top">
            <span class="template-description">{{ scope.row.description }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="标签" width="150">
        <template #default="scope">
          <el-space size="small">
            <el-tag 
              v-for="tag in scope.row.tags.slice(0, 3)" 
              :key="tag" 
              size="small"
            >
              {{ tag }}
            </el-tag>
            <el-tag v-if="scope.row.tags.length > 3" size="small">
              +{{ scope.row.tags.length - 3 }}
            </el-tag>
          </el-space>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.updatedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-space size="small">
            <el-button size="small" @click="emit('apply', scope.row)">应用</el-button>
            <el-button size="small" @click="emit('edit', scope.row)">编辑</el-button>
            <el-dropdown @command="handleCommand">
              <el-button size="small">
                更多<el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="{action: 'export', row: scope.row}">
                    导出
                  </el-dropdown-item>
                  <el-dropdown-item :command="{action: 'delete', row: scope.row}" divided>
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-space>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Search, 
  ArrowDown,
  Document, 
  Guide, 
  ChatDotSquare 
} from '@element-plus/icons-vue'
import { formatDate } from '@/utils/date'
import type { AnyTemplate, TemplateType } from '@/types/template'
import { useTemplateStore } from '@/stores/templateStore'

const props = defineProps<{
  type: TemplateType;
}>()

const emit = defineEmits<{
  (e: 'apply', template: AnyTemplate): void
  (e: 'edit', template: AnyTemplate): void
  (e: 'delete', template: AnyTemplate): void
  (e: 'export', template: AnyTemplate): void
}>()

const templateStore = useTemplateStore()
const searchQuery = ref('')
const selectedTags = ref<string[]>([])
const sortOption = ref('updatedAt:desc')

const isLoading = computed(() => templateStore.isLoading)
const templates = computed(() => templateStore.templates)
const tagOptions = computed(() => 
  templateStore.tags.map((tag: string) => ({ label: tag, value: tag }))
)
const total = computed(() => templateStore.total)
const currentPage = computed({
  get: () => templateStore.currentPage,
  set: (value) => templateStore.updateFilters({ page: value })
})
const pageSize = computed({
  get: () => templateStore.pageSize,
  set: (value) => templateStore.updateFilters({ pageSize: value })
})

const sortOptions = [
  { label: '最新更新', value: 'updatedAt:desc' },
  { label: '最早更新', value: 'updatedAt:asc' },
  { label: '名称 A-Z', value: 'name:asc' },
  { label: '名称 Z-A', value: 'name:desc' },
  { label: '最新创建', value: 'createdAt:desc' },
  { label: '最早创建', value: 'createdAt:asc' },
]

// 生命周期钩子
onMounted(async () => {
  // 加载模板
  await refreshTemplates()
  await templateStore.fetchTags()
})

watch(() => props.type, async (newType) => {
  templateStore.updateFilters({ type: newType, page: 1 })
  await refreshTemplates()
})

// 方法
function handleSearch(value: string) {
  searchQuery.value = value
  templateStore.updateFilters({ search: value, page: 1 })
  refreshTemplates()
}

function handleTagChange(values: string[]) {
  selectedTags.value = values
  templateStore.updateFilters({ tags: values, page: 1 })
  refreshTemplates()
}

function handleSortChange(value: string) {
  sortOption.value = value
  const [sortBy, sortOrder] = value.split(':')
  templateStore.updateFilters({
    sortBy,
    sortOrder: sortOrder as 'asc' | 'desc',
    page: 1,
  })
  refreshTemplates()
}

function handlePageChange(page: number) {
  templateStore.updateFilters({ page })
  refreshTemplates()
}

function handlePageSizeChange(size: number) {
  templateStore.updateFilters({ pageSize: size, page: 1 })
  refreshTemplates()
}

function handleCommand(command: { action: string; row: AnyTemplate }) {
  const { action, row } = command
  
  switch (action) {
    case 'export':
      emit('export', row)
      break
    case 'delete':
      emit('delete', row)
      break
  }
}

function getTemplateIcon(type: TemplateType) {
  switch (type) {
    case 'workflow':
      return Document
    case 'agent':
      return Guide
    case 'prompt':
      return ChatDotSquare
    default:
      return Document
  }
}

async function refreshTemplates() {
  if (props.type) {
    await templateStore.fetchTemplatesByType(props.type)
  } else {
    await templateStore.fetchTemplates()
  }
}
</script>

<style scoped>
.template-list {
  width: 100%;
  padding: 16px;
}

.list-header {
  margin-bottom: 16px;
}

.loading-container {
  padding: 20px;
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.template-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.template-icon {
  display: flex;
  align-items: center;
}

.template-name {
  font-weight: 500;
}

.template-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>