<template>
  <div class="context-management">
    <div class="context-controls">
      <el-button type="primary" :icon="Plus" @click="$emit('createNewContext')">
        新建上下文
      </el-button>
      <el-button :icon="View" @click="$emit('showContextVariables')"> 查看变量 </el-button>
    </div>

    <div class="context-list">
      <el-empty v-if="!contexts || contexts.length === 0" description="暂无上下文" />

      <el-timeline v-else>
        <el-timeline-item
          v-for="context in contexts"
          :key="context.id"
          :timestamp="formatTime(context.timestamp)"
          :type="context.id === currentContext?.id ? 'primary' : 'info'"
          :hollow="context.id !== currentContext?.id"
          placement="top"
        >
          <el-card :class="{ 'current-context': context.id === currentContext?.id }" shadow="hover">
            <template #header>
              <div class="context-header">
                <div class="context-title">
                  <span class="context-name">{{ context.name }}</span>
                  <el-tag
                    v-if="context.id === currentContext?.id"
                    type="success"
                    size="small"
                    effect="dark"
                  >
                    当前
                  </el-tag>
                </div>
                <div class="context-actions">
                  <el-button
                    v-if="context.id !== currentContext?.id"
                    type="primary"
                    text
                    size="small"
                    @click="switchContext(context)"
                  >
                    切换
                  </el-button>
                </div>
              </div>
            </template>
            <div class="context-content">
              <p class="context-description">{{ context.description || '暂无描述' }}</p>
              <div class="context-meta">
                <div class="meta-item">
                  <el-icon><Calendar /></el-icon>
                  <span>{{ formatTime(context.createdAt) }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><Refresh /></el-icon>
                  <span>{{ formatTime(context.updatedAt) }}</span>
                </div>
              </div>
              <div class="context-actions-bottom">
                <el-button type="primary" text size="small" @click="editContext(context)">
                  <el-icon><Edit /></el-icon>编辑
                </el-button>
                <el-button type="danger" text size="small" @click="deleteContext(context)">
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script setup>
import { Plus, View, Calendar, Refresh, Edit, Delete } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const props = defineProps({
  contexts: Array,
  currentContext: Object,
})

const emit = defineEmits([
  'createNewContext',
  'showContextVariables',
  'switchContext',
  'editContext',
  'deleteContext',
])

const formatTime = (timestamp) => {
  if (!timestamp) return ''

  // 使用 dayjs 格式化时间
  try {
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
  } catch (error) {
    console.error('时间格式化错误:', error)
    return timestamp.toString()
  }
}

const switchContext = (context) => {
  emit('switchContext', context)
}

const editContext = (context) => {
  emit('editContext', context)
}

const deleteContext = (context) => {
  emit('deleteContext', context)
}
</script>

<style scoped>
.context-management {
  padding: 16px;
}

.context-controls {
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
}

.context-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.context-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.context-name {
  font-weight: 500;
  font-size: 16px;
}

.context-content {
  padding: 8px 0;
}

.context-description {
  color: #666;
  margin-bottom: 12px;
  line-height: 1.5;
}

.context-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 12px;
  color: #999;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.context-actions-bottom {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.current-context {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary);
}

.context-actions :deep(.el-button) {
  padding: 4px 8px;
}

.context-actions-bottom :deep(.el-button) {
  padding: 4px 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .context-controls {
    flex-direction: column;
  }

  .context-meta {
    flex-direction: column;
    gap: 8px;
  }

  .context-actions-bottom {
    justify-content: flex-start;
  }
}
</style>
