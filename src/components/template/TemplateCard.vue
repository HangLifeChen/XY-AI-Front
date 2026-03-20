<template>
  <div class="template-card">
    <div class="template-thumbnail">
      <div class="default-thumbnail" :class="thumbnailClass">
        <el-icon size="32">
          <component :is="typeIcon" />
        </el-icon>
      </div>
      <div class="template-type">{{ typeLabel }}</div>
    </div>

    <div class="template-content">
      <h3 class="template-name">{{ template.name }}</h3>
      <p class="template-description">{{ template.description }}</p>

      <div class="template-meta">
        <span class="template-date">{{ formatDate(template.updatedAt) }}</span>
      </div>
    </div>

    <div class="template-actions">
      <el-tooltip content="查看" placement="top">
        <el-button circle size="small" @click="$emit('view', template)">
          <el-icon><View /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="应用" placement="top">
        <el-button circle size="small" type="primary" @click="$emit('apply', template)">
          <el-icon><VideoPlay /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="导出" placement="top">
        <el-button circle size="small" @click="$emit('export', template)">
          <el-icon><Download /></el-icon>
        </el-button>
      </el-tooltip>

      <el-popconfirm title="确定要删除这个模板吗？" @confirm="$emit('delete', template)">
        <template #reference>
          <el-button circle size="small" type="danger">
            <el-icon><Delete /></el-icon>
          </el-button>
        </template>
      </el-popconfirm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Document,
  User,
  Connection,
  View,
  VideoPlay,
  Download,
  Edit,
  Delete,
} from '@element-plus/icons-vue'
import type { AnyTemplate } from '@/types/template'

const props = defineProps<{
  template: AnyTemplate
}>()

defineEmits<{
  (e: 'view', template: AnyTemplate): void
  (e: 'edit', template: AnyTemplate): void
  (e: 'delete', template: AnyTemplate): void
  (e: 'apply', template: AnyTemplate): void
  (e: 'export', template: AnyTemplate): void
}>()

// 根据模板类型获取图标
const typeIcon = computed(() => {
  switch (props.template.type) {
    case 'workflow':
      return Connection
    case 'agent':
      return User
    default:
      return Document
  }
})

// 根据模板类型获取标签文本
const typeLabel = computed(() => {
  switch (props.template.type) {
    case 'workflow':
      return '工作流'
    case 'agent':
      return '智能体'
    default:
      return '未知'
  }
})

// 根据模板类型获取缩略图样式类
const thumbnailClass = computed(() => {
  return `thumbnail-${props.template.type}`
})

// 格式化日期
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
</script>

<style scoped>
.template-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.template-card.is-built-in {
  border-left: 3px solid #18a058;
}

.template-thumbnail {
  height: 140px;
  position: relative;
  overflow: hidden;
}

.template-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-thumbnail {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.thumbnail-workflow {
  background: linear-gradient(135deg, #1890ff, #0050b3);
}

.thumbnail-agent {
  background: linear-gradient(135deg, #722ed1, #531dab);
}

.thumbnail-prompt {
  background: linear-gradient(135deg, #13c2c2, #006d75);
}

.template-type {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.template-content {
  padding: 16px;
  flex: 1;
}

.template-name {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.template-description {
  margin: 0 0 12px;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.template-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.built-in-badge {
  background-color: #e8f5e9;
  color: #18a058;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.template-actions {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
