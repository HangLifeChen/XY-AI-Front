<template>
  <div class="knowledge-base-list">
    <!-- 搜索和过滤区域 -->
    <div class="filter-section mb-4">
      <el-row :gutter="12">
        <el-col :span="8">
          <el-input
            v-model="searchQuery"
            placeholder="搜索知识库名称或描述"
            clearable
            @keydown.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </el-col>
        <el-col :span="4" :offset="8" style="text-align: right">
          <slot name="actions"></slot>
        </el-col>
      </el-row>
    </div>

    <!-- 知识库表格 -->
    <el-table :data="knowledgeBases" v-loading="loading" stripe @row-click="handleRowClick">
      <el-table-column prop="name" label="名称" min-width="150">
        <template #default="scope">
          <el-text tag="b">{{ scope.row.name }}</el-text>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="documentCount" label="文档数" width="100" align="center" />
      <el-table-column prop="createdAt" label="创建时间" width="180" align="center">
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-space>
            <el-button size="small" @click.stop="handleView(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click.stop="handleEdit(scope.row)"
              >编辑</el-button
            >
            <el-popconfirm
              title="确定要删除这个知识库吗？此操作不可恢复。"
              @confirm="handleDelete(scope.row)"
            >
              <template #reference>
                <el-button size="small" type="danger" @click.stop>删除</el-button>
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
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import type { KnowledgeBase } from '@/types/knowledgeBase'

const props = defineProps<{
  knowledgeBases: KnowledgeBase[]
  loading?: boolean
  total?: number
  currentPage?: number
  pageSize?: number
}>()

const emit = defineEmits<{
  (e: 'search', query: string): void
  (e: 'view', knowledgeBase: KnowledgeBase): void
  (e: 'edit', knowledgeBase: KnowledgeBase): void
  (e: 'delete', knowledgeBase: KnowledgeBase): void
  (e: 'size-change', size: number): void
  (e: 'current-change', page: number): void
}>()

// 搜索相关
const searchQuery = ref('')

// 分页相关
const currentPage = ref(props.currentPage || 1)
const pageSize = ref(props.pageSize || 10)
const total = ref(props.total || 0)

// 监听外部传入的分页变化
if (props.currentPage !== undefined) {
  currentPage.value = props.currentPage
}

if (props.pageSize !== undefined) {
  pageSize.value = props.pageSize
}

if (props.total !== undefined) {
  total.value = props.total
}

// 搜索处理
const handleSearch = () => {
  emit('search', searchQuery.value)
}

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
  emit('size-change', size)
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  emit('current-change', page)
}

// 操作处理
const handleView = (knowledgeBase: KnowledgeBase) => {
  emit('view', knowledgeBase)
}

const handleEdit = (knowledgeBase: KnowledgeBase) => {
  emit('edit', knowledgeBase)
}

const handleDelete = (knowledgeBase: KnowledgeBase) => {
  emit('delete', knowledgeBase)
}

const handleRowClick = (row: KnowledgeBase) => {
  handleView(row)
}

// 状态处理
const getStatusType = (status: string): 'success' | 'info' | 'warning' | 'error' | '' => {
  const statusMap: Record<string, 'success' | 'info' | 'warning' | 'error' | ''> = {
    active: 'success',
    processing: 'info',
    error: 'error',
    archived: 'warning',
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: '活跃',
    processing: '处理中',
    error: '错误',
    archived: '已归档',
  }
  return statusMap[status] || status
}

// 格式化日期
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.knowledge-base-list {
  padding: 16px;
}

.filter-section {
  margin-bottom: 16px;
}

.mb-4 {
  margin-bottom: 16px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
