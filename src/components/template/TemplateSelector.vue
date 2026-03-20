<template>
  <div class="template-selector">
    <el-card class="template-card">
      <template #header>
        <div class="card-header">
          <span>选择模板</span>
          <el-space>
            <el-input
              v-model="searchText"
              placeholder="搜索模板"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select
              v-model="selectedTags"
              placeholder="标签筛选"
              clearable
              multiple
              @change="handleTagsChange"
            >
              <el-option
                v-for="tag in tagOptions"
                :key="tag.value"
                :label="tag.label"
                :value="tag.value"
              />
            </el-select>
          </el-space>
        </div>
      </template>

      <div v-if="isLoading" class="loading-container">
        <el-spin size="large" />
      </div>
      <div v-else-if="filteredTemplates.length === 0" class="empty-container">
        <el-empty description="暂无模板数据" />
      </div>
      <div v-else class="templates-grid">
        <el-row :gutter="16">
          <el-col 
            v-for="template in filteredTemplates" 
            :key="template.id" 
            :span="8"
            style="margin-bottom: 16px"
          >
            <el-card 
              :class="['template-item', { 'selected': selectedTemplate?.id === template.id }]"
              @click="selectTemplate(template)"
            >
              <template #header>
                <div class="template-header">
                  <span class="template-name">{{ template.name }}</span>
                  <el-tag v-if="template.isBuiltIn" size="small" type="info">内置</el-tag>
                </div>
              </template>
              
              <div class="template-cover">
                <img
                  v-if="template.thumbnail"
                  :src="template.thumbnail"
                  :alt="template.name"
                  class="template-thumbnail"
                />
                <div v-else class="template-thumbnail-placeholder">
                  <el-icon size="48">
                    <component :is="getTemplateIcon(template.type)" />
                  </el-icon>
                </div>
              </div>
              
              <div class="template-description">
                {{ template.description }}
              </div>
              
              <div class="template-tags">
                <el-tag
                  v-for="tag in template.tags.slice(0, 3)"
                  :key="tag"
                  type="success"
                  size="small"
                  style="margin-right: 4px"
                >
                  {{ tag }}
                </el-tag>
                <el-tag v-if="template.tags.length > 3" size="small">
                  +{{ template.tags.length - 3 }}
                </el-tag>
              </div>
              
              <template #footer>
                <div class="template-footer">
                  <span class="template-date">
                    {{ formatDate(template.createdAt) }}
                  </span>
                  <el-button 
                    size="small" 
                    type="primary" 
                    @click.stop="applyTemplate(template)"
                  >
                    使用
                  </el-button>
                </div>
              </template>
            </el-card>
          </el-col>
        </el-row>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            :page-sizes="[10, 20, 30, 50]"
            @current-change="handlePageChange"
            @size-change="handlePageSizeChange"
          />
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="showTemplateDetail"
      title="模板详情"
      width="600px"
    >
      <template v-if="selectedTemplate">
        <div class="template-detail-header">
          <el-tag v-if="selectedTemplate.isBuiltIn" type="info">内置</el-tag>
          <div class="template-detail-cover">
            <img
              v-if="selectedTemplate.thumbnail"
              :src="selectedTemplate.thumbnail"
              :alt="selectedTemplate.name"
              class="template-detail-image"
            />
            <div v-else class="template-detail-placeholder">
              <el-icon size="64">
                <component :is="getTemplateIcon(selectedTemplate.type)" />
              </el-icon>
            </div>
          </div>
          <h3>{{ selectedTemplate.name }}</h3>
        </div>
        
        <div class="template-detail-description">
          {{ selectedTemplate.description }}
        </div>
        
        <div class="template-detail-tags">
          <el-space wrap>
            <el-tag
              v-for="tag in selectedTemplate.tags"
              :key="tag"
              type="success"
            >
              {{ tag }}
            </el-tag>
          </el-space>
        </div>
        
        <div class="template-detail-info">
          <p><strong>类型：</strong> {{ getTemplateTypeName(selectedTemplate.type) }}</p>
          <p><strong>创建时间：</strong> {{ formatDate(selectedTemplate.createdAt) }}</p>
        </div>
      </template>
      
      <template #footer>
        <el-space>
          <el-button @click="showTemplateDetail = false">取消</el-button>
          <el-button type="primary" @click="applySelectedTemplate">使用此模板</el-button>
        </el-space>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { 
  Document, 
  Guide, 
  ChatDotSquare 
} from '@element-plus/icons-vue'
import { formatDate } from '@/utils/date'
import { useTemplateStore } from '@/stores/templateStore'
import type { AnyTemplate, TemplateType } from '@/types/template'

interface Props {
  type?: TemplateType
  preselectedId?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: undefined,
  preselectedId: undefined
})

const emit = defineEmits<{
  (e: 'apply', template: AnyTemplate): void
}>()

const templateStore = useTemplateStore()
const searchText = ref('')
const selectedTags = ref<string[]>([])
const showTemplateDetail = ref(false)
const pageSize = ref(10)
const currentPage = ref(1)
const total = ref(0)

// 计算属性
const templates = computed(() => templateStore.templates)
const isLoading = computed(() => templateStore.isLoading)

const tagOptions = computed(() => {
  return templateStore.tags.map((tag: string) => ({
    label: tag,
    value: tag
  }))
})

const filteredTemplates = computed(() => {
  return templates.value
})

// 生命周期钩子
onMounted(async () => {
  // 加载模板
  if (props.type) {
    await templateStore.fetchTemplatesByType(props.type)
  } else {
    await templateStore.fetchTemplates()
  }
  
  total.value = templateStore.total
  
  if (props.preselectedId) {
    const template = templates.value.find((t: AnyTemplate) => t.id === props.preselectedId)
    if (template) {
      selectTemplate(template)
    }
  }
})

// 监听器
watch(() => props.type, async (newType) => {
  if (newType) {
    await templateStore.fetchTemplatesByType(newType)
  } else {
    await templateStore.fetchTemplates()
  }
  total.value = templateStore.total
})

const selectedTemplate = ref<AnyTemplate | null>(null)

function handleSearch(value: string) {
  templateStore.updateFilters({ search: value, page: 1 })
}

function handleTagsChange(values: string[]) {
  templateStore.updateFilters({ tags: values, page: 1 })
}

function handlePageChange(page: number) {
  currentPage.value = page
  templateStore.updateFilters({ page })
}

function handlePageSizeChange(size: number) {
  pageSize.value = size
  templateStore.updateFilters({ pageSize: size, page: 1 })
}

function selectTemplate(template: AnyTemplate) {
  selectedTemplate.value = template
  showTemplateDetail.value = true
}

function applyTemplate(template: AnyTemplate) {
  emit('apply', template)
}

function applySelectedTemplate() {
  if (selectedTemplate.value) {
    emit('apply', selectedTemplate.value)
    showTemplateDetail.value = false
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

function getTemplateTypeName(type: TemplateType) {
  switch (type) {
    case 'workflow':
      return '工作流'
    case 'agent':
      return '智能体'
    case 'prompt':
      return '提示词'
    default:
      return '未知'
  }
}
</script>

<style scoped>
.template-selector {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  height: 300px;
}

.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  height: 300px;
}

.template-item {
  height: 100%;
  transition: all 0.3s ease;
  cursor: pointer;
}

.template-item:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.template-item.selected {
  border-color: var(--el-color-primary);
}

.template-cover {
  height: 120px;
  margin-bottom: 12px;
}

.template-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-thumbnail-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-name {
  font-weight: bold;
  font-size: 16px;
}

.template-description {
  color: #666;
  margin: 8px 0;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.template-tags {
  margin: 8px 0;
}

.template-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-date {
  color: #999;
  font-size: 12px;
}

.template-detail-header {
  text-align: center;
  margin-bottom: 20px;
}

.template-detail-cover {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 16px;
}

.template-detail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-detail-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
}

.template-detail-description {
  line-height: 1.6;
  margin-bottom: 16px;
}

.template-detail-tags {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.template-detail-info p {
  margin: 4px 0;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
