<template>
  <div class="knowledge-base-search">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>知识库搜索</span>
          <el-button @click="handleSearch" type="primary" :loading="isSearching">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-input
            v-model="searchQuery"
            placeholder="请输入搜索关键词"
            clearable
            @keydown.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
      </el-row>

      <div class="search-results" v-if="searchResponse && searchResponse.results.length > 0">
        <div class="results-header">
          <h3>搜索结果 ({{ searchResponse.total }} 条, 耗时 {{ searchResponse.took }}ms)</h3>
        </div>

        <el-card
          v-for="result in searchResponse.results"
          :key="result.id"
          class="result-item"
          shadow="hover"
        >
          <template #header>
            <div class="result-header">
              <span class="result-title">{{ result.document?.name || '未知文档' }}</span>
              <el-tag size="small">{{ result.document?.fileType || '未知类型' }}</el-tag>
            </div>
          </template>

          <div class="result-content">
            <div class="result-snippet" v-html="highlightSnippet(result.content)"></div>
            <div class="result-meta">
              <span>相似度: {{ (result.score * 100).toFixed(2) }}%</span>
              <span>位置: {{ result.metadata.position }}</span>
              <span v-if="result.document"
                >创建时间: {{ formatDate(result.document?.createdAt) }}</span
              >
            </div>
          </div>
        </el-card>
      </div>

      <div
        class="no-results"
        v-else-if="searchResponse && searchResponse.results.length === 0 && hasSearched"
      >
        <el-empty description="暂无搜索结果" />
      </div>

      <div class="search-prompt" v-else>
        <el-alert title="请输入关键词进行搜索" type="info" show-icon :closable="false" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useKnowledgeBaseStore } from '@/stores/knowledgeBaseStore'
import type { KnowledgeBase, KnowledgeBaseSearchResponse } from '@/types/knowledgeBase'

const props = defineProps<{
  knowledgeBase: KnowledgeBase
}>()

const route = useRoute()
const knowledgeBaseStore = useKnowledgeBaseStore()

// 状态变量
const searchQuery = ref('')
const searchResponse = ref<KnowledgeBaseSearchResponse | null>(null)
const isSearching = ref(false)
const hasSearched = ref(false)

// 生命周期钩子
onMounted(() => {
  // 从路由参数中获取搜索关键词（如果有的话）
  if (route.query.q) {
    searchQuery.value = route.query.q as string
    handleSearch()
  }
})

// 方法
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  isSearching.value = true
  hasSearched.value = true

  try {
    const response: KnowledgeBaseSearchResponse = await knowledgeBaseStore.searchKnowledgeBase({
      knowledgeBaseId: props.knowledgeBase.id,
      query: searchQuery.value,
    })
    searchResponse.value = response
  } catch (error) {
    ElMessage.error('搜索失败')
    searchResponse.value = null
  } finally {
    isSearching.value = false
  }
}

const highlightSnippet = (snippet: string): string => {
  // 简单的高亮处理，实际项目中可能需要更复杂的处理
  if (!searchQuery.value) return snippet

  const regex = new RegExp(`(${searchQuery.value})`, 'gi')
  return snippet.replace(regex, '<mark>$1</mark>')
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
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
.knowledge-base-search {
  width: 100%;
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-results {
  margin-top: 20px;
}

.results-header h3 {
  margin: 0 0 16px 0;
  color: #303133;
}

.result-item {
  margin-bottom: 16px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-title {
  font-weight: bold;
  font-size: 16px;
}

.result-content {
  padding: 12px 0;
}

.result-snippet {
  line-height: 1.6;
  color: #606266;
  margin-bottom: 12px;
}

.result-snippet :deep(mark) {
  background-color: #fff6de;
  padding: 2px 4px;
  border-radius: 2px;
  color: #e6a23c;
}

.result-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.no-results,
.search-prompt {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .knowledge-base-search {
    padding: 12px;
  }

  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
